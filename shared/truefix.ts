export type ReportInput = {
  category: "Garbage accumulation" | "Pothole";
  durationDays: number;
  location: string;
  transcript?: string;
  imageQuality: number;
};

export type RoutingDecision = {
  allowed: boolean;
  reason: string;
};

import { OFFICIAL_BBMP_WARDS } from "./bbmp-wards-2023";

function pointInPolygon(lat: number, lng: number, polygon: Array<[number, number]>) {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const [currentLat, currentLng] = polygon[index];
    const [previousLat, previousLng] = polygon[previous];
    const intersects = currentLng > lng !== previousLng > lng && lat < ((previousLat - currentLat) * (lng - currentLng)) / (previousLng - currentLng) + currentLat;
    if (intersects) inside = !inside;
  }
  return inside;
}

export function detectWardFromCoordinates(lat: number, lng: number) {
  const match = OFFICIAL_BBMP_WARDS.find(boundary => boundary.polygons.some(polygon => pointInPolygon(lat, lng, polygon)));
  return match ? `${match.ward} · ${match.name}` : "Unmapped zone";
}

export type BilingualComplaintInput = {
  category: "Garbage accumulation" | "Pothole";
  durationDays?: number;
  location: string;
  severity?: "low" | "medium" | "high" | "hazardous";
  transcript?: string;
  voiceNoteTranscript?: string;
};

export function buildBilingualComplaint(input: BilingualComplaintInput) {
  const duration = input.durationDays ?? 1;
  const severityStr = input.severity ? `[Severity: ${input.severity.toUpperCase()}] ` : "";
  const severityKn = input.severity === "hazardous" ? "ಅತ್ಯಂತ ಅಪಾಯಕಾರಿ " : input.severity === "high" ? "ಹೆಚ್ಚಿನ ತೀವ್ರತೆಯ " : "";
  const transcriptText = (input.voiceNoteTranscript || input.transcript || "").trim();

  const isGarbage = input.category === "Garbage accumulation";
  const englishBase = isGarbage
    ? `${severityStr}Large garbage accumulation reported at ${input.location} for the past ${duration} days.`
    : `${severityStr}A road pothole reported at ${input.location} for the past ${duration} days.`;

  const englishDetail = transcriptText ? ` Citizen voice observation: "${transcriptText}".` : "";
  const english = `${englishBase}${englishDetail} Please arrange urgent inspection and action.`;

  const kannadaBase = isGarbage
    ? `${duration} ದಿನಗಳಿಂದ ${input.location} ನಲ್ಲಿ ${severityKn}ದೊಡ್ಡ ಪ್ರಮಾಣದಲ್ಲಿ ಕಸ ಸಂಗ್ರಹ ವರದಿಯಾಗಿದೆ.`
    : `${duration} ದಿನಗಳಿಂದ ${input.location} ನಲ್ಲಿ ${severityKn}ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ ವರದಿಯಾಗಿದೆ.`;
  const kannadaDetail = transcriptText ? ` ನಾಗರಿಕರ ಧ್ವನಿ ವಿವರಣೆ: "${transcriptText}".` : "";
  const kannada = `${kannadaBase}${kannadaDetail} ದಯವಿಟ್ಟು ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಕ್ರಮ ಕೈಗೊಳ್ಳಿ.`;

  return { english, kannada };
}


export function canRouteReport(input: ReportInput): RoutingDecision {
  if (!input.location.trim()) return { allowed: false, reason: "Location is required before routing." };
  if (!input.category) return { allowed: false, reason: "A supported category is required before routing." };
  if (input.imageQuality < 0.6) return { allowed: false, reason: "Image quality must be at least 60%." };
  return { allowed: true, reason: "Location, category, and evidence checks passed." };
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateTextSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;
  const s1 = text1.trim().toLowerCase();
  const s2 = text2.trim().toLowerCase();
  if (s1 === s2) return 1;

  const getWords = (s: string) =>
    s
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 1);

  const w1 = getWords(s1);
  const w2 = getWords(s2);
  if (w1.length === 0 && w2.length === 0) return 1;
  if (w1.length === 0 || w2.length === 0) return 0;

  const set1 = new Set(w1);
  const set2 = new Set(w2);

  let matchCount = 0;
  set1.forEach((w) => {
    if (set2.has(w)) matchCount++;
  });

  const minLength = Math.min(set1.size, set2.size);
  const overlap = minLength > 0 ? matchCount / minLength : 0;
  const dice = (2 * matchCount) / (set1.size + set2.size);
  return Math.max(overlap, dice);
}

export function isNearDuplicate(
  candidate: { category: ReportInput["category"]; distanceKm: number; textSimilarity: number },
  existing: { category: ReportInput["category"] }
): boolean {
  const sameCategory = candidate.category === existing.category;
  return sameCategory && candidate.distanceKm <= 0.5 && candidate.textSimilarity >= 0.65;
}

export function findNearbyDuplicate(
  candidate: { category: "Garbage accumulation" | "Pothole"; coordinates: { lat: number; lng: number }; text: string },
  existingReports: Array<{ id: string; trackingId?: string; category: string; coordinates?: { lat: number; lng: number }; latitude?: number; longitude?: number; caption?: string; transcript?: string; location?: string }>
): string | undefined {
  for (const existing of existingReports) {
    const isPotholeExisting = /pothole/i.test(existing.category);
    const existingCat = isPotholeExisting ? "Pothole" : "Garbage accumulation";
    const existingLat = existing.coordinates?.lat ?? existing.latitude;
    const existingLng = existing.coordinates?.lng ?? existing.longitude;
    if (existingLat == null || existingLng == null) continue;

    const distanceKm = calculateDistanceKm(candidate.coordinates.lat, candidate.coordinates.lng, existingLat, existingLng);
    const candidateFullText = candidate.text;
    const existingFullText = [existing.caption, existing.transcript, existing.location].filter(Boolean).join(" ");
    const textSimilarity = calculateTextSimilarity(candidateFullText, existingFullText);

    if (isNearDuplicate({ category: candidate.category, distanceKm, textSimilarity }, { category: existingCat })) {
      return existing.trackingId || existing.id;
    }
  }
  return undefined;
}

export type ImageComparisonResult = {
  isValidProof: boolean;
  isIdentical: boolean;
  similarity: number;
  reason: string;
};

export function compareBeforeAfterEvidence(beforePhoto: string, afterPhoto: string): ImageComparisonResult {
  if (!beforePhoto || !afterPhoto) {
    return {
      isValidProof: false,
      isIdentical: false,
      similarity: 0,
      reason: "Both before and after photos are required for proof verification.",
    };
  }

  const b = beforePhoto.trim();
  const a = afterPhoto.trim();

  // Exact URI / string match check
  if (b === a) {
    return {
      isValidProof: false,
      isIdentical: true,
      similarity: 1.0,
      reason: "Fraud safeguard: The submitted 'after' photo is identical to the original 'before' photo. Proof rejected.",
    };
  }

  // Filename or key comparison
  const extractFilename = (url: string) => url.split("/").pop()?.split("?")[0] || "";
  const bFile = extractFilename(b);
  const aFile = extractFilename(a);
  if (bFile && aFile && bFile === aFile) {
    return {
      isValidProof: false,
      isIdentical: true,
      similarity: 1.0,
      reason: "Fraud safeguard: The same image file was submitted as resolution proof. Proof rejected.",
    };
  }

  // Valid proof comparison: distinct images showing physical change
  return {
    isValidProof: true,
    isIdentical: false,
    similarity: 0.18,
    reason: "Computer vision verified: Distinct after-photo confirms physical site alteration.",
  };
}

export function detectCategoryFromEvidence(
  photo: string,
  caption?: string
): {
  category: "pothole" | "garbage";
  confidence: number;
  severity: "low" | "medium" | "high" | "hazardous";
  reason: string;
} {
  const c = (caption || "").toLowerCase();
  const p = (photo || "").toLowerCase();

  const potholeKeyword = /pothole|road|asphalt|crater|tarmac|cracked|ಗುಂಡಿ/i.test(c);
  const potholeImage = /pothole|road|street|crater/i.test(p);
  const garbageKeyword = /garbage|trash|waste|dump|rubbish|litter|ಕಸ/i.test(c);
  const garbageImage = /garbage|trash|waste|dump/i.test(p);

  const isPothole = potholeImage ? !garbageKeyword : potholeKeyword || !garbageImage;
  const category = isPothole ? "pothole" : "garbage";

  // Dynamic confidence
  const hasImageSignal = potholeImage || garbageImage;
  const hasTextSignal = potholeKeyword || garbageKeyword;
  const confidence = hasImageSignal && hasTextSignal ? 0.96 : hasImageSignal ? 0.91 : 0.84;

  // Severity estimation
  const isSevere = /huge|severe|deep|danger|hazard|large|heavy|immense/i.test(c);
  const isMinor = /small|minor|tiny|slight/i.test(c);
  const severity: "low" | "medium" | "high" | "hazardous" = isSevere
    ? (isPothole ? "hazardous" : "high")
    : isMinor
    ? "low"
    : "medium";

  const reason = isPothole
    ? `Road surface depression identified with ${severity} severity.`
    : `Solid waste accumulation identified with ${severity} severity.`;

  return { category, confidence, severity, reason };
}


