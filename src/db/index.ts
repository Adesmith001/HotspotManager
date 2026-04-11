import SQLite from 'react-native-sqlite-storage';

import {migrations} from './migrations';

SQLite.enablePromise(true);

let dbInstance: any = null;

export const getDatabase = async (): Promise<any> => {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabase({
    name: 'hotspot_manager.db',
    location: 'default',
  });
  return dbInstance;
};

export const runMigrations = async (): Promise<void> => {
  const db = await getDatabase();
  for (const migration of migrations) {
    await db.executeSql(migration.sql);
  }
};
