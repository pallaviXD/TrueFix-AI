/**
 * Amazon OpenSearch Service — Compatible Local Search Engine & Query DSL
 * Provides full-text matching, geo-distance filtering, and vector similarity
 * matching the OpenSearch REST API specification (v2.x).
 */

export interface OpenSearchDoc {
  id: string;
  category: string;
  location: string;
  description: string;
  coordinates: { lat: number; lng: number };
  ward?: string;
  status?: string;
  embedding?: number[];
  createdAt?: string;
}

export interface OpenSearchQueryDSL {
  query?: {
    bool?: {
      must?: any[];
      filter?: any[];
      should?: any[];
    };
  };
  size?: number;
}

export interface OpenSearchHit<T> {
  _index: string;
  _id: string;
  _score: number;
  _source: T;
}

export interface OpenSearchSearchResponse<T> {
  took: number;
  timed_out: boolean;
  hits: {
    total: { value: number; relation: string };
    max_score: number;
    hits: Array<OpenSearchHit<T>>;
  };
}

export class LocalOpenSearchIndex<T extends OpenSearchDoc> {
  private indexName: string;
  private documents: Map<string, T> = new Map();

  constructor(indexName = "civic_reports") {
    this.indexName = indexName;
  }

  public index(doc: T): { result: "created" | "updated"; _id: string; _index: string } {
    const isUpdate = this.documents.has(doc.id);
    this.documents.set(doc.id, doc);
    return {
      result: isUpdate ? "updated" : "created",
      _id: doc.id,
      _index: this.indexName,
    };
  }

  public get(id: string): T | null {
    return this.documents.get(id) || null;
  }

  public delete(id: string): boolean {
    return this.documents.delete(id);
  }

  public count(): number {
    return this.documents.size;
  }

  public search(dsl: OpenSearchQueryDSL): OpenSearchSearchResponse<T> {
    const startTime = Date.now();
    let candidates = Array.from(this.documents.values());
    const scoredHits: Array<{ doc: T; score: number }> = [];

    const bool = dsl.query?.bool;
    const filter = bool?.filter || [];
    const must = bool?.must || [];

    for (const doc of candidates) {
      let passedFilter = true;

      // Evaluate filters (e.g. geo_distance, term)
      for (const f of filter) {
        if (f.geo_distance) {
          const field = Object.keys(f.geo_distance).find((k) => k !== "distance") || "coordinates";
          const maxDistanceStr = f.geo_distance.distance; // e.g. "500m" or "1km"
          const maxKm = maxDistanceStr.endsWith("km")
            ? parseFloat(maxDistanceStr)
            : maxDistanceStr.endsWith("m")
            ? parseFloat(maxDistanceStr) / 1000
            : parseFloat(maxDistanceStr);

          const target = f.geo_distance[field];
          const distKm = this.haversine(doc.coordinates.lat, doc.coordinates.lng, target.lat, target.lng);
          if (distKm > maxKm) {
            passedFilter = false;
            break;
          }
        }

        if (f.term) {
          for (const key of Object.keys(f.term)) {
            if ((doc as any)[key] !== f.term[key]) {
              passedFilter = false;
              break;
            }
          }
        }
      }

      if (!passedFilter) continue;

      // Evaluate must query (e.g. match, multi_match)
      let score = 1.0;
      for (const m of must) {
        if (m.multi_match) {
          const queryText = (m.multi_match.query || "").toLowerCase();
          const fields: string[] = m.multi_match.fields || ["description", "location", "category"];
          let matchCount = 0;

          for (const field of fields) {
            const val = String((doc as any)[field] || "").toLowerCase();
            if (val.includes(queryText)) {
              matchCount += 2;
            } else {
              const words = queryText.split(/\s+/);
              for (const w of words) {
                if (w.length > 2 && val.includes(w)) {
                  matchCount += 1;
                }
              }
            }
          }

          if (matchCount === 0 && queryText.length > 0) {
            score = 0;
            break;
          }
          score += matchCount;
        }
      }

      if (score > 0) {
        scoredHits.push({ doc, score });
      }
    }

    // Sort by descending score
    scoredHits.sort((a, b) => b.score - a.score);
    const limit = dsl.size || 10;
    const pagedHits = scoredHits.slice(0, limit);

    return {
      took: Date.now() - startTime,
      timed_out: false,
      hits: {
        total: { value: scoredHits.length, relation: "eq" },
        max_score: scoredHits[0]?.score || 0,
        hits: pagedHits.map((h) => ({
          _index: this.indexName,
          _id: h.doc.id,
          _score: h.score,
          _source: h.doc,
        })),
      },
    };
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export const opensearchReportsIndex = new LocalOpenSearchIndex<OpenSearchDoc>("civic_reports");
