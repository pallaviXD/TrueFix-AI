import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { storagePut } from "../storage";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";
import { appendCitizenComment, createReport, getAllComplaints, getComplaintByIdOrTrackingId, toComplaint, updateAfterPhoto, updateReportStatus } from "../db";
import { compareBeforeAfterEvidence } from "../../shared/truefix";
import { transcribeAudio } from "./voiceTranscription";



async function fetchImageBuffer(url: string | undefined) {
  if (!url || !/^https?:\/\//i.test(url)) return undefined;
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return undefined;
  }
}

async function fetchMapSnapshot(latitude: number | null, longitude: number | null) {
  if (typeof latitude !== "number" || typeof longitude !== "number") return undefined;
  try {
    const url = new URL(`${ENV.forgeApiUrl.replace(/\/+$/, "")}/v1/maps/proxy/maps/api/staticmap`);
    url.searchParams.set("key", ENV.forgeApiKey);
    url.searchParams.set("center", `${latitude},${longitude}`);
    url.searchParams.set("zoom", "15");
    url.searchParams.set("size", "640x240");
    url.searchParams.set("scale", "2");
    url.searchParams.set("maptype", "roadmap");
    url.searchParams.set("markers", `color:0x7e9b1a|${latitude},${longitude}`);
    return fetchImageBuffer(url.toString());
  } catch {
    return undefined;
  }
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => server.close(() => resolve(true)));
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  console.log("[TrueFix] startServer() invoked");
  const app = express();
  const server = createServer(app);

  app.post(
    "/api/media-upload",
    express.raw({ type: ["image/*", "audio/*", "application/octet-stream"], limit: "16mb" }),
    async (req, res) => {
      try {
        const contentType = String(req.headers["x-file-type"] || req.headers["content-type"] || "application/octet-stream");
        const fileName = String(req.headers["x-file-name"] || "evidence.bin").replace(/[^a-zA-Z0-9._-]/g, "-");
        const buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body ?? []);
        if (!buffer.length) return res.status(400).json({ error: "Empty file" });
        if (buffer.length > 16 * 1024 * 1024) return res.status(413).json({ error: "File must be smaller than 16MB" });
        const uploaded = await storagePut(`uploads/${crypto.randomUUID()}-${fileName}`, buffer, contentType);
        return res.json(uploaded);
      } catch (error) {
        console.error("[TrueFix] media upload failed", error);
        return res.status(500).json({ error: error instanceof Error ? error.message : "Media upload failed" });
      }
    },
  );

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.post("/api/reports/export/:format", async (req, res) => {
    const format = req.params.format;
    const reports = Array.isArray(req.body?.reports) ? req.body.reports : [];
    const rows: Array<Record<string, string>> = reports.map((report: Record<string, unknown>) => ({
      "Report ID": String(report.id ?? ""),
      Category: String(report.category ?? ""),
      Status: String(report.status ?? ""),
      Ward: String(report.ward ?? ""),
      Location: String(report.location ?? ""),
      Confidence: report.confidence == null ? "" : `${report.confidence}%`,
      "Created at": report.createdAt ? new Date(String(report.createdAt)).toLocaleString("en-IN") : "",
      Description: String(report.transcript ?? ""),
    }));
    if (format === "xlsx") {
      const workbook = XLSX.utils.book_new();
      const sheet = XLSX.utils.json_to_sheet(rows);
      sheet["!cols"] = [{ wch: 14 }, { wch: 24 }, { wch: 14 }, { wch: 20 }, { wch: 42 }, { wch: 12 }, { wch: 22 }, { wch: 64 }];
      sheet["!autofilter"] = { ref: `A1:H${Math.max(1, rows.length + 1)}` };
      XLSX.utils.book_append_sheet(workbook, sheet, "Ward handoff");
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="nammafix-field-handoff-${new Date().toISOString().slice(0, 10)}.xlsx"`);
      return res.send(buffer);
    }
    if (format === "pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="nammafix-field-handoff-${new Date().toISOString().slice(0, 10)}.pdf"`);
      const document = new PDFDocument({ size: "A4", margin: 36 });
      document.pipe(res);
      document.fontSize(18).fillColor("#122131").text("NammaFix · Ward field handoff");
      document.fontSize(9).fillColor("#68736d").text(`${rows.length} filtered report${rows.length === 1 ? "" : "s"} · Generated ${new Date().toLocaleString("en-IN")}`);
      document.moveDown();
      for (let index = 0; index < rows.length; index += 1) {
        const row = rows[index];
        if (index > 0) document.moveDown(0.7);
        document.fontSize(11).fillColor("#122131").text(`${row["Report ID"]} · ${row.Category} · ${row.Status}`);
        document.fontSize(9).fillColor("#526057").text(`${row.Ward} · ${row.Location}`);
        document.text(`Confidence: ${row.Confidence} · Created: ${row["Created at"]}`);
        if (row.Description) document.text(`Description: ${row.Description}`, { width: 520 });
        const source = reports[index] as Record<string, unknown>;
        const [photoBuffer, mapBuffer] = await Promise.all([
          fetchImageBuffer(typeof source.photoUrl === "string" ? source.photoUrl : undefined),
          fetchMapSnapshot(typeof source.latitude === "number" ? source.latitude : null, typeof source.longitude === "number" ? source.longitude : null),
        ]);
        if (photoBuffer) {
          document.moveDown(0.35);
          document.fontSize(8).fillColor("#7e9b1a").text("UPLOADED EVIDENCE");
          document.image(photoBuffer, { fit: [245, 120], align: "center" });
        }
        if (mapBuffer) {
          document.moveDown(0.35);
          document.fontSize(8).fillColor("#7e9b1a").text("LOCATION SNAPSHOT");
          document.image(mapBuffer, { fit: [245, 120], align: "center" });
        }
        document.moveTo(36, document.y + 6).lineTo(559, document.y + 6).strokeColor("#d8ddd4").stroke();
        if (document.y > 740 && index < rows.length - 1) document.addPage();
      }
      document.end();
      return;
    }
    return res.status(400).json({ error: "Unsupported export format" });
  });
  registerStorageProxy(app);
  registerOAuthRoutes(app);

  // Complaints REST API for persistent database access
  app.get("/api/complaints", async (_req, res) => {
    try {
      const complaints = await getAllComplaints();
      res.json(complaints);
    } catch (error) {
      console.error("[API] GET /api/complaints error:", error);
      res.status(500).json({ error: "Failed to list complaints" });
    }
  });

  app.get("/api/complaints/:id", async (req, res) => {
    try {
      const complaint = await getComplaintByIdOrTrackingId(req.params.id);
      if (!complaint) return res.status(404).json({ error: "Complaint not found" });
      res.json(complaint);
    } catch (error) {
      console.error("[API] GET /api/complaints/:id error:", error);
      res.status(500).json({ error: "Failed to get complaint" });
    }
  });

  app.post("/api/complaints", async (req, res) => {
    try {
      const created = await createReport(req.body);
      res.status(201).json(toComplaint(created));
    } catch (error) {
      console.error("[API] POST /api/complaints error:", error);
      res.status(500).json({ error: "Failed to create complaint" });
    }
  });

  app.post("/api/complaints/:id/after-photo", async (req, res) => {
    try {
      const updated = await updateAfterPhoto(req.params.id, req.body.afterPhoto);
      if (!updated) return res.status(404).json({ error: "Complaint not found" });
      res.json(toComplaint(updated));
    } catch (error) {
      console.error("[API] POST /api/complaints/:id/after-photo error:", error);
      res.status(500).json({ error: "Failed to update after photo" });
    }
  });

  app.post("/api/complaints/:id/resolution", async (req, res) => {
    try {
      const outcome = req.body.outcome;
      const complaint = await getComplaintByIdOrTrackingId(req.params.id);
      if (!complaint) return res.status(404).json({ error: "Complaint not found" });

      if (outcome === "fixed") {
        const comparison = compareBeforeAfterEvidence(complaint.photo, complaint.afterPhoto || "");
        if (!comparison.isValidProof) {
          return res.status(400).json({ error: comparison.reason });
        }
      }

      const status = outcome === "fixed" ? "Resolved" : "Disputed";
      const resolutionNotes = outcome === "fixed"
        ? "Before/after photo verified by computer vision diff."
        : "Reporter says the issue remains after the reported resolution.";
      const updated = await updateReportStatus(req.params.id, status, resolutionNotes);
      if (!updated) return res.status(404).json({ error: "Complaint not found" });
      res.json(toComplaint(updated));
    } catch (error) {
      console.error("[API] POST /api/complaints/:id/resolution error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to update resolution" });
    }
  });

  app.post("/api/complaints/:id/comments", async (req, res) => {
    try {
      const comment = await appendCitizenComment(req.params.id, req.body.text, req.body.author);
      if (!comment) return res.status(404).json({ error: "Complaint not found" });
      res.json(comment);
    } catch (error) {
      console.error("[API] POST /api/complaints/:id/comments error:", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

  // Real voice transcription route
  app.post("/api/voice/transcribe", async (req, res) => {
    try {
      const { audioUrl, audioDataUrl, language, prompt } = req.body;
      let targetUrl = audioUrl;
      if (!targetUrl && audioDataUrl) {
        // Upload audioDataUrl to local storage
        const match = String(audioDataUrl).match(/^data:([^;]+);base64,([\s\S]+)$/);
        if (match) {
          const contentType = match[1];
          const buffer = Buffer.from(match[2], "base64");
          const uploaded = await storagePut(`voice/${crypto.randomUUID()}.webm`, buffer, contentType);
          targetUrl = uploaded.url;
        }
      }
      if (!targetUrl) return res.status(400).json({ error: "No audio provided" });
      const result = await transcribeAudio({ audioUrl: targetUrl, language, prompt });
      return res.json(result);
    } catch (error) {
      console.error("[Voice Transcribe Error]:", error);
      return res.status(500).json({ error: "Transcription failed" });
    }
  });

  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") {
    console.log("[TrueFix] setting up Vite...");
    await setupVite(app, server);
    console.log("[TrueFix] Vite setup complete");
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  server.listen(port, () => console.log(`Server running on http://localhost:${port}/`));
}

startServer().catch(console.error);
