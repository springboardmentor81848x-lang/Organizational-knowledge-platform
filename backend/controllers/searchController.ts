import { Request, Response } from 'express';
import { query } from '../config/mysqlDb';

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    if (!q) {
      return res.json({ success: true, data: [] });
    }
    const like = `%${q}%`;
    const results: any[] = [];

    const employees = await query(
      `SELECT e.id, u.first_name, u.last_name, u.email, e.designation
       FROM employees e JOIN users u ON u.id = e.user_id
       WHERE LOWER(CONCAT(u.first_name,' ',u.last_name)) LIKE ? OR LOWER(e.designation) LIKE ? OR LOWER(u.email) LIKE ?
       LIMIT 10`,
      [like, like, like]
    );
    employees.forEach((emp: any) => results.push({
      type: 'Employee', id: emp.id, title: `${emp.first_name} ${emp.last_name}`,
      subtitle: `${emp.designation} (${emp.email})`, path: `/employees/${emp.id}`,
    }));

    const departments = await query(
      `SELECT id, name, code, description FROM departments WHERE LOWER(name) LIKE ? OR LOWER(code) LIKE ? LIMIT 10`,
      [like, like]
    );
    departments.forEach((dept: any) => results.push({
      type: 'Department', id: dept.id, title: dept.name,
      subtitle: `Code: ${dept.code} - ${dept.description}`, path: '/departments',
    }));

    const skills = await query(
      `SELECT id, name, category FROM skills WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ? LIMIT 10`,
      [like, like]
    );
    skills.forEach((sk: any) => results.push({
      type: 'Skill', id: sk.id, title: sk.name, subtitle: `Category: ${sk.category}`, path: '/skills',
    }));

    const trainings = await query(
      `SELECT id, title, category, provider, duration_hours FROM training_programs WHERE LOWER(title) LIKE ? OR LOWER(category) LIKE ? LIMIT 10`,
      [like, like]
    );
    trainings.forEach((tp: any) => results.push({
      type: 'Training', id: tp.id, title: tp.title,
      subtitle: `${tp.provider} (${tp.duration_hours} hrs)`, path: '/training',
    }));

    const tasks = await query(
      `SELECT t.id, t.title, t.priority, CONCAT(u.first_name,' ',u.last_name) AS employee_name
       FROM tasks t LEFT JOIN employees e ON e.id = t.assigned_to LEFT JOIN users u ON u.id = e.user_id
       WHERE LOWER(t.title) LIKE ? OR LOWER(CONCAT(u.first_name,' ',u.last_name)) LIKE ? LIMIT 10`,
      [like, like]
    );
    tasks.forEach((t: any) => results.push({
      type: 'Task', id: t.id, title: t.title,
      subtitle: `Assigned to ${t.employee_name} [${t.priority} Priority]`, path: '/tasks',
    }));

    const leaves = await query(
      `SELECT l.id, l.leave_type, l.status, l.start_date, l.end_date, CONCAT(u.first_name,' ',u.last_name) AS employee_name
       FROM leave_requests l JOIN employees e ON e.id = l.employee_id JOIN users u ON u.id = e.user_id
       WHERE LOWER(CONCAT(u.first_name,' ',u.last_name)) LIKE ? OR LOWER(l.leave_type) LIKE ? LIMIT 10`,
      [like, like]
    );
    leaves.forEach((l: any) => results.push({
      type: 'Leave Request', id: l.id, title: `${l.employee_name} - ${l.leave_type} Leave`,
      subtitle: `Status: ${l.status} (${l.start_date} to ${l.end_date})`, path: '/leave',
    }));

    res.json({ success: true, data: results.slice(0, 15) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/search/experts (Expert Directory search)
export const searchExperts = async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase().trim();
    const departmentFilter = (req.query.department as string) || '';
    const proficiencyFilter = (req.query.proficiency as string) || '';

    const getProficiencyLabel = (level: number) => {
      if (level >= 5) return 'Expert';
      if (level === 4) return 'Advanced';
      if (level === 3) return 'Intermediate';
      if (level === 2) return 'Beginner';
      return 'Novice';
    };

    const rows = await query(`
      SELECT es.current_proficiency, e.id AS employee_id, u.first_name, u.last_name, u.email,
             e.phone, e.designation, e.employment_status, e.avatar_url,
             d.id AS department_id, d.name AS department_name,
             s.id AS skill_id, s.name AS skill_name, s.category AS skill_category, s.description AS skill_description
      FROM employee_skills es
      JOIN employees e ON e.id = es.employee_id
      JOIN users u ON u.id = e.user_id
      JOIN skills s ON s.id = es.skill_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE es.current_proficiency >= 3
    `);

    const mentorStats = await query(`
      SELECT mentor_employee_id, COUNT(*) AS active_count, AVG(rating) AS avg_rating
      FROM mentor_requests WHERE status IN ('ACCEPTED', 'ACTIVE') GROUP BY mentor_employee_id
    `);
    const sessionStats = await query(`
      SELECT host_employee_id, COUNT(*) AS hosted_count FROM knowledge_sessions GROUP BY host_employee_id
    `);

    let expertsList = rows.map((row: any) => {
      const mentor = mentorStats.find((m: any) => m.mentor_employee_id === row.employee_id);
      const session = sessionStats.find((s: any) => s.host_employee_id === row.employee_id);
      const profLabel = getProficiencyLabel(row.current_proficiency);

      return {
        id: `${row.employee_id}-${row.skill_id}`,
        employee_id: row.employee_id,
        expert_name: `${row.first_name} ${row.last_name}`,
        email: row.email,
        phone: row.phone,
        designation: row.designation,
        department_id: row.department_id || 0,
        department_name: row.department_name || 'Technology & Engineering',
        skill_id: row.skill_id,
        skill_name: row.skill_name,
        skill_category: row.skill_category,
        current_proficiency: row.current_proficiency,
        proficiency: profLabel,
        rating: mentor?.avg_rating ? parseFloat(Number(mentor.avg_rating).toFixed(1)) : 4.9,
        active_mentees_count: mentor?.active_count || 0,
        hosted_sessions_count: session?.hosted_count || 0,
        availability: row.employment_status === 'ACTIVE' ? 'Available for Mentorship' : 'Limited Availability',
        photo_url: row.avatar_url,
        _skillDescription: row.skill_description,
      };
    });

    if (q) {
      expertsList = expertsList.filter((entry: any) => {
        const fullText = `${entry.expert_name} ${entry.skill_name} ${entry.department_name} ${entry.designation} ${entry._skillDescription}`.toLowerCase();
        const isAliasMatch =
          (q.includes('java') && (fullText.includes('spring') || fullText.includes('react') || fullText.includes('node') || fullText.includes('sql') || fullText.includes('cloud'))) ||
          (q.includes('spring') && fullText.includes('spring')) ||
          (q.includes('cloud') && fullText.includes('cloud')) ||
          (q.includes('k8s') && fullText.includes('cloud'));
        return fullText.includes(q) || isAliasMatch;
      });
    }
    if (departmentFilter) {
      expertsList = expertsList.filter((e: any) => e.department_name.toLowerCase() === departmentFilter.toLowerCase());
    }
    if (proficiencyFilter) {
      expertsList = expertsList.filter((e: any) => e.proficiency.toLowerCase() === proficiencyFilter.toLowerCase());
    }

    expertsList.forEach((e: any) => delete e._skillDescription);
    expertsList.sort((a: any, b: any) => b.current_proficiency - a.current_proficiency || b.rating - a.rating);

    res.json({ success: true, count: expertsList.length, data: expertsList });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
