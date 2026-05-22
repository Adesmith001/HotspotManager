import {getDatabase} from '../index';
import {ConnectedDevice} from '../../types/domain';

export const upsertDevice = async (device: ConnectedDevice): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO devices (
      id,
      displayName,
      nickname,
      vendor,
      ipAddress,
      macAddress,
      blocked,
      trusted,
      policyStatus,
      firstSeenAt,
      lastSeenAt,
      connectionCount
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      device.id,
      device.displayName,
      device.nickname ?? null,
      device.vendor ?? null,
      device.ipAddress ?? null,
      device.macAddress ?? null,
      device.blocked ? 1 : 0,
      device.trusted ? 1 : 0,
      device.policyStatus,
      device.firstSeenAt,
      device.lastSeenAt,
      device.connectionCount,
    ],
  );
};

export const getDevices = async (): Promise<ConnectedDevice[]> => {
  const db = await getDatabase();
  const [resultSet] = await db.executeSql(`SELECT * FROM devices;`);
  const devices: ConnectedDevice[] = [];
  for (let i = 0; i < resultSet.rows.length; i += 1) {
    const row = resultSet.rows.item(i);
    devices.push({
      id: row.id,
      displayName: row.displayName,
      nickname: row.nickname ?? undefined,
      vendor: row.vendor ?? undefined,
      ipAddress: row.ipAddress ?? undefined,
      macAddress: row.macAddress ?? undefined,
      blocked: row.blocked === 1,
      trusted: row.trusted === 1,
      policyStatus: row.policyStatus ?? 'normal',
      firstSeenAt: row.firstSeenAt ?? row.lastSeenAt,
      lastSeenAt: row.lastSeenAt,
      connectionCount: row.connectionCount ?? 1,
    });
  }
  return devices;
};
