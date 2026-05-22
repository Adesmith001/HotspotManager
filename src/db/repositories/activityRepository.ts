import {getDatabase} from '../index';
import {ActivityEvent} from '../../types/domain';

export const addActivityEvent = async (event: ActivityEvent): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO activity_events (id, type, title, details, timestamp, severity, deviceId) VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      event.id,
      event.type,
      event.title,
      event.details,
      event.timestamp,
      event.severity,
      event.deviceId ?? null,
    ],
  );
};

export const getActivityEvents = async (): Promise<ActivityEvent[]> => {
  const db = await getDatabase();
  const [resultSet] = await db.executeSql(
    `SELECT * FROM activity_events ORDER BY timestamp DESC;`,
  );
  const events: ActivityEvent[] = [];
  for (let index = 0; index < resultSet.rows.length; index += 1) {
    const row = resultSet.rows.item(index);
    events.push({
      id: row.id,
      type: row.type,
      title: row.title,
      details: row.details,
      timestamp: row.timestamp,
      severity: row.severity,
      deviceId: row.deviceId ?? undefined,
    });
  }
  return events;
};
