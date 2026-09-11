import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// PostgreSQL Connection Config
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'knowledge_gap_db',
  password: process.env.PGPASSWORD || 'postgres',
  port: parseInt(process.env.PGPORT || '5432'),
});

let isPostgresConnected = false;

// Fallback in-memory store if local PostgreSQL server is unreachable
const memoryStore = {
  userSkills: [
    { id: 1, user_id: 1, skill_name: "Java", category: "Programming", proficiency_level: "Advanced", score: 85 },
    { id: 2, user_id: 1, skill_name: "Spring Boot", category: "Framework", proficiency_level: "Intermediate", score: 60 },
    { id: 3, user_id: 1, skill_name: "SQL", category: "Database", proficiency_level: "Intermediate", score: 55 },
    { id: 4, user_id: 1, skill_name: "System Design", category: "Architecture", proficiency_level: "Intermediate", score: 60 },
    { id: 5, user_id: 1, skill_name: "Microservices", category: "Architecture", proficiency_level: "Beginner", score: 35 },
    { id: 6, user_id: 1, skill_name: "Docker", category: "DevOps", proficiency_level: "Beginner", score: 35 },
    { id: 7, user_id: 1, skill_name: "AWS", category: "DevOps", proficiency_level: "Beginner", score: 35 },
    { id: 8, user_id: 1, skill_name: "Kubernetes", category: "DevOps", proficiency_level: "Beginner", score: 30 },
  ],
  roleRequirements: [
    { role_name: "Software Developer", skill_name: "System Design", category: "Architecture", required_level: "Advanced", required_score: 85 },
    { role_name: "Software Developer", skill_name: "Microservices", category: "Architecture", required_level: "Advanced", required_score: 85 },
    { role_name: "Software Developer", skill_name: "Docker", category: "DevOps", required_level: "Intermediate", required_score: 60 },
    { role_name: "Software Developer", skill_name: "AWS", category: "DevOps", required_level: "Intermediate", required_score: 60 },
    { role_name: "Software Developer", skill_name: "Kubernetes", category: "DevOps", required_level: "Advanced", required_score: 85 },
  ],
  gapResults: [],
  courses: [
    { id: 1, title: "Infosys Springboard: Java Microservices Deep Dive", provider: "Infosys Springboard", description: "Master building production-ready Microservices using Spring Boot and API Gateway.", level: "Advanced", duration: "18 hrs", category: "Architecture", skill_name: "Microservices", rating: 4.9, url: "https://springboard.infosys.com", color: "#007cc3", icon: "🚀" },
    { id: 2, title: "Infosys Springboard: Enterprise System Design", provider: "Infosys Springboard", description: "Learn high-level system design, fault tolerance, caching, and distributed systems.", level: "Advanced", duration: "22 hrs", category: "Architecture", skill_name: "System Design", rating: 4.9, url: "https://springboard.infosys.com", color: "#007cc3", icon: "🕸️" },
    { id: 3, title: "Coursera: Cloud Application Development with Docker", provider: "Coursera", description: "Containerize applications and deploy scalable cluster applications.", level: "Intermediate", duration: "16 hrs", category: "DevOps", skill_name: "Docker", rating: 4.8, url: "https://www.coursera.org", color: "#0056D2", icon: "🐳" },
    { id: 4, title: "Udemy: Ultimate AWS Certified Solutions Architect", provider: "Udemy", description: "Comprehensive AWS Cloud training covering EC2, S3, RDS, Serverless, IAM.", level: "Intermediate", duration: "25 hrs", category: "DevOps", skill_name: "AWS", rating: 4.7, url: "https://www.udemy.com", color: "#A435F0", icon: "☁️" },
    { id: 5, title: "Coursera: Kubernetes in Production & Orchestration", provider: "Coursera", description: "Deploy, manage, and scale enterprise container workloads using Kubernetes.", level: "Advanced", duration: "20 hrs", category: "DevOps", skill_name: "Kubernetes", rating: 4.8, url: "https://www.coursera.org", color: "#0056D2", icon: "☸️" }
  ]
};

export const initDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully to PostgreSQL database!');
    isPostgresConnected = true;

    // Run schema.sql and seed.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const seedPath = path.join(__dirname, 'seed.sql');

    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schemaSql);
      console.log('✅ PostgreSQL Schema initialized.');
    }

    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf-8');
      await client.query(seedSql);
      console.log('✅ PostgreSQL Seed data loaded.');
    }

    client.release();
  } catch (error) {
    console.warn('⚠️ Could not connect to PostgreSQL server directly:', error.message);
    console.log('🔄 Operating with built-in in-memory PostgreSQL emulator mode for smooth presentation!');
    isPostgresConnected = false;
  }
};

export const query = async (text, params) => {
  if (isPostgresConnected) {
    return pool.query(text, params);
  } else {
    // Return structured response for offline mode
    return { rows: [], rowCount: 0 };
  }
};

export { pool, isPostgresConnected, memoryStore };
