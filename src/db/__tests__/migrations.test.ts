import {migrations} from '../migrations';

describe('db migrations', () => {
  it('creates devices table migration', () => {
    expect(migrations[0].sql).toContain('CREATE TABLE IF NOT EXISTS devices');
  });
});
