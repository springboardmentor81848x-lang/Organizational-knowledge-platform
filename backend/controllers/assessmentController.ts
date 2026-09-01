import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { createNotification, nextCode } from '../utils/codes';
import { recalculateAllGaps } from '../utils/gaps';

// NOTE: skill_assessments / assessment_questions / assessment_results already
// exist in the real schema. assessment_results.assessment_type / assessor_id /
// feedback are added via schema_updates.sql for the 360-evaluation feature.

const initialAssessments = [
  { skill_id: 1, title: 'React & Frontend Architecture Evaluation', description: 'Assess core React principles, JSX, custom hooks, Virtual DOM optimization, and state management.', pass_score: 70, questions: [
    { question: 'What is the primary function of React Virtual DOM?', option_a: 'Directly modify browser DOM elements', option_b: 'Minimize costly real DOM manipulation via diffing algorithms', option_c: 'Provide server-side database connectivity', option_d: 'Replace CSS stylesheets', correct_index: 1 },
    { question: 'Which hook should be used for side effects like data fetching?', option_a: 'useState', option_b: 'useMemo', option_c: 'useEffect', option_d: 'useCallback', correct_index: 2 },
    { question: 'How do you prevent unnecessary re-renders of child components in React?', option_a: 'React.memo & useCallback', option_b: 'forceUpdate()', option_c: 'window.reload()', option_d: 'Async component wrappers', correct_index: 0 },
    { question: 'What is the purpose of Context API in React applications?', option_a: 'Database querying', option_b: 'Global state sharing without prop drilling', option_c: 'HTTP request routing', option_d: 'CSS styling', correct_index: 1 },
  ]},
  { skill_id: 2, title: 'Node.js & Express Microservices Competency Exam', description: 'Test your understanding of non-blocking I/O, Express routing, JWT security, and middleware pipelines.', pass_score: 70, questions: [
    { question: 'What architectural model enables Node.js to handle high concurrency with single thread?', option_a: 'Multi-threaded process pooling', option_b: 'Non-blocking I/O Event Loop', option_c: 'Synchronous blocking calls', option_d: 'Forked CPU threads', correct_index: 1 },
    { question: 'Which HTTP status code signifies a failed JWT authentication attempt?', option_a: '200 OK', option_b: '404 Not Found', option_c: '401 Unauthorized', option_d: '500 Internal Error', correct_index: 2 },
    { question: 'In Express.js, what parameter function forwards execution to the next middleware?', option_a: 'continue()', option_b: 'next()', option_c: 'forward()', option_d: 'res.send()', correct_index: 1 },
    { question: 'How should sensitive environment credentials like DB passwords be loaded in Node.js?', option_a: 'Hardcoded in public scripts', option_b: 'Via process.env using dotenv', option_c: 'Stored in git commits', option_d: 'Passed via URL parameters', correct_index: 1 },
  ]},
  { skill_id: 3, title: 'Cloud Infrastructure (AWS/GCP) & Docker Mastery Exam', description: 'Evaluate Docker containerization, Kubernetes pod orchestration, and AWS/GCP security architectures.', pass_score: 75, questions: [
    { question: 'Which tool is used to manage multi-container Docker applications via a single file?', option_a: 'Docker Compose', option_b: 'Kubernetes Ingress', option_c: 'AWS CloudFormation', option_d: 'Terraform', correct_index: 0 },
    { question: 'What is the smallest deployable computing unit in Kubernetes?', option_a: 'Container', option_b: 'Pod', option_c: 'Service', option_d: 'Node', correct_index: 1 },
    { question: 'Which cloud security mechanism enforces least-privilege permissions?', option_a: 'VPC Peering', option_b: 'IAM Policies & Roles', option_c: 'Security Groups', option_d: 'S3 Bucket Policies', correct_index: 1 },
    { question: 'What is the primary benefit of Infrastructure as Code (IaC)?', option_a: 'Manual server configuration', option_b: 'Reproducible, version-controlled cloud infrastructure', option_c: 'Faster browser rendering', option_d: 'Automated code obfuscation', correct_index: 1 },
  ]},
  { skill_id: 4, title: 'SQL & Relational Database Optimization Exam', description: 'Assess indexing, execution plans EXPLAIN, composite keys, and transaction isolation.', pass_score: 70, questions: [
    { question: 'Which index structure is most commonly used in relational DBs for fast range lookups?', option_a: 'Hash Index', option_b: 'B-Tree Index', option_c: 'Bitmap Index', option_d: 'Spatial Index', correct_index: 1 },
    { question: 'What SQL command inspects the query execution plan in MySQL or PostgreSQL?', option_a: 'DESCRIBE', option_b: 'EXPLAIN', option_c: 'ANALYZE QUERY', option_d: 'SHOW INDEX', correct_index: 1 },
    { question: 'Which ACID property guarantees that completed database transactions persist across system crashes?', option_a: 'Atomicity', option_b: 'Consistency', option_c: 'Isolation', option_d: 'Durability', correct_index: 3 },
    { question: 'What type of JOIN returns only matching rows present in both tables?', option_a: 'LEFT JOIN', option_b: 'RIGHT JOIN', option_c: 'INNER JOIN', option_d: 'FULL OUTER JOIN', correct_index: 2 },
  ]},
  { skill_id: 5, title: 'Cybersecurity & Risk Audit Certification Exam', description: 'Evaluate SOC2 compliance controls, OWASP Top 10 vulnerabilities, and encryption standards.', pass_score: 75, questions: [
    { question: 'Which vulnerability allows attackers to execute unauthorized database queries?', option_a: 'Cross-Site Scripting (XSS)', option_b: 'SQL Injection (SQLi)', option_c: 'CSRF', option_d: 'Insecure Direct Object Reference', correct_index: 1 },
    { question: 'What encryption standard is recommended for securing web communications in transit?', option_a: 'HTTP 1.0', option_b: 'TLS 1.3 / HTTPS', option_c: 'MD5 Hashing', option_d: 'Base64 Encoding', correct_index: 1 },
    { question: 'What is the primary objective of a Zero Trust Security model?', option_a: 'Trust all internal network IP addresses', option_b: 'Never trust, always verify every request regardless of origin', option_c: 'Disable all user passwords', option_d: 'Allow open API access', correct_index: 1 },
  ]},
  { skill_id: 6, title: 'Agile Leadership & Team Facilitation Assessment', description: 'Assess Scrum sprint velocity, backlog grooming, 1-on-1 coaching, and cross-functional leadership.', pass_score: 70, questions: [
    { question: 'What is the main goal of a Daily Standup meeting in Scrum?', option_a: 'Detailed status reporting to executive managers', option_b: 'Quick alignment on daily goals, progress, and blockers', option_c: 'Perform code review for merged PRs', option_d: 'Estimate user story points', correct_index: 1 },
    { question: 'Who is responsible for prioritizing the Product Backlog in Agile teams?', option_a: 'Scrum Master', option_b: 'Product Owner', option_c: 'Lead Developer', option_d: 'QA Lead', correct_index: 1 },
    { question: 'What metric measures the amount of work completed by an Agile team during a sprint?', option_a: 'Code coverage', option_b: 'Velocity', option_c: 'Burndown rate', option_d: 'Cycle time', correct_index: 1 },
  ]},
];

async function seedAssessmentsIfEmpty() {
  try {
    const [{ count }] = await query('SELECT COUNT(*) as count FROM skill_assessments');
    if (count > 0) return;

    for (const ass of initialAssessments) {
      const [skillExists] = await query('SELECT id FROM skills WHERE id = ?', [ass.skill_id]);
      if (!skillExists) continue;

      const code = await nextCode('skill_assessments', 'ASMT');
      const result = await execute(
        `INSERT INTO skill_assessments (assessment_code, skill_id, title, description, pass_score) VALUES (?, ?, ?, ?, ?)`,
        [code, ass.skill_id, ass.title, ass.description, ass.pass_score]
      );
      for (const q of ass.questions) {
        const qCode = await nextCode('assessment_questions', 'AQ');
        await execute(
          `INSERT INTO assessment_questions (question_code, assessment_id, question, option_a, option_b, option_c, option_d, correct_index)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [qCode, result.insertId, q.question, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_index]
        );
      }
    }
  } catch (err: any) {
    console.error('Assessment seed error:', err.message);
  }
}
seedAssessmentsIfEmpty();

async function attachQuestions(assessment: any) {
  const questions = await query('SELECT * FROM assessment_questions WHERE assessment_id = ?', [assessment.id]);
  assessment.questions = questions.map((q: any) => ({
    id: q.id, question: q.question, options: [q.option_a, q.option_b, q.option_c, q.option_d], correct_index: q.correct_index,
  }));
  return assessment;
}

export const getAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const assessments = await query(`
      SELECT sa.*, s.name as skill_name, s.category as skill_category
      FROM skill_assessments sa LEFT JOIN skills s ON sa.skill_id = s.id ORDER BY sa.id ASC
    `);
    for (const a of assessments) await attachQuestions(a);
    res.json({ success: true, count: assessments.length, data: assessments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssessmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [assessment] = await query(`
      SELECT sa.*, s.name as skill_name, s.category as skill_category
      FROM skill_assessments sa LEFT JOIN skills s ON sa.skill_id = s.id WHERE sa.id = ?
    `, [Number(id)]);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment not found' });
    }
    await attachQuestions(assessment);
    res.json({ success: true, data: assessment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;
    const { answers } = req.body;

    const [assessment] = await query('SELECT * FROM skill_assessments WHERE id = ?', [Number(id)]);
    if (!assessment) {
      return res.status(404).json({ success: false, message: 'Assessment record not found' });
    }
    await attachQuestions(assessment);

    const [emp] = await query('SELECT * FROM employees WHERE user_id = ?', [user.id]);
    if (!emp) {
      return res.status(400).json({ success: false, message: 'Employee profile required for skill evaluation' });
    }

    let correctCount = 0;
    const totalQuestions = assessment.questions.length || 1;
    assessment.questions.forEach((q: any, idx: number) => {
      if (answers && answers[idx] === q.correct_index) correctCount += 1;
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= (assessment.pass_score || 70);

    let newLevel = 1;
    if (score >= 90) newLevel = 5;
    else if (score >= 75) newLevel = 4;
    else if (score >= 60) newLevel = 3;
    else if (score >= 40) newLevel = 2;

    const [prevSkill] = await query('SELECT * FROM employee_skills WHERE employee_id = ? AND skill_id = ?', [emp.id, assessment.skill_id]);
    const prevLevel = prevSkill ? Number(prevSkill.current_proficiency) : 0;

    const [deptReq] = await query('SELECT * FROM department_required_skills WHERE department_id = ? AND skill_id = ?', [emp.department_id, assessment.skill_id]);
    const requiredLevel = deptReq ? Number(deptReq.required_proficiency) : 4;
    const gapBefore = Math.max(0, requiredLevel - prevLevel);
    const gapAfter = Math.max(0, requiredLevel - newLevel);

    if (passed || newLevel > prevLevel) {
      const esCode = await nextCode('employee_skills', 'ESK');
      await execute(
        `INSERT INTO employee_skills (employee_skill_code, employee_id, skill_id, current_proficiency, assessed_date, verified_by)
         VALUES (?, ?, ?, ?, CURDATE(), 'Automated Assessment Engine')
         ON DUPLICATE KEY UPDATE current_proficiency = VALUES(current_proficiency), assessed_date = CURDATE()`,
        [esCode, emp.id, assessment.skill_id, newLevel]
      );
    }

    const resultCode = await nextCode('assessment_results', 'RESULT');
    const insertResult = await execute(
      `INSERT INTO assessment_results (result_code, employee_id, assessment_id, skill_id, score, passed, new_proficiency_level, previous_proficiency_level, gap_before, gap_after)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [resultCode, emp.id, assessment.id, assessment.skill_id, score, passed ? 1 : 0, newLevel, prevLevel, gapBefore, gapAfter]
    );

    await recalculateAllGaps();

    const message = passed
      ? `Congratulations! You scored ${score}% and met the required benchmark. Proficiency updated to Level ${newLevel}.`
      : `You scored ${score}%. Passing threshold is ${assessment.pass_score || 70}%. Review course modules in your Learning Path and retake the assessment.`;

    res.json({
      success: true,
      data: {
        id: insertResult.insertId,
        employee_id: emp.id,
        assessment_id: assessment.id,
        skill_id: assessment.skill_id,
        score,
        passed,
        new_proficiency_level: newLevel,
        previous_proficiency_level: prevLevel,
        skill_improvement: Math.max(0, newLevel - prevLevel),
        gap_before: gapBefore,
        gap_after: gapAfter,
        taken_at: new Date().toISOString(),
        skill_name: assessment.skill_name,
        title: assessment.title,
        required_level: requiredLevel,
      },
      message,
    });
  } catch (error: any) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssessmentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, skillId } = req.query;
    let sql = `
      SELECT ar.*, sa.title as assessment_title, s.name as skill_name, s.category as skill_category,
             CONCAT(u.first_name, ' ', u.last_name) as employee_name, d.name as department_name
      FROM assessment_results ar
      LEFT JOIN skill_assessments sa ON ar.assessment_id = sa.id
      LEFT JOIN skills s ON ar.skill_id = s.id
      LEFT JOIN employees e ON ar.employee_id = e.id
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (employeeId) { sql += ' AND ar.employee_id = ?'; params.push(Number(employeeId)); }
    if (skillId) { sql += ' AND ar.skill_id = ?'; params.push(Number(skillId)); }
    sql += ' ORDER BY ar.taken_at ASC';

    const history = await query(sql, params);
    res.json({ success: true, count: history.length, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/assessments/evaluate (Self, Peer 360, Manager Assessment)
export const evaluateSkill = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, skillId, evaluationType, evaluatedProficiency, feedback } = req.body;

    const empId = Number(employeeId);
    const sId = Number(skillId);
    const newProficiency = Number(evaluatedProficiency);
    const evalType = evaluationType || 'SELF';

    const [emp] = await query('SELECT * FROM employees WHERE id = ?', [empId]);
    const [skill] = await query('SELECT * FROM skills WHERE id = ?', [sId]);
    if (!emp || !skill) {
      return res.status(404).json({ success: false, message: 'Employee or Skill not found' });
    }

    const [empSkill] = await query('SELECT * FROM employee_skills WHERE employee_id = ? AND skill_id = ?', [empId, sId]);
    const prevLevel = empSkill ? empSkill.current_proficiency : 1;
    const improvement = Math.max(0, newProficiency - prevLevel);

    const [deptReq] = await query('SELECT * FROM department_required_skills WHERE department_id = ? AND skill_id = ?', [emp.department_id, sId]);
    const requiredLevel = deptReq ? deptReq.required_proficiency : 4;
    const gapBefore = Math.max(0, requiredLevel - prevLevel);
    const gapAfter = Math.max(0, requiredLevel - newProficiency);

    const verifiedBy = evalType === 'MANAGER_EVALUATION' ? 'Manager Certified' : evalType === 'PEER_360' ? 'Peer Endorsed' : 'Self Assessment';
    const esCode = await nextCode('employee_skills', 'ESK');
    await execute(
      `INSERT INTO employee_skills (employee_skill_code, employee_id, skill_id, current_proficiency, assessed_date, verified_by)
       VALUES (?, ?, ?, ?, CURDATE(), ?)
       ON DUPLICATE KEY UPDATE current_proficiency = VALUES(current_proficiency), assessed_date = CURDATE(), verified_by = VALUES(verified_by)`,
      [esCode, empId, sId, newProficiency, verifiedBy]
    );

    // assessment_results.assessment_id is NOT NULL; attach to any existing
    // assessment for this skill, or fall back to the first assessment overall.
    let [assessmentRow] = await query('SELECT id FROM skill_assessments WHERE skill_id = ? LIMIT 1', [sId]);
    if (!assessmentRow) {
      [assessmentRow] = await query('SELECT id FROM skill_assessments LIMIT 1');
    }

    let insertedId: number | null = null;
    if (assessmentRow) {
      const resultCode = await nextCode('assessment_results', 'RESULT');
      const insertResult = await execute(
        `INSERT INTO assessment_results (result_code, employee_id, assessment_id, skill_id, score, passed, new_proficiency_level, previous_proficiency_level, gap_before, gap_after, assessment_type, assessor_id, feedback)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          resultCode, empId, assessmentRow.id, sId, newProficiency * 20, newProficiency >= 3 ? 1 : 0,
          newProficiency, prevLevel, gapBefore, gapAfter, evalType, req.user?.id ?? null,
          feedback || `${evalType} submitted. Competency recorded at level ${newProficiency}.`,
        ]
      );
      insertedId = insertResult.insertId;
    }

    await recalculateAllGaps();

    await createNotification(
      execute, emp.user_id,
      evalType === 'SELF' ? 'Self Assessment Recorded' : evalType === 'PEER_360' ? 'Peer 360 Feedback Received' : 'Manager Evaluation Completed',
      `Your proficiency in ${skill.name} has been updated to Level ${newProficiency} (Gap: ${gapAfter} levels remaining).`,
      'Skill Verified', 'ASSESSMENT_RESULT', insertedId ?? undefined
    );

    res.json({
      success: true,
      message: `Evaluation recorded! Skill proficiency updated to Level ${newProficiency}. Remaining gap is ${gapAfter}.`,
      data: {
        id: insertedId,
        employee_id: empId,
        skill_id: sId,
        assessment_type: evalType,
        assessor_id: req.user?.id,
        previous_proficiency_level: prevLevel,
        new_proficiency_level: newProficiency,
        skill_improvement: improvement,
        gap_before: gapBefore,
        gap_after: gapAfter,
        feedback: feedback || null,
        taken_at: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
