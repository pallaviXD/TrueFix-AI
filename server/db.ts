import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { InsertReport, InsertUser, Report, User } from "../drizzle/schema";

let _db: Database.Database | null = null;

function getDbPath(): string {
  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    return path.resolve("./data/test.db");
  }
  const envUrl = process.env.DATABASE_URL || "./data/truefix.db";
  // If connection string starts with sqlite: or sqlite://
  const cleanPath = envUrl.replace(/^sqlite:\/\//i, "").replace(/^sqlite:/i, "");
  return path.resolve(cleanPath);
}

export function initDb(): Database.Database {
  if (_db) return _db;
  const dbPath = getDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");

  // Create tables
  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      openId TEXT NOT NULL UNIQUE,
      name TEXT,
      email TEXT,
      loginMethod TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      lastSignedIn TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      trackingId TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'In review',
      title TEXT,
      titleKannada TEXT,
      caption TEXT,
      ward TEXT NOT NULL,
      department TEXT,
      confidence REAL DEFAULT 94,
      severity TEXT DEFAULT 'medium',
      location TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      durationDays INTEGER DEFAULT 1,
      transcript TEXT,
      photoUrl TEXT,
      audioUrl TEXT,
      audioDuration REAL,
      audioTranscript TEXT,
      audioTranscriptKannada TEXT,
      afterPhoto TEXT,
      duplicateOf TEXT,
      resolutionNotes TEXT,
      citizenComments TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  try {
    _db.exec("ALTER TABLE reports ADD COLUMN severity TEXT DEFAULT 'medium'");
  } catch {}

  // Seed default data if reports table is empty
  const countStmt = _db.prepare("SELECT COUNT(*) as count FROM reports");
  const { count } = countStmt.get() as { count: number };
  if (count === 0) {
    seedInitialReports(_db);
  }

  return _db;
}

function seedInitialReports(db: Database.Database) {
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO reports (
      id, trackingId, category, status, title, titleKannada, caption,
      ward, department, confidence, location, latitude, longitude,
      durationDays, transcript, photoUrl, audioUrl, audioDuration,
      audioTranscript, audioTranscriptKannada, afterPhoto, duplicateOf,
      resolutionNotes, citizenComments, createdAt, updatedAt
    ) VALUES (
      @id, @trackingId, @category, @status, @title, @titleKannada, @caption,
      @ward, @department, @confidence, @location, @latitude, @longitude,
      @durationDays, @transcript, @photoUrl, @audioUrl, @audioDuration,
      @audioTranscript, @audioTranscriptKannada, @afterPhoto, @duplicateOf,
      @resolutionNotes, @citizenComments, @createdAt, @updatedAt
    )
  `);

  const initialReports = [
    {
      id: "cmp-027",
      trackingId: "NF-2026-0919-027",
      category: "Garbage accumulation",
      status: "Needs Review",
      title: "Overflowing waste collection point near 12th Main",
      titleKannada: "12ನೇ ಮುಖ್ಯ ರಸ್ತೆಯ ಬಳಿ ತುಂಬಿ ಹರಿಯುತ್ತಿರುವ ಕಸದ ಸಂಗ್ರಹಣಾ ಸ್ಥಳ",
      caption: "Garbage has been piling up beside the bus stop for three days.",
      ward: "151 · Domlur",
      department: "BBMP Solid Waste Management",
      confidence: 89,
      location: "12th Main Road, Indiranagar",
      latitude: 12.9784,
      longitude: 77.6408,
      durationDays: 3,
      transcript: "Garbage has been piling up beside the bus stop for three days. It blocks pedestrians.",
      photoUrl: "/evidence/garbage-before.jpg",
      audioUrl: "sample",
      audioDuration: 8,
      audioTranscript: "Garbage has been piling up beside the bus stop for three days. It blocks pedestrians.",
      audioTranscriptKannada: "12ನೇ ಮುಖ್ಯ ರಸ್ತೆಯ ಬಸ್ ನಿಲ್ದಾಣದ ಬಳಿ ಮೂರು ದಿನಗಳಿಂದ ಕಸ ಸಂಗ್ರಹವಾಗಿದ್ದು, ಪಾದಚಾರಿಗಳಿಗೆ ಅಡ್ಡಿಯಾಗಿದೆ.",
      afterPhoto: null,
      duplicateOf: "NF-2026-0919-024",
      resolutionNotes: null,
      citizenComments: JSON.stringify([
        {
          id: "comm-1",
          text: "The garbage truck skipped this junction this morning as well. Bags are now spreading into the road.",
          createdAt: "2026-09-19T14:30:00+05:30",
          author: "Indiranagar Resident",
        },
        {
          id: "comm-2",
          text: "BBMP junior health inspector visited the site. Awaiting compactor vehicle dispatch.",
          createdAt: "2026-09-19T16:15:00+05:30",
          author: "Ward 151 Field Coordinator",
        },
      ]),
      createdAt: "2026-09-19T12:18:00+05:30",
      updatedAt: "2026-09-19T12:18:00+05:30",
    },
    {
      id: "cmp-026",
      trackingId: "NF-2026-0919-026",
      category: "Pothole",
      status: "Routed",
      title: "Deep pothole creating a hazard for two-wheelers",
      titleKannada: "ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಅಪಾಯ ಉಂಟುಮಾಡುತ್ತಿರುವ ಆಳವಾದ ರಸ್ತೆ ಗುಂಡಿ",
      caption: "Large pothole after the metro pillar; water collects here when it rains.",
      ward: "150 · Koramangala",
      department: "BBMP Road Infrastructure",
      confidence: 94,
      location: "80 Feet Road, Koramangala",
      latitude: 12.9352,
      longitude: 77.6245,
      durationDays: 2,
      transcript: "Large pothole after the metro pillar; water collects here when it rains.",
      photoUrl: "/evidence/pothole-before.jpg",
      audioUrl: "sample",
      audioDuration: 12,
      audioTranscript: "Large pothole after the metro pillar; water collects here when it rains.",
      audioTranscriptKannada: "80 ಅಡಿ ರಸ್ತೆಯ ಮೆಟ್ರೋ ಪಿಲ್ಲರ್ 150 ಬಳಿ ಆಳವಾದ ರಸ್ತೆ ಗುಂಡಿ ಇದೆ. ದ್ವಿಚಕ್ರ ವಾಹನಗಳಿಗೆ ಅಪಾಯಕಾರಿಯಾಗಿದೆ.",
      afterPhoto: null,
      duplicateOf: null,
      resolutionNotes: null,
      citizenComments: JSON.stringify([
        {
          id: "comm-3",
          text: "Temporary barricade has been placed around the pothole while asphalt team is mobilized.",
          createdAt: "2026-09-19T09:00:00+05:30",
          author: "Koramangala Traffic Police",
        },
      ]),
      createdAt: "2026-09-18T17:42:00+05:30",
      updatedAt: "2026-09-18T17:42:00+05:30",
    },
    {
      id: "cmp-025",
      trackingId: "NF-2026-0918-025",
      category: "Garbage accumulation",
      status: "Submitted",
      title: "Mixed waste dumped beside the footpath",
      titleKannada: "ಪಾದಚಾರಿ ಮಾರ್ಗದ ಪಕ್ಕದಲ್ಲಿ ಮಿಶ್ರ ಕಸ ಎಸೆಯಲಾಗಿದೆ",
      caption: "The footpath is blocked by bags and food waste.",
      ward: "147 · HSR Layout",
      department: "BBMP Solid Waste Management",
      confidence: 86,
      location: "27th Main, HSR Layout",
      latitude: 12.9116,
      longitude: 77.6389,
      durationDays: 1,
      transcript: "The footpath is blocked by bags and food waste.",
      photoUrl: "/evidence/garbage-before.jpg",
      audioUrl: null,
      audioDuration: null,
      audioTranscript: null,
      audioTranscriptKannada: null,
      afterPhoto: null,
      duplicateOf: null,
      resolutionNotes: null,
      citizenComments: JSON.stringify([]),
      createdAt: "2026-09-18T09:06:00+05:30",
      updatedAt: "2026-09-18T09:06:00+05:30",
    },
    {
      id: "cmp-024",
      trackingId: "NF-2026-0917-024",
      category: "Pothole",
      status: "Resolved",
      title: "Road surface broken near the school crossing",
      titleKannada: "ಶಾಲೆಯ ಕ್ರಾಸಿಂಗ್ ಬಳಿ ಹಾಳಾದ ರಸ್ತೆ ಮೇಲ್ಮೈ",
      caption: "The patch had widened and was difficult to see at night.",
      ward: "154 · Jayanagar",
      department: "BBMP Road Infrastructure",
      confidence: 91,
      location: "4th Block, Jayanagar",
      latitude: 12.925,
      longitude: 77.5938,
      durationDays: 4,
      transcript: "The patch had widened and was difficult to see at night.",
      photoUrl: "/evidence/pothole-before.jpg",
      audioUrl: null,
      audioDuration: null,
      audioTranscript: null,
      audioTranscriptKannada: null,
      afterPhoto: "/evidence/pothole-after.jpg",
      duplicateOf: null,
      resolutionNotes: "Before/after photo checked by the reporter on 19 Sep 2026.",
      citizenComments: JSON.stringify([]),
      createdAt: "2026-09-17T14:22:00+05:30",
      updatedAt: "2026-09-17T14:22:00+05:30",
    },
    {
      id: "cmp-023",
      trackingId: "NF-2026-0916-023",
      category: "Garbage accumulation",
      status: "Disputed",
      title: "Overflowing bin still blocking the lane",
      titleKannada: "ತುಂಬಿದ ಕಸದ ಬುಟ್ಟಿ ಇನ್ನೂ ದಾರಿಯನ್ನು ತಡೆಯುತ್ತಿದೆ",
      caption: "Marked resolved, but bags are still being left around the bin.",
      ward: "149 · BTM Layout",
      department: "BBMP Solid Waste Management",
      confidence: 83,
      location: "2nd Stage, BTM Layout",
      latitude: 12.9166,
      longitude: 77.6101,
      durationDays: 3,
      transcript: "Marked resolved, but bags are still being left around the bin.",
      photoUrl: "/evidence/garbage-before.jpg",
      audioUrl: null,
      audioDuration: null,
      audioTranscript: null,
      audioTranscriptKannada: null,
      afterPhoto: "/evidence/garbage-after.jpg",
      duplicateOf: null,
      resolutionNotes: null,
      citizenComments: JSON.stringify([]),
      createdAt: "2026-09-16T19:05:00+05:30",
      updatedAt: "2026-09-16T19:05:00+05:30",
    },
  ];

  for (const report of initialReports) {
    insertStmt.run(report);
  }
}

export async function getDb(): Promise<Database.Database> {
  return initDb();
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO users (openId, name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(openId) DO UPDATE SET
      name = COALESCE(excluded.name, users.name),
      email = COALESCE(excluded.email, users.email),
      loginMethod = COALESCE(excluded.loginMethod, users.loginMethod),
      role = COALESCE(excluded.role, users.role),
      updatedAt = excluded.updatedAt,
      lastSignedIn = excluded.lastSignedIn
  `);
  stmt.run(
    user.openId,
    user.name ?? null,
    user.email ?? null,
    user.loginMethod ?? null,
    user.role ?? "user",
    now,
    now,
    user.lastSignedIn ? new Date(user.lastSignedIn).toISOString() : now
  );
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  const stmt = db.prepare("SELECT * FROM users WHERE openId = ? LIMIT 1");
  const row = stmt.get(openId) as any;
  if (!row) return undefined;
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
    lastSignedIn: new Date(row.lastSignedIn),
  };
}

export async function createReport(report: any): Promise<Report> {
  const db = await getDb();
  const now = new Date().toISOString();
  const trackingId = report.trackingId || report.id;
  const isPothole = /pothole/i.test(report.category);
  const category = isPothole ? "Pothole" : "Garbage accumulation";
  const department = report.department || (isPothole ? "BBMP Road Infrastructure" : "BBMP Solid Waste Management");

  const stmt = db.prepare(`
    INSERT INTO reports (
      id, trackingId, category, status, title, titleKannada, caption,
      ward, department, confidence, severity, location, latitude, longitude,
      durationDays, transcript, photoUrl, audioUrl, audioDuration,
      audioTranscript, audioTranscriptKannada, afterPhoto, duplicateOf,
      resolutionNotes, citizenComments, createdAt, updatedAt
    ) VALUES (
      @id, @trackingId, @category, @status, @title, @titleKannada, @caption,
      @ward, @department, @confidence, @severity, @location, @latitude, @longitude,
      @durationDays, @transcript, @photoUrl, @audioUrl, @audioDuration,
      @audioTranscript, @audioTranscriptKannada, @afterPhoto, @duplicateOf,
      @resolutionNotes, @citizenComments, @createdAt, @updatedAt
    )
  `);

  const values = {
    id: report.id,
    trackingId,
    category,
    status: report.status || "In review",
    title: report.title || (isPothole ? "Road damage detected near the reported location" : "Uncollected waste detected near the reported location"),
    titleKannada: report.titleKannada || (isPothole ? "ವರದಿ ಮಾಡಿದ ಸ್ಥಳದ ಬಳಿ ರಸ್ತೆ ಹಾನಿ ಪತ್ತೆಯಾಗಿದೆ" : "ವರದಿ ಮಾಡಿದ ಸ್ಥಳದ ಬಳಿ ಸಂಗ್ರಹಿಸದ ಕಸ ಪತ್ತೆಯಾಗಿದೆ"),
    caption: report.caption || report.transcript || "Photo submitted",
    ward: report.ward || "Ward 151 · Domlur",
    department,
    confidence: typeof report.confidence === "number" ? (report.confidence <= 1 ? Math.round(report.confidence * 100) : report.confidence) : 94,
    severity: report.severity || "medium",
    location: report.location,
    latitude: report.latitude ?? null,
    longitude: report.longitude ?? null,
    durationDays: report.durationDays ?? 1,
    transcript: report.transcript ?? report.audioTranscript ?? null,
    photoUrl: report.photoUrl || report.photo || null,
    audioUrl: report.audioUrl ?? null,
    audioDuration: report.audioDuration ?? null,
    audioTranscript: report.audioTranscript ?? null,
    audioTranscriptKannada: report.audioTranscriptKannada ?? null,
    afterPhoto: report.afterPhoto ?? null,
    duplicateOf: report.duplicateOf ?? null,
    resolutionNotes: report.resolutionNotes ?? report.resolutionNote ?? null,
    citizenComments: report.citizenComments ? (typeof report.citizenComments === "string" ? report.citizenComments : JSON.stringify(report.citizenComments)) : JSON.stringify([]),
    createdAt: report.createdAt || now,
    updatedAt: now,
  };

  stmt.run(values);
  return getReport(report.id) as Promise<Report>;
}

export async function getReport(idOrTrackingId: string): Promise<Report | undefined> {
  const db = await getDb();
  const stmt = db.prepare("SELECT * FROM reports WHERE LOWER(id) = LOWER(?) OR LOWER(trackingId) = LOWER(?) LIMIT 1");
  const row = stmt.get(idOrTrackingId, idOrTrackingId) as any;
  if (!row) return undefined;
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export async function listReports(limit = 50): Promise<Report[]> {
  const db = await getDb();
  const stmt = db.prepare("SELECT * FROM reports ORDER BY createdAt DESC LIMIT ?");
  const rows = stmt.all(limit) as any[];
  return rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}

export async function updateReportStatus(
  id: string,
  status: "In review" | "Assigned" | "Resolved" | "Disputed" | "Submitted" | "Routed" | "Needs Review",
  resolutionNotes?: string
): Promise<Report | undefined> {
  const db = await getDb();
  const now = new Date().toISOString();
  if (resolutionNotes !== undefined) {
    const stmt = db.prepare("UPDATE reports SET status = ?, resolutionNotes = ?, updatedAt = ? WHERE LOWER(id) = LOWER(?) OR LOWER(trackingId) = LOWER(?)");
    stmt.run(status, resolutionNotes, now, id, id);
  } else {
    const stmt = db.prepare("UPDATE reports SET status = ?, updatedAt = ? WHERE LOWER(id) = LOWER(?) OR LOWER(trackingId) = LOWER(?)");
    stmt.run(status, now, id, id);
  }
  return getReport(id);
}

export async function updateAfterPhoto(id: string, afterPhoto: string): Promise<Report | undefined> {
  const db = await getDb();
  const now = new Date().toISOString();
  const stmt = db.prepare("UPDATE reports SET afterPhoto = ?, updatedAt = ? WHERE LOWER(id) = LOWER(?) OR LOWER(trackingId) = LOWER(?)");
  stmt.run(afterPhoto, now, id, id);
  return getReport(id);
}

export async function appendCitizenComment(id: string, text: string, author = "Bengaluru Citizen") {
  const db = await getDb();
  const report = await getReport(id);
  if (!report) return undefined;
  let comments: Array<{ id: string; text: string; createdAt: string; author?: string }> = [];
  try {
    const parsed = report.citizenComments ? JSON.parse(report.citizenComments) : [];
    if (Array.isArray(parsed)) {
      comments = parsed;
    }
  } catch {
    comments = [];
  }
  const newComment = {
    id: `comm-${Date.now()}`,
    text,
    createdAt: new Date().toISOString(),
    author,
  };
  comments.push(newComment);
  const now = new Date().toISOString();
  const stmt = db.prepare("UPDATE reports SET citizenComments = ?, updatedAt = ? WHERE LOWER(id) = LOWER(?) OR LOWER(trackingId) = LOWER(?)");
  stmt.run(JSON.stringify(comments), now, id, id);
  return newComment;
}

export function normalizeComplaintStatus(status: string | null | undefined): "Submitted" | "Routed" | "Needs Review" | "Resolved" | "Disputed" {
  const s = String(status || "").trim().toLowerCase();
  if (s.includes("review")) return "Needs Review";
  if (s.includes("rout") || s.includes("progress")) return "Routed";
  if (s.includes("resolv") || s.includes("fix")) return "Resolved";
  if (s.includes("disput")) return "Disputed";
  return "Submitted";
}

// Client Complaint shape converter
export function toComplaint(row: any): any {
  if (!row) return null;
  const isPothole = /pothole/i.test(row.category);
  let comments = [];
  try {
    if (row.citizenComments) comments = JSON.parse(row.citizenComments);
  } catch {}

  const rawConf = Number(row.confidence) || 94;
  const confidence = rawConf > 1 ? rawConf / 100 : rawConf;

  return {
    id: row.id,
    trackingId: row.trackingId || row.id,
    category: isPothole ? "pothole" : "garbage",
    status: normalizeComplaintStatus(row.status),
    title: row.title || (isPothole ? "Road damage detected near the reported location" : "Uncollected waste detected near the reported location"),
    titleKannada: row.titleKannada || (isPothole ? "ವರದಿ ಮಾಡಿದ ಸ್ಥಳದ ಬಳಿ ರಸ್ತೆ ಹಾನಿ ಪತ್ತೆಯಾಗಿದೆ" : "ವರದಿ ಮಾಡಿದ ಸ್ಥಳದ ಬಳಿ ಸಂಗ್ರಹಿಸದ ಕಸ ಪತ್ತೆಯಾಗಿದೆ"),
    caption: row.caption || row.transcript || "Citizen report",
    ward: row.ward,
    department: row.department || (isPothole ? "BBMP Road Infrastructure" : "BBMP Solid Waste Management"),
    confidence,
    severity: row.severity || "medium",
    location: row.location,
    coordinates: {
      lat: row.latitude ?? 12.9784,
      lng: row.longitude ?? 77.6408,
    },
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    photo: row.photoUrl || "/evidence/garbage-before.jpg",
    audioUrl: row.audioUrl || undefined,
    audioDuration: row.audioDuration || undefined,
    audioTranscript: row.audioTranscript || row.transcript || undefined,
    audioTranscriptKannada: row.audioTranscriptKannada || undefined,
    afterPhoto: row.afterPhoto || undefined,
    duplicateOf: row.duplicateOf || undefined,
    resolutionNote: row.resolutionNotes || undefined,
    comments,
  };
}

export async function getAllComplaints(): Promise<any[]> {
  const reports = await listReports(100);
  return reports.map(toComplaint);
}

export async function getComplaintByIdOrTrackingId(id: string): Promise<any | null> {
  const report = await getReport(id);
  return report ? toComplaint(report) : null;
}
