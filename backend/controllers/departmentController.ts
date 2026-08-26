import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { nextCode } from '../utils/codes';
import { recalculateAllGaps } from '../utils/gaps';

export const getDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const depts = await query(`
      SELECT d.*, CONCAT(u.first_name, ' ', u.last_name) AS head_name,
        (SELECT COUNT(*) FROM employees e WHERE e.department_id = d.id) AS employee_count
      FROM departments d
      LEFT JOIN employees he ON he.id = d.department_head_id
      LEFT JOIN users u ON u.id = he.user_id
    `);
    const reqSkills = await query(`
      SELECT drs.*, s.name AS skill_name, s.category
      FROM department_required_skills drs JOIN skills s ON s.id = drs.skill_id
    `);
    const gaps = await query(`
      SELECT g.priority, e.department_id
      FROM knowledge_gaps g JOIN employees e ON e.id = g.employee_id
    `);

    const data = depts.map((d: any) => {
      const deptGaps = gaps.filter((g: any) => g.department_id === d.id);
      return {
        ...d,
        head_name: d.head_name || 'Not Assigned',
        required_skills: reqSkills.filter((r: any) => r.department_id === d.id),
        active_gaps_count: deptGaps.length,
        high_priority_gaps: deptGaps.filter((g: any) => g.priority === 'High').length,
      };
    });

    return res.json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [d] = await query('SELECT * FROM departments WHERE id = ?', [Number(id)]);
    if (!d) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const [head] = await query(
      `SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [d.department_head_id]
    );
    const employees = await query(
      `SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id WHERE e.department_id = ?`,
      [d.id]
    );
    const requiredSkills = await query(
      `SELECT drs.*, s.id AS skill_id, s.name, s.category, s.description
       FROM department_required_skills drs JOIN skills s ON s.id = drs.skill_id
       WHERE drs.department_id = ?`,
      [d.id]
    );
    const shapedSkills = requiredSkills.map((r: any) => ({
      id: r.id,
      department_id: r.department_id,
      skill_id: r.skill_id,
      required_proficiency: r.required_proficiency,
      skill: { id: r.skill_id, name: r.name, category: r.category, description: r.description },
    }));

    return res.json({ success: true, data: { ...d, head: head || null, employees, requiredSkills: shapedSkills } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, description, headEmployeeId } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required' });
    }

    const existing = await query('SELECT id FROM departments WHERE UPPER(code) = ?', [String(code).toUpperCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Department code already exists' });
    }

    const deptCode = await nextCode('departments', 'DEPT');
    const result = await execute(
      `INSERT INTO departments (department_code, name, code, description, department_head_id, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [deptCode, name, String(code).toUpperCase().trim(), description || '', headEmployeeId ? Number(headEmployeeId) : null]
    );
    const [newDept] = await query('SELECT * FROM departments WHERE id = ?', [result.insertId]);

    return res.status(201).json({ success: true, message: 'Department created', data: newDept });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [d] = await query('SELECT * FROM departments WHERE id = ?', [Number(id)]);
    if (!d) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { name, code, description, headEmployeeId, requiredSkills } = req.body;
    await execute(
      `UPDATE departments SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        description = COALESCE(?, description),
        department_head_id = ?
       WHERE id = ?`,
      [
        name ?? null,
        code ? String(code).toUpperCase() : null,
        description !== undefined ? description : null,
        headEmployeeId !== undefined ? (headEmployeeId ? Number(headEmployeeId) : null) : d.department_head_id,
        Number(id),
      ]
    );

    if (Array.isArray(requiredSkills)) {
      await execute('DELETE FROM department_required_skills WHERE department_id = ?', [Number(id)]);
      for (const sk of requiredSkills) {
        const code2 = await nextCode('department_required_skills', 'DRS');
        await execute(
          `INSERT INTO department_required_skills (dept_req_code, department_id, skill_id, required_proficiency)
           VALUES (?, ?, ?, ?)`,
          [code2, Number(id), Number(sk.skill_id), Number(sk.required_proficiency || 3)]
        );
      }
      await recalculateAllGaps();
    }

    const [updated] = await query('SELECT * FROM departments WHERE id = ?', [Number(id)]);
    return res.json({ success: true, message: 'Department updated', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id FROM departments WHERE id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await execute('UPDATE employees SET department_id = NULL WHERE department_id = ?', [Number(id)]);
    await execute('DELETE FROM departments WHERE id = ?', [Number(id)]);
    await recalculateAllGaps();

    return res.json({ success: true, message: 'Department deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
