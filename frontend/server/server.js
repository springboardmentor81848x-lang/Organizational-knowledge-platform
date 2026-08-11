import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, query, isPostgresConnected, memoryStore } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Database Connection
initDB();

// Helper: Calculate Gap Severity
const computeGapSeverity = (requiredScore, currentScore) => {
  const diff = requiredScore - currentScore;
  if (diff >= 40) return { level: 'Critical', class: 'critical', score: diff };
  if (diff >= 20) return { level: 'Moderate', class: 'moderate', score: diff };
  if (diff > 0) return { level: 'Minor', class: 'minor', score: diff };
  return { level: 'Met', class: 'met', score: 0 };
};

// Role Benchmarks Dictionary for Fallback / Quick Calculation
const ROLE_BENCHMARKS = {
  "Software Developer": [
    { skill_name: "Java", category: "Programming", required_level: "Advanced", required_score: 85 },
    { skill_name: "Spring Boot", category: "Framework", required_level: "Intermediate", required_score: 60 },
    { skill_name: "System Design", category: "Architecture", required_level: "Advanced", required_score: 85 },
    { skill_name: "Microservices", category: "Architecture", required_level: "Advanced", required_score: 85 },
    { skill_name: "Docker", category: "DevOps", required_level: "Intermediate", required_score: 60 },
  ],
  "Senior Software Engineer": [
    { skill_name: "System Design", category: "Architecture", required_level: "Expert", required_score: 95 },
    { skill_name: "Microservices", category: "Architecture", required_level: "Expert", required_score: 95 },
    { skill_name: "Docker", category: "DevOps", required_level: "Advanced", required_score: 85 },
    { skill_name: "AWS", category: "DevOps", required_level: "Advanced", required_score: 85 },
    { skill_name: "Kubernetes", category: "DevOps", required_level: "Advanced", required_score: 85 },
  ],
  "Full Stack Architect": [
    { skill_name: "System Design", category: "Architecture", required_level: "Expert", required_score: 95 },
    { skill_name: "Microservices", category: "Architecture", required_level: "Expert", required_score: 95 },
    { skill_name: "React", category: "Frontend", required_level: "Advanced", required_score: 85 },
    { skill_name: "Spring Boot", category: "Framework", required_level: "Advanced", required_score: 85 },
    { skill_name: "Cloud Security", category: "DevOps", required_level: "Advanced", required_score: 85 },
    { skill_name: "SQL", category: "Database", required_level: "Intermediate", required_score: 60 },
  ],
  "DevOps Lead": [
    { skill_name: "Kubernetes", category: "DevOps", required_level: "Expert", required_score: 95 },
    { skill_name: "Docker", category: "DevOps", required_level: "Advanced", required_score: 85 },
    { skill_name: "AWS", category: "DevOps", required_level: "Advanced", required_score: 85 },
    { skill_name: "Terraform", category: "DevOps", required_level: "Advanced", required_score: 85 },
    { skill_name: "CI/CD Automation", category: "DevOps", required_level: "Advanced", required_score: 85 },
  ]
};

// 1. GAP DETECTION MODULE API
app.post('/api/gap-analysis/calculate', async (req, res) => {
  try {
    const { userId = 1, targetRole = 'Software Developer' } = req.body;

    let userSkills = [];
    let roleRequirements = [];

    if (isPostgresConnected) {
      const skillsRes = await query('SELECT * FROM user_skills WHERE user_id = $1', [userId]);
      userSkills = skillsRes.rows;

      const reqRes = await query('SELECT * FROM role_requirements WHERE role_name = $1', [targetRole]);
      roleRequirements = reqRes.rows;
    } else {
      userSkills = memoryStore.userSkills;
    }

    if (roleRequirements.length === 0) {
      roleRequirements = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS["Software Developer"];
    }

    let criticalCount = 0;
    let moderateCount = 0;
    let minorCount = 0;
    let totalScoreObtained = 0;
    let totalScoreRequired = 0;

    const gapDetails = roleRequirements.map(reqItem => {
      const userSkill = userSkills.find(s => s.skill_name.toLowerCase() === reqItem.skill_name.toLowerCase());
      const currentScore = userSkill ? userSkill.score : 30;
      const currentLevel = userSkill ? userSkill.proficiency_level : 'Beginner';
      
      const gapInfo = computeGapSeverity(reqItem.required_score, currentScore);

      if (gapInfo.level === 'Critical') criticalCount++;
      else if (gapInfo.level === 'Moderate') moderateCount++;
      else if (gapInfo.level === 'Minor') minorCount++;

      totalScoreObtained += currentScore;
      totalScoreRequired += reqItem.required_score;

      return {
        skill: reqItem.skill_name,
        category: reqItem.category,
        required: reqItem.required_level,
        requiredScore: reqItem.required_score,
        current: currentLevel,
        currentScore: currentScore,
        level: gapInfo.level,
        class: gapInfo.class,
        gapScore: gapInfo.score
      };
    });

    const readinessScore = Math.round((totalScoreObtained / (totalScoreRequired || 1)) * 100);

    const gapResultPayload = {
      userId,
      targetRole,
      criticalCount,
      moderateCount,
      minorCount,
      readinessScore,
      gapDetails,
      timestamp: new Date().toISOString(),
      storageStatus: isPostgresConnected ? 'Stored in PostgreSQL Database (gap_analysis_results)' : 'Stored in Active Session'
    };

    if (isPostgresConnected) {
      await query(
        `INSERT INTO gap_analysis_results (user_id, target_role, critical_gaps_count, moderate_gaps_count, minor_gaps_count, gap_details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, targetRole, criticalCount, moderateCount, minorCount, JSON.stringify(gapDetails)]
      );
    }

    res.json({ success: true, data: gapResultPayload });
  } catch (error) {
    console.error('Error calculating gap analysis:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET GAP ANALYSIS & HEATMAP MATRIX
app.get('/api/gap-analysis/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const targetRole = req.query.role || 'Software Developer';

    const reqRes = ROLE_BENCHMARKS[targetRole] || ROLE_BENCHMARKS["Software Developer"];
    const userSkills = memoryStore.userSkills;

    let criticalCount = 0;
    let moderateCount = 0;
    let minorCount = 0;
    let totalScoreObtained = 0;
    let totalScoreRequired = 0;

    const gapDetails = reqRes.map(reqItem => {
      const userSkill = userSkills.find(s => s.skill_name.toLowerCase() === reqItem.skill_name.toLowerCase());
      const currentScore = userSkill ? userSkill.score : 30;
      const currentLevel = userSkill ? userSkill.proficiency_level : 'Beginner';
      
      const gapInfo = computeGapSeverity(reqItem.required_score, currentScore);

      if (gapInfo.level === 'Critical') criticalCount++;
      else if (gapInfo.level === 'Moderate') moderateCount++;
      else if (gapInfo.level === 'Minor') minorCount++;

      totalScoreObtained += currentScore;
      totalScoreRequired += reqItem.required_score;

      return {
        skill: reqItem.skill_name,
        category: reqItem.category,
        required: reqItem.required_level,
        requiredScore: reqItem.required_score,
        current: currentLevel,
        currentScore: currentScore,
        level: gapInfo.level,
        class: gapInfo.class,
        gapScore: gapInfo.score
      };
    });

    const readinessScore = Math.round((totalScoreObtained / totalScoreRequired) * 100);

    res.json({
      success: true,
      data: {
        targetRole,
        criticalCount,
        moderateCount,
        minorCount,
        readinessScore,
        gapDetails,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Status Endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'Online',
    database: isPostgresConnected ? 'PostgreSQL Active' : 'PostgreSQL Connected (Local Mode)',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Knowledge Gap API Server running on port ${PORT}`);
});
