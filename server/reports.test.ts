import { describe, expect, it } from "vitest";
import { decodeDataUrl, normalizeClassification } from "./routers";

describe("report media payloads", () => {
  it("decodes image data URLs into a typed buffer", () => {
    const decoded = decodeDataUrl("data:image/png;base64,SGVsbG8=");
    expect(decoded.contentType).toBe("image/png");
    expect(decoded.buffer.toString("utf8")).toBe("Hello");
  });

  it("rejects non-data-url payloads before storage upload", () => {
    expect(() => decodeDataUrl("https://example.com/photo.png")).toThrow("base64 data URL");
  });

  it("normalizes supported AI categories and clamps confidence", () => {
    expect(normalizeClassification({ category: "Pothole", confidence: 124.4, reason: "Visible road depression" })).toEqual({
      category: "Pothole",
      confidence: 100,
      reason: "Visible road depression",
    });
  });

  it("rejects unsupported AI categories", () => {
    expect(() => normalizeClassification({ category: "Broken streetlight", confidence: 90, reason: "" })).toThrow("Unsupported classification category");
  });

  it("submits a report, reinitializes client state, and confirms persistence in real database by tracking ID", async () => {
    const { api } = await import("../client/src/lib/api");
    const { getReport } = await import("./db");

    // Submit a new report via the client API
    const submitted = await api.submitReport({
      photo: "/evidence/garbage-before.jpg",
      caption: "Persistent civic trash report near 80ft Road",
      location: "80 Feet Road, 4th Block, Koramangala",
      coordinates: { lat: 12.9352, lng: 77.6245 },
    });

    expect(submitted.trackingId).toBeDefined();
    expect(submitted.location).toBe("80 Feet Road, 4th Block, Koramangala");

    // Reinitialize client query — simulate a page reload / fresh query from database
    const retrievedFromApi = await api.getComplaint(submitted.trackingId);
    expect(retrievedFromApi).not.toBeNull();
    expect(retrievedFromApi?.id).toBe(submitted.id);
    expect(retrievedFromApi?.trackingId).toBe(submitted.trackingId);
    expect(retrievedFromApi?.location).toBe("80 Feet Road, 4th Block, Koramangala");

    // Verify it is physically present in the SQLite database
    const dbRecord = await getReport(submitted.trackingId);
    expect(dbRecord).toBeDefined();
    expect(dbRecord?.id).toBe(submitted.id);
    expect(dbRecord?.trackingId).toBe(submitted.trackingId);
    expect(dbRecord?.location).toBe("80 Feet Road, 4th Block, Koramangala");
  });
});

