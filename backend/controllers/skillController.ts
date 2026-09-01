import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { nextCode } from '../utils/codes';
import { recalculateAllGaps } from '../utils/gaps';

export const getSkills = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query(`
      SELECT s.*,
        (SELECT COUNT(*) FROM employee_skills es WHERE es.skill_id = s.id) AS assessed_employees_count,
        (SELECT COUNT(*) FROM knowledge_gaps g WHERE g.skill_id = s.id) AS gap_count,
        (SELECT COUNT(*) FROM knowledge_gaps g WHERE g.skill_id = s.id AND g.priority = 'High') AS high_priority_gaps
      FROM skills s
    `);
    const deptReqs = await query(`
      SELECT drs.skill_id, d.name FROM department_required_skills drs
      JOIN departments d ON d.id = drs.department_id
    `);

    let list = rows.map((s: any) => ({
      ...s,
      required_in_departments: deptReqs.filter((d: any) => d.skill_id === s.id).map((d: any) => d.name),
    }));

    const { category, search } = req.query;
    if (category) {
      list = list.filter((s: any) => s.category === category);
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter((s: any) =>
        s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSkill = async (req: AuthRequest, res: Response) => {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Skill name and category are required' });
    }

    const existing = await query('SELECT id FROM skills WHERE LOWER(name) = ?', [String(name).toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Skill already exists' });
    }

    const code = await nextCode('skills', 'SKL');
    const result = await execute(
      `INSERT INTO skills (skill_code, name, category, description, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
      [code, String(name).trim(), category, description || '']
    );
    const [newSkill] = await query('SELECT * FROM skills WHERE id = ?', [result.insertId]);

    return res.status(201).json({ success: true, message: 'Skill added', data: newSkill });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSkill = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT * FROM skills WHERE id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    const { name, category, description } = req.body;
    await execute(
      `UPDATE skills SET name = COALESCE(?, name), category = COALESCE(?, category), description = COALESCE(?, description) WHERE id = ?`,
      [name ?? null, category ?? null, description !== undefined ? description : null, Number(id)]
    );

    const [updated] = await query('SELECT * FROM skills WHERE id = ?', [Number(id)]);
    return res.json({ success: true, message: 'Skill updated', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSkill = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT id FROM skills WHERE id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    // FK constraints (ON DELETE CASCADE) already remove employee_skills /
    // department_required_skills rows referencing this skill.
    await execute('DELETE FROM skills WHERE id = ?', [Number(id)]);
    await recalculateAllGaps();

    return res.json({ success: true, message: 'Skill deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const assignEmployeeSkill = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, skillId, currentProficiency, verifiedBy } = req.body;
    if (!employeeId || !skillId || !currentProficiency) {
      return res.status(400).json({ success: false, message: 'Employee ID, Skill ID, and Proficiency level (1-5) required' });
    }

    const [emp] = await query('SELECT id FROM employees WHERE id = ?', [Number(employeeId)]);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const code = await nextCode('employee_skills', 'ESK');
    await execute(
      `INSERT INTO employee_skills (employee_skill_code, employee_id, skill_id, current_proficiency, assessed_date, verified_by)
       VALUES (?, ?, ?, ?, CURDATE(), ?)
       ON DUPLICATE KEY UPDATE current_proficiency = VALUES(current_proficiency), assessed_date = CURDATE(), verified_by = VALUES(verified_by)`,
      [code, Number(employeeId), Number(skillId), Number(currentProficiency), verifiedBy || 'Assessor']
    );

    await recalculateAllGaps();

    return res.json({ success: true, message: 'Employee skill assessment updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
