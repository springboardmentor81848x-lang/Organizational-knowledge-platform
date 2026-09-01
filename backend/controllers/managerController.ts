import { Response } from 'express';
import { query } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { recalculateAllGaps } from '../utils/gaps';

async function getDepartmentFilter(req: AuthRequest): Promise<number | null> {
  const { departmentId } = req.query;
  if (departmentId && departmentId !== 'All') {
    return Number(departmentId);
  }
  const user = req.user;
  if (user && (user.role === 'Manager' || user.role === 'Department Head')) {
    const [emp] = await query(
      'SELECT department_id FROM employees WHERE id = ? OR user_id = ?',
      [user.employeeId ?? -1, user.id]
    );
    if (emp?.department_id) return emp.department_id;
  }
  return null;
}

const EMP_SELECT = `
  SELECT e.*, u.first_name, u.last_name, u.email, d.name AS department_name
  FROM employees e JOIN users u ON u.id = e.user_id LEFT JOIN departments d ON d.id = e.department_id
`;

export const getManagerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const deptId = await getDepartmentFilter(req);
    await recalculateAllGaps();

    const employees = deptId
      ? await query(EMP_SELECT + ` WHERE e.employment_status = 'ACTIVE' AND e.department_id = ?`, [deptId])
      : await query(EMP_SELECT + ` WHERE e.employment_status = 'ACTIVE'`);
    const empIds = employees.map((e: any) => e.id);
    const totalEmployees = employees.length;

    const departments = await query('SELECT * FROM departments');
    const currentDepartment = deptId ? departments.find((d: any) => d.id === deptId) : null;
    const totalDepartments = deptId ? 1 : departments.length;

    const skills = await query('SELECT * FROM skills');
    const totalSkills = skills.length;

    const empSkillsList = empIds.length > 0
      ? await query(`SELECT * FROM employee_skills WHERE employee_id IN (${empIds.map(() => '?').join(',')})`, empIds)
      : [];

    const avgSkillLevelPercent = empSkillsList.length > 0
      ? Math.round(empSkillsList.reduce((acc: number, es: any) => acc + Number(es.current_proficiency) * 20, 0) / empSkillsList.length)
      : 65;

    const allGaps = (await query('SELECT * FROM knowledge_gaps WHERE gap_score > 0'));
    const relevantGaps = allGaps.filter((g: any) => empIds.includes(g.employee_id));
    const highRiskGapsCount = relevantGaps.filter((g: any) => g.priority === 'High' || Number(g.gap_score) >= 2).length;
    const totalGapsCount = relevantGaps.length;

    const trainingAssignments = empIds.length > 0
      ? await query(`SELECT * FROM training_assignments WHERE employee_id IN (${empIds.map(() => '?').join(',')})`, empIds)
      : [];
    const completedTrainings = trainingAssignments.filter((ta: any) => ta.status === 'Completed').length;
    const trainingCompletionRate = trainingAssignments.length > 0 ? Math.round((completedTrainings / trainingAssignments.length) * 100) : 0;

    const allDeptReqSkills = await query('SELECT * FROM department_required_skills');
    const deptRequiredSkills = deptId ? allDeptReqSkills.filter((dr: any) => dr.department_id === deptId) : allDeptReqSkills;

    const teamSkillCoverage = deptRequiredSkills.map((dr: any) => {
      const s = skills.find((sk: any) => sk.id === dr.skill_id);
      const relevantEmpSkills = empSkillsList.filter((es: any) => es.skill_id === dr.skill_id);
      const satisfyingCount = relevantEmpSkills.filter((es: any) => Number(es.current_proficiency) >= dr.required_proficiency).length;
      const coveragePercent = totalEmployees > 0 ? Math.round((satisfyingCount / totalEmployees) * 100) : 0;
      const avgProf = relevantEmpSkills.length > 0
        ? (relevantEmpSkills.reduce((acc: number, es: any) => acc + Number(es.current_proficiency), 0) / relevantEmpSkills.length).toFixed(1)
        : '0.0';
      return {
        skillId: dr.skill_id,
        skillName: s ? s.name : 'Technical Competency',
        category: s ? s.category : 'Technical',
        requiredProficiency: dr.required_proficiency,
        teamSatisfiedCount: satisfyingCount,
        totalTeamMembers: totalEmployees,
        coveragePercentage: coveragePercent,
        averageProficiency: Number(avgProf),
      };
    });

    const teamMembers = employees.map((emp: any) => {
      const empSkills = empSkillsList.filter((es: any) => es.employee_id === emp.id);
      const empGaps = relevantGaps.filter((g: any) => g.employee_id === emp.id);
      const empTrainings = trainingAssignments.filter((ta: any) => ta.employee_id === emp.id);
      const isAssessed = empSkills.length > 0;
      const completedCount = empTrainings.filter((t: any) => t.status === 'Completed').length;
      const trainProgress = empTrainings.length > 0 ? Math.round((completedCount / empTrainings.length) * 100) : 0;
      const avgLevel = empSkills.length > 0
        ? Math.round((empSkills.reduce((acc: number, es: any) => acc + Number(es.current_proficiency), 0) / empSkills.length) * 20)
        : 0;

      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        firstName: emp.first_name,
        lastName: emp.last_name,
        email: emp.email,
        designation: emp.designation,
        photoUrl: emp.avatar_url,
        joinDate: emp.joining_date,
        isAssessed,
        assessmentStatus: isAssessed ? 'Assessed' : 'Assessment Pending',
        skillsCount: empSkills.length,
        gapsCount: empGaps.length,
        highRiskGapsCount: empGaps.filter((g: any) => g.priority === 'High' || Number(g.gap_score) >= 2).length,
        avgSkillPercent: avgLevel,
        trainingEnrollmentCount: empTrainings.length,
        trainingCompletionRate: trainProgress,
        gaps: empGaps.map((g: any) => {
          const sk = skills.find((s: any) => s.id === g.skill_id);
          return {
            id: g.id, skillId: g.skill_id, skillName: sk ? sk.name : 'Skill',
            requiredProficiency: g.required_proficiency, currentProficiency: g.current_proficiency,
            gapScore: g.gap_score, priority: g.priority, status: g.status,
          };
        }),
      };
    });

    const activePrograms = await query(`SELECT * FROM training_programs WHERE status = 'Active'`);
    const teamHighRiskAlerts = relevantGaps
      .filter((g: any) => g.priority === 'High' || Number(g.gap_score) >= 2)
      .map((g: any) => {
        const emp = employees.find((e: any) => e.id === g.employee_id);
        const sk = skills.find((s: any) => s.id === g.skill_id);
        const prog = activePrograms.find((p: any) => p.target_skill_id === g.skill_id);
        return {
          gapId: g.id,
          employeeId: g.employee_id,
          employeeName: emp ? `${emp.first_name} ${emp.last_name}` : 'Team Member',
          employeeDesignation: emp?.designation || '',
          skillId: g.skill_id,
          skillName: sk ? sk.name : 'Critical Skill',
          requiredProficiency: g.required_proficiency,
          currentProficiency: g.current_proficiency,
          gapScore: g.gap_score,
          priority: g.priority,
          recommendedProgram: prog ? prog.title : 'Targeted Upskilling Course',
          recommendedProgramId: prog?.id || null,
        };
      });

    const topPerformers = teamMembers.filter((m: any) => m.isAssessed).slice(0, 5);

    const highRiskSkills = skills.map((s: any) => {
      const skillGaps = relevantGaps.filter((g: any) => g.skill_id === s.id);
      const avgGap = skillGaps.length > 0
        ? (skillGaps.reduce((acc: number, g: any) => acc + Number(g.gap_score), 0) / skillGaps.length).toFixed(1)
        : 0;
      let riskLevel = 'Low';
      if (Number(avgGap) >= 2 || skillGaps.length >= 2) riskLevel = 'High';
      else if (Number(avgGap) >= 1 || skillGaps.length >= 1) riskLevel = 'Medium';
      return {
        skillId: s.id, skillName: s.name, category: s.category || 'Technical',
        gapCount: skillGaps.length, avgGapScore: Number(avgGap),
        avgGapPercent: Math.round(Number(avgGap) * 20), riskLevel,
      };
    }).filter((s: any) => s.gapCount > 0 || s.riskLevel !== 'Low').sort((a: any, b: any) => b.gapCount - a.gapCount).slice(0, 5);

    res.json({
      success: true,
      scopedDepartment: currentDepartment ? {
        id: currentDepartment.id, name: currentDepartment.name, code: currentDepartment.code, description: currentDepartment.description,
      } : null,
      isDepartmentScoped: !!deptId,
      metrics: {
        totalEmployees, totalDepartments, totalSkills,
        averageSkillLevel: avgSkillLevelPercent,
        highRiskGapsCount, totalGapsCount, trainingCompletionRate,
        assessedEmployeesCount: teamMembers.filter((m: any) => m.isAssessed).length,
        pendingAssessmentCount: teamMembers.filter((m: any) => !m.isAssessed).length,
      },
      teamSkillCoverage,
      teamMembers,
      teamHighRiskAlerts,
      topPerformers,
      highRiskSkills,
      departments: departments.map((d: any) => ({ id: d.id, name: d.name, code: d.code })),
    });
  } catch (error: any) {
    console.error('Manager Dashboard API error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve manager dashboard data: ' + error.message });
  }
};

export const getManagerEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const deptId = await getDepartmentFilter(req);
    const employees = deptId
      ? await query(EMP_SELECT + ` WHERE e.employment_status = 'ACTIVE' AND e.department_id = ?`, [deptId])
      : await query(EMP_SELECT + ` WHERE e.employment_status = 'ACTIVE'`);

    await recalculateAllGaps();
    const gapsList = await query('SELECT * FROM knowledge_gaps WHERE gap_score > 0');
    const skillsList = await query('SELECT * FROM employee_skills');
    const trainingsList = await query('SELECT * FROM training_assignments');

    const data = employees.map((emp: any) => {
      const empGaps = gapsList.filter((g: any) => g.employee_id === emp.id);
      const empSkills = skillsList.filter((es: any) => es.employee_id === emp.id);
      const empTrainings = trainingsList.filter((ta: any) => ta.employee_id === emp.id);
      const avgSkillLevel = empSkills.length > 0
        ? Math.round((empSkills.reduce((acc: number, es: any) => acc + Number(es.current_proficiency), 0) / empSkills.length) * 20)
        : 60;

      return {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        phone: emp.phone,
        designation: emp.designation,
        departmentId: emp.department_id,
        departmentName: emp.department_name || 'Unassigned',
        joinDate: emp.joining_date,
        photoUrl: emp.avatar_url,
        activeGapsCount: empGaps.length,
        highRiskGapsCount: empGaps.filter((g: any) => g.priority === 'High' || g.gap_score >= 2).length,
        avgSkillPercent: avgSkillLevel,
        trainingsAssigned: empTrainings.length,
        trainingsCompleted: empTrainings.filter((t: any) => t.status === 'Completed').length,
      };
    });

    res.json({ success: true, count: data.length, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSkillImprovementTrend = async (req: AuthRequest, res: Response) => {
  try {
    const deptId = await getDepartmentFilter(req);
    const { employeeId, skillId } = req.query;

    let sql = `
      SELECT ar.*, sa.title as assessment_title, s.name as skill_name,
             CONCAT(u.first_name, ' ', u.last_name) as employee_name,
             DATE_FORMAT(ar.taken_at, '%Y-%m') as month_year
      FROM assessment_results ar
      JOIN skill_assessments sa ON ar.assessment_id = sa.id
      JOIN skills s ON ar.skill_id = s.id
      JOIN employees e ON ar.employee_id = e.id
      JOIN users u ON u.id = e.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (deptId) { sql += ' AND e.department_id = ?'; params.push(deptId); }
    if (employeeId) { sql += ' AND ar.employee_id = ?'; params.push(Number(employeeId)); }
    if (skillId) { sql += ' AND ar.skill_id = ?'; params.push(Number(skillId)); }
    sql += ' ORDER BY ar.taken_at ASC';

    const trendData = await query(sql, params);
    res.json({ success: true, data: trendData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getManagerPendingLeaves = async (req: AuthRequest, res: Response) => {
  try {
    const deptId = await getDepartmentFilter(req);
    let sql = `
      SELECT l.*, e.department_id, CONCAT(u.first_name,' ',u.last_name) AS employee_name
      FROM leave_requests l JOIN employees e ON l.employee_id = e.id JOIN users u ON u.id = e.user_id
      WHERE l.status = 'Pending'
    `;
    const params: any[] = [];
    if (deptId) { sql += ' AND e.department_id = ?'; params.push(deptId); }
    sql += ' ORDER BY l.created_at DESC';

    const pendingLeaves = await query(sql, params);
    res.json({ success: true, count: pendingLeaves.length, data: pendingLeaves });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeDrilldown = async (req: AuthRequest, res: Response) => {
  try {
    const employeeId = Number(req.params.id);
    if (!employeeId || isNaN(employeeId)) {
      return res.status(400).json({ success: false, message: 'Valid employee ID required' });
    }

    const [emp] = await query(EMP_SELECT + ' WHERE e.id = ?', [employeeId]);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    await recalculateAllGaps();
    const skills = await query(
      `SELECT es.*, s.name as skill_name, s.category as skill_category FROM employee_skills es JOIN skills s ON es.skill_id = s.id WHERE es.employee_id = ?`,
      [employeeId]
    );
    const gaps = await query(
      `SELECT g.*, s.name as skill_name FROM knowledge_gaps g JOIN skills s ON g.skill_id = s.id WHERE g.employee_id = ? AND g.gap_score > 0`,
      [employeeId]
    );
    const assessments = await query(
      `SELECT ar.*, sa.title as assessment_title, s.name as skill_name FROM assessment_results ar JOIN skill_assessments sa ON ar.assessment_id = sa.id JOIN skills s ON ar.skill_id = s.id WHERE ar.employee_id = ? ORDER BY ar.taken_at DESC`,
      [employeeId]
    );
    const trainings = await query(
      `SELECT ta.*, tp.title as program_title, tp.provider FROM training_assignments ta JOIN training_programs tp ON ta.training_program_id = tp.id WHERE ta.employee_id = ?`,
      [employeeId]
    );
    const leaves = await query('SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC', [employeeId]);

    res.json({
      success: true,
      employee: {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        phone: emp.phone,
        designation: emp.designation,
        departmentName: emp.department_name || 'Unassigned',
        joinDate: emp.joining_date,
        photoUrl: emp.avatar_url,
      },
      skills, gaps, assessments, trainings, leaves,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
