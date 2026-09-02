import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Real connection pool (mysql2/promise) — no in-memory fallback, no mock data.
// Requires DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL in .env
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_PORT'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  // Fail loudly instead of silently falling back to mock/in-memory data.
  console.error(`❌ Missing required DB env vars: ${missing.join(', ')}. Check your .env file.`);
}

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  // Cloud-hosted MySQL (Aiven, RDS, PlanetScale, etc.) will periodically
  // drop idle connections — TCP keep-alive pings stop that from surfacing
  // as an unexpected ECONNRESET on the next query.
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Pool-level connections can still be closed server-side between the ping
// above and an actual query (a cloud proxy timeout, a failover, etc).
// mysql2 emits 'error' on the pool for those cases; without a listener,
// Node treats it as an uncaught 'error' event and crashes the process.
// This just logs it — the retry logic in query()/execute() below is what
// actually recovers the in-flight request.
pool.on('error', (err: any) => {
  console.error('⚠️  MySQL pool error (non-fatal, connection will be replaced):', err.code || err.message);
});

export async function verifyConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log(`✅ MySQL connected to ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    return true;
  } catch (err: any) {
    console.error('❌ MySQL connection failed:', err.message);
    return false;
  }
}

/** Errors where the underlying TCP connection dropped — safe to retry once,
 * since no partial write could have happened before the driver even got a
 * connection to send the query on. */
const RETRYABLE_CODES = new Set([
  'ECONNRESET',
  'PROTOCOL_CONNECTION_LOST',
  'ETIMEDOUT',
  'ECONNREFUSED',
  'PROTOCOL_SEQUENCE_TIMEOUT',
]);

function isRetryable(err: any): boolean {
  return !!err && (RETRYABLE_CODES.has(err.code) || RETRYABLE_CODES.has(err.errno));
}

/**
 * Run a parameterized query. Throws on error — callers must handle errors
 * (via try/catch in each controller) rather than silently getting null,
 * so failures are visible instead of masquerading as "no data".
 *
 * Transparently retries once on a dropped-connection error (ECONNRESET /
 * PROTOCOL_CONNECTION_LOST / etc) — those happen when the pool hands out a
 * connection that the server closed in the background, and a retry against
 * a fresh connection from the pool succeeds essentially every time. Any
 * other error (syntax, constraint violation, etc) is not retried and just
 * propagates immediately, same as before.
 */
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  try {
    const [rows] = await pool.query(sql, params);
    return rows as T[];
  } catch (err: any) {
    if (isRetryable(err)) {
      console.warn(`⚠️  MySQL ${err.code || err.errno} on query — retrying once...`);
      const [rows] = await pool.query(sql, params);
      return rows as T[];
    }
    throw err;
  }
}

/** Convenience for INSERT/UPDATE/DELETE — returns the ResultSetHeader (insertId, affectedRows, etc). */
export async function execute(sql: string, params: any[] = []) {
  try {
    const [result] = await pool.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } catch (err: any) {
    if (isRetryable(err)) {
      console.warn(`⚠️  MySQL ${err.code || err.errno} on execute — retrying once...`);
      const [result] = await pool.execute(sql, params);
      return result as mysql.ResultSetHeader;
    }
    throw err;
  }
}

export default pool;
