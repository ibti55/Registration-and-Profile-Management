import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

import { pool } from './pool';

async function migrate(): Promise<void> {
  const migrationsDir = path.join(__dirname, '..', '..', '..', 'database', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    console.log(`Running migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    try {
      await pool.query(sql);
      console.log(`✅ Migration ${file} completed`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`❌ Migration ${file} failed:`, message);
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully');
  await pool.end();
  process.exit(0);
}

migrate();
