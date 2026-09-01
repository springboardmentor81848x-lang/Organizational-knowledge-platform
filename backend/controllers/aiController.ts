import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { query, execute } from '../config/mysqlDb';

const getAiClient = () => {
  if (process.env.GEMINI_API_KEY) {
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return null;
};

// Static course catalog used to enrich AI recommendations by skill name.
// This is illustrative content (not user data) — kept as-is by design.
const courseMap: Record<string, any[]> = {
  'Cloud Infrastructure (AWS/GCP)': [
    { title: 'AWS Certified Cloud Practitioner Mastery', duration: '20 Hours', provider: 'AWS Training', difficulty: 'Beginner', priority: 'High', matchScore: 98 },
    { title: 'Docker & Containerization Essentials', duration: '12 Hours', provider: 'Docker Academy', difficulty: 'Intermediate', priority: 'High', matchScore: 95 },
    { title: 'Kubernetes Production Fundamentals (CKA)', duration: '28 Hours', provider: 'CNCF Labs', difficulty: 'Advanced', priority: 'High', matchScore: 92 },
    { title: 'Azure Administrator Associate (AZ-104)', duration: '24 Hours', provider: 'Microsoft Learn', difficulty: 'Intermediate', priority: 'Medium', matchScore: 88 },
  ],
  'React & Frontend Architecture': [
    { title: 'Advanced React 19 State Patterns & Performance', duration: '18 Hours', provider: 'Frontend Masters', difficulty: 'Advanced', priority: 'High', matchScore: 96 },
    { title: 'Next.js 15 Full Stack Architecture', duration: '16 Hours', provider: 'Vercel Academy', difficulty: 'Intermediate', priority: 'High', matchScore: 93 },
    { title: 'TypeScript for Enterprise React Applications', duration: '10 Hours', provider: 'Ultimate Courses', difficulty: 'Intermediate', priority: 'Medium', matchScore: 90 },
  ],
  'Node.js & Microservices': [
    { title: 'Node.js Microservices Architecture & gRPC', duration: '22 Hours', provider: 'Node.js Foundation', difficulty: 'Advanced', priority: 'High', matchScore: 97 },
    { title: 'Express API Security & OWASP Standards', duration: '14 Hours', provider: 'Secure Code Academy', difficulty: 'Intermediate', priority: 'High', matchScore: 94 },
  ],
  'SQL & Database Optimization': [
    { title: 'MySQL High Availability & Query Tuning', duration: '16 Hours', provider: 'Oracle University', difficulty: 'Intermediate', priority: 'High', matchScore: 95 },
    { title: 'PostgreSQL Indexing & Partitioning Masterclass', duration: '20 Hours', provider: 'DBA Institute', difficulty: 'Advanced', priority: 'High', matchScore: 91 },
  ],
  'Cybersecurity & Risk Audit': [
    { title: 'CompTIA Security+ SY0-701 Prep', duration: '30 Hours', provider: 'Cybrary', difficulty: 'Intermediate', priority: 'High', matchScore: 99 },
    { title: 'SOC 2 Type II Compliance & Threat Modeling', duration: '18 Hours', provider: 'SANS Institute', difficulty: 'Advanced', priority: 'High', matchScore: 94 },
  ],
  'Agile Team Leadership': [
    { title: 'Certified ScrumMaster (CSM) Training', duration: '16 Hours', provider: 'Scrum Alliance', difficulty: 'Beginner', priority: 'Medium', matchScore: 92 },
  ],
};

// 1. AI Training Recommendations
export const getAiRecommendations = async (req: Request, res: Response) => {
  try {
    const gaps = await query(`
      SELECT g.*, s.name AS skill_name, u.first_name, u.last_name
      FROM knowledge_gaps g
      JOIN skills s ON s.id = g.skill_id
      JOIN employees e ON e.id = g.employee_id
      JOIN users u ON u.id = e.user_id
    `);

    const recommendations = gaps.map((gap: any) => {
      const skillName = gap.skill_name || 'Technical Skill';
      const defaultCourses = courseMap[skillName] || [
        { title: `${skillName} Professional Upskilling`, duration: '15 Hours', provider: 'OKGIP Learning Hub', difficulty: 'Intermediate', priority: 'High', matchScore: 90 },
        { title: `Advanced ${skillName} Best Practices`, duration: '20 Hours', provider: 'Global Academy', difficulty: 'Advanced', priority: 'Medium', matchScore: 85 },
      ];

      return {
        gapId: gap.id,
        employeeId: gap.employee_id,
        employeeName: `${gap.first_name} ${gap.last_name}`,
        skillId: gap.skill_id,
        skillName,
        gapScore: gap.gap_score,
        priority: gap.priority,
        recommendedCourses: defaultCourses,
      };
    });

    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Predictive Skill Gap Analysis
export const getPredictiveAnalysis = async (req: Request, res: Response) => {
  try {
    // Forward-looking projections are illustrative content, not stored data.
    const futureShortages = [
      { skill: 'Cloud Infrastructure (AWS/GCP)', projectedDeficit: 45, timeline: 'Q3 2026', riskLevel: 'Critical' },
      { skill: 'Cybersecurity & Risk Audit', projectedDeficit: 38, timeline: 'Q4 2026', riskLevel: 'High' },
      { skill: 'SQL & Database Optimization', projectedDeficit: 25, timeline: 'Q1 2027', riskLevel: 'Medium' },
    ];

    const departments = await query('SELECT id, name FROM departments');
    const gapsByDept = await query(`
      SELECT e.department_id, g.priority, COUNT(*) AS cnt
      FROM knowledge_gaps g JOIN employees e ON e.id = g.employee_id
      GROUP BY e.department_id, g.priority
    `);

    const departmentsAtRisk = departments.map((dept: any) => {
      const rows = gapsByDept.filter((g: any) => g.department_id === dept.id);
      const totalGaps = rows.reduce((sum: number, r: any) => sum + r.cnt, 0);
      const highRiskGaps = rows.filter((r: any) => r.priority === 'High').reduce((sum: number, r: any) => sum + r.cnt, 0);
      const riskScore = highRiskGaps * 25 + totalGaps * 10;
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        totalGaps,
        highPriorityGaps: highRiskGaps,
        riskScore: Math.min(100, riskScore || 15),
        riskLevel: riskScore > 50 ? 'High Risk' : riskScore > 20 ? 'Moderate Risk' : 'Low Risk',
      };
    });

    const employeesAtRisk = await query(`
      SELECT e.id AS employeeId, CONCAT(u.first_name, ' ', u.last_name) AS name,
        COALESCE(d.name, 'General') AS department,
        COUNT(g.id) AS gapsCount, COALESCE(MAX(g.gap_score), 0) AS maxDeficit
      FROM employees e
      JOIN users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN knowledge_gaps g ON g.employee_id = e.id
      GROUP BY e.id
      LIMIT 5
    `);
    const shapedEmployeesAtRisk = employeesAtRisk.map((emp: any) => ({
      ...emp,
      status: emp.gapsCount > 2 ? 'At Risk of Falling Behind' : 'On Track',
    }));

    const trendingSkills = [
      { name: 'Generative AI & LLM Engineering', growthRate: '+142%', demand: 'High' },
      { name: 'Kubernetes Cloud Native Security', growthRate: '+98%', demand: 'High' },
      { name: 'SOC2 Type II Automated Auditing', growthRate: '+76%', demand: 'Medium' },
      { name: 'Micro-Frontend React 19', growthRate: '+65%', demand: 'Medium' },
    ];

    res.json({
      success: true,
      data: { futureShortages, departmentsAtRisk, employeesAtRisk: shapedEmployeesAtRisk, trendingSkills },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. AI Chat Assistant
export const handleAiChat = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const user = (req as any).user;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const ai = getAiClient();
    let reply = '';
    let source = 'RULES';

    if (ai) {
      try {
        const systemPrompt = `You are OKGIP AI Assistant, an expert enterprise advisor for the Organizational Knowledge Gap Intelligence Platform.
Context:
- Platform monitors Employee Skills, Knowledge Gaps, Departments, Training Programs, Leave Management, Tasks, and Audit Logs.
- Keep responses clear, professional, well-formatted with bullet points if helpful.
- Answer user queries regarding skills, trainings, knowledge gaps, leaves, tasks, and system policies.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `${systemPrompt}\n\nUser Question: ${message}`,
        });

        if (response.text) {
          reply = response.text;
          source = 'GEMINI';
        }
      } catch (err) {
        console.error('Gemini API call error, falling back to smart rules:', err);
      }
    }

    if (!reply) {
      const msg = String(message).toLowerCase();
      reply = 'I am the OKGIP AI Assistant. I can help you analyze knowledge gaps, suggest training courses, check leave policies, track task progress, review mentorship activity, or review department competencies.';

      if (msg.includes('skill') || msg.includes('gap')) {
        const [{ total }] = await query('SELECT COUNT(*) AS total FROM knowledge_gaps');
        const [{ highGaps }] = await query(`SELECT COUNT(*) AS highGaps FROM knowledge_gaps WHERE priority = 'High'`);
        const topGapSkills = await query(`
          SELECT s.name, COUNT(*) AS cnt FROM knowledge_gaps g JOIN skills s ON s.id = g.skill_id
          GROUP BY s.id ORDER BY cnt DESC LIMIT 3
        `);
        const topList = topGapSkills.map((s: any) => `${s.name} (${s.cnt})`).join(', ') || 'none identified yet';
        reply = `🔍 **Knowledge Gap Summary**: There are **${total} total knowledge gaps** identified across departments, with **${highGaps} critical high-priority gaps** (deficit ≥ 2 proficiency levels). Top skill gaps right now: ${topList}.`;
      } else if (msg.includes('training') || msg.includes('course') || msg.includes('recommend')) {
        const activePrograms = await query(`SELECT title, provider, duration_hours FROM training_programs WHERE status = 'Active' LIMIT 3`);
        if (activePrograms.length > 0) {
          const list = activePrograms.map((p: any, i: number) => `${i + 1}. **${p.title}** — ${p.provider} (${p.duration_hours}h)`).join('\n');
          reply = `🎓 **Active Training Programs**:\n${list}\nEnroll directly from the **Training** page!`;
        } else {
          reply = `🎓 There are no active training programs configured yet. An Admin or L&D Admin can add one from the Training & Development page.`;
        }
      } else if (msg.includes('leave') || msg.includes('vacation') || msg.includes('sick')) {
        const leaveTypes = await query('SELECT name, default_days FROM leave_types');
        if (leaveTypes.length > 0) {
          const list = leaveTypes.map((t: any) => `${t.name} (${t.default_days} days)`).join(', ');
          reply = `📅 **Leave Policy**: Configured leave types are: ${list}. Apply from the **Leave Management** tab — your assigned approver reviews it from there.`;
        } else {
          reply = `📅 Apply for leave from the **Leave Management** tab. Your assigned approver reviews and responds from there.`;
        }
      } else if (msg.includes('task') || msg.includes('assignment')) {
        let taskSummary = '';
        if (user?.id) {
          const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [user.id]);
          if (emp) {
            const [{ pending }] = await query(`SELECT COUNT(*) AS pending FROM tasks WHERE assigned_to = ? AND status != 'Completed'`, [emp.id]);
            taskSummary = ` You currently have **${pending} open task(s)** assigned to you.`;
          }
        }
        reply = `📋 **Task Management**: Managers can assign tasks with priorities and due dates from the Task Assignment page.${taskSummary}`;
      } else if (msg.includes('mentor') || msg.includes('session')) {
        const [{ activeMentorships }] = await query(`SELECT COUNT(*) AS activeMentorships FROM mentorships WHERE status IN ('Approved','Active')`);
        const [{ upcomingSessions }] = await query(`SELECT COUNT(*) AS upcomingSessions FROM knowledge_sessions WHERE status = 'SCHEDULED'`);
        reply = `🤝 **Mentorship & Sessions**: There are currently **${activeMentorships} active mentorship(s)** and **${upcomingSessions} upcoming knowledge session(s)** scheduled. Browse the Mentorship Hub to request a mentor or register for a session.`;
      } else if (msg.includes('report') || msg.includes('export') || msg.includes('pdf')) {
        reply = `📊 **Reports & Exporting**: You can generate comprehensive PDF, Excel, or CSV reports filtered by Department, Date, Role, or Employee directly from the **Reports & Analytics** module.`;
      }
    }

    if (user?.id) {
      const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [user.id]);
      await execute(
        'INSERT INTO ai_chat_logs (user_id, employee_id, message, reply, source) VALUES (?, ?, ?, ?, ?)',
        [user.id, emp?.id ?? null, message, reply, source]
      );
    }

    res.json({ success: true, reply });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
