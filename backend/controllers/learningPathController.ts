import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { nextCode } from '../utils/codes';
import { recalculateAllGaps } from '../utils/gaps';

// NOTE: learning_resources / learning_paths / learning_path_items already
// exist in the real schema (and come pre-seeded in your dump). Field aliases
// below (duration, priority casing) preserve the original API shape.

function formatDuration(minutes: number) {
  if (!minutes) return '1 Hour';
  if (minutes < 60) return `${minutes} Mins`;
  const hrs = Math.round(minutes / 60);
  return `${hrs} Hour${hrs !== 1 ? 's' : ''}`;
}

export const getLearningResources = async (req: AuthRequest, res: Response) => {
  try {
    const { skillId, skillName, platform, difficulty, resourceType } = req.query;

    let sql = `SELECT lr.*, s.name as skill_name, s.category as skill_category FROM learning_resources lr LEFT JOIN skills s ON lr.skill_id = s.id WHERE 1=1`;
    const params: any[] = [];
    if (skillId) { sql += ' AND lr.skill_id = ?'; params.push(Number(skillId)); }
    if (skillName) { sql += ' AND s.name LIKE ?'; params.push(`%${skillName}%`); }
    if (platform && platform !== 'All') { sql += ' AND lr.platform = ?'; params.push(platform); }
    if (difficulty && difficulty !== 'All') { sql += ' AND lr.difficulty = ?'; params.push(difficulty); }
    if (resourceType && resourceType !== 'All') { sql += ' AND lr.resource_type = ?'; params.push(resourceType); }
    sql += ' ORDER BY lr.skill_id, lr.sequence_order ASC';

    const rows = await query(sql, params);
    const resources = rows.map((r: any) => ({ ...r, duration: formatDuration(r.duration_minutes) }));

    return res.json({ success: true, count: resources.length, resources });
  } catch (err: any) {
    console.error('Error fetching learning resources:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve learning resources: ' + err.message });
  }
};

export const getEmployeeLearningPath = async (req: AuthRequest, res: Response) => {
  try {
    let employeeIdParam = Number(req.params.employeeId);
    if (!employeeIdParam || isNaN(employeeIdParam)) {
      return res.status(400).json({ success: false, message: 'Invalid employee ID provided' });
    }

    await recalculateAllGaps();

    let [emp] = await query(
      `SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [employeeIdParam]
    );

    // Safe fallback — NOT a UNION with users.id (employees.id and users.id
    // are different ID spaces; conflating them can silently return a
    // different person's data or break the department/avatar joins below,
    // since those columns don't exist on `users`). Instead: if the
    // requested employees.id doesn't exist, and the caller is authenticated,
    // fall back to the caller's own employee record via the real user_id FK.
    // This is what actually fixes "my own learning path 404s" — the caller
    // asked for their own data but the id they had on hand didn't resolve.
    if (!emp && req.user?.id) {
      [emp] = await query(
        `SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id WHERE e.user_id = ?`,
        [req.user.id]
      );
      if (emp) employeeIdParam = emp.id;
    }

    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }
    const [dept] = emp.department_id ? await query('SELECT * FROM departments WHERE id = ?', [emp.department_id]) : [null];

    const empGaps = await query(
      `SELECT * FROM knowledge_gaps WHERE employee_id = ? AND gap_score > 0 ORDER BY gap_score DESC`,
      [employeeIdParam]
    );

    const allSkills = await query('SELECT * FROM skills');
    const learningPathsResult = [];

    for (const gap of empGaps) {
      const skill = allSkills.find((s: any) => s.id === gap.skill_id) || { id: gap.skill_id, name: `Skill #${gap.skill_id}`, category: 'Technical' };

      let [pathRecord] = await query('SELECT * FROM learning_paths WHERE employee_id = ? AND skill_id = ?', [employeeIdParam, gap.skill_id]);
      if (!pathRecord) {
        const pathCode = await nextCode('learning_paths', 'LP');
        const result = await execute(
          `INSERT INTO learning_paths (path_code, employee_id, skill_id, title, target_level, priority, status, progress_percentage)
           VALUES (?, ?, ?, ?, ?, ?, 'IN_PROGRESS', 0)`,
          [pathCode, employeeIdParam, gap.skill_id, `${skill.name} Mastery Path`, gap.required_proficiency || 4, gap.priority || 'High']
        );
        [pathRecord] = await query('SELECT * FROM learning_paths WHERE id = ?', [result.insertId]);
      }
      const pathId = pathRecord.id;

      let itemsList = await query(
        `SELECT lpi.*, lr.title, lr.platform, lr.url, lr.resource_type, lr.difficulty, lr.duration_minutes, lr.description, lr.is_free
         FROM learning_path_items lpi JOIN learning_resources lr ON lpi.resource_id = lr.id
         WHERE lpi.learning_path_id = ? ORDER BY lpi.sequence_order ASC`,
        [pathId]
      );

      if (itemsList.length === 0) {
        const matchingResources = await query('SELECT * FROM learning_resources WHERE skill_id = ? ORDER BY sequence_order ASC', [gap.skill_id]);
        for (const r of matchingResources) {
          await execute(
            `INSERT INTO learning_path_items (learning_path_id, resource_id, sequence_order, status) VALUES (?, ?, ?, 'Pending')`,
            [pathId, r.id, r.sequence_order || 1]
          );
        }
        itemsList = await query(
          `SELECT lpi.*, lr.title, lr.platform, lr.url, lr.resource_type, lr.difficulty, lr.duration_minutes, lr.description, lr.is_free
           FROM learning_path_items lpi JOIN learning_resources lr ON lpi.resource_id = lr.id
           WHERE lpi.learning_path_id = ? ORDER BY lpi.sequence_order ASC`,
          [pathId]
        );
      }

      const completedCount = itemsList.filter((item: any) => item.status === 'Completed').length;
      const progressPercentage = itemsList.length > 0 ? Math.round((completedCount / itemsList.length) * 100) : 0;

      await execute('UPDATE learning_paths SET progress_percentage = ?, status = ? WHERE id = ?', [
        progressPercentage, progressPercentage === 100 ? 'COMPLETED' : 'IN_PROGRESS', pathId,
      ]);

      learningPathsResult.push({
        pathId,
        skillId: skill.id,
        skillName: skill.name,
        skillCategory: skill.category || 'Technical',
        currentProficiency: gap.current_proficiency,
        requiredProficiency: gap.required_proficiency,
        gapScore: gap.gap_score,
        priority: gap.priority,
        status: progressPercentage === 100 ? 'Completed' : 'Active',
        progressPercentage,
        totalSteps: itemsList.length,
        completedSteps: completedCount,
        nextRecommendedStep: itemsList.find((item: any) => item.status !== 'Completed') || null,
        items: itemsList.map((item: any) => ({
          itemId: item.id,
          resourceId: item.resource_id,
          title: item.title,
          platform: item.platform,
          url: item.url,
          resourceType: item.resource_type,
          difficulty: item.difficulty,
          duration: formatDuration(item.duration_minutes),
          description: item.description,
          isFree: Boolean(item.is_free),
          sequenceOrder: item.sequence_order,
          status: item.status,
          completedAt: item.completed_at,
        })),
      });
    }

    const totalGapsCount = learningPathsResult.length;
    const overallProgress = totalGapsCount > 0
      ? Math.round(learningPathsResult.reduce((acc, p) => acc + p.progressPercentage, 0) / totalGapsCount)
      : 0;

    return res.json({
      success: true,
      employee: {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.email,
        designation: emp.designation,
        departmentId: emp.department_id,
        departmentName: dept ? dept.name : 'Engineering & Operations',
        photoUrl: emp.avatar_url,
      },
      overallProgress,
      totalSkillGaps: totalGapsCount,
      completedSkillPaths: learningPathsResult.filter((p) => p.progressPercentage === 100).length,
      learningPaths: learningPathsResult,
    });
  } catch (err: any) {
    console.error('Error in getEmployeeLearningPath:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve employee learning path: ' + err.message });
  }
};

export const completePathItem = async (req: AuthRequest, res: Response) => {
  try {
    const itemIdParam = Number(req.params.itemId);
    if (!itemIdParam || isNaN(itemIdParam)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID' });
    }

    await execute(`UPDATE learning_path_items SET status = 'Completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?`, [itemIdParam]);

    const [item] = await query('SELECT * FROM learning_path_items WHERE id = ?', [itemIdParam]);
    const now = new Date().toISOString();

    if (item && item.learning_path_id) {
      const pathId = item.learning_path_id;
      const allItems = await query('SELECT * FROM learning_path_items WHERE learning_path_id = ?', [pathId]);

      if (allItems.length > 0) {
        const completedCount = allItems.filter((i: any) => i.status === 'Completed').length;
        const newProgress = Math.round((completedCount / allItems.length) * 100);

        await execute('UPDATE learning_paths SET progress_percentage = ?, status = ? WHERE id = ?', [
          newProgress, newProgress === 100 ? 'COMPLETED' : 'IN_PROGRESS', pathId,
        ]);

        if (newProgress === 100) {
          const [lp] = await query('SELECT * FROM learning_paths WHERE id = ?', [pathId]);
          if (lp) {
            const [empSkill] = await query('SELECT * FROM employee_skills WHERE employee_id = ? AND skill_id = ?', [lp.employee_id, lp.skill_id]);
            if (empSkill) {
              const updatedProf = Math.min(5, Number(empSkill.current_proficiency) + 1);
              await execute('UPDATE employee_skills SET current_proficiency = ?, assessed_date = CURRENT_TIMESTAMP WHERE employee_id = ? AND skill_id = ?', [
                updatedProf, lp.employee_id, lp.skill_id,
              ]);
            } else {
              const esCode = await nextCode('employee_skills', 'ESK');
              await execute(
                `INSERT INTO employee_skills (employee_skill_code, employee_id, skill_id, current_proficiency, assessed_date, verified_by)
                 VALUES (?, ?, ?, 3, CURRENT_TIMESTAMP, 'AI Learning Path Engine')`,
                [esCode, lp.employee_id, lp.skill_id]
              );
            }
            await recalculateAllGaps();
          }
        }
      }
    }

    return res.json({ success: true, message: 'Learning resource marked as completed! Progress updated.', completedAt: now });
  } catch (err: any) {
    console.error('Error completing learning path item:', err);
    return res.status(500).json({ success: false, message: 'Failed to update item completion: ' + err.message });
  }
};

export const getTeamLearningSummary = async (req: AuthRequest, res: Response) => {
  try {
    const { departmentId } = req.query;
    let sql = `
      SELECT e.*, u.first_name, u.last_name, d.name as department_name
      FROM employees e JOIN users u ON u.id = e.user_id LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.employment_status = 'ACTIVE'
    `;
    const params: any[] = [];
    if (departmentId) { sql += ' AND e.department_id = ?'; params.push(Number(departmentId)); }

    const empList = await query(sql, params);
    await recalculateAllGaps();
    const gapsList = await query('SELECT * FROM knowledge_gaps WHERE gap_score > 0');
    const skills = await query('SELECT * FROM skills');

    const teamSummary = empList.map((e: any) => {
      const empGaps = gapsList.filter((g: any) => g.employee_id === e.id);
      return {
        employeeId: e.id,
        name: `${e.first_name} ${e.last_name}`,
        designation: e.designation,
        departmentName: e.department_name || 'Department',
        photoUrl: e.avatar_url,
        activeGapsCount: empGaps.length,
        topSkillGaps: empGaps.slice(0, 3).map((g: any) => {
          const sk = skills.find((s: any) => s.id === g.skill_id);
          return { skillId: g.skill_id, skillName: sk ? sk.name : `Skill #${g.skill_id}`, gapScore: g.gap_score, priority: g.priority };
        }),
      };
    });

    return res.json({ success: true, count: teamSummary.length, teamSummary });
  } catch (err: any) {
    console.error('Error fetching team summary:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve team learning summary: ' + err.message });
  }
};
