import { Pool, QueryResult, PoolClient } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'bpsc_rpm',
  user: process.env.DB_USER || 'bpsc_admin',
  password: process.env.DB_PASSWORD || 'bpsc_secure_password_2026',
  min: parseInt(process.env.DB_POOL_MIN || '2', 10),
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('📦 Database pool: new client connected');
});

/**
 * Execute a parameterized query using prepared statements.
 * Uses $1, $2, ... placeholders to prevent SQL injection.
 */
export const query = async (text: string, params: unknown[] = []): Promise<QueryResult> => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log('📝 Query executed', {
      text: text.substring(0, 80),
      duration: `${duration}ms`,
      rows: res.rowCount,
    });
  }
  return res;
};

/**
 * Get a client from the pool for transaction support.
 */
export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export { pool };
