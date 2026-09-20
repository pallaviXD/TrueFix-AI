import { describe, expect, it } from "vitest";
import { buildBilingualComplaint, canRouteReport, detectWardFromCoordinates, isNearDuplicate } from "../shared/truefix";

describe("TrueFix domain rules", () => {
  it("builds an English and Kannada complaint from the same structured report", () => {
    const complaint = buildBilingualComplaint({
      category: "Garbage accumulation",
      durationDays: 3,
      location: "HSR Layout, Ward 174",
    });

    expect(complaint.english).toContain("HSR Layout, Ward 174");
    expect(complaint.english).toContain("3 days");
    expect(complaint.kannada).toContain("HSR Layout, Ward 174");
    expect(complaint.kannada).toContain("3 ದಿನಗಳಿಂದ");
  });

  it("blocks routing when evidence quality is below the policy threshold", () => {
    const decision = canRouteReport({
      category: "Pothole",
      durationDays: 1,
      location: "BTM 2nd Stage, Ward 172",
      imageQuality: 0.42,
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("60%");
  });

  it("detects a same-category report that is close and text-similar", () => {
    expect(
      isNearDuplicate(
        { category: "Garbage accumulation", distanceKm: 0.3, textSimilarity: 0.82 },
        { category: "Garbage accumulation" },
      ),
    ).toBe(true);

    expect(
      isNearDuplicate(
        { category: "Pothole", distanceKm: 0.3, textSimilarity: 0.82 },
        { category: "Garbage accumulation" },
      ),
    ).toBe(false);
  });

  it("assigns GPS points to the correct official BBMP administrative zone", () => {
    expect(detectWardFromCoordinates(12.9352, 77.6245)).toBe("Ward 174 · Koramangala");
    expect(detectWardFromCoordinates(12.9, 77.6)).toBe("Ward 215 · Bilekhalli");
    expect(detectWardFromCoordinates(13.02, 77.7)).toBe("Ward 91 · K R Puram");
  });
});
