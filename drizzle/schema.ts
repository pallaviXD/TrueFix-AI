import { double, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const reports = mysqlTable("reports", {
  id: varchar("id", { length: 32 }).primaryKey(),
  category: mysqlEnum("category", ["Garbage accumulation", "Pothole"]).notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  ward: varchar("ward", { length: 128 }).notNull(),
  latitude: double("latitude"),
  longitude: double("longitude"),
  durationDays: int("durationDays").notNull().default(1),
  transcript: text("transcript"),
  photoUrl: text("photoUrl"),
  audioUrl: text("audioUrl"),
  resolutionNotes: text("resolutionNotes"),
  citizenComments: text("citizenComments"),
  status: mysqlEnum("status", ["In review", "Assigned", "Resolved", "Disputed"]).notNull().default("In review"),
  confidence: int("confidence").notNull().default(94),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;
