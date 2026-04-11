import {getDatabase} from '../index';
import {ConnectedDevice} from '../../types/domain';

export const upsertDevice = async (device: ConnectedDevice): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO devices (id, displayName, blocked, lastSeenAt) VALUES (?, ?, ?, ?);`,
    [device.id, device.displayName, device.blocked ? 1 : 0, device.lastSeenAt],
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
      blocked: row.blocked === 1,
      lastSeenAt: row.lastSeenAt,
    });
  }
  return devices;
};
