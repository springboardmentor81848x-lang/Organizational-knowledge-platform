import { Response } from 'express';
import { query } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { recalculateAllGaps } from '../utils/gaps';

export const getEmployeeReport = async (req: AuthRequest, res: Response) => {
  const employees = await query(`
    SELECT e.id, u.first_name, u.last_name, u.email, e.designation, d.name AS department, e.employment_status AS status, e.joining_date AS join_date
    FROM employees e JOIN users u ON u.id = e.user_id LEFT JOIN departments d ON d.id = e.department_id
  `);
  const skills = await query(`
    SELECT es.employee_id, s.name AS skill_name, s.category, es.current_proficiency AS proficiency
    FROM employee_skills es JOIN skills s ON s.id = es.skill_id
  `);
  const gaps = await query('SELECT employee_id, priority FROM knowledge_gaps');
  const trainings = await query('SELECT employee_id, status FROM training_assignments');

  const data = employees.map((emp: any) => {
    const empSkills = skills.filter((s: any) => s.employee_id === emp.id);
    const empGaps = gaps.filter((g: any) => g.employee_id === emp.id);
    const empTrainings = trainings.filter((t: any) => t.employee_id === emp.id);
    return {
      id: emp.id,
      employee_name: `${emp.first_name} ${emp.last_name}`,
      email: emp.email,
      designation: emp.designation,
      department: emp.department || 'Unassigned',
      status: emp.status,
      join_date: emp.join_date,
      skills_count: empSkills.length,
      skills_list: empSkills.map((s: any) => ({ skill_name: s.skill_name, category: s.category, proficiency: s.proficiency })),
      gaps_count: empGaps.length,
      high_gaps_count: empGaps.filter((g: any) => g.priority === 'High').length,
      trainings_completed: empTrainings.filter((t: any) => t.status === 'Completed').length,
      trainings_in_progress: empTrainings.filter((t: any) => t.status === 'In Progress').length,
    };
  });

  return res.json({
    success: true,
    generated_at: new Date().toISOString(),
    report_title: 'Employee Competency & Skills Master Report',
    data,
  });
};

export const getGapReport = async (req: AuthRequest, res: Response) => {
  await recalculateAllGaps();

  const rows = await query(`
    SELECT g.*, CONCAT(u.first_name,' ',u.last_name) AS employee_name, COALESCE(d.name,'Unassigned') AS department,
           s.name AS skill_name, s.category
    FROM knowledge_gaps g
    JOIN employees e ON e.id = g.employee_id
    JOIN users u ON u.id = e.user_id
    LEFT JOIN departments d ON d.id = e.department_id
    JOIN skills s ON s.id = g.skill_id
  `);

  const data = rows.map((g: any) => ({
    id: g.id,
    employee_name: g.employee_name,
    department: g.department,
    skill_name: g.skill_name,
    category: g.category,
    required_proficiency: g.required_proficiency,
    current_proficiency: g.current_proficiency,
    gap_score: g.gap_score,
    priority: g.priority,
    status: g.status,
    created_at: g.created_at,
  }));

  return res.json({
    success: true,
    generated_at: new Date().toISOString(),
    report_title: 'Organizational Knowledge Gap Analysis Report',
    summary: {
      total_gaps: data.length,
      high_priority: data.filter((d: any) => d.priority === 'High').length,
      medium_priority: data.filter((d: any) => d.priority === 'Medium').length,
      low_priority: data.filter((d: any) => d.priority === 'Low').length,
      resolved: data.filter((d: any) => d.status === 'Resolved').length,
    },
    data,
  });
};

export const getEmployeeSpecificReport = async (req: AuthRequest, res: Response) => {
  const empId = Number(req.params.id) || req.user?.employeeId;
  const [emp] = await query(`
    SELECT e.id, u.first_name, u.last_name, u.email, e.designation, d.name AS department, e.joining_date AS join_date, e.employment_status AS status
    FROM employees e JOIN users u ON u.id = e.user_id LEFT JOIN departments d ON d.id = e.department_id
    WHERE e.id = ?
  `, [empId]);

  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  const skills = await query(`
    SELECT s.name AS skill_name, s.category, es.current_proficiency AS current_level, es.verified_by, es.assessed_date AS last_assessed
    FROM employee_skills es JOIN skills s ON s.id = es.skill_id WHERE es.employee_id = ?
  `, [emp.id]);

  const gaps = await query(`
    SELECT s.name AS skill_name, g.required_proficiency, g.current_proficiency, g.gap_score, g.priority, g.status
    FROM knowledge_gaps g JOIN skills s ON s.id = g.skill_id WHERE g.employee_id = ?
  `, [emp.id]);

  const trainings = await query(`
    SELECT COALESCE(tp.title, 'Training Course') AS title, ta.status, ta.progress_percentage AS progress, ta.due_date, ta.completed_at
    FROM training_assignments ta LEFT JOIN training_programs tp ON tp.id = ta.training_program_id WHERE ta.employee_id = ?
  `, [emp.id]);

  const assessments = await query('SELECT score FROM assessment_results WHERE employee_id = ?', [emp.id]);
  // No fabricated fallback — an employee genuinely hasn't been assessed yet
  // until assessment_results has rows for them, and the report should say
  // that plainly rather than show a number that looks real but isn't.
  const avgScore = assessments.length > 0
    ? Math.round(assessments.reduce((acc: number, a: any) => acc + (a.score || 0), 0) / assessments.length)
    : null;

  return res.json({
    success: true,
    data: {
      employee: {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        designation: emp.designation,
        department: emp.department || 'Unassigned',
        join_date: emp.join_date,
        status: emp.status,
      },
      skills: skills.map((s: any) => ({ ...s, verified: !!s.verified_by })),
      gaps,
      trainings,
      assessments_completed: assessments.length,
      average_assessment_score: avgScore,
    },
  });
};

export const getDepartmentSpecificReport = async (req: AuthRequest, res: Response) => {
  const deptId = Number(req.params.id);
  if (!deptId || isNaN(deptId)) {
    return res.status(400).json({ success: false, message: 'A valid department ID is required' });
  }
  const [dept] = await query('SELECT * FROM departments WHERE id = ?', [deptId]);
  if (!dept) {
    return res.status(404).json({ success: false, message: 'Department not found' });
  }

  const emps = await query(`
    SELECT e.id, u.first_name, u.last_name, e.designation, e.employment_status AS status
    FROM employees e JOIN users u ON u.id = e.user_id WHERE e.department_id = ?
  `, [dept.id]);
  const gaps = await query(`
    SELECT g.priority FROM knowledge_gaps g JOIN employees e ON e.id = g.employee_id WHERE e.department_id = ?
  `, [dept.id]);
  const trainings = await query(`
    SELECT ta.status, ta.progress_percentage FROM training_assignments ta JOIN employees e ON e.id = ta.employee_id WHERE e.department_id = ?
  `, [dept.id]);
  const completedTrainings = trainings.filter((t: any) => t.status === 'Completed');

  return res.json({
    success: true,
    data: {
      department: {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        description: dept.description,
        employee_count: emps.length,
      },
      metrics: {
        total_employees: emps.length,
        active_skill_gaps: gaps.length,
        high_risk_gaps: gaps.filter((g: any) => g.priority === 'High').length,
        total_training_enrollments: trainings.length,
        training_completion_rate: trainings.length > 0 ? Math.round((completedTrainings.length / trainings.length) * 100) : 0,
        average_progress: trainings.length > 0 ? Math.round(trainings.reduce((acc: number, t: any) => acc + (t.progress_percentage || 0), 0) / trainings.length) : 0,
      },
      employees: emps.map((e: any) => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        designation: e.designation,
        status: e.status,
      })),
    },
  });
};

export const getTrainingEffectivenessReport = async (req: AuthRequest, res: Response) => {
  const programs = await query('SELECT * FROM training_programs');
  const assignments = await query('SELECT training_program_id, status, progress_percentage FROM training_assignments');

  const programReports = await Promise.all(programs.map(async (p: any) => {
    const enrollments = assignments.filter((t: any) => t.training_program_id === p.id);
    const completed = enrollments.filter((t: any) => t.status === 'Completed');
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((acc: number, t: any) => acc + (t.progress_percentage || 0), 0) / enrollments.length)
      : 0;

    // Real effectiveness proxy: average assessment score for the skill this
    // program targets, among employees who actually took that assessment
    // (not a fixed constant). Null if nobody's been assessed on it yet.
    const skillAssessments = await query(
      'SELECT score FROM assessment_results WHERE skill_id = ?',
      [p.target_skill_id]
    );
    const avgAssessmentScore = skillAssessments.length > 0
      ? Math.round(skillAssessments.reduce((acc: number, a: any) => acc + (a.score || 0), 0) / skillAssessments.length)
      : null;

    return {
      id: p.id,
      title: p.title,
      category: p.category,
      provider: p.provider,
      total_enrolled: enrollments.length,
      completed_count: completed.length,
      completion_rate: enrollments.length > 0 ? Math.round((completed.length / enrollments.length) * 100) : 0,
      average_progress: avgProgress,
      average_assessment_score: avgAssessmentScore,
    };
  }));

  // Real average time-to-resolution for closed gaps — computed from actual
  // created_at/updated_at timestamps, not a fixed "18 Days" placeholder.
  const resolvedGaps = await query(
    `SELECT created_at, updated_at FROM knowledge_gaps WHERE status = 'Resolved' AND updated_at IS NOT NULL`
  );
  const avgDaysToResolution = resolvedGaps.length > 0
    ? Math.round(
        resolvedGaps.reduce((acc: number, g: any) => {
          const days = (new Date(g.updated_at).getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return acc + Math.max(0, days);
        }, 0) / resolvedGaps.length
      )
    : null;

  return res.json({
    success: true,
    data: {
      total_programs: programs.length,
      total_enrollments: assignments.length,
      overall_completion_rate: assignments.length > 0
        ? Math.round((assignments.filter((t: any) => t.status === 'Completed').length / assignments.length) * 100)
        : 0,
      average_days_to_gap_resolution: avgDaysToResolution,
      resolved_gaps_count: resolvedGaps.length,
      programs: programReports,
    },
  });
};
