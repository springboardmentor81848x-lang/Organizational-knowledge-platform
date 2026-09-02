import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { recalculateAllGaps } from '../utils/gaps';

export const getKnowledgeGaps = async (req: AuthRequest, res: Response) => {
  try {
    await recalculateAllGaps();

    const rows = await query(`
      SELECT g.*, CONCAT(u.first_name,' ',u.last_name) AS employee_name, e.designation AS employee_designation,
             e.avatar_url AS employee_photo, e.department_id, COALESCE(d.name,'Unassigned') AS department_name,
             s.name AS skill_name, s.category AS skill_category
      FROM knowledge_gaps g
      JOIN employees e ON e.id = g.employee_id
      JOIN users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      JOIN skills s ON s.id = g.skill_id
    `);
    const activePrograms = await query(`SELECT * FROM training_programs WHERE status = 'Active'`);

    let gaps = rows.map((g: any) => {
      const percentage = Math.round((g.current_proficiency / g.required_proficiency) * 100);
      const recommendedProgram = activePrograms.find((tp: any) => tp.target_skill_id === g.skill_id);
      return {
        ...g,
        competency_percentage: percentage,
        recommended_training: recommendedProgram
          ? { id: recommendedProgram.id, title: recommendedProgram.title, duration_hours: recommendedProgram.duration_hours, provider: recommendedProgram.provider }
          : null,
      };
    });

    const { priority, status, departmentId, employeeId, search } = req.query;
    if (priority) gaps = gaps.filter((g: any) => g.priority === priority);
    if (status) gaps = gaps.filter((g: any) => g.status === status);
    if (departmentId) gaps = gaps.filter((g: any) => g.department_id === Number(departmentId));
    if (employeeId) gaps = gaps.filter((g: any) => g.employee_id === Number(employeeId));
    if (search) {
      const q = String(search).toLowerCase();
      gaps = gaps.filter((g: any) =>
        g.employee_name.toLowerCase().includes(q) || g.skill_name.toLowerCase().includes(q) || g.department_name.toLowerCase().includes(q)
      );
    }

    return res.json({ success: true, count: gaps.length, data: gaps });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGapAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    await recalculateAllGaps();
    const { departmentId } = req.query;

    const employeeFilter = departmentId ? 'WHERE department_id = ?' : '';
    const params = departmentId ? [Number(departmentId)] : [];
    const targetEmployees = await query(`SELECT id FROM employees ${employeeFilter}`, params);
    const empIds = targetEmployees.map((e: any) => e.id);

    const [{ totalDepartments }] = await query('SELECT COUNT(*) AS totalDepartments FROM departments');
    const [{ totalSkills }] = await query('SELECT COUNT(*) AS totalSkills FROM skills');

    const allGaps = await query('SELECT * FROM knowledge_gaps');
    const relevantGaps = departmentId ? allGaps.filter((g: any) => empIds.includes(g.employee_id)) : allGaps;

    const totalGaps = relevantGaps.length;
    const highPriorityGaps = relevantGaps.filter((g: any) => g.priority === 'High').length;
    const mediumPriorityGaps = relevantGaps.filter((g: any) => g.priority === 'Medium').length;
    const lowPriorityGaps = relevantGaps.filter((g: any) => g.priority === 'Low').length;
    const inTrainingCount = relevantGaps.filter((g: any) => g.status === 'In Training').length;
    const avgGapScore = totalGaps > 0
      ? (relevantGaps.reduce((sum: number, g: any) => sum + g.gap_score, 0) / totalGaps).toFixed(2)
      : '0.00';

    const departments = await query('SELECT * FROM departments' + (departmentId ? ' WHERE id = ?' : ''), params);
    const departmentBreakdown = await Promise.all(departments.map(async (d: any) => {
      const emps = await query('SELECT id FROM employees WHERE department_id = ?', [d.id]);
      const empIdSet = emps.map((e: any) => e.id);
      const dGaps = allGaps.filter((g: any) => empIdSet.includes(g.employee_id));
      return {
        department_id: d.id,
        department_name: d.name,
        total_gaps: dGaps.length,
        high_gaps: dGaps.filter((g: any) => g.priority === 'High').length,
      };
    }));

    const skills = await query('SELECT * FROM skills');
    const skillDeficiencies = skills.map((s: any) => {
      const sGaps = relevantGaps.filter((g: any) => g.skill_id === s.id);
      return {
        skill_id: s.id,
        skill_name: s.name,
        category: s.category,
        gap_count: sGaps.length,
        avg_deficit: sGaps.length > 0 ? Number((sGaps.reduce((sum: number, g: any) => sum + g.gap_score, 0) / sGaps.length).toFixed(1)) : 0,
      };
    }).sort((a: any, b: any) => b.gap_count - a.gap_count);

    const teamMembers = await query(`
      SELECT e.id, CONCAT(u.first_name,' ',u.last_name) AS name, e.designation, e.avatar_url AS photo_url,
        (SELECT COUNT(*) FROM employee_skills es WHERE es.employee_id = e.id) AS assessed_skills_count,
        (SELECT COUNT(*) FROM knowledge_gaps g WHERE g.employee_id = e.id) AS active_gaps_count,
        (SELECT COUNT(*) FROM knowledge_gaps g WHERE g.employee_id = e.id AND g.priority = 'High') AS high_gaps_count,
        (SELECT COUNT(*) FROM training_assignments ta WHERE ta.employee_id = e.id) AS active_trainings_count,
        (SELECT COUNT(*) FROM training_assignments ta WHERE ta.employee_id = e.id AND ta.status = 'Completed') AS completed_trainings_count,
        (SELECT COALESCE(ROUND(AVG(ta.progress_percentage)), 0) FROM training_assignments ta WHERE ta.employee_id = e.id) AS avg_progress
      FROM employees e JOIN users u ON u.id = e.user_id
      ${departmentId ? 'WHERE e.department_id = ?' : ''}
    `, params);

    return res.json({
      success: true,
      data: {
        metrics: {
          totalEmployees: targetEmployees.length,
          totalDepartments: departmentId ? 1 : totalDepartments,
          totalSkills,
          totalGaps,
          highPriorityGaps,
          mediumPriorityGaps,
          lowPriorityGaps,
          inTrainingCount,
          avgGapScore: Number(avgGapScore),
        },
        departmentBreakdown,
        skillDeficiencies,
        teamMembers,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveGap = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [gap] = await query('SELECT * FROM knowledge_gaps WHERE id = ?', [Number(id)]);
    if (!gap) {
      return res.status(404).json({ success: false, message: 'Gap record not found' });
    }

    await execute(`UPDATE knowledge_gaps SET status = 'Resolved' WHERE id = ?`, [Number(id)]);
    await execute(
      `UPDATE employee_skills SET current_proficiency = ? WHERE employee_id = ? AND skill_id = ?`,
      [gap.required_proficiency, gap.employee_id, gap.skill_id]
    );

    return res.json({ success: true, message: 'Gap marked as resolved and competency updated' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHeatmapData = async (req: AuthRequest, res: Response) => {
  try {
    await recalculateAllGaps();
    const { departmentId, employeeId, category } = req.query;

    const employeesList = await query(`
      SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.employment_status = 'ACTIVE'
    `);
    const skillsList = await query('SELECT * FROM skills ORDER BY category, id');
    const departmentsList = await query('SELECT * FROM departments');
    const empSkillsList = await query('SELECT * FROM employee_skills');
    const deptReqSkillsList = await query('SELECT * FROM department_required_skills');
    const gapsList = await query('SELECT * FROM knowledge_gaps');

    let filteredEmployees = employeesList;
    if (employeeId) {
      filteredEmployees = filteredEmployees.filter((e: any) => e.id === Number(employeeId));
    } else if (departmentId) {
      filteredEmployees = filteredEmployees.filter((e: any) => e.department_id === Number(departmentId));
    }

    let filteredSkills = skillsList;
    if (category && category !== 'All') {
      filteredSkills = filteredSkills.filter((s: any) => s.category === category);
    }

    const employeeNames: string[] = [];
    const skillNames: string[] = filteredSkills.map((s: any) => s.name);
    const matrixData: number[][] = [];
    const detailedMatrix: any[][] = [];

    filteredEmployees.forEach((emp: any) => {
      const empFullName = `${emp.first_name} ${emp.last_name}`;
      employeeNames.push(empFullName);
      const dept = departmentsList.find((d: any) => d.id === emp.department_id);
      const empRowValues: number[] = [];
      const empRowDetails: any[] = [];

      filteredSkills.forEach((skill: any) => {
        const empSkill = empSkillsList.find((es: any) => es.employee_id === emp.id && es.skill_id === skill.id);
        const currentLevel = empSkill ? Number(empSkill.current_proficiency) : 0;
        const isAssessed = Boolean(empSkill);

        const deptReq = deptReqSkillsList.find((dr: any) => dr.department_id === emp.department_id && dr.skill_id === skill.id);
        const requiredLevel = deptReq ? Number(deptReq.required_proficiency) : 3;

        const gapScore = Math.max(0, requiredLevel - currentLevel);
        const existingGap = gapsList.find((g: any) => g.employee_id === emp.id && g.skill_id === skill.id);

        let status = 'Met';
        if (!isAssessed) status = 'Not Assessed';
        else if (existingGap && existingGap.status === 'In Training') status = 'In Training';
        else if (gapScore > 0) status = 'Identified Gap';

        const priority = gapScore >= 2 ? 'High' : gapScore === 1 ? 'Medium' : 'Low';

        empRowValues.push(gapScore);
        empRowDetails.push({
          employeeId: emp.id,
          employeeName: empFullName,
          designation: emp.designation || 'Team Member',
          departmentId: emp.department_id,
          departmentName: dept ? dept.name : 'Unassigned',
          skillId: skill.id,
          skillName: skill.name,
          skillCategory: skill.category || 'Technical',
          currentLevel,
          requiredLevel,
          gapScore,
          gapPercentage: requiredLevel > 0 ? Math.min(100, Math.round((currentLevel / requiredLevel) * 100)) : 100,
          status,
          priority,
          isAssessed,
        });
      });

      matrixData.push(empRowValues);
      detailedMatrix.push(empRowDetails);
    });

    const flatDetails = detailedMatrix.flat();

    return res.json({
      success: true,
      employees: employeeNames,
      skills: skillNames,
      data: matrixData,
      employeeDetails: filteredEmployees.map((e: any) => {
        const dept = departmentsList.find((d: any) => d.id === e.department_id);
        return {
          id: e.id,
          name: `${e.first_name} ${e.last_name}`,
          designation: e.designation,
          departmentId: e.department_id,
          departmentName: dept ? dept.name : 'Unassigned',
          photoUrl: e.avatar_url,
        };
      }),
      skillDetails: filteredSkills.map((s: any) => ({
        id: s.id, name: s.name, category: s.category || 'Technical', description: s.description || '',
      })),
      matrix: detailedMatrix,
      summary: {
        totalEmployees: filteredEmployees.length,
        totalSkills: filteredSkills.length,
        totalGaps: flatDetails.filter((cell: any) => cell.gapScore > 0).length,
        highPriorityGaps: flatDetails.filter((cell: any) => cell.gapScore >= 2).length,
        mediumPriorityGaps: flatDetails.filter((cell: any) => cell.gapScore === 1).length,
        zeroGapCount: flatDetails.filter((cell: any) => cell.gapScore === 0).length,
      },
    });
  } catch (err: any) {
    console.error('Heatmap DB API error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve heatmap: ' + err.message });
  }
};
