import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditLogger';
import { nextCode } from '../utils/codes';
import { recalculateAllGaps } from '../utils/gaps';

async function computeTargetRoleReadiness(employeeId: number, targetRoleId: number | null, empSkills: any[]) {
  if (!targetRoleId) return 0;
  const requiredSkills = await query(
    'SELECT skill_id, required_proficiency FROM target_role_skills WHERE target_role_id = ?',
    [targetRoleId]
  );
  if (requiredSkills.length === 0) return 0;

  let totalReq = 0;
  let totalAch = 0;
  requiredSkills.forEach((rs: any) => {
    totalReq += rs.required_proficiency;
    const matched = empSkills.find((es: any) => es.skill_id === rs.skill_id);
    totalAch += matched ? Math.min(matched.current_proficiency, rs.required_proficiency) : 0;
  });
  return totalReq > 0 ? Math.round((totalAch / totalReq) * 100) : 100;
}

const EMPLOYEE_SELECT = `
  SELECT e.*, u.first_name, u.last_name, u.email, u.profile_photo,
         d.name AS department_name, tr.title AS target_role
  FROM employees e
  JOIN users u ON u.id = e.user_id
  LEFT JOIN departments d ON d.id = e.department_id
  LEFT JOIN target_roles tr ON tr.id = e.target_role_id
`;

export const getEmployees = async (req: AuthRequest, res: Response) => {
  try {
    const employees = await query(EMPLOYEE_SELECT);
    const allSkills = await query(`
      SELECT es.*, s.name AS skill_name, s.category FROM employee_skills es JOIN skills s ON s.id = es.skill_id
    `);
    const allGaps = await query('SELECT employee_id, priority FROM knowledge_gaps');

    let list = await Promise.all(
      employees.map(async (e: any) => {
        const skills = allSkills.filter((s: any) => s.employee_id === e.id);
        const gaps = allGaps.filter((g: any) => g.employee_id === e.id);
        const isAssessed = skills.length > 0;
        const targetRoleReadiness = await computeTargetRoleReadiness(e.id, e.target_role_id, skills);

        return {
          ...e,
          department_name: e.department_name || 'Unassigned',
          skills_count: skills.length,
          gaps_count: gaps.length,
          high_gaps_count: gaps.filter((g: any) => g.priority === 'High').length,
          is_assessed: isAssessed,
          assessment_status: isAssessed ? 'Assessed' : 'Assessment Pending',
          target_role_readiness: targetRoleReadiness,
        };
      })
    );

    const { departmentId, search, status } = req.query;
    if (departmentId) {
      list = list.filter((e: any) => e.department_id === Number(departmentId));
    }
    if (status) {
      list = list.filter((e: any) => e.employment_status === status);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((e: any) =>
        e.first_name.toLowerCase().includes(q) ||
        e.last_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.designation || '').toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [employee] = await query(EMPLOYEE_SELECT + ' WHERE e.id = ?', [Number(id)]);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const [department] = employee.department_id
      ? await query('SELECT * FROM departments WHERE id = ?', [employee.department_id])
      : [null];

    const skillRows = await query(
      `SELECT es.*, s.id AS skill_id_full, s.name AS skill_name, s.category, s.description
       FROM employee_skills es JOIN skills s ON s.id = es.skill_id WHERE es.employee_id = ?`,
      [employee.id]
    );
    const skills = skillRows.map((es: any) => ({
      ...es,
      skill: { id: es.skill_id, name: es.skill_name, category: es.category, description: es.description },
    }));

    const gaps = await query(
      `SELECT g.*, s.name AS skill_name, s.category AS skill_category
       FROM knowledge_gaps g JOIN skills s ON s.id = g.skill_id WHERE g.employee_id = ?`,
      [employee.id]
    );

    const trainingAssignments = await query(
      `SELECT ta.*, tp.title AS program_title, tp.category
       FROM training_assignments ta LEFT JOIN training_programs tp ON tp.id = ta.training_program_id
       WHERE ta.employee_id = ?`,
      [employee.id]
    );

    let deptReqs: any[] = [];
    if (department) {
      const rows = await query(
        `SELECT dr.*, s.name AS skill_name FROM department_required_skills dr JOIN skills s ON s.id = dr.skill_id WHERE dr.department_id = ?`,
        [department.id]
      );
      deptReqs = rows.map((dr: any) => {
        const empSkill = skills.find((es: any) => es.skill_id === dr.skill_id);
        return {
          ...dr,
          current_proficiency: empSkill ? empSkill.current_proficiency : 0,
          is_met: empSkill ? empSkill.current_proficiency >= dr.required_proficiency : false,
        };
      });
    }

    const isAssessed = skills.length > 0;
    const [targetRoleObj] = employee.target_role_id
      ? await query('SELECT * FROM target_roles WHERE id = ?', [employee.target_role_id])
      : [null];
    const targetRoleReadiness = await computeTargetRoleReadiness(employee.id, employee.target_role_id, skills);

    return res.json({
      success: true,
      data: {
        ...employee,
        department,
        skills,
        gaps,
        trainingAssignments,
        department_required_skills: deptReqs,
        target_role_object: targetRoleObj || null,
        target_role_readiness: targetRoleReadiness,
        is_assessed: isAssessed,
        assessment_status: isAssessed ? 'Assessed' : 'Assessment Pending',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, phone, designation, targetRole, targetRoleId, departmentId, joinDate, status } = req.body;

    if (!firstName || !lastName || !email || !designation) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Employee email already registered' });
    }

    const placeholderHash = bcrypt.hashSync('ChangeMe123!', 10);
    const userCode = await nextCode('users', 'USER');
    const userResult = await execute(
      `INSERT INTO users (user_code, email, password_hash, first_name, last_name, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [userCode, cleanEmail, placeholderHash, firstName, lastName]
    );
    const newUserId = userResult.insertId;

    const [employeeRole] = await query("SELECT id FROM roles WHERE name = 'Employee'");
    if (employeeRole) {
      await execute('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)', [newUserId, employeeRole.id]);
    }

    let matchedTargetRoleId: number | null = null;
    if (targetRoleId) {
      matchedTargetRoleId = Number(targetRoleId);
    } else if (targetRole) {
      const [tr] = await query('SELECT id FROM target_roles WHERE LOWER(title) = ?', [String(targetRole).toLowerCase()]);
      matchedTargetRoleId = tr?.id ?? null;
    }

    const employeeCode = await nextCode('employees', 'EMP');
    const empResult = await execute(
      `INSERT INTO employees (employee_code, user_id, department_id, designation, target_role_id, joining_date, employment_status, phone, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '/default-avatar.svg')`,
      [
        employeeCode,
        newUserId,
        departmentId ? Number(departmentId) : null,
        designation,
        matchedTargetRoleId,
        joinDate || new Date().toISOString().split('T')[0],
        status || 'ACTIVE',
        phone || '+1-800-555-0199',
      ]
    );

    await recalculateAllGaps();

    const [newEmp] = await query(EMPLOYEE_SELECT + ' WHERE e.id = ?', [empResult.insertId]);

    await logAudit({
      actor_user_id: req.user?.id,
      action: 'CREATE',
      entity_type: 'EMPLOYEE',
      entity_id: newEmp.employee_code,
      new_values: newEmp,
      description: `Created new employee ${newEmp.first_name} ${newEmp.last_name} (${newEmp.email})`,
    });

    return res.status(201).json({ success: true, message: 'Employee created', data: newEmp });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [existing] = await query(EMPLOYEE_SELECT + ' WHERE e.id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const { firstName, lastName, phone, designation, targetRole, targetRoleId, departmentId, status } = req.body;

    if (firstName || lastName) {
      await execute(
        `UPDATE users SET first_name = COALESCE(?, first_name), last_name = COALESCE(?, last_name) WHERE id = ?`,
        [firstName ?? null, lastName ?? null, existing.user_id]
      );
    }

    let resolvedTargetRoleId: number | null | undefined = undefined;
    if (targetRoleId !== undefined) {
      resolvedTargetRoleId = targetRoleId ? Number(targetRoleId) : null;
    } else if (targetRole !== undefined) {
      const [tr] = await query('SELECT id FROM target_roles WHERE LOWER(title) = ?', [String(targetRole).toLowerCase()]);
      resolvedTargetRoleId = tr?.id ?? null;
    }

    await execute(
      `UPDATE employees SET
        phone = COALESCE(?, phone),
        designation = COALESCE(?, designation),
        department_id = ?,
        target_role_id = ?,
        employment_status = COALESCE(?, employment_status)
       WHERE id = ?`,
      [
        phone ?? null,
        designation ?? null,
        departmentId !== undefined ? (departmentId ? Number(departmentId) : null) : existing.department_id,
        resolvedTargetRoleId !== undefined ? resolvedTargetRoleId : existing.target_role_id,
        status ?? null,
        Number(id),
      ]
    );

    await recalculateAllGaps();

    const [updated] = await query(EMPLOYEE_SELECT + ' WHERE e.id = ?', [Number(id)]);

    await logAudit({
      actor_user_id: req.user?.id,
      action: 'UPDATE',
      entity_type: 'EMPLOYEE',
      entity_id: updated.employee_code,
      old_values: existing,
      new_values: updated,
      description: `Updated employee record for ${updated.first_name} ${updated.last_name}`,
    });

    return res.json({ success: true, message: 'Employee updated', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [emp] = await query(EMPLOYEE_SELECT + ' WHERE e.id = ?', [Number(id)]);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // employee_skills, knowledge_gaps etc. cascade via FK ON DELETE CASCADE.
    // Deleting the user cascades to the employee row too (employees.user_id FK).
    await execute('DELETE FROM users WHERE id = ?', [emp.user_id]);
    await recalculateAllGaps();

    await logAudit({
      actor_user_id: req.user?.id,
      action: 'DELETE',
      entity_type: 'EMPLOYEE',
      entity_id: emp.employee_code,
      old_values: emp,
      description: `Deleted employee ${emp.first_name} ${emp.last_name}`,
    });

    return res.json({ success: true, message: 'Employee removed successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
