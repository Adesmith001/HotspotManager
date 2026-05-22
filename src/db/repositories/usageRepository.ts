import {getDatabase} from '../index';
import {UsageRecord, UsageSnapshot} from '../../types/domain';

export const addUsageSnapshot = async (snapshot: UsageSnapshot): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO usage_snapshots (id, deviceId, timestamp, bytesUsed, periodKey, source) VALUES (?, ?, ?, ?, ?, ?);`,
    [
      snapshot.id,
      snapshot.deviceId,
      snapshot.timestamp,
      snapshot.bytesUsed,
      snapshot.periodKey,
      snapshot.source,
    ],
  );
};

export const getUsageSnapshots = async (): Promise<UsageSnapshot[]> => {
  const db = await getDatabase();
  const [resultSet] = await db.executeSql(`SELECT * FROM usage_snapshots;`);
  const snapshots: UsageSnapshot[] = [];
  for (let i = 0; i < resultSet.rows.length; i += 1) {
    const row = resultSet.rows.item(i);
    snapshots.push({
      id: row.id,
      deviceId: row.deviceId,
      timestamp: row.timestamp,
      bytesUsed: row.bytesUsed,
      periodKey: row.periodKey,
      source: row.source,
    });
  }
  return snapshots;
};

export const addUsageRecord = async (record: UsageRecord): Promise<void> => {
  await addUsageSnapshot({
    ...record,
    periodKey: new Date(record.timestamp).toISOString().slice(0, 10),
    source: 'estimated',
  });
};

export const getUsageRecords = async (): Promise<UsageRecord[]> => {
  const snapshots = await getUsageSnapshots();
  return snapshots.map(snapshot => ({
    id: snapshot.id,
    deviceId: snapshot.deviceId,
    timestamp: snapshot.timestamp,
    bytesUsed: snapshot.bytesUsed,
  }));
};
