CREATE TABLE radar_snapshots (
 id TEXT PRIMARY KEY NOT NULL,
 payload_json TEXT NOT NULL,
 saved_at INTEGER NOT NULL
);
--> statement-breakpoint
CREATE TABLE weekly_summaries (
 fingerprint TEXT PRIMARY KEY NOT NULL,
 category TEXT NOT NULL,
 payload_json TEXT NOT NULL,
 generated_at TEXT NOT NULL,
 model TEXT NOT NULL,
 prompt_version TEXT NOT NULL
);
--> statement-breakpoint
CREATE TABLE summary_control (
 id TEXT PRIMARY KEY NOT NULL,
 lease_until INTEGER NOT NULL DEFAULT 0,
 retry_after INTEGER NOT NULL DEFAULT 0,
 token TEXT NOT NULL DEFAULT '',
 last_error TEXT NOT NULL DEFAULT ''
);
