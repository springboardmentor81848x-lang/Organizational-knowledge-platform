import { Request, Response } from 'express';
import { query } from '../config/mysqlDb';

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const rows = await query(`
      SELECT
        e.id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        COALESCE(e.avatar_url, '/default-avatar.svg') AS photoUrl,
        e.designation,
        COALESCE(d.name, 'General') AS department,
        e.employment_status,
        COALESCE(ta.completed_count, 0) AS completedTrainings,
        COALESCE(es.avg_score, 3.0) AS avgSkillScore,
        COALESCE(cert.cert_count, 0) AS certificationsCount,
        COALESCE(bg.badge_count, 0) AS badgeCount
      FROM employees e
      LEFT JOIN users u ON u.id = e.user_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN (
        SELECT employee_id, COUNT(*) AS completed_count FROM training_assignments
        WHERE status = 'Completed' GROUP BY employee_id
      ) ta ON ta.employee_id = e.id
      LEFT JOIN (
        SELECT employee_id, ROUND(AVG(current_proficiency), 1) AS avg_score FROM employee_skills
        GROUP BY employee_id
      ) es ON es.employee_id = e.id
      LEFT JOIN (
        SELECT employee_id, COUNT(*) AS cert_count FROM certificates GROUP BY employee_id
      ) cert ON cert.employee_id = e.id
      LEFT JOIN (
        SELECT employee_id, COUNT(*) AS badge_count FROM employee_badges GROUP BY employee_id
      ) bg ON bg.employee_id = e.id
    `);

    const badgeRows = await query('SELECT employee_id, badge_title, icon FROM employee_badges');

    const leaderboard = rows.map((emp: any) => {
      const empBadges = badgeRows.filter((b: any) => b.employee_id === emp.id);
      const score = Math.round(
        emp.completedTrainings * 250 +
        Number(emp.avgSkillScore) * 100 +
        emp.badgeCount * 150 +
        emp.certificationsCount * 200 +
        (emp.employment_status === 'ACTIVE' ? 50 : 0)
      );
      return {
        id: emp.id,
        name: emp.name,
        photoUrl: emp.photoUrl,
        designation: emp.designation,
        department: emp.department,
        completedTrainings: emp.completedTrainings,
        avgSkillScore: Number(emp.avgSkillScore),
        certificationsCount: emp.certificationsCount,
        score,
        badges: empBadges.map((b: any) => ({ type: b.badge_title, name: b.badge_title, icon: b.icon })),
      };
    });

    leaderboard.sort((a, b) => b.score - a.score);

    const rankedLeaderboard = leaderboard.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      topBadge: idx === 0 ? '👑 Rank #1 Gold Champion' : idx === 1 ? '🥈 Rank #2 Silver Leader' : idx === 2 ? '🥉 Rank #3 Bronze Specialist' : null,
    }));

    res.json({ success: true, data: rankedLeaderboard });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
