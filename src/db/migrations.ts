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
];
