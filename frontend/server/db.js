import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename=fileURLToPath(import.meta.url); const __dirname=path.dirname(__filename);
const {Pool}=pg;
const pool=new Pool({
  user:process.env.PGUSER||'postgres', host:process.env.PGHOST||'localhost', database:process.env.PGDATABASE||'knowledge_gap_platform',
  password:process.env.PGPASSWORD||'postgres', port:parseInt(process.env.PGPORT||'5432',10), connectionTimeoutMillis:5000
});
let isPostgresConnected=false;
const memoryStore={userSkills:[],roleRequirements:[],gapResults:[],courses:[]};

export const initDB=async()=>{
  try{
    const client=await pool.connect();
    await client.query('SELECT 1');
    isPostgresConnected=true;
    console.log(`✅ Connected to PostgreSQL: ${process.env.PGDATABASE||'knowledge_gap_platform'} @ ${process.env.PGHOST||'localhost'}:${process.env.PGPORT||5432}`);
    for(const file of ['schema.sql','seed.sql']){
      const p=path.join(__dirname,file);
      if(fs.existsSync(p)){await client.query(fs.readFileSync(p,'utf8'));console.log(`✅ ${file} applied.`);}
    }
    client.release();
  }catch(error){
    isPostgresConnected=false;
    console.error('❌ PostgreSQL connection/setup failed:',error.message);
    console.log('⚠️ API is using fallback mode. Check frontend/.env and PostgreSQL credentials.');
  }
};
export const query=(text,params)=>pool.query(text,params);
export {pool,isPostgresConnected,memoryStore};
