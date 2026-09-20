import { describe, it, expect } from "vitest";
import { getCedarEngine, evaluateCedarRouting, evaluateCedarResolution } from "./cedar";
import path from "node:path";

describe("Cedar Policy Engine & Policies Specification", () => {
  it("loads and parses the .cedar policy file correctly", () => {
    const engine = getCedarEngine();
    const rules = engine.getLoadedRules();
    expect(rules.length).toBeGreaterThanOrEqual(4);

    const actions = rules.map((r) => r.action);
    expect(actions).toContain("RouteReport");
    expect(actions).toContain("ConfirmResolution");
  });

  describe("RouteReport Policy Evaluation", () => {
    it("permits routing when location is provided and imageQuality >= 0.60", () => {
      const decision = evaluateCedarRouting({
        location: "Koramangala 80ft Road",
        category: "Pothole",
        imageQuality: 0.85,
      });
      expect(decision.allowed).toBe(true);
      expect(decision.reason).toContain("Cedar authorization granted");
    });

    it("forbids routing when location is empty", () => {
      const decision = evaluateCedarRouting({
        location: "   ",
        category: "Pothole",
        imageQuality: 0.9,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toMatch(/forbid|denied/i);
    });

    it("forbids routing when image quality is below 0.60", () => {
      const decision = evaluateCedarRouting({
        location: "Indiranagar 100ft Road",
        category: "Garbage accumulation",
        imageQuality: 0.45,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toMatch(/forbid|denied/i);
    });
  });

  describe("ConfirmResolution Policy Evaluation (Anti-Fraud)", () => {
    it("permits resolution when valid distinct after-evidence is submitted", () => {
      const decision = evaluateCedarResolution({
        reportId: "TF-101",
        hasAfterPhoto: true,
        isIdentical: false,
      });
      expect(decision.allowed).toBe(true);
    });

    it("forbids resolution when before and after photos are identical (fraud protection)", () => {
      const decision = evaluateCedarResolution({
        reportId: "TF-101",
        hasAfterPhoto: true,
        isIdentical: true,
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toMatch(/forbid|fraud|identical|denied/i);
    });

    it("denies resolution when after photo is missing", () => {
      const decision = evaluateCedarResolution({
        reportId: "TF-101",
        hasAfterPhoto: false,
        isIdentical: false,
      });
      expect(decision.allowed).toBe(false);
    });
  });

  it("denies unknown actions by default (Cedar default-deny model)", () => {
    const engine = getCedarEngine();
    const res = engine.isAuthorized({
      principal: "Citizen::123",
      action: "DeleteAuditLogs",
      resource: { id: "log-1", type: "AuditLog" },
      context: {},
    });
    expect(res.decision).toBe("DENY");
    expect(res.reasons[0]).toContain("Default deny");
  });
});
