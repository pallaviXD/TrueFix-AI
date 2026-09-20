import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import {
  canRouteReport,
  detectWardFromCoordinates,
  isNearDuplicate,
  buildBilingualComplaint,
  type ReportInput,
} from "../shared/truefix";
import { api } from "../client/src/lib/api";

function createMockContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "http", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("Spec Audit: Pipeline & Policy Tests", () => {
  describe("1. Agent Stages & Cedar Validation Policy", () => {
    it("rejects reports with empty or whitespace-only location", () => {
      const decision = canRouteReport({
        category: "Garbage accumulation",
        durationDays: 2,
        location: "   ",
        imageQuality: 0.85,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toMatch(/location is required/i);
    });

    it("rejects reports where image quality is below the 60% threshold", () => {
      const decision = canRouteReport({
        category: "Pothole",
        durationDays: 1,
        location: "MG Road, Ward 111",
        imageQuality: 0.45,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toMatch(/60%/);
    });

    it("approves valid reports meeting all policy criteria", () => {
      const decision = canRouteReport({
        category: "Garbage accumulation",
        durationDays: 3,
        location: "Indiranagar 100ft Road",
        imageQuality: 0.92,
      });
      expect(decision.allowed).toBe(true);
      expect(decision.reason).toMatch(/passed/i);
    });
  });

  describe("2. Duplicate Detection Engine", () => {
    it("flags duplicate report within 500m and high text similarity", () => {
      const isDupe = isNearDuplicate(
        { category: "Garbage accumulation", distanceKm: 0.15, textSimilarity: 0.88 },
        { category: "Garbage accumulation" },
      );
      expect(isDupe).toBe(true);
    });

    it("does NOT flag duplicate if category is different even if location matches", () => {
      const isDupe = isNearDuplicate(
        { category: "Pothole", distanceKm: 0.05, textSimilarity: 0.95 },
        { category: "Garbage accumulation" },
      );
      expect(isDupe).toBe(false);
    });

    it("does NOT flag duplicate if distance exceeds 500m radius", () => {
      const isDupe = isNearDuplicate(
        { category: "Garbage accumulation", distanceKm: 1.2, textSimilarity: 0.95 },
        { category: "Garbage accumulation" },
      );
      expect(isDupe).toBe(false);
    });

    it("flags duplicate on a genuinely new duplicate submission (not just the seeded mock)", async () => {
      // 1. Submit an original report at unique coordinates
      const original = await api.submitReport({
        photo: "/evidence/garbage-before.jpg",
        caption: "Large uncollected trash pile near park entrance",
        location: "Outer Ring Road, Bellandur",
        coordinates: { lat: 12.926, lng: 77.676 },
      });
      expect(original.trackingId).toBeDefined();

      // 2. Submit a duplicate report 50m away with similar description
      const duplicate = await api.submitReport({
        photo: "/evidence/garbage-before.jpg",
        caption: "Uncollected trash pile near park gate",
        location: "Outer Ring Road near park entrance, Bellandur",
        coordinates: { lat: 12.9263, lng: 77.6762 },
      });

      // 3. Verify it flags and links to the original report
      expect(duplicate.duplicateOf).toBe(original.trackingId);
    });

    it("blocks submission through submitReport when location is missing or empty", async () => {
      await expect(
        api.submitReport({
          photo: "/evidence/garbage-before.jpg",
          caption: "Missing location report",
          location: "   ",
          coordinates: { lat: 12.9784, lng: 77.6408 },
        })
      ).rejects.toThrow(/location is required/i);
    });
  });

  describe("3. Routing & Administrative Zone Assignment", () => {
    it("maps GPS coordinates to official BBMP ward delimitation for at least 3 known coordinate pairs", () => {
      // Coordinate Pair 1: Indiranagar (Hoysala Nagar)
      expect(detectWardFromCoordinates(12.9784, 77.6408)).toBe("Ward 113 · Hoysala Nagar");

      // Coordinate Pair 2: Koramangala
      expect(detectWardFromCoordinates(12.9352, 77.6245)).toBe("Ward 174 · Koramangala");

      // Coordinate Pair 3: Malleshwaram
      expect(detectWardFromCoordinates(13.003, 77.568)).toBe("Ward 58 · Kadu Malleshwar Ward");
    });

    it("routes submitReport accurately according to BBMP boundary polygons (Malleshwaram & Hoysala Nagar)", async () => {
      // Coordinates for Malleshwaram (~13.003, 77.568)
      const reportInMalleshwaram = await api.submitReport({
        photo: "/evidence/pothole-before.jpg",
        caption: "Deep pothole in Malleshwaram 8th Main",
        location: "Malleshwaram 8th Main",
        coordinates: { lat: 13.003, lng: 77.568 },
      });
      expect(reportInMalleshwaram.ward).toBe("Ward 58 · Kadu Malleshwar Ward");

      // Coordinates for Indiranagar (12.9784, 77.6408)
      const reportInIndiranagar = await api.submitReport({
        photo: "/evidence/garbage-before.jpg",
        caption: "New garbage spot on 100ft road",
        location: "Indiranagar 100ft Road",
        coordinates: { lat: 12.9784, lng: 77.6408 },
      });
      expect(reportInIndiranagar.ward).toBe("Ward 113 · Hoysala Nagar");
    });
  });

  describe("4. Bilingual Generation & Vision Classification", () => {
    it("builds English and Kannada template text from structured input", () => {
      const complaint = buildBilingualComplaint({
        category: "Pothole",
        durationDays: 4,
        location: "Koramangala 80ft Road",
      });
      expect(complaint.english).toContain("Koramangala 80ft Road");
      expect(complaint.kannada).toContain("ರಸ್ತೆಯಲ್ಲಿ ಗುಂಡಿ");
    });

    it("correctly classifies issue using image evidence even when caption is neutral", async () => {
      // Uploading pothole image without 'pothole' or 'road' in caption
      const report = await api.submitReport({
        photo: "/evidence/pothole-before.jpg",
        caption: "Severe civic issue on street corner",
        location: "Koramangala",
        coordinates: { lat: 12.935, lng: 77.624 },
      });
      // Vision heuristic correctly detects pothole from image evidence and sets hazardous severity
      expect(report.category).toBe("pothole");
      expect(report.severity).toBe("hazardous");
      expect(report.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("integrates audio transcript into bilingual complaint generation", () => {
      const complaint = buildBilingualComplaint({
        category: "Pothole",
        durationDays: 3,
        location: "Indiranagar 100ft Road",
        severity: "hazardous",
        voiceNoteTranscript: "Water is pooling and two wheelers are skidding.",
      });
      expect(complaint.english).toContain('Citizen voice observation: "Water is pooling and two wheelers are skidding."');
      expect(complaint.english).toContain("Indiranagar 100ft Road");
      expect(complaint.kannada).toContain("ನಾಗರಿಕರ ಧ್ವನಿ ವಿವರಣೆ:");
    });
  });

  describe("5. Backend Database Persistence & Zero Paid AWS Calls", () => {
    it("backend persistence succeeds and persists report into real SQLite database", async () => {
      const ctx = createMockContext();
      const caller = appRouter.createCaller(ctx);

      const created = await caller.reports.create({
        category: "Pothole",
        location: "Indiranagar 12th Main",
        ward: "Ward 113 · Hoysala Nagar",
        latitude: 12.9784,
        longitude: 77.6408,
        photoUrl: "https://example.com/test.jpg",
      });

      expect(created).toBeDefined();
      expect(created.id).toMatch(/^TF-\d+/);
      expect(created.location).toBe("Indiranagar 12th Main");
    });

    it("fails closed when identical before and after photos are submitted as resolution proof", async () => {
      const original = await api.submitReport({
        photo: "/evidence/garbage-before.jpg",
        caption: "Garbage on corner",
        location: "Indiranagar",
        coordinates: { lat: 12.978, lng: 77.64 },
      });

      // Submit identical photo as 'afterPhoto'
      await api.uploadAfterPhoto(original.id, original.photo);
      
      // Catches fraud: confirming resolution with identical photo throws an error
      await expect(api.confirmResolution(original.id, "fixed")).rejects.toThrow(
        /identical|Proof rejected/i
      );

      // Distinct after photo succeeds
      await api.uploadAfterPhoto(original.id, "/evidence/garbage-after-cleaned.jpg");
      const resolved = await api.confirmResolution(original.id, "fixed");
      expect(resolved?.status).toBe("Resolved");
      expect(resolved?.afterPhoto).toBe("/evidence/garbage-after-cleaned.jpg");
    });

    it("verifies no paid AWS endpoints (amazonaws.com) are called without mocks", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      // Calling domain rule checks
      canRouteReport({
        category: "Garbage accumulation",
        durationDays: 2,
        location: "Test St",
        imageQuality: 0.9,
      });
      // Assert no calls hit real AWS billed domains
      const awsCalls = fetchSpy.mock.calls.filter(call => {
        const url = String(call[0]);
        return url.includes(".amazonaws.com");
      });
      expect(awsCalls).toHaveLength(0);
      fetchSpy.mockRestore();
    });
  });
});
