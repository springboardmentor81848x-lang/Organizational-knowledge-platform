import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1OEt7ZLANvR6ZK9n@db.utdvsjyzybvwhudovgyn.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('⚡ Connected to Supabase PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error', err);
});

export default pool;
