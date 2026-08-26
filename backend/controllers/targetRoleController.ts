import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { nextCode, createNotification } from '../utils/codes';
import { logAudit } from '../services/auditLogger';

// NOTE: `target_roles`, `target_role_skills`, and `employees.target_role_id`
// are new — added via schema_updates.sql, since the original dump had no
// career-ladder / target-role feature at all.

async function loadRequiredSkills(targetRoleId: number) {
  return query(
    `SELECT trs.skill_id, s.name AS skill_name, s.category, trs.required_proficiency
     FROM target_role_skills trs JOIN skills s ON s.id = trs.skill_id
     WHERE trs.target_role_id = ?`,
    [targetRoleId]
  );
}

export const getTargetRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId, search, level } = req.query;

    let sql = `
      SELECT tr.*, d.name AS department_name,
        (SELECT COUNT(*) FROM employees e WHERE e.target_role_id = tr.id) AS aspiring_employees_count
      FROM target_roles tr LEFT JOIN departments d ON d.id = tr.department_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (departmentId) {
      sql += ' AND tr.department_id = ?';
      params.push(Number(departmentId));
    }
    if (level) {
      sql += ' AND LOWER(tr.level) = ?';
      params.push(String(level).toLowerCase());
    }
    if (search) {
      sql += ' AND (LOWER(tr.title) LIKE ? OR LOWER(tr.description) LIKE ? OR LOWER(d.name) LIKE ?)';
      const q = `%${String(search).toLowerCase()}%`;
      params.push(q, q, q);
    }

    const roles = await query(sql, params);
    const data = await Promise.all(
      roles.map(async (role: any) => {
        const requiredSkills = await loadRequiredSkills(role.id);
        return {
          ...role,
          department_name: role.department_name || 'General',
          required_skills: requiredSkills,
          required_skills_count: requiredSkills.length,
        };
      })
    );

    return res.json({ success: true, count: data.length, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTargetRoleById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [role] = await query(
      `SELECT tr.*, d.name AS department_name FROM target_roles tr LEFT JOIN departments d ON d.id = tr.department_id WHERE tr.id = ?`,
      [Number(id)]
    );
    if (!role) {
      return res.status(404).json({ success: false, message: 'Target role not found' });
    }

    const requiredSkills = await loadRequiredSkills(role.id);
    const aspiringEmployees = await query(
      `SELECT e.id, CONCAT(u.first_name,' ',u.last_name) AS name, e.designation, e.avatar_url AS photo_url, e.department_id
       FROM employees e JOIN users u ON u.id = e.user_id WHERE e.target_role_id = ?`,
      [role.id]
    );

    return res.json({
      success: true,
      data: {
        ...role,
        department_name: role.department_name || 'General',
        required_skills: requiredSkills,
        aspiring_employees: aspiringEmployees,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTargetRoleGapAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { id, employeeId } = req.params;
    const [targetRole] = await query('SELECT * FROM target_roles WHERE id = ?', [Number(id)]);
    const [employee] = await query(
      `SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [Number(employeeId)]
    );

    if (!targetRole) {
      return res.status(404).json({ success: false, message: 'Target role not found' });
    }
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const requiredSkills = await loadRequiredSkills(targetRole.id);
    const empSkills = await query('SELECT skill_id, current_proficiency FROM employee_skills WHERE employee_id = ?', [employee.id]);
    const activePrograms = await query(`SELECT * FROM training_programs WHERE status = 'Active'`);

    let totalRequiredProf = 0;
    let totalAchievedProf = 0;
    let missingCompetenciesCount = 0;
    let readyCompetenciesCount = 0;
    let totalGapPoints = 0;

    const skillAnalysis = requiredSkills.map((reqSkill: any) => {
      const matched = empSkills.find((es: any) => es.skill_id === reqSkill.skill_id);
      const currentProf = matched ? matched.current_proficiency : 0;
      const gap = Math.max(0, reqSkill.required_proficiency - currentProf);

      totalRequiredProf += reqSkill.required_proficiency;
      totalAchievedProf += Math.min(currentProf, reqSkill.required_proficiency);
      if (gap > 0) {
        missingCompetenciesCount++;
        totalGapPoints += gap;
      } else {
        readyCompetenciesCount++;
      }

      const priority = gap >= 2 ? 'High' : gap === 1 ? 'Medium' : 'Low';
      const recommendedTrainings = activePrograms.filter((tp: any) => tp.target_skill_id === reqSkill.skill_id);

      return {
        skill_id: reqSkill.skill_id,
        skill_name: reqSkill.skill_name,
        category: reqSkill.category,
        required_proficiency: reqSkill.required_proficiency,
        current_proficiency: currentProf,
        gap,
        is_met: gap === 0,
        priority,
        recommended_trainings: recommendedTrainings,
      };
    });

    const readinessPercentage = totalRequiredProf > 0 ? Math.round((totalAchievedProf / totalRequiredProf) * 100) : 100;
    let readinessStatus = 'In Development';
    if (readinessPercentage >= 90) readinessStatus = 'Ready for Promotion';
    else if (readinessPercentage >= 65) readinessStatus = 'Advancing Fast';
    else if (readinessPercentage < 35) readinessStatus = 'Early Stage Preparation';

    return res.json({
      success: true,
      data: {
        target_role: { ...targetRole, required_skills: requiredSkills },
        employee: {
          id: employee.id,
          name: `${employee.first_name} ${employee.last_name}`,
          current_designation: employee.designation,
          photo_url: employee.avatar_url,
          department_id: employee.department_id,
        },
        readiness_percentage: readinessPercentage,
        readiness_status: readinessStatus,
        total_gap_points: totalGapPoints,
        missing_competencies_count: missingCompetenciesCount,
        ready_competencies_count: readyCompetenciesCount,
        skills_analysis: skillAnalysis,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignEmployeeTargetRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { targetRoleId, targetRoleTitle } = req.body;

    const [emp] = await query('SELECT * FROM employees WHERE id = ?', [Number(id)]);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    let chosenRole: any;
    if (targetRoleId) {
      [chosenRole] = await query('SELECT * FROM target_roles WHERE id = ?', [Number(targetRoleId)]);
    } else if (targetRoleTitle) {
      [chosenRole] = await query('SELECT * FROM target_roles WHERE LOWER(title) = ?', [String(targetRoleTitle).toLowerCase()]);
    }

    const roleTitle = chosenRole ? chosenRole.title : targetRoleTitle || 'Senior Full Stack Developer';
    const roleId = chosenRole ? chosenRole.id : null;

    await execute('UPDATE employees SET target_role_id = ? WHERE id = ?', [roleId, Number(id)]);

    await createNotification(
      execute,
      emp.user_id,
      'Career Target Role Assigned',
      `Your career target role has been set to "${roleTitle}". View your personalized skill gap analysis and roadmap!`,
      'System',
      'TARGET_ROLE',
      roleId ?? undefined
    );

    await logAudit({
      actor_user_id: req.user?.id,
      action: 'UPDATE_TARGET_ROLE',
      entity_type: 'EMPLOYEE',
      entity_id: `EMP-${emp.id}`,
      new_values: { target_role: roleTitle, target_role_id: roleId },
      description: `Assigned Target Role "${roleTitle}" to employee ${emp.id}`,
    });

    return res.json({
      success: true,
      message: `Target role successfully updated to ${roleTitle}`,
      data: { employee_id: emp.id, target_role: roleTitle, target_role_id: roleId },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createTargetRole = async (req: AuthRequest, res: Response) => {
  try {
    const { title, departmentId, level, description, salaryBand, requiredSkills } = req.body;
    if (!title || !departmentId || !level) {
      return res.status(400).json({ success: false, message: 'Title, department, and level are required' });
    }

    const code = await nextCode('target_roles', 'ROLE');
    const result = await execute(
      `INSERT INTO target_roles (target_role_code, title, department_id, level, description, salary_band)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [code, title, Number(departmentId), level, description || `Career progression standard for ${title}`, salaryBand || '$120,000 - $160,000']
    );
    const newRoleId = result.insertId;

    if (Array.isArray(requiredSkills)) {
      for (const s of requiredSkills) {
        await execute(
          `INSERT INTO target_role_skills (target_role_id, skill_id, required_proficiency) VALUES (?, ?, ?)`,
          [newRoleId, Number(s.skill_id || s.id), Number(s.required_proficiency || 4)]
        );
      }
    }

    const [newRole] = await query('SELECT * FROM target_roles WHERE id = ?', [newRoleId]);
    const finalSkills = await loadRequiredSkills(newRoleId);

    await logAudit({
      actor_user_id: req.user?.id,
      action: 'CREATE',
      entity_type: 'TARGET_ROLE',
      entity_id: `ROLE-${newRoleId}`,
      new_values: { ...newRole, required_skills: finalSkills },
      description: `Created new enterprise Target Role standard: ${title}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Target role created successfully',
      data: { ...newRole, required_skills: finalSkills },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
