import {getDatabase} from '../index';
import {AppSettings} from '../../types/domain';

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  autoRefreshSeconds: 15,
  showApproximateUsage: true,
  backupUpdatedAt: null,
};

export const saveSettings = async (settings: AppSettings): Promise<void> => {
  const entries = Object.entries(settings) as [string, unknown][];
  for (const [key, value] of entries) {
    await saveAppValue(key, value);
  }
};

export const getSettings = async (): Promise<AppSettings> => {
  const raw = await getAllAppValues();
  return {
    ...defaultSettings,
    ...raw,
  } as AppSettings;
};

export const saveAppValue = async (key: string, value: unknown): Promise<void> => {
  const db = await getDatabase();
  await db.executeSql(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?);`,
    [key, JSON.stringify(value)],
  );
};

export const getAllAppValues = async (): Promise<Record<string, unknown>> => {
  const db = await getDatabase();
  const [resultSet] = await db.executeSql(`SELECT * FROM app_settings;`);
  const raw: Record<string, unknown> = {};

  for (let index = 0; index < resultSet.rows.length; index += 1) {
    const row = resultSet.rows.item(index);
    raw[row.key] = JSON.parse(row.value);
  }

  return raw;
};
