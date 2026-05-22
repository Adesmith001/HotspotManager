export const migrations = [
  {
    id: 1,
    sql: `CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY NOT NULL,
      displayName TEXT NOT NULL,
      blocked INTEGER NOT NULL DEFAULT 0,
      lastSeenAt INTEGER NOT NULL
    );`,
  },
  {
    id: 2,
    sql: `CREATE TABLE IF NOT EXISTS usage_records (
      id TEXT PRIMARY KEY NOT NULL,
      deviceId TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      bytesUsed INTEGER NOT NULL
    );`,
  },
  {
    id: 3,
    sql: `CREATE TABLE IF NOT EXISTS schedules (
      id TEXT PRIMARY KEY NOT NULL,
      scope TEXT NOT NULL,
      deviceId TEXT,
      dayOfWeek INTEGER NOT NULL,
      startHour INTEGER NOT NULL,
      endHour INTEGER NOT NULL,
      cap INTEGER NOT NULL
    );`,
  },
  {
    id: 4,
    sql: `CREATE TABLE IF NOT EXISTS device_plans (
      id TEXT PRIMARY KEY NOT NULL,
      deviceId TEXT NOT NULL,
      planName TEXT NOT NULL,
      byteCap INTEGER NOT NULL,
      overageAction TEXT NOT NULL,
      scheduleRuleId TEXT
    );`,
  },
  {
    id: 5,
    sql: `CREATE TABLE IF NOT EXISTS usage_snapshots (
      id TEXT PRIMARY KEY NOT NULL,
      deviceId TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      bytesUsed INTEGER NOT NULL,
      periodKey TEXT NOT NULL,
      source TEXT NOT NULL
    );`,
  },
  {
    id: 6,
    sql: `CREATE TABLE IF NOT EXISTS activity_events (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      severity TEXT NOT NULL,
      deviceId TEXT
    );`,
  },
  {
    id: 7,
    sql: `CREATE TABLE IF NOT EXISTS device_policies (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      scope TEXT NOT NULL,
      deviceId TEXT,
      enabled INTEGER NOT NULL,
      byteCap INTEGER,
      warningThresholdPct INTEGER NOT NULL,
      overageAction TEXT NOT NULL,
      allowTrustedBypass INTEGER NOT NULL,
      fallbackBehavior TEXT NOT NULL,
      scheduleRuleId TEXT
    );`,
  },
  {
    id: 8,
    sql: `CREATE TABLE IF NOT EXISTS automation_profiles (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL,
      enabled INTEGER NOT NULL,
      triggerDescription TEXT NOT NULL,
      reaction TEXT NOT NULL
    );`,
  },
  {
    id: 9,
    sql: `CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`,
  },
  {
    id: 10,
    sql: `ALTER TABLE devices ADD COLUMN nickname TEXT;`,
  },
  {
    id: 11,
    sql: `ALTER TABLE devices ADD COLUMN vendor TEXT;`,
  },
  {
    id: 12,
    sql: `ALTER TABLE devices ADD COLUMN ipAddress TEXT;`,
  },
  {
    id: 13,
    sql: `ALTER TABLE devices ADD COLUMN macAddress TEXT;`,
  },
  {
    id: 14,
    sql: `ALTER TABLE devices ADD COLUMN trusted INTEGER NOT NULL DEFAULT 0;`,
  },
  {
    id: 15,
    sql: `ALTER TABLE devices ADD COLUMN policyStatus TEXT NOT NULL DEFAULT 'normal';`,
  },
  {
    id: 16,
    sql: `ALTER TABLE devices ADD COLUMN firstSeenAt INTEGER NOT NULL DEFAULT 0;`,
  },
  {
    id: 17,
    sql: `ALTER TABLE devices ADD COLUMN connectionCount INTEGER NOT NULL DEFAULT 0;`,
  },
];
