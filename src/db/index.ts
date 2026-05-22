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
  await db.executeSql(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY NOT NULL
    );`,
  );
  const [results] = await db.executeSql(`SELECT id FROM schema_migrations;`);
  const applied = new Set<number>();

  for (let index = 0; index < results.rows.length; index += 1) {
    applied.add(results.rows.item(index).id);
  }

  for (const migration of migrations) {
    if (applied.has(migration.id)) {
      continue;
    }
    await db.executeSql(migration.sql);
    await db.executeSql(`INSERT INTO schema_migrations (id) VALUES (?);`, [
      migration.id,
    ]);
  }
};
