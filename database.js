import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DATABASE_PATH =
  process.env.DATABASE_PATH || "./data/montadoria.db";

const databaseDirectory = path.dirname(
  path.resolve(DATABASE_PATH)
);

if (DATABASE_PATH !== ":memory:") {
  fs.mkdirSync(databaseDirectory, { recursive: true });
}

const db = new Database(DATABASE_PATH);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ========================================
// USERS
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    display_name TEXT NOT NULL,

    money INTEGER NOT NULL DEFAULT 0,
    infinite_money INTEGER NOT NULL DEFAULT 0,
    bank INTEGER NOT NULL DEFAULT 0,

    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,

    role TEXT NOT NULL DEFAULT 'user',
    job TEXT,
    race TEXT,

    hunger INTEGER NOT NULL DEFAULT 100,
    sleep INTEGER NOT NULL DEFAULT 100,

    last_food_at TEXT,
    last_sleep_at TEXT,
    last_blood_at TEXT,

    warnings INTEGER NOT NULL DEFAULT 0,
    muted INTEGER NOT NULL DEFAULT 0,
    approved INTEGER NOT NULL DEFAULT 0,

    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    permission_required INTEGER NOT NULL DEFAULT 1,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS rp_groups (
    chat_id INTEGER PRIMARY KEY,
    title TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS warning_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL,
    cleared_at TEXT
  );

  CREATE TABLE IF NOT EXISTS observer_admins (
    telegram_id INTEGER PRIMARY KEY,
    added_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER,
    chat_id INTEGER,
    event_type TEXT NOT NULL,
    details TEXT,
    created_at TEXT NOT NULL
  );
`);

// ========================================
// DATABASE MIGRATIONS
// Add missing columns to existing databases.
// ========================================

const existingColumns = db
  .prepare("PRAGMA table_info(users)")
  .all()
  .map((column) => column.name);

const migrations = {
  infinite_money:
    "ALTER TABLE users ADD COLUMN infinite_money INTEGER NOT NULL DEFAULT 0",

  bank:
    "ALTER TABLE users ADD COLUMN bank INTEGER NOT NULL DEFAULT 0",

  xp:
    "ALTER TABLE users ADD COLUMN xp INTEGER NOT NULL DEFAULT 0",

  level:
    "ALTER TABLE users ADD COLUMN level INTEGER NOT NULL DEFAULT 1",

  role:
    "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'",

  job:
    "ALTER TABLE users ADD COLUMN job TEXT",

  race:
    "ALTER TABLE users ADD COLUMN race TEXT",

  hunger:
    "ALTER TABLE users ADD COLUMN hunger INTEGER NOT NULL DEFAULT 100",

  sleep:
    "ALTER TABLE users ADD COLUMN sleep INTEGER NOT NULL DEFAULT 100",

  last_food_at:
    "ALTER TABLE users ADD COLUMN last_food_at TEXT",

  last_sleep_at:
    "ALTER TABLE users ADD COLUMN last_sleep_at TEXT",

  last_blood_at:
    "ALTER TABLE users ADD COLUMN last_blood_at TEXT",

  warnings:
    "ALTER TABLE users ADD COLUMN warnings INTEGER NOT NULL DEFAULT 0",

  muted:
    "ALTER TABLE users ADD COLUMN muted INTEGER NOT NULL DEFAULT 0",

  approved:
    "ALTER TABLE users ADD COLUMN approved INTEGER NOT NULL DEFAULT 0"
};

for (const [column, sql] of Object.entries(migrations)) {
  if (!existingColumns.includes(column)) {
    db.exec(sql);
  }
}

// ========================================
// DEFAULT JOBS
// ========================================

const defaultJobs = [
  ["کارمند دولت", "government"],
  ["شهرداری", "government"],
  ["ثبت احوال", "government"],
  ["پلیس", "law"],
  ["کارآگاه", "law"],
  ["قاضی", "law"],
  ["وکیل", "law"],
  ["پزشک", "medical"],
  ["پرستار", "medical"],
  ["کارمند بانک", "finance"],
  ["حسابدار", "finance"],
  ["مشاور املاک", "business"],
  ["فروشنده", "business"],
  ["آشپز", "service"],
  ["گارسون", "service"],
  ["کارمند هتل", "service"],
  ["مکانیک", "technical"],
  ["کشاورز", "agriculture"],
  ["دامدار", "agriculture"],
  ["کارگر اصطبل", "agriculture"],
  ["مربی اسب", "agriculture"],
  ["دامپزشک", "medical"],
  ["مربی بدنسازی", "fitness"],
  ["خبرنگار", "media"],
  ["نگهبان", "security"],
  ["عضو خاندان BONDS", "family"]
];

const insertJob = db.prepare(`
  INSERT OR IGNORE INTO jobs (
    name,
    category,
    description,
    permission_required,
    active,
    created_at
  )
  VALUES (?, ?, ?, 1, 1, ?)
`);

const insertDefaultJobs = db.transaction(() => {
  for (const [name, category] of defaultJobs) {
    insertJob.run(
      name,
      category,
      "برای فعالیت در این شغل، مجوز مربوطه لازم است.",
      new Date().toISOString()
    );
  }
});

insertDefaultJobs();

// ========================================
// OWNER INITIALIZATION
// ========================================

const OWNER_ID = Number(process.env.OWNER_ID);

if (Number.isSafeInteger(OWNER_ID) && OWNER_ID > 0) {
  const owner = db
    .prepare(
      "SELECT telegram_id FROM users WHERE telegram_id = ?"
    )
    .get(OWNER_ID);

  if (owner) {
    db.prepare(`
      UPDATE users
      SET role = 'owner',
          updated_at = ?
      WHERE telegram_id = ?
    `).run(new Date().toISOString(), OWNER_ID);
  }
}

// ========================================
// OBSERVER ADMIN INITIALIZATION
// ========================================

const configuredAdmins = (
  process.env.OBSERVER_ADMIN_IDS || ""
)
  .split(",")
  .map((value) => Number(value.trim()))
  .filter(
    (id) => Number.isSafeInteger(id) && id > 0
  );

const insertAdmin = db.prepare(`
  INSERT OR IGNORE INTO observer_admins (
    telegram_id,
    added_at
  )
  VALUES (?, ?)
`);

for (const adminId of configuredAdmins) {
  insertAdmin.run(adminId, new Date().toISOString());
}

// ========================================
// EXPORT
// ========================================

export default db;
