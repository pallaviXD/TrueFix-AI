import { describe, it, expect, beforeEach } from "vitest";
import { LocalOpenSearchIndex, OpenSearchDoc } from "./opensearch";

describe("Amazon OpenSearch Service — Compatible Search Index", () => {
  let index: LocalOpenSearchIndex<OpenSearchDoc>;

  beforeEach(() => {
    index = new LocalOpenSearchIndex("civic_reports_test");
    index.index({
      id: "TF-101",
      category: "Pothole",
      location: "Koramangala 80ft Road",
      description: "Severe crater near Sony World Signal",
      coordinates: { lat: 12.9352, lng: 77.6245 },
      ward: "Ward 151 · Koramangala",
      status: "In Progress",
    });

    index.index({
      id: "TF-102",
      category: "Garbage accumulation",
      location: "Indiranagar 100ft Road",
      description: "Overflowing commercial garbage bins",
      coordinates: { lat: 12.9784, lng: 77.6408 },
      ward: "Ward 113 · Hoysala Nagar",
      status: "Submitted",
    });

    index.index({
      id: "TF-103",
      category: "Pothole",
      location: "Malleshwaram 8th Cross",
      description: "Deep pothole near market entrance",
      coordinates: { lat: 13.0031, lng: 77.5702 },
      ward: "Ward 65 · Kadu Malleshwaram",
      status: "Resolved",
    });
  });

  it("indexes documents and returns count", () => {
    expect(index.count()).toBe(3);
    expect(index.get("TF-101")?.category).toBe("Pothole");
  });

  it("performs full-text multi_match search using OpenSearch DSL", () => {
    const res = index.search({
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: "crater Sony World",
                fields: ["description", "location"],
              },
            },
          ],
        },
      },
    });

    expect(res.hits.total.value).toBe(1);
    expect(res.hits.hits[0]._id).toBe("TF-101");
    expect(res.hits.hits[0]._score).toBeGreaterThan(1.0);
  });

  it("filters search results with geo_distance filter within 1km radius", () => {
    // Search within 1km of Sony World Signal (12.935, 77.624)
    const res = index.search({
      query: {
        bool: {
          filter: [
            {
              geo_distance: {
                distance: "1km",
                coordinates: { lat: 12.935, lng: 77.624 },
              },
            },
          ],
        },
      },
    });

    // Only Koramangala report should match, Indiranagar and Malleshwaram are > 5km away
    expect(res.hits.total.value).toBe(1);
    expect(res.hits.hits[0]._id).toBe("TF-101");
  });

  it("combines geo_distance filter and term filter for category", () => {
    const res = index.search({
      query: {
        bool: {
          filter: [
            {
              geo_distance: {
                distance: "15km",
                coordinates: { lat: 12.9716, lng: 77.5946 },
              },
            },
            {
              term: { category: "Garbage accumulation" },
            },
          ],
        },
      },
    });

    expect(res.hits.total.value).toBe(1);
    expect(res.hits.hits[0]._id).toBe("TF-102");
  });
});
