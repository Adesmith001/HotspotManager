import {getDatabase} from '../index';
import {UsageRecord} from '../../types/domain';

export const addUsageRecord = async (record: UsageRecord): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO usage_records (id, deviceId, timestamp, bytesUsed) VALUES (?, ?, ?, ?);`,
    [record.id, record.deviceId, record.timestamp, record.bytesUsed],
  );
};

export const getUsageRecords = async (): Promise<UsageRecord[]> => {
  const db = await getDatabase();
  const [resultSet] = await db.executeSql(`SELECT * FROM usage_records;`);
  const records: UsageRecord[] = [];
  for (let i = 0; i < resultSet.rows.length; i += 1) {
    const row = resultSet.rows.item(i);
    records.push({
      id: row.id,
      deviceId: row.deviceId,
      timestamp: row.timestamp,
      bytesUsed: row.bytesUsed,
    });
  }
  return records;
};
