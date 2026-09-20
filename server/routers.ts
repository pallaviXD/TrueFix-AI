import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { storageGetSignedUrl, storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { appendCitizenComment, createReport, getReport, listReports, updateReportStatus } from "./db";
import { detectWardFromCoordinates } from "../shared/truefix";

type ReportCategory = "Garbage accumulation" | "Pothole";

export function normalizeClassification(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid classification response");
  const record = value as Record<string, unknown>;
  if (record.category !== "Garbage accumulation" && record.category !== "Pothole") throw new Error("Unsupported classification category");
  const confidence = Number(record.confidence);
  if (!Number.isFinite(confidence)) throw new Error("Invalid classification confidence");
  return { category: record.category as ReportCategory, confidence: Math.max(0, Math.min(100, Math.round(confidence))), reason: String(record.reason || "") };
}

export function decodeDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,([\s\S]+)$/);
  if (!match) throw new Error("Expected a base64 data URL");
  return { contentType: match[1], buffer: Buffer.from(match[2], "base64") };
}

async function uploadDataUrl(dataUrl: string | undefined, key: string) {
  if (!dataUrl) return undefined;
  const { contentType, buffer } = decodeDataUrl(dataUrl);
  if (buffer.byteLength > 16 * 1024 * 1024) throw new Error("Media must be smaller than 16MB");
  return storagePut(key, buffer, contentType);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  reports: router({
    list: publicProcedure.input(z.object({ limit: z.number().int().min(1).max(50).default(20) }).optional()).query(({ input }) => listReports(input?.limit ?? 20)),
    get: publicProcedure.input(z.object({ id: z.string().min(3).max(32) })).query(({ input }) => getReport(input.id)),
    addComment: publicProcedure.input(z.object({ id: z.string().min(3).max(32), text: z.string().trim().min(2).max(1000) })).mutation(({ input }) => appendCitizenComment(input.id, input.text)),
    updateStatus: publicProcedure.input(z.object({ id: z.string().min(3).max(32), status: z.enum(["In review", "Assigned", "Resolved", "Disputed"]), resolutionNotes: z.string().max(2000).optional() })).mutation(({ input }) => updateReportStatus(input.id, input.status, input.resolutionNotes)),
    classifyImage: publicProcedure.input(z.object({ storageKey: z.string().min(3).max(1000) })).mutation(async ({ input }) => {
      const imageUrl = await storageGetSignedUrl(input.storageKey);
      const response = await invokeLLM({
        messages: [{
          role: "user",
          content: [
            { type: "text", text: "Classify this civic issue photo. Choose exactly one category: Garbage accumulation or Pothole. Return a concise reason based only on visible evidence. Do not invent a location or duration." },
            { type: "image_url", image_url: { url: imageUrl, detail: "low" } },
          ],
        }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "civic_issue_classification",
            strict: true,
            schema: {
              type: "object",
              properties: {
                category: { type: "string", enum: ["Garbage accumulation", "Pothole"] },
                confidence: { type: "integer", minimum: 0, maximum: 100 },
                reason: { type: "string" },
              },
              required: ["category", "confidence", "reason"],
              additionalProperties: false,
            },
          },
        },
        maxTokens: 180,
      });
      const content = response.choices[0]?.message.content;
      const text = typeof content === "string" ? content : content.map(part => "text" in part ? part.text : "").join("");
      return normalizeClassification(JSON.parse(text));
    }),
    create: publicProcedure.input(z.object({
      category: z.enum(["Garbage accumulation", "Pothole"]),
      location: z.string().min(2).max(255),
      ward: z.string().min(2).max(128),
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      durationDays: z.number().int().min(1).max(365).default(3),
      transcript: z.string().max(5000).optional(),
      photoUrl: z.string().max(1000).optional(),
      audioUrl: z.string().max(1000).optional(),
      photoDataUrl: z.string().optional(),
      audioDataUrl: z.string().optional(),
    })).mutation(async ({ input }) => {
      const id = `TF-${Math.floor(10000 + Math.random() * 89999)}`;
      const photo = input.photoUrl ? { url: input.photoUrl, key: input.photoUrl } : await uploadDataUrl(input.photoDataUrl, `reports/${id}/evidence.jpg`);
      const audio = input.audioUrl ? { url: input.audioUrl, key: input.audioUrl } : await uploadDataUrl(input.audioDataUrl, `reports/${id}/voice.webm`);
      let transcript = input.transcript;
      if (!transcript && audio && input.audioDataUrl) {
        try {
          const signedAudioUrl = await storageGetSignedUrl(audio.key);
          const transcription = await transcribeAudio({ audioUrl: signedAudioUrl, language: "en", prompt: "Civic issue report for garbage accumulation or potholes" });
          if ("text" in transcription) transcript = transcription.text;
        } catch (error) {
          console.warn("[TrueFix] Voice transcription unavailable; continuing with media-only report", error);
        }
      }
      return createReport({
        id,
        category: input.category,
        location: input.location,
        ward: input.latitude !== undefined && input.longitude !== undefined ? detectWardFromCoordinates(input.latitude, input.longitude) : input.ward,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        durationDays: input.durationDays,
        transcript: transcript ?? null,
        photoUrl: photo?.url ?? null,
        audioUrl: audio?.url ?? null,
        status: "In review",
        confidence: 94,
      });
    }),
  }),
});

export type AppRouter = typeof appRouter;
