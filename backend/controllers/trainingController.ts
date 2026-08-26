import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditLogger';
import { nextCode, createNotification } from '../utils/codes';
import { recalculateAllGaps } from '../utils/gaps';

// NOTE: training_programs.modules/milestones and training_assignments.
// start_date/expected_completion_date/actual_completion_date/recommendation_reason/
// modules/milestones/certificate_number/certificate_expiry_date/is_certified/completed_at
// are added via schema_updates.sql (stored as JSON for modules/milestones —
// the original mock data modeled them as arrays of objects per assignment).
// certificates.expiry_date/status are added too.

const DEFAULT_MODULES = [
  { id: 1, name: 'Core Foundations & Architecture', progress_percentage: 0, status: 'Not Started' },
  { id: 2, name: 'Intermediate Implementations', progress_percentage: 0, status: 'Not Started' },
  { id: 3, name: 'Advanced Optimization & Testing', progress_percentage: 0, status: 'Not Started' },
  { id: 4, name: 'Production Capstone & Deployment', progress_percentage: 0, status: 'Not Started' },
];
const DEFAULT_MILESTONES = [
  { id: 1, title: 'Milestone 1: Fundamentals Mastery', description: 'Core principles and configuration', status: 'Not Started', completion_date: null },
  { id: 2, title: 'Milestone 2: Practical Implementation', description: 'Hands-on project deliverables', status: 'Not Started', completion_date: null },
  { id: 3, title: 'Milestone 3: Final Certification Project', description: 'Peer code review and verification', status: 'Not Started', completion_date: null },
];

function parseJsonCol(val: any, fallback: any[]) {
  if (!val) return fallback;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  return val;
}

export const getTrainings = async (req: AuthRequest, res: Response) => {
  try {
    const programs = await query(`
      SELECT tp.*, s.name AS target_skill_name,
        (SELECT COUNT(*) FROM training_assignments ta WHERE ta.training_program_id = tp.id) AS total_enrolled,
        (SELECT COUNT(*) FROM training_assignments ta WHERE ta.training_program_id = tp.id AND ta.status IN ('Completed','Certified')) AS completed_count
      FROM training_programs tp LEFT JOIN skills s ON s.id = tp.target_skill_id
    `);

    const list = programs.map((tp: any) => ({
      ...tp,
      target_skill_name: tp.target_skill_name || 'Unknown Skill',
      completion_rate: tp.total_enrolled > 0 ? Math.round((tp.completed_count / tp.total_enrolled) * 100) : 0,
      modules: parseJsonCol(tp.modules, []),
      milestones: parseJsonCol(tp.milestones, []),
    }));

    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrainingRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const empIdParam = Number(req.query.employeeId);
    const empId = empIdParam || (await query('SELECT id FROM employees WHERE user_id = ?', [req.user?.id]))[0]?.id;
    const [emp] = await query('SELECT * FROM employees WHERE id = ?', [empId]);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const gaps = await query(
      `SELECT g.*, s.name AS skill_name, s.category FROM knowledge_gaps g JOIN skills s ON s.id = g.skill_id WHERE g.employee_id = ? AND g.gap_score > 0`,
      [emp.id]
    );
    const activePrograms = await query(`SELECT * FROM training_programs WHERE status = 'Active'`);
    const [fallbackProgram] = await query('SELECT * FROM training_programs LIMIT 1');

    const recommendations = await Promise.all(gaps.map(async (gap: any) => {
      const matchingProgram = activePrograms.find((p: any) => p.target_skill_id === gap.skill_id) || fallbackProgram;
      const [activeAssignment] = matchingProgram
        ? await query('SELECT * FROM training_assignments WHERE employee_id = ? AND training_program_id = ?', [emp.id, matchingProgram.id])
        : [null];

      const modules = matchingProgram ? parseJsonCol(matchingProgram.modules, DEFAULT_MODULES) : DEFAULT_MODULES;
      const milestones = matchingProgram ? parseJsonCol(matchingProgram.milestones, DEFAULT_MILESTONES) : DEFAULT_MILESTONES;

      return {
        gap_id: gap.id,
        skill_id: gap.skill_id,
        skill_name: gap.skill_name || 'Target Skill',
        category: gap.category || 'Technical',
        required_proficiency: gap.required_proficiency,
        current_proficiency: gap.current_proficiency,
        gap_score: gap.gap_score,
        priority: gap.priority,
        reason: `${gap.skill_name || 'Skill'} proficiency is currently level ${gap.current_proficiency}/5, but target requirement is level ${gap.required_proficiency}/5 (${gap.priority} priority deficit).`,
        recommended_program: matchingProgram ? {
          id: matchingProgram.id, title: matchingProgram.title, description: matchingProgram.description,
          provider: matchingProgram.provider, duration_hours: matchingProgram.duration_hours,
          min_proficiency_gain: matchingProgram.min_proficiency_gain,
          modules_count: modules.length, milestones_count: milestones.length,
        } : null,
        is_enrolled: !!activeAssignment,
        enrollment_status: activeAssignment?.status || null,
        assignment_id: activeAssignment?.id || null,
      };
    }));

    return res.json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

async function buildAssignmentRow(tp: any, empId: number, assignedBy: number | null | undefined, dueDate: string, reason: string) {
  const startDateStr = new Date().toISOString().split('T')[0];
  const modules = parseJsonCol(tp.modules, DEFAULT_MODULES).map((m: any) => ({ ...m, progress_percentage: 0, status: 'Not Started' }));
  const milestones = parseJsonCol(tp.milestones, DEFAULT_MILESTONES).map((m: any) => ({ ...m, status: 'Not Started', completion_date: null }));

  const code = await nextCode('training_assignments', 'ASSIGN');
  const result = await execute(
    `INSERT INTO training_assignments
      (assignment_code, training_program_id, employee_id, assigned_by, assigned_date, start_date, expected_completion_date, due_date, status, progress_percentage, recommendation_reason, modules, milestones)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Not Started', 0, ?, ?, ?)`,
    [code, tp.id, empId, assignedBy ?? null, startDateStr, startDateStr, dueDate, dueDate, reason, JSON.stringify(modules), JSON.stringify(milestones)]
  );
  return result.insertId;
}

export const enrollTraining = async (req: AuthRequest, res: Response) => {
  try {
    const { trainingProgramId, employeeId, reason } = req.body;
    const tpId = Number(trainingProgramId);
    const empId = Number(employeeId) || (await query('SELECT id FROM employees WHERE user_id = ?', [req.user?.id]))[0]?.id;

    const [tp] = await query('SELECT * FROM training_programs WHERE id = ?', [tpId]);
    const [emp] = await query(
      `SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [empId]
    );
    if (!tp || !emp) {
      return res.status(404).json({ success: false, message: 'Training program or employee record not found.' });
    }

    const existing = await query(
      `SELECT id FROM training_assignments WHERE training_program_id = ? AND employee_id = ? AND status IN ('In Progress','Not Started','Assigned')`,
      [tp.id, emp.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this training program.' });
    }

    const dueDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const insertedId = await buildAssignmentRow(tp, emp.id, req.user?.id, dueDate, reason || 'Enrolled to close identified skill proficiency deficit.');

    await recalculateAllGaps();

    const [newAssignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [insertedId]);

    await logAudit({
      actor_user_id: req.user?.id, action: 'ENROLL', entity_type: 'TRAINING_ASSIGNMENT',
      entity_id: `ASSIGNMENT-${insertedId}`, new_values: newAssignment,
      description: `Enrolled employee ${emp.first_name} ${emp.last_name} in ${tp.title}`,
    });

    return res.status(201).json({
      success: true, message: `Enrolled successfully in ${tp.title}!`,
      data: { ...newAssignment, modules: parseJsonCol(newAssignment.modules, []), milestones: parseJsonCol(newAssignment.milestones, []) },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTraining = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, targetSkillId, minProficiencyGain, durationHours, provider, modules, milestones } = req.body;
    if (!title || !targetSkillId || !category) {
      return res.status(400).json({ success: false, message: 'Title, category, and target skill ID are required' });
    }

    const finalModules = modules || [
      { id: 1, name: 'Course Introduction & Environment', progress_percentage: 0, status: 'Not Started' },
      { id: 2, name: 'Core Architecture & Patterns', progress_percentage: 0, status: 'Not Started' },
      { id: 3, name: 'Enterprise Best Practices', progress_percentage: 0, status: 'Not Started' },
    ];
    const finalMilestones = milestones || [
      { id: 1, title: 'Milestone 1: Core Fundamentals', description: 'Baseline concepts', status: 'Not Started' },
      { id: 2, title: 'Milestone 2: Final Assessment', description: 'Evaluation exam', status: 'Not Started' },
    ];

    const code = await nextCode('training_programs', 'TRAIN');
    const result = await execute(
      `INSERT INTO training_programs (training_code, title, description, category, target_skill_id, min_proficiency_gain, duration_hours, provider, status, modules, milestones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?, ?)`,
      [code, title, description || '', category, Number(targetSkillId), Number(minProficiencyGain || 1), Number(durationHours || 10), provider || 'OKGIP Academy', JSON.stringify(finalModules), JSON.stringify(finalMilestones)]
    );

    const [newProgram] = await query('SELECT * FROM training_programs WHERE id = ?', [result.insertId]);

    await logAudit({
      actor_user_id: req.user?.id, action: 'CREATE', entity_type: 'TRAINING_PROGRAM',
      entity_id: `TRAINING-${result.insertId}`, new_values: newProgram, description: `Created training program: ${title}`,
    });

    return res.status(201).json({ success: true, message: 'Training program created', data: { ...newProgram, modules: finalModules, milestones: finalMilestones } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const ASSIGNMENT_SELECT = `
  SELECT ta.*, tp.title AS program_title, tp.category AS program_category, tp.description AS program_description,
         tp.duration_hours, tp.provider, tp.target_skill_id, s.name AS target_skill_name,
         CONCAT(u.first_name,' ',u.last_name) AS employee_name, u.email AS employee_email, e.designation AS employee_designation,
         COALESCE(d.name,'Unassigned') AS department_name
  FROM training_assignments ta
  LEFT JOIN training_programs tp ON tp.id = ta.training_program_id
  LEFT JOIN skills s ON s.id = tp.target_skill_id
  LEFT JOIN employees e ON e.id = ta.employee_id
  LEFT JOIN users u ON u.id = e.user_id
  LEFT JOIN departments d ON d.id = e.department_id
`;

function shapeAssignment(ta: any) {
  const modules = parseJsonCol(ta.modules, []);
  const milestones = parseJsonCol(ta.milestones, []);
  const completedModules = modules.filter((m: any) => m.status === 'Completed' || m.progress_percentage === 100);
  const remainingModules = modules.filter((m: any) => m.status !== 'Completed' && m.progress_percentage < 100);
  const completedMilestones = milestones.filter((m: any) => m.status === 'Completed');
  const remainingMilestones = milestones.filter((m: any) => m.status !== 'Completed');

  return {
    ...ta,
    program_title: ta.program_title || 'Unknown Program',
    modules, milestones,
    completed_modules_count: completedModules.length,
    total_modules_count: modules.length,
    completed_modules_list: completedModules,
    remaining_modules_list: remainingModules,
    completed_milestones_count: completedMilestones.length,
    total_milestones_count: milestones.length,
    completed_milestones_list: completedMilestones,
    remaining_milestones_list: remainingMilestones,
  };
}

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    let sql = ASSIGNMENT_SELECT;
    const params: any[] = [];
    const conditions: string[] = [];
    const { employeeId, status } = req.query;
    if (employeeId) { conditions.push('ta.employee_id = ?'); params.push(Number(employeeId)); }
    if (status) { conditions.push('LOWER(ta.status) = ?'); params.push(String(status).toLowerCase()); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');

    const rows = await query(sql, params);
    return res.json({ success: true, count: rows.length, data: rows.map(shapeAssignment) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssignmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [ta] = await query(ASSIGNMENT_SELECT + ' WHERE ta.id = ?', [Number(id)]);
    if (!ta) {
      return res.status(404).json({ success: false, message: 'Training assignment not found' });
    }
    return res.json({ success: true, data: shapeAssignment(ta) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignTraining = async (req: AuthRequest, res: Response) => {
  try {
    const { trainingProgramId, employeeId, dueDate } = req.body;
    if (!trainingProgramId || !employeeId || !dueDate) {
      return res.status(400).json({ success: false, message: 'Program, employee, and due date required' });
    }

    const [tp] = await query('SELECT * FROM training_programs WHERE id = ?', [Number(trainingProgramId)]);
    const [emp] = await query('SELECT * FROM employees WHERE id = ?', [Number(employeeId)]);
    if (!tp || !emp) {
      return res.status(404).json({ success: false, message: 'Training program or employee not found' });
    }

    const existing = await query(
      `SELECT id FROM training_assignments WHERE training_program_id = ? AND employee_id = ? AND status NOT IN ('Completed','Certified')`,
      [tp.id, emp.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Employee is already enrolled in this active training program' });
    }

    const insertedId = await buildAssignmentRow(tp, emp.id, req.user?.id, dueDate, 'Assigned by management to bridge departmental competency standards.');

    if (emp.user_id) {
      await createNotification(
        execute, emp.user_id, 'New Training Assigned 🎓',
        `You have been assigned to "${tp.title}". Due date: ${dueDate}.`,
        'Training Assigned', 'TRAINING_ASSIGNMENT', insertedId
      );
    }

    await recalculateAllGaps();

    const [newAssignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [insertedId]);
    return res.status(201).json({ success: true, message: 'Training program assigned successfully', data: shapeAssignment(newAssignment) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

async function triggerPostTrainingSkillImprovement(assignment: any) {
  const [tp] = await query('SELECT * FROM training_programs WHERE id = ?', [assignment.training_program_id]);
  if (!tp) return;

  const gain = tp.min_proficiency_gain || 1;
  const [empSkill] = await query('SELECT * FROM employee_skills WHERE employee_id = ? AND skill_id = ?', [assignment.employee_id, tp.target_skill_id]);
  const prevLevel = empSkill ? empSkill.current_proficiency : 1;
  const newLevel = Math.min(5, prevLevel + gain);

  const esCode = await nextCode('employee_skills', 'ESK');
  await execute(
    `INSERT INTO employee_skills (employee_skill_code, employee_id, skill_id, current_proficiency, assessed_date, verified_by)
     VALUES (?, ?, ?, ?, CURDATE(), 'Automated Post-Training Assessment')
     ON DUPLICATE KEY UPDATE current_proficiency = VALUES(current_proficiency), assessed_date = CURDATE(), verified_by = VALUES(verified_by)`,
    [esCode, assignment.employee_id, tp.target_skill_id, newLevel]
  );

  await recalculateAllGaps();
}

export const updateAssignmentProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { progressPercentage, status } = req.body;

    const [assignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const percentage = Math.min(100, Math.max(0, Number(progressPercentage)));
    let newStatus = status || assignment.status;
    let actualCompletionDate = assignment.actual_completion_date;
    let completedAt = assignment.completed_at;

    if (!status) {
      if (percentage === 0) newStatus = 'Not Started';
      else if (percentage < 100) newStatus = 'In Progress';
      else if (percentage === 100 && assignment.status !== 'Certified' && assignment.status !== 'Expired / Renewal') {
        newStatus = 'Completed';
        actualCompletionDate = new Date().toISOString().split('T')[0];
        completedAt = new Date();
      }
    }

    await execute(
      `UPDATE training_assignments SET progress_percentage = ?, status = ?, actual_completion_date = ?, completed_at = ? WHERE id = ?`,
      [percentage, newStatus, actualCompletionDate, completedAt, Number(id)]
    );

    if (percentage === 100) {
      const [updated] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
      await triggerPostTrainingSkillImprovement(updated);
    } else {
      await recalculateAllGaps();
    }

    const [row] = await query(ASSIGNMENT_SELECT + ' WHERE ta.id = ?', [Number(id)]);
    return res.json({ success: true, message: 'Progress updated successfully', data: shapeAssignment(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateModuleProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id, moduleId } = req.params;
    const { progressPercentage } = req.body;

    const [assignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const modules = parseJsonCol(assignment.modules, DEFAULT_MODULES);
    const mod = modules.find((m: any) => m.id === Number(moduleId));
    if (!mod) {
      return res.status(404).json({ success: false, message: 'Module not found in assignment' });
    }

    const pct = Math.min(100, Math.max(0, Number(progressPercentage)));
    mod.progress_percentage = pct;
    mod.status = pct === 100 ? 'Completed' : pct > 0 ? 'In Progress' : 'Not Started';

    const avgOverall = Math.round(modules.reduce((sum: number, m: any) => sum + m.progress_percentage, 0) / modules.length);

    let newStatus = assignment.status;
    let actualCompletionDate = assignment.actual_completion_date;
    let completedAt = assignment.completed_at;
    if (avgOverall === 0) newStatus = 'Not Started';
    else if (avgOverall < 100) newStatus = 'In Progress';
    else if (avgOverall === 100 && assignment.status !== 'Certified' && assignment.status !== 'Expired / Renewal') {
      newStatus = 'Completed';
      actualCompletionDate = new Date().toISOString().split('T')[0];
      completedAt = new Date();
    }

    await execute(
      `UPDATE training_assignments SET modules = ?, progress_percentage = ?, status = ?, actual_completion_date = ?, completed_at = ? WHERE id = ?`,
      [JSON.stringify(modules), avgOverall, newStatus, actualCompletionDate, completedAt, Number(id)]
    );

    if (avgOverall === 100) {
      const [updated] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
      await triggerPostTrainingSkillImprovement(updated);
    }

    const [row] = await query(ASSIGNMENT_SELECT + ' WHERE ta.id = ?', [Number(id)]);
    return res.json({ success: true, message: `Module "${mod.name}" updated to ${pct}%. Overall progress: ${avgOverall}%.`, data: shapeAssignment(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMilestoneStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body;

    const [assignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const milestones = parseJsonCol(assignment.milestones, DEFAULT_MILESTONES);
    const milestone = milestones.find((m: any) => m.id === Number(milestoneId));
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Milestone not found' });
    }

    milestone.status = status;
    milestone.completion_date = status === 'Completed' ? new Date().toISOString().split('T')[0] : null;

    const completedCount = milestones.filter((m: any) => m.status === 'Completed').length;
    const inProgressCount = milestones.filter((m: any) => m.status === 'In Progress').length;
    const totalCount = milestones.length;

    let newProgress = assignment.progress_percentage;
    let newStatus = assignment.status;
    let actualCompletionDate = assignment.actual_completion_date;
    let completedAt = assignment.completed_at;
    let shouldTriggerImprovement = false;

    if (completedCount === totalCount) {
      newProgress = 100;
      if (assignment.status !== 'Certified' && assignment.status !== 'Expired / Renewal') {
        newStatus = 'Completed';
        actualCompletionDate = new Date().toISOString().split('T')[0];
        completedAt = new Date();
        shouldTriggerImprovement = true;
      }
    } else if (completedCount > 0 || inProgressCount > 0) {
      if (assignment.status === 'Not Started') newStatus = 'In Progress';
      const calculatedPct = Math.round(((completedCount * 100) + (inProgressCount * 50)) / totalCount);
      newProgress = Math.max(assignment.progress_percentage, calculatedPct);
    }

    await execute(
      `UPDATE training_assignments SET milestones = ?, progress_percentage = ?, status = ?, actual_completion_date = ?, completed_at = ? WHERE id = ?`,
      [JSON.stringify(milestones), newProgress, newStatus, actualCompletionDate, completedAt, Number(id)]
    );

    if (shouldTriggerImprovement) {
      const [updated] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
      await triggerPostTrainingSkillImprovement(updated);
    }

    const [row] = await query(ASSIGNMENT_SELECT + ' WHERE ta.id = ?', [Number(id)]);
    return res.json({ success: true, message: `Milestone "${milestone.title}" updated to ${status}.`, data: shapeAssignment(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const certifyAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [assignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    const [tp] = await query('SELECT * FROM training_programs WHERE id = ?', [assignment.training_program_id]);
    const [emp] = await query(
      `SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [assignment.employee_id]
    );

    const now = new Date();
    const certNumber = `OKGIP-CERT-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const expiryDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];
    const nowDateStr = now.toISOString().split('T')[0];

    await execute(
      `UPDATE training_assignments SET status = 'Certified', progress_percentage = 100, is_certified = 1,
        certificate_number = ?, certificate_url = ?, certificate_expiry_date = ?, actual_completion_date = ?, completed_at = ? WHERE id = ?`,
      [certNumber, certNumber, expiryDate, nowDateStr, now, Number(id)]
    );

    const verificationCode = `VER-${Math.floor(10000 + Math.random() * 90000)}-${(tp?.category || 'TECH').replace(/\s+/g, '').toUpperCase()}`;
    const certResult = await execute(
      `INSERT INTO certificates (employee_id, certificate_number, title, provider, issue_date, expiry_date, status, verification_code, training_assignment_id)
       VALUES (?, ?, ?, ?, ?, ?, 'Valid', ?, ?)`,
      [assignment.employee_id, certNumber, tp ? tp.title : 'Professional Certification Course', tp?.provider || 'OKGIP Academy', nowDateStr, expiryDate, verificationCode, assignment.id]
    );

    await triggerPostTrainingSkillImprovement({ ...assignment, status: 'Certified' });

    await execute(
      `INSERT INTO employee_badges (employee_id, badge_title, description, icon, awarded_at) VALUES (?, 'Training Master', ?, 'Award', CURDATE())`,
      [assignment.employee_id, `Earned professional certification in ${tp?.title || 'Training Specialization'}.`]
    );

    if (emp?.user_id) {
      await createNotification(
        execute, emp.user_id, 'Certification Issued! 🏆',
        `Congratulations! You have received official certification: ${certNumber} for ${tp?.title}.`,
        'Certificate Earned', 'CERTIFICATE', certResult.insertId
      );
    }

    await logAudit({
      actor_user_id: req.user?.id, action: 'CERTIFY', entity_type: 'CERTIFICATE',
      entity_id: certNumber, description: `Issued certification ${certNumber} to ${emp?.first_name} ${emp?.last_name}`,
    });

    const [updatedAssignment] = await query(ASSIGNMENT_SELECT + ' WHERE ta.id = ?', [Number(id)]);
    const [newCert] = await query('SELECT * FROM certificates WHERE id = ?', [certResult.insertId]);

    return res.json({
      success: true,
      message: `Certification issued successfully! Certificate ID: ${certNumber}. Valid until ${expiryDate}.`,
      data: { assignment: shapeAssignment(updatedAssignment), certificate: newCert },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const renewCertification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [assignment] = await query('SELECT * FROM training_assignments WHERE id = ?', [Number(id)]);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const now = new Date();
    const nextExpiry = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()).toISOString().split('T')[0];

    await execute(`UPDATE training_assignments SET status = 'Certified', certificate_expiry_date = ? WHERE id = ?`, [nextExpiry, Number(id)]);
    await execute(`UPDATE certificates SET expiry_date = ?, status = 'Valid' WHERE training_assignment_id = ?`, [nextExpiry, Number(id)]);

    const [tp] = await query('SELECT * FROM training_programs WHERE id = ?', [assignment.training_program_id]);
    const [emp] = await query('SELECT * FROM employees WHERE id = ?', [assignment.employee_id]);

    if (emp?.user_id) {
      await createNotification(
        execute, emp.user_id, 'Certification Renewed! 🔄',
        `Your certification for "${tp?.title}" has been renewed until ${nextExpiry}.`,
        'Certificate Earned', 'TRAINING_ASSIGNMENT', Number(id)
      );
    }

    const [row] = await query(ASSIGNMENT_SELECT + ' WHERE ta.id = ?', [Number(id)]);
    return res.json({ success: true, message: `Certification successfully renewed! Extended validity through ${nextExpiry}.`, data: shapeAssignment(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getLearningVelocityAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const allAssignments = await query('SELECT * FROM training_assignments');
    const totalEnrolled = allAssignments.length;
    const certifiedCount = allAssignments.filter((a: any) => a.status === 'Certified').length;
    const completedCount = allAssignments.filter((a: any) => a.status === 'Completed').length;
    const inProgressCount = allAssignments.filter((a: any) => a.status === 'In Progress').length;
    const expiredCount = allAssignments.filter((a: any) => a.status === 'Expired / Renewal').length;
    const notStartedCount = allAssignments.filter((a: any) => a.status === 'Not Started' || a.status === 'Assigned').length;

    const totalProgress = allAssignments.reduce((acc: number, a: any) => acc + (a.progress_percentage || 0), 0);
    const averageVelocity = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0;

    const departments = await query('SELECT * FROM departments');
    const employees = await query(`
      SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id
    `);
    const gaps = await query('SELECT * FROM knowledge_gaps WHERE gap_score > 0');

    const departmentBreakdown = departments.map((dept: any) => {
      const deptEmployees = employees.filter((e: any) => e.department_id === dept.id);
      const deptEmpIds = deptEmployees.map((e: any) => e.id);
      const deptAssignments = allAssignments.filter((a: any) => deptEmpIds.includes(a.employee_id));
      const completed = deptAssignments.filter((a: any) => a.status === 'Completed' || a.status === 'Certified').length;
      const avgProgress = deptAssignments.length > 0
        ? Math.round(deptAssignments.reduce((s: number, a: any) => s + a.progress_percentage, 0) / deptAssignments.length)
        : 0;

      return {
        department_id: dept.id, department_name: dept.name,
        total_employees: deptEmployees.length, total_enrollments: deptAssignments.length,
        completed_count: completed, average_progress: avgProgress,
        active_gaps: gaps.filter((g: any) => deptEmpIds.includes(g.employee_id)).length,
      };
    });

    const programs = await query('SELECT id, title FROM training_programs');
    const teamMembers = employees.map((emp: any) => {
      const empAssignments = allAssignments.filter((a: any) => a.employee_id === emp.id);
      const empGaps = gaps.filter((g: any) => g.employee_id === emp.id);
      const dept = departments.find((d: any) => d.id === emp.department_id);

      return {
        employee_id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        designation: emp.designation,
        department_name: dept ? dept.name : 'Tech',
        active_courses_count: empAssignments.filter((a: any) => a.status === 'In Progress').length,
        certified_courses_count: empAssignments.filter((a: any) => a.status === 'Certified').length,
        open_gaps_count: empGaps.length,
        assignments: empAssignments.map((a: any) => {
          const tp = programs.find((p: any) => p.id === a.training_program_id);
          return {
            id: a.id, title: tp?.title || 'Training Program', progress_percentage: a.progress_percentage,
            status: a.status, start_date: a.start_date, due_date: a.due_date,
          };
        }),
      };
    });

    return res.json({
      success: true,
      data: {
        metrics: {
          total_enrolled: totalEnrolled, certified_count: certifiedCount, completed_count: completedCount,
          in_progress_count: inProgressCount, expired_count: expiredCount, not_started_count: notStartedCount,
          average_completion_rate: averageVelocity,
        },
        department_breakdown: departmentBreakdown,
        team_members: teamMembers,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
