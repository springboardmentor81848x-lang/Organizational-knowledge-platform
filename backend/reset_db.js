const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL || process.env.DB_URL || 'postgresql://postgres:password@localhost:5432/knowledgeiq';

const client = new Client({
  connectionString: connectionString
});

async function resetDb() {
  try {
    await client.connect();
    console.log('Connected to Supabase DB');
    
    // Drop all tables in public schema
    await client.query('DROP SCHEMA public CASCADE;');
    await client.query('CREATE SCHEMA public;');
    await client.query('GRANT ALL ON SCHEMA public TO postgres;');
    await client.query('GRANT ALL ON SCHEMA public TO public;');
    console.log('Dropped and recreated public schema');
    
    // Read the schema sql file
    const sqlPath = path.join(__dirname, 'supabase_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Execute the schema sql
    await client.query(sql);
    console.log('Schema created successfully with correct required_level column!');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

resetDb();
