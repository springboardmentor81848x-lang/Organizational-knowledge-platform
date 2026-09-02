import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { nextCode } from '../utils/codes';

// Community of Practice groups — skill-focused groups any employee can join,
// with a lightweight discussion feed. Separate from the 1:1 mentorship
// workflow (mentorshipController.ts) and formal knowledge_sessions
// (sessionController.ts) — this is informal, ongoing peer knowledge-sharing.

async function resolveEmployeeId(req: AuthRequest): Promise<number | null> {
  const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [req.user?.id]);
  return emp?.id ?? null;
}

const GROUP_SELECT = `
  SELECT cg.*, s.name AS skill_name,
    (SELECT COUNT(*) FROM community_group_members m WHERE m.group_id = cg.id) AS member_count,
    (SELECT COUNT(*) FROM community_posts p WHERE p.group_id = cg.id) AS post_count
  FROM community_groups cg
  LEFT JOIN skills s ON s.id = cg.skill_id
`;

export const getGroups = async (req: AuthRequest, res: Response) => {
  try {
    const empId = await resolveEmployeeId(req);
    const groups = await query(GROUP_SELECT + ` WHERE cg.status = 'ACTIVE' ORDER BY cg.created_at DESC`);

    const myMemberships = empId
      ? await query('SELECT group_id FROM community_group_members WHERE employee_id = ?', [empId])
      : [];
    const myGroupIds = new Set(myMemberships.map((m: any) => m.group_id));

    const data = groups.map((g: any) => ({ ...g, is_member: myGroupIds.has(g.id) }));
    return res.json({ success: true, count: data.length, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [group] = await query(GROUP_SELECT + ' WHERE cg.id = ?', [Number(id)]);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const members = await query(
      `SELECT cgm.*, CONCAT(u.first_name,' ',u.last_name) AS employee_name, e.designation, e.avatar_url
       FROM community_group_members cgm
       JOIN employees e ON e.id = cgm.employee_id
       JOIN users u ON u.id = e.user_id
       WHERE cgm.group_id = ? ORDER BY cgm.joined_at ASC`,
      [Number(id)]
    );

    const posts = await query(
      `SELECT cp.*, CONCAT(u.first_name,' ',u.last_name) AS employee_name, e.avatar_url
       FROM community_posts cp
       JOIN employees e ON e.id = cp.employee_id
       JOIN users u ON u.id = e.user_id
       WHERE cp.group_id = ? ORDER BY cp.created_at DESC`,
      [Number(id)]
    );

    const empId = await resolveEmployeeId(req);
    const isMember = empId ? members.some((m: any) => m.employee_id === empId) : false;

    return res.json({ success: true, data: { ...group, members, posts, is_member: isMember } });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, skillId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Group name is required' });
    }
    const empId = await resolveEmployeeId(req);

    const code = await nextCode('community_groups', 'GROUP');
    const result = await execute(
      `INSERT INTO community_groups (group_code, name, description, skill_id, created_by, status)
       VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
      [code, name, description || '', skillId ? Number(skillId) : null, empId]
    );

    if (empId) {
      await execute(
        `INSERT INTO community_group_members (group_id, employee_id, role) VALUES (?, ?, 'ADMIN')`,
        [result.insertId, empId]
      );
    }

    const [newGroup] = await query(GROUP_SELECT + ' WHERE cg.id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Community group created', data: newGroup });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const joinGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const empId = await resolveEmployeeId(req);
    if (!empId) {
      return res.status(400).json({ success: false, message: 'Employee profile required to join a group' });
    }

    await execute(
      `INSERT INTO community_group_members (group_id, employee_id, role) VALUES (?, ?, 'MEMBER')
       ON DUPLICATE KEY UPDATE role = role`,
      [Number(id), empId]
    );

    return res.json({ success: true, message: 'Joined group successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const leaveGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const empId = await resolveEmployeeId(req);
    if (!empId) {
      return res.status(400).json({ success: false, message: 'Employee profile not found' });
    }

    await execute('DELETE FROM community_group_members WHERE group_id = ? AND employee_id = ?', [Number(id), empId]);
    return res.json({ success: true, message: 'Left group successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content is required' });
    }

    const empId = await resolveEmployeeId(req);
    if (!empId) {
      return res.status(400).json({ success: false, message: 'Employee profile required to post' });
    }

    const [membership] = await query(
      'SELECT id FROM community_group_members WHERE group_id = ? AND employee_id = ?',
      [Number(id), empId]
    );
    if (!membership) {
      return res.status(403).json({ success: false, message: 'Join the group before posting' });
    }

    const result = await execute(
      'INSERT INTO community_posts (group_id, employee_id, content) VALUES (?, ?, ?)',
      [Number(id), empId, content.trim()]
    );

    const [newPost] = await query(
      `SELECT cp.*, CONCAT(u.first_name,' ',u.last_name) AS employee_name, e.avatar_url
       FROM community_posts cp JOIN employees e ON e.id = cp.employee_id JOIN users u ON u.id = e.user_id
       WHERE cp.id = ?`,
      [result.insertId]
    );

    return res.status(201).json({ success: true, message: 'Posted', data: newPost });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
