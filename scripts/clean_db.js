import Database from "better-sqlite3";
import path from "path";

const dbPath = path.resolve("./data/truefix.db");
const db = new Database(dbPath);

const res = db.prepare("DELETE FROM reports WHERE id NOT IN ('cmp-027', 'cmp-026', 'cmp-025', 'cmp-024', 'cmp-023')").run();
console.log("Deleted test entries:", res.changes);

const remaining = db.prepare("SELECT id, trackingId, category, status, title FROM reports").all();
console.log("Remaining clean reports:", remaining.length);
console.log(remaining);
