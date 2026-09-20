import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("AWS SAM Local Configuration & Lambda Handlers", () => {
  it("defines a valid SAM template.yaml with Serverless Transform", () => {
    const templatePath = path.join(process.cwd(), "template.yaml");
    expect(fs.existsSync(templatePath)).toBe(true);

    const templateContent = fs.readFileSync(templatePath, "utf-8");
    expect(templateContent).toContain("AWSTemplateFormatVersion: '2010-09-09'");
    expect(templateContent).toContain("Transform: AWS::Serverless-2016-10-31");
    expect(templateContent).toContain("TranscribeAudioFunction:");
    expect(templateContent).toContain("RouteReportFunction:");
    expect(templateContent).toContain("VerifyResolutionFunction:");
  });

  it("executes SAM Local route handler successfully", async () => {
    const { handler: routeHandler } = await import("../sam/handlers/route.js");
    const event = {
      body: JSON.stringify({
        location: "Koramangala 80ft Road",
        category: "Pothole",
        coordinates: { lat: 12.935, lng: 77.624 },
        imageQuality: 0.85,
      }),
    };

    const res = await routeHandler(event);
    expect(res.statusCode).toBe(200);

    const data = JSON.parse(res.body);
    expect(data.ward).toContain("Ward 151");
    expect(data.policyStatus).toBe("AUTHORIZED_BY_CEDAR");
  });

  it("SAM Local route handler enforces validation when location is missing", async () => {
    const { handler: routeHandler } = await import("../sam/handlers/route.js");
    const event = {
      body: JSON.stringify({
        location: "",
        category: "Pothole",
        coordinates: { lat: 12.935, lng: 77.624 },
        imageQuality: 0.85,
      }),
    };

    const res = await routeHandler(event);
    expect(res.statusCode).toBe(400);
    const data = JSON.parse(res.body);
    expect(data.error).toMatch(/location is required/i);
  });

  it("executes SAM Local verify handler and passes distinct images", async () => {
    const { handler: verifyHandler } = await import("../sam/handlers/verify.js");
    const event = {
      body: JSON.stringify({
        beforePhoto: "/evidence/pothole-before.jpg",
        afterPhoto: "/evidence/pothole-after.jpg",
      }),
    };

    const res = await verifyHandler(event);
    expect(res.statusCode).toBe(200);
    const data = JSON.parse(res.body);
    expect(data.isValidProof).toBe(true);
    expect(data.isIdentical).toBe(false);
  });

  it("SAM Local verify handler rejects identical images with HTTP 422", async () => {
    const { handler: verifyHandler } = await import("../sam/handlers/verify.js");
    const event = {
      body: JSON.stringify({
        beforePhoto: "/evidence/pothole-before.jpg",
        afterPhoto: "/evidence/pothole-before.jpg",
      }),
    };

    const res = await verifyHandler(event);
    expect(res.statusCode).toBe(422);
    const data = JSON.parse(res.body);
    expect(data.isValidProof).toBe(false);
    expect(data.isIdentical).toBe(true);
  });
});
