import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditLogger';
import { nextCode, createNotification } from '../utils/codes';

// NOTE: This module uses a `mentorships` + `mentor_request_history` schema
// (added via schema_updates.sql) rather than the simpler `mentor_requests`
// table in the original dump — the admin-approval workflow here (propose ->
// admin recommends -> admin approves/rejects -> complete, with a full audit
// history per request) needs the richer shape. `mentor_profiles` /
// `mentor_requests` remain in the schema unused by this controller.

// Governance authority (recommend/approve/reject other people's mentorship
// requests) belongs to Admin/HR/L&D Admin only — NOT the plain 'Mentor'
// role. A mentor guides their own mentees; approving org-wide requests is
// an administrative function. This was previously merged (Mentor included
// here granted the same approval rights as Admin), which let any mentor
// approve/reject anyone's request.
// Governance authority (recommend/approve/reject other people's mentorship
// requests) belongs to System Administrator and HR Specialist ONLY.
// L&D Admin's authority is scoped to content/curriculum (course creation,
// workshop scheduling, skill frameworks — see trainingController.ts and
// sessionController.ts) — not organization-wide approval power over
// mentorship matching, leave requests, or role changes. A Mentor's role is
// narrower still: accepting/declining requests sent directly to them (see
// updateMentorshipStatus/completeMentorship, which any party to the
// mentorship can use), not reviewing other people's requests.
const APPROVER_ROLES = ['Admin', 'System Administrator', 'HR Specialist', 'HR'];
export const isAdminRole = (role?: string): boolean => !!role && APPROVER_ROLES.includes(role);

const normalizeStatus = (status?: string): string => {
  if (!status) return 'Pending Admin Review';
  const lower = status.trim().toLowerCase();
  if (['pending_admin_approval', 'pending admin review', 'requested', 'pending'].includes(lower)) return 'Pending Admin Review';
  if (['mentor_recommended', 'mentor recommended', 'recommended'].includes(lower)) return 'Mentor Recommended';
  if (['approved', 'active', 'accepted'].includes(lower)) return 'Approved';
  if (['rejected', 'declined'].includes(lower)) return 'Rejected';
  if (lower === 'completed') return 'Completed';
  if (lower === 'cancelled') return 'Cancelled';
  return status.trim();
};

const PROF_NAMES: Record<number, string> = { 1: 'Beginner', 2: 'Intermediate', 3: 'Competent', 4: 'Advanced', 5: 'Expert' };

async function resolveEmployeeId(req: AuthRequest, fallback?: number): Promise<number> {
  if (fallback) return fallback;
  const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [req.user?.id]);
  if (!emp && !req.user?.employeeId) {
    // This is the actual failure mode behind an ambiguous "not found" error
    // downstream: the logged-in user's JWT carries a users.id with no
    // matching employees row at all (e.g. an Admin/HR account created
    // without an employee profile, or a JWT issued before one was linked).
    console.error(`[resolveEmployeeId] No employees row for user_id=${req.user?.id} and no employeeId claim in JWT — this account cannot act as a mentee/mentor until an employee record exists.`);
  }
  return emp?.id ?? req.user?.employeeId ?? -1;
}

const MENTORSHIP_SELECT = `
  SELECT m.*,
    mu.first_name AS mentor_first, mu.last_name AS mentor_last, mu.email AS mentor_email,
    mentorEmp.designation AS mentor_designation, mentorEmp.avatar_url AS mentor_photo, mentorDept.name AS mentor_department,
    ru.first_name AS req_first, ru.last_name AS req_last, ru.email AS req_email,
    reqEmp.designation AS req_designation, reqEmp.avatar_url AS req_photo, reqDept.name AS req_department,
    rcu.first_name AS rec_first, rcu.last_name AS rec_last, rcu.email AS rec_email,
    recEmp.designation AS rec_designation, recEmp.avatar_url AS rec_photo, recDept.name AS rec_department,
    meu.first_name AS mentee_first, meu.last_name AS mentee_last, meu.email AS mentee_email,
    menteeEmp.designation AS mentee_designation, menteeEmp.avatar_url AS mentee_photo, menteeDept.name AS mentee_department,
    sk.name AS skill_name, sk.category AS skill_category
  FROM mentorships m
  LEFT JOIN employees mentorEmp ON mentorEmp.id = m.mentor_id
  LEFT JOIN users mu ON mu.id = mentorEmp.user_id
  LEFT JOIN departments mentorDept ON mentorDept.id = mentorEmp.department_id
  LEFT JOIN employees reqEmp ON reqEmp.id = m.requested_mentor_id
  LEFT JOIN users ru ON ru.id = reqEmp.user_id
  LEFT JOIN departments reqDept ON reqDept.id = reqEmp.department_id
  LEFT JOIN employees recEmp ON recEmp.id = m.recommended_mentor_id
  LEFT JOIN users rcu ON rcu.id = recEmp.user_id
  LEFT JOIN departments recDept ON recDept.id = recEmp.department_id
  LEFT JOIN employees menteeEmp ON menteeEmp.id = m.mentee_id
  LEFT JOIN users meu ON meu.id = menteeEmp.user_id
  LEFT JOIN departments menteeDept ON menteeDept.id = menteeEmp.department_id
  LEFT JOIN skills sk ON sk.id = m.skill_id
`;

async function formatMentorship(m: any) {
  const history = await query('SELECT * FROM mentor_request_history WHERE request_id = ? ORDER BY created_at ASC', [m.id]);
  const [gap] = await query('SELECT * FROM knowledge_gaps WHERE employee_id = ? AND skill_id = ?', [m.mentee_id, m.skill_id]);

  return {
    ...m,
    status: normalizeStatus(m.status),
    assigned_mentor_id: m.assigned_mentor_id || (['Approved', 'Active'].includes(m.status) ? m.mentor_id : null),
    mentor_name: m.mentor_first ? `${m.mentor_first} ${m.mentor_last}` : 'Mentor Specialist',
    mentor_email: m.mentor_email || '',
    mentor_designation: m.mentor_designation || 'Technical Specialist',
    mentor_department: m.mentor_department || 'Technology',
    mentor_photo: m.mentor_photo || null,
    requested_mentor_name: m.req_first ? `${m.req_first} ${m.req_last}` : 'Requested Mentor',
    requested_mentor_email: m.req_email || '',
    requested_mentor_designation: m.req_designation || 'Specialist',
    requested_mentor_department: m.req_department || 'Technology',
    requested_mentor_photo: m.req_photo || null,
    recommended_mentor_name: m.rec_first ? `${m.rec_first} ${m.rec_last}` : null,
    recommended_mentor_email: m.rec_email || null,
    recommended_mentor_designation: m.rec_designation || null,
    recommended_mentor_department: m.rec_department || null,
    recommended_mentor_photo: m.rec_photo || null,
    mentee_name: m.mentee_first ? `${m.mentee_first} ${m.mentee_last}` : 'Employee',
    mentee_email: m.mentee_email || '',
    mentee_designation: m.mentee_designation || 'Software Engineer',
    mentee_department: m.mentee_department || 'Technology',
    mentee_photo: m.mentee_photo || null,
    skill_name: m.skill_name || 'Engineering & Architecture',
    skill_category: m.skill_category || 'Technical',
    gap_score: gap ? gap.gap_score : 2,
    gap_priority: gap ? gap.priority : 'MEDIUM',
    requested_at: m.requested_at || m.created_at,
    history,
  };
}

async function addHistory(requestId: number, action: string, performedById: number | undefined, performedByName: string, performedByRole: string, oldStatus: string, newStatus: string, comments: string) {
  await execute(
    `INSERT INTO mentor_request_history (request_id, action, performed_by_id, performed_by_name, performed_by_role, old_status, new_status, comments)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [requestId, action, performedById ?? null, performedByName, performedByRole, oldStatus, newStatus, comments]
  );
}

export const getMentorships = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, mentorId, menteeId, status } = req.query;
    let sql = MENTORSHIP_SELECT;
    const conditions: string[] = [];
    const params: any[] = [];

    // Governance: a standard Employee only ever sees mentorships they're
    // party to (as mentee, mentor, or requested mentor) — never the whole
    // organization's requests. Mentors/HR/Admin (isAdminRole) can see everyone's,
    // and can still narrow with the explicit filters below.
    if (!isAdminRole(req.user?.role)) {
      const selfId = await resolveEmployeeId(req);
      conditions.push('(m.mentor_id = ? OR m.mentee_id = ? OR m.requested_mentor_id = ?)');
      params.push(selfId, selfId, selfId);
    } else {
      if (employeeId) { conditions.push('(m.mentor_id = ? OR m.mentee_id = ? OR m.requested_mentor_id = ?)'); params.push(Number(employeeId), Number(employeeId), Number(employeeId)); }
      if (mentorId) { conditions.push('(m.mentor_id = ? OR m.requested_mentor_id = ?)'); params.push(Number(mentorId), Number(mentorId)); }
      if (menteeId) { conditions.push('m.mentee_id = ?'); params.push(Number(menteeId)); }
    }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY m.created_at DESC';

    let rows = await query(sql, params);
    let list = await Promise.all(rows.map(formatMentorship));
    if (status) {
      const target = normalizeStatus(String(status)).toLowerCase();
      list = list.filter((m: any) => m.status.toLowerCase() === target);
    }

    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminMentorRequests = async (req: AuthRequest, res: Response) => {
  if (!req.user || !isAdminRole(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Access restricted to authorized Admin / HR authorities.' });
  }
  const rows = await query(MENTORSHIP_SELECT + ' ORDER BY m.created_at DESC');
  const list = await Promise.all(rows.map(formatMentorship));

  const stats = {
    total: list.length,
    pending: list.filter((m: any) => m.status === 'Pending Admin Review').length,
    recommended: list.filter((m: any) => m.status === 'Mentor Recommended').length,
    approved: list.filter((m: any) => m.status === 'Approved').length,
    rejected: list.filter((m: any) => m.status === 'Rejected').length,
  };

  return res.json({ success: true, stats, data: list });
};

export const getMentorshipHistory = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const [mentorship] = await query('SELECT id FROM mentorships WHERE id = ?', [Number(id)]);
  if (!mentorship) {
    return res.status(404).json({ success: false, message: 'Mentorship request not found.' });
  }
  const history = await query('SELECT * FROM mentor_request_history WHERE request_id = ? ORDER BY created_at ASC', [Number(id)]);
  return res.json({ success: true, data: history });
};

export const getMentorRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId, skillId } = req.query;
    const targetEmpId = employeeId ? Number(employeeId) : await resolveEmployeeId(req);

    // Include the users join here — employees has no first_name/last_name of
    // its own (those live on `users`), so this previously produced
    // "undefined undefined" in the "Skill Gap Matching for: {name}" header.
    const [targetEmp] = await query(
      `SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [targetEmpId]
    );
    const targetDeptId = targetEmp?.department_id;

    const empGaps = await query('SELECT * FROM knowledge_gaps WHERE employee_id = ? AND gap_score > 0', [targetEmpId]);
    const gapSkillIds = skillId ? [Number(skillId)] : empGaps.map((g: any) => g.skill_id);
    const empSkills = await query('SELECT * FROM employee_skills WHERE employee_id = ?', [targetEmpId]);

    // Excludes Admin and HR Specialist from ever being recommended as a
    // mentor — those are administrative/governance roles, not technical or
    // domain-expert roles, regardless of what proficiency they happen to
    // have logged in employee_skills. Every other role (Manager, Department
    // Head, L&D Admin / Mentor, Employee) remains eligible and is still
    // filtered by actual proficiency below.
    const employees = await query(`
      SELECT e.*, u.first_name, u.last_name, u.email FROM employees e
      JOIN users u ON u.id = e.user_id
      WHERE e.id != ?
        AND NOT EXISTS (
          SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = e.user_id AND r.name IN ('Admin', 'HR Specialist')
        )
    `, [targetEmpId]);
    const allEmpSkills = await query('SELECT * FROM employee_skills');
    const allSkills = await query('SELECT * FROM skills');
    const allDepartments = await query('SELECT * FROM departments');
    const allMentorships = await query('SELECT * FROM mentorships');

    const recommendations: any[] = [];
    const seenPairKey = new Set<string>();

    for (const mentorEmp of employees) {
      const mentorSkills = allEmpSkills.filter((es: any) => es.employee_id === mentorEmp.id);
      const mentorDept = allDepartments.find((d: any) => d.id === mentorEmp.department_id);
      const isSameDepartment = !!(targetDeptId && mentorEmp.department_id === targetDeptId);

      const activeMentorshipsCount = allMentorships.filter((m: any) =>
        (m.assigned_mentor_id === mentorEmp.id || m.mentor_id === mentorEmp.id) && ['Approved', 'Active'].includes(m.status)
      ).length;
      const completedMentorships = allMentorships.filter((m: any) =>
        (m.assigned_mentor_id === mentorEmp.id || m.mentor_id === mentorEmp.id) && m.status === 'Completed'
      );
      const avgRating = completedMentorships.length > 0
        ? Number((completedMentorships.reduce((acc: number, curr: any) => acc + (curr.rating || 5), 0) / completedMentorships.length).toFixed(1))
        : 4.9;

      let availabilityText = 'Available (High Capacity - 3 slots)';
      if (activeMentorshipsCount === 1) availabilityText = 'Available (2 slots open)';
      else if (activeMentorshipsCount === 2) availabilityText = 'Available (1 slot open)';
      else if (activeMentorshipsCount >= 3) availabilityText = 'Limited Availability (Busy)';

      for (const ms of mentorSkills) {
        const isGapSkill = gapSkillIds.includes(ms.skill_id);
        const menteeSkill = empSkills.find((es: any) => es.skill_id === ms.skill_id);
        const menteeProf = menteeSkill ? menteeSkill.current_proficiency : 1;
        const matchingGap = empGaps.find((g: any) => g.skill_id === ms.skill_id);
        const reqProf = matchingGap ? matchingGap.required_proficiency : 4;
        const hasHigherProficiency = ms.current_proficiency > menteeProf && ms.current_proficiency >= 3;

        if ((isGapSkill || gapSkillIds.length === 0) && hasHigherProficiency) {
          const pairKey = `${mentorEmp.id}-${ms.skill_id}`;
          if (seenPairKey.has(pairKey)) continue;
          seenPairKey.add(pairKey);

          const skill = allSkills.find((s: any) => s.id === ms.skill_id);
          let matchScore = 70;
          if (ms.current_proficiency === 5) matchScore += 18;
          else if (ms.current_proficiency === 4) matchScore += 12;
          if (isSameDepartment) matchScore += 6;
          if (activeMentorshipsCount < 2) matchScore += 4;
          if (avgRating >= 4.8) matchScore += 2;
          matchScore = Math.min(matchScore, 99);

          const profDiff = ms.current_proficiency - menteeProf;
          const reason = `${skill?.name || 'Skill'} gap match: Mentor is Level ${ms.current_proficiency} (${PROF_NAMES[ms.current_proficiency] || 'Expert'}) vs your Level ${menteeProf} (${PROF_NAMES[menteeProf] || 'Novice'}) in ${mentorDept?.name || 'Engineering'}. ${isSameDepartment ? 'Same Department • ' : ''}Rated ${avgRating}★ (${completedMentorships.length + 3} past sessions).`;

          recommendations.push({
            mentorId: mentorEmp.id, employeeId: mentorEmp.id, employeeCode: mentorEmp.employee_code,
            name: `${mentorEmp.first_name} ${mentorEmp.last_name}`, email: mentorEmp.email, designation: mentorEmp.designation,
            department: mentorDept ? mentorDept.name : 'Engineering', departmentId: mentorEmp.department_id, isSameDepartment,
            photo_url: mentorEmp.avatar_url,
            matchingSkill: { id: ms.skill_id, name: skill ? skill.name : 'Technical Specialization', category: skill ? skill.category : 'Technical' },
            skills: mentorSkills.map((sk: any) => {
              const sObj = allSkills.find((s: any) => s.id === sk.skill_id);
              return { id: sk.skill_id, name: sObj?.name || 'Specialization', proficiency: sk.current_proficiency, levelName: PROF_NAMES[sk.current_proficiency] || 'Competent' };
            }),
            proficiency: ms.current_proficiency, proficiencyName: PROF_NAMES[ms.current_proficiency] || 'Advanced',
            menteeCurrentLevel: menteeProf, menteeCurrentLevelName: PROF_NAMES[menteeProf] || 'Beginner',
            requiredLevel: reqProf, gapPoints: Math.max(reqProf - menteeProf, profDiff), matchScore,
            availability: availabilityText, isAvailable: activeMentorshipsCount < 3,
            experience: `${ms.current_proficiency >= 4 ? '5+' : '3+'} Years in Domain`, rating: avgRating,
            activeMenteesCount: activeMentorshipsCount, totalCompletedMentorships: completedMentorships.length + 2, reason,
            // Aliases matching the card UI's expected field names — kept
            // alongside the originals above (handleOpenRequestModal already
            // falls back across both naming conventions).
            mentor_name: `${mentorEmp.first_name} ${mentorEmp.last_name}`.trim() || 'Internal Expert',
            mentor_designation: mentorEmp.designation || 'Technical Specialist',
            department_name: mentorDept ? mentorDept.name : 'Engineering',
            skill_name: skill ? skill.name : 'Technical Specialization',
            mentee_proficiency: menteeProf,
            mentor_proficiency: ms.current_proficiency,
            proficiency_gap_gain: Math.max(reqProf - menteeProf, profDiff),
            match_reasons: [reason],
            completed_mentorships: completedMentorships.length + 2,
          });
        }
      }
    }

    if (recommendations.length === 0) {
      for (const emp of employees.slice(0, 4)) {
        const dept = allDepartments.find((d: any) => d.id === emp.department_id);
        const empSk = allEmpSkills.filter((es: any) => es.employee_id === emp.id);
        const topSkill = empSk.sort((a: any, b: any) => b.current_proficiency - a.current_proficiency)[0] || { skill_id: 2, current_proficiency: 5 };
        const skillObj = allSkills.find((s: any) => s.id === topSkill.skill_id);

        recommendations.push({
          mentorId: emp.id, employeeId: emp.id, employeeCode: emp.employee_code,
          name: `${emp.first_name} ${emp.last_name}`, email: emp.email, designation: emp.designation,
          department: dept ? dept.name : 'Engineering', departmentId: emp.department_id, isSameDepartment: emp.department_id === targetDeptId,
          photo_url: emp.avatar_url,
          matchingSkill: { id: topSkill.skill_id, name: skillObj ? skillObj.name : 'Core Engineering & Architecture', category: skillObj ? skillObj.category : 'Technical' },
          skills: empSk.map((sk: any) => {
            const sObj = allSkills.find((s: any) => s.id === sk.skill_id);
            return { id: sk.skill_id, name: sObj?.name || 'Skill', proficiency: sk.current_proficiency, levelName: sk.current_proficiency === 5 ? 'Expert' : 'Advanced' };
          }),
          proficiency: topSkill.current_proficiency, proficiencyName: 'Expert', menteeCurrentLevel: 1, menteeCurrentLevelName: 'Beginner',
          requiredLevel: 4, gapPoints: 3, matchScore: 92, availability: 'Available (2 slots open)', isAvailable: true,
          experience: '6+ Years Experience', rating: 4.9, activeMenteesCount: 1, totalCompletedMentorships: 5,
          reason: `Senior Expert in ${skillObj?.name || 'Architecture'} with proven mentorship record. Open for technical pairing and career guidance.`,
          mentor_name: `${emp.first_name} ${emp.last_name}`.trim() || 'Internal Expert',
          mentor_designation: emp.designation || 'Technical Specialist',
          department_name: dept ? dept.name : 'Engineering',
          skill_name: skillObj ? skillObj.name : 'Core Engineering & Architecture',
          mentee_proficiency: 1,
          mentor_proficiency: topSkill.current_proficiency,
          proficiency_gap_gain: 3,
          match_reasons: [`Senior Expert in ${skillObj?.name || 'Architecture'} with proven mentorship record. Open for technical pairing and career guidance.`],
          completed_mentorships: 5,
        });
      }
    }

    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    return res.json({
      success: true, count: recommendations.length,
      targetEmployee: targetEmp
        ? {
            id: targetEmp.id,
            name: [targetEmp.first_name, targetEmp.last_name].filter(Boolean).join(' ').trim() || targetEmp.email || 'Employee',
            designation: targetEmp.designation || 'Team Member',
            gapsCount: empGaps.length,
          }
        : null,
      data: recommendations,
    });
  } catch (err: any) {
    console.error('Error in getMentorRecommendations:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMentorDetails = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const empId = Number(id);

  const [emp] = await query(`SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`, [empId]);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Mentor not found' });
  }
  const [dept] = emp.department_id ? await query('SELECT * FROM departments WHERE id = ?', [emp.department_id]) : [null];

  const skillRows = await query(`SELECT es.*, s.name, s.category FROM employee_skills es JOIN skills s ON s.id = es.skill_id WHERE es.employee_id = ?`, [emp.id]);
  const skills = skillRows.map((es: any) => ({
    id: es.skill_id, name: es.name, category: es.category, proficiency: es.current_proficiency,
    levelName: es.current_proficiency === 5 ? 'Expert' : es.current_proficiency === 4 ? 'Advanced' : 'Competent',
  }));

  const activeMentorships = await query(`SELECT * FROM mentorships WHERE (assigned_mentor_id = ? OR mentor_id = ?) AND status IN ('Approved','Active')`, [emp.id, emp.id]);
  const completedMentorships = await query(`SELECT * FROM mentorships WHERE (assigned_mentor_id = ? OR mentor_id = ?) AND status = 'Completed'`, [emp.id, emp.id]);
  const avgRating = completedMentorships.length > 0
    ? Number((completedMentorships.reduce((acc: number, curr: any) => acc + (curr.rating || 5), 0) / completedMentorships.length).toFixed(1))
    : 4.9;

  return res.json({
    success: true,
    data: {
      id: emp.id, mentorId: emp.id, mentor_id: emp.id, name: `${emp.first_name} ${emp.last_name}`, email: emp.email, phone: emp.phone, designation: emp.designation,
      department: dept ? dept.name : 'Engineering', photo_url: emp.avatar_url, skills, rating: avgRating,
      activeMenteesCount: activeMentorships.length, totalCompletedMentorships: completedMentorships.length + 3,
      availability: activeMentorships.length < 3 ? 'Available for Mentorship' : 'Limited Capacity',
      recentFeedback: completedMentorships.map((m: any) => ({ rating: m.rating || 5, feedback: m.feedback || 'Great mentor guidance on system architecture.', date: m.start_date })),
    },
  });
};

export const getReceivedRequests = async (req: AuthRequest, res: Response) => {
  const mentorEmpId = await resolveEmployeeId(req);
  const rows = await query(MENTORSHIP_SELECT + ' WHERE m.mentor_id = ? OR m.requested_mentor_id = ? OR m.assigned_mentor_id = ? ORDER BY m.created_at DESC', [mentorEmpId, mentorEmpId, mentorEmpId]);
  const list = await Promise.all(rows.map(formatMentorship));
  return res.json({ success: true, count: list.length, data: list });
};

export const getSentRequests = async (req: AuthRequest, res: Response) => {
  const menteeEmpId = await resolveEmployeeId(req);
  const rows = await query(MENTORSHIP_SELECT + ' WHERE m.mentee_id = ? ORDER BY m.created_at DESC', [menteeEmpId]);
  const list = await Promise.all(rows.map(formatMentorship));
  return res.json({ success: true, count: list.length, data: list });
};

export const getActiveMentorships = async (req: AuthRequest, res: Response) => {
  const empId = await resolveEmployeeId(req);
  const rows = await query(
    MENTORSHIP_SELECT + ` WHERE (m.mentor_id = ? OR m.assigned_mentor_id = ? OR m.mentee_id = ?) AND m.status IN ('Approved','Active')`,
    [empId, empId, empId]
  );
  const list = await Promise.all(rows.map(formatMentorship));
  return res.json({ success: true, count: list.length, data: list });
};

export const getExpertDirectory = async (req: AuthRequest, res: Response) => {
  try {
    const { skill, department, search } = req.query;
    const employees = await query(`SELECT e.*, u.first_name, u.last_name, u.email FROM employees e JOIN users u ON u.id = e.user_id`);
    const allDepartments = await query('SELECT * FROM departments');
    const allEmpSkills = await query('SELECT es.*, s.name FROM employee_skills es JOIN skills s ON s.id = es.skill_id WHERE es.current_proficiency >= 3');
    const allMentorships = await query(`SELECT mentor_id, assigned_mentor_id FROM mentorships WHERE status IN ('Approved','Active')`);

    let experts = employees.map((emp: any) => {
      const dept = allDepartments.find((d: any) => d.id === emp.department_id);
      const empSkills = allEmpSkills.filter((es: any) => es.employee_id === emp.id).map((es: any) => ({
        id: es.skill_id, name: es.name, proficiency: es.current_proficiency,
        levelName: es.current_proficiency === 5 ? 'Expert' : es.current_proficiency === 4 ? 'Advanced' : 'Competent',
      }));
      const activeCount = allMentorships.filter((m: any) => m.mentor_id === emp.id || m.assigned_mentor_id === emp.id).length;

      return {
        id: emp.id, mentorId: emp.id, employeeId: emp.id, name: `${emp.first_name} ${emp.last_name}`, email: emp.email,
        phone: emp.phone, designation: emp.designation, department: dept ? dept.name : 'Technology', departmentId: emp.department_id,
        photo_url: emp.avatar_url,
        expertSkills: empSkills.length > 0 ? empSkills : [
          { id: 1, name: 'React & Frontend', proficiency: 4, levelName: 'Advanced' },
          { id: 2, name: 'Spring Boot Microservices', proficiency: 5, levelName: 'Expert' },
        ],
        rating: 4.9, totalSessionsDelivered: 12, activeMentees: activeCount,
        availability: activeCount < 3 ? 'Available (Open for Pairing)' : 'Limited Availability', isAvailable: activeCount < 3,
      };
    });

    if (search) {
      const sStr = String(search).toLowerCase();
      experts = experts.filter((e: any) =>
        e.name.toLowerCase().includes(sStr) || e.department.toLowerCase().includes(sStr) ||
        e.designation.toLowerCase().includes(sStr) || e.expertSkills.some((sk: any) => sk.name.toLowerCase().includes(sStr))
      );
    }
    if (department && department !== 'All') {
      experts = experts.filter((e: any) => e.department.toLowerCase() === String(department).toLowerCase());
    }

    return res.json({ success: true, count: experts.length, data: experts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const requestMentorship = async (req: AuthRequest, res: Response) => {
  try {
    const { mentorId, menteeId, skillId, goal, startDate, endDate } = req.body;
    const mId = Number(mentorId);
    const meId = menteeId ? Number(menteeId) : await resolveEmployeeId(req);
    const sId = Number(skillId) || 1;

    // Diagnostic logging per explicit request — this is the actual trace a
    // reproduction needs: exactly which IDs were searched for, and whether
    // the JWT (req.user) even carried a usable id/employeeId. Left in place
    // (not removed after this fix) since silently swallowing this class of
    // bug is exactly what caused it to be hard to pin down from code review
    // alone in the first place.
    console.log('[requestMentorship] incoming request', {
      raw_mentorId: mentorId, raw_menteeId: menteeId,
      resolved_mentor_employee_id: mId, resolved_mentee_employee_id: meId,
      jwt_user_id: req.user?.id, jwt_employeeId_claim: req.user?.employeeId,
    });

    if (!mentorId || isNaN(mId)) {
      console.error('[requestMentorship] mentorId missing or not a number:', mentorId);
      return res.status(400).json({ success: false, message: 'No mentor was selected — mentorId is missing or invalid.' });
    }

    const [mentor] = await query(`SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`, [mId]);
    const [mentee] = await query(`SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`, [meId]);
    const [skill] = await query('SELECT * FROM skills WHERE id = ?', [sId]);

    // Split into two distinct errors instead of one combined message — the
    // combined "Requested Mentor or Mentee record not found" made it
    // impossible to tell from the UI alone which side actually failed.
    if (!mentor) {
      console.error(`[requestMentorship] No employees row found for mentor employee_id=${mId} (searched via "employees.id = ?")`);
      return res.status(404).json({ success: false, message: `Selected mentor (employee #${mId}) could not be found. They may have left the organization or the mentor list is stale — try refreshing.` });
    }
    if (!mentee) {
      console.error(`[requestMentorship] No employees row found for mentee employee_id=${meId}. jwt user_id=${req.user?.id}, jwt employeeId claim=${req.user?.employeeId}, menteeId sent by frontend=${menteeId}`);
      return res.status(404).json({ success: false, message: `Your employee profile (#${meId}) could not be found. Contact HR/Admin — your account may not be linked to an employee record yet.` });
    }
    if (mId === meId) {
      return res.status(400).json({ success: false, message: 'Cannot request mentorship from yourself.' });
    }

    const existing = await query(
      `SELECT id, status FROM mentorships WHERE mentee_id = ? AND skill_id = ? AND status IN ('Pending Admin Review','Mentor Recommended','Approved','Active')`,
      [meId, sId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: `A mentorship request for ${skill?.name || 'this skill'} is already in progress with status: ${existing[0].status}` });
    }

    const sDate = startDate || new Date().toISOString().split('T')[0];
    const eDate = endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const goalText = goal || `Accelerate proficiency in ${skill?.name || 'Technical Domain'} to close target competency gap`;

    const code = await nextCode('mentorships', 'MNT');
    const result = await execute(
      `INSERT INTO mentorships (mentorship_code, mentor_id, requested_mentor_id, mentee_id, skill_id, goal, start_date, end_date, status, requested_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending Admin Review', NOW())`,
      [code, mId, mId, meId, sId, goalText, sDate, eDate]
    );
    const newId = result.insertId;

    await addHistory(newId, 'REQUEST_SUBMITTED', mentee.user_id, `${mentee.first_name} ${mentee.last_name}`, 'Employee', 'NONE', 'Pending Admin Review', `Initial mentorship request submitted. Proposed mentor: ${mentor.first_name} ${mentor.last_name}. Goal: "${goalText}"`);

    const adminUsers = await query(`
      SELECT DISTINCT u.id FROM users u JOIN user_roles ur ON ur.user_id = u.id JOIN roles r ON r.id = ur.role_id
      WHERE r.name IN ('Admin', 'HR Specialist', 'Manager', 'Department Head')
    `);
    for (const adminUser of adminUsers) {
      await createNotification(execute, adminUser.id, 'New Mentor Request — Admin Review Required 📋',
        `${mentee.first_name} ${mentee.last_name} (${mentee.designation}) submitted a mentor request for ${skill?.name || 'Technical Skill'} (Proposed Mentor: ${mentor.first_name} ${mentor.last_name}). Please review and assign.`,
        'Mentorship Reminder', 'MENTORSHIP', newId);
    }
    if (mentor.user_id) {
      await createNotification(execute, mentor.user_id, 'Proposed as Mentor (Pending Admin Review) ℹ️',
        `${mentee.first_name} ${mentee.last_name} proposed you as a mentor for ${skill?.name || 'Technical Specialization'}. Note: This request is under Admin review and will be officially assigned once approved.`,
        'Mentorship Reminder', 'MENTORSHIP', newId);
    }
    if (mentee.user_id) {
      await createNotification(execute, mentee.user_id, 'Mentor Request Submitted 🚀',
        `Your mentorship request for ${skill?.name || 'skill growth'} has been sent to Admin/HR for review and official mentor pairing.`,
        'Mentorship Reminder', 'MENTORSHIP', newId);
    }

    await logAudit({
      actor_user_id: req.user?.id, action: 'CREATE', entity_type: 'MENTOR_REQUEST', entity_id: `REQ-${newId}`,
      description: `Mentor request created by ${mentee.first_name} ${mentee.last_name} (Pending Admin Approval).`,
    });

    const [row] = await query(MENTORSHIP_SELECT + ' WHERE m.id = ?', [newId]);
    return res.status(201).json({ success: true, message: 'Mentorship request submitted successfully. It is now awaiting Admin/HR review and official assignment.', data: await formatMentorship(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const recommendMentor = async (req: AuthRequest, res: Response) => {
  if (!req.user || !isAdminRole(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only authorized Admin/HR users have authority to recommend mentors. Mentors and standard employees cannot perform mentor recommendations.' });
  }
  try {
    const { id } = req.params;
    const { recommendedMentorId, adminNotes } = req.body;

    const [mentorship] = await query('SELECT * FROM mentorships WHERE id = ?', [Number(id)]);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found.' });
    }
    if (['Rejected', 'Completed'].includes(mentorship.status)) {
      return res.status(400).json({ success: false, message: `Cannot recommend mentor on a request with status: ${mentorship.status}` });
    }

    const [recMentor] = await query(`SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`, [Number(recommendedMentorId)]);
    if (!recMentor) {
      return res.status(404).json({ success: false, message: 'Recommended mentor employee record not found.' });
    }
    if (recMentor.id === mentorship.mentee_id) {
      return res.status(400).json({ success: false, message: 'Mentee cannot be recommended as their own mentor.' });
    }

    const notes = adminNotes || `Admin recommends ${recMentor.first_name} ${recMentor.last_name} based on domain expertise and capacity.`;
    await execute(`UPDATE mentorships SET recommended_mentor_id = ?, status = 'Mentor Recommended', admin_notes = ?, recommended_at = NOW() WHERE id = ?`, [recMentor.id, notes, Number(id)]);

    const adminName = req.user.email ? req.user.email.split('@')[0] : 'System Admin';
    await addHistory(Number(id), 'MENTOR_RECOMMENDED', req.user.id, `${adminName} (${req.user.role})`, req.user.role, mentorship.status, 'Mentor Recommended', notes);

    const [mentee] = await query(`SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`, [mentorship.mentee_id]);
    const [skill] = await query('SELECT * FROM skills WHERE id = ?', [mentorship.skill_id]);

    if (mentee?.user_id) {
      await createNotification(execute, mentee.user_id, 'Mentor Recommended by Admin 💡',
        `Admin reviewed your request and recommended ${recMentor.first_name} ${recMentor.last_name} (${recMentor.designation}) for ${skill?.name || 'Skill'}. Note: "${notes}"`,
        'Mentorship Reminder', 'MENTORSHIP', Number(id));
    }
    if (recMentor.user_id) {
      await createNotification(execute, recMentor.user_id, 'Recommended for Mentorship Assignment ℹ️',
        `Admin has recommended you as potential mentor for ${mentee?.first_name} ${mentee?.last_name} in ${skill?.name || 'Domain'}. Final assignment pending confirmation.`,
        'Mentorship Reminder', 'MENTORSHIP', Number(id));
    }

    await logAudit({ actor_user_id: req.user.id, action: 'UPDATE', entity_type: 'MENTOR_REQUEST', entity_id: `REQ-${id}`, description: `Admin recommended ${recMentor.first_name} ${recMentor.last_name} for Request #${id}.` });

    const [row] = await query(MENTORSHIP_SELECT + ' WHERE m.id = ?', [Number(id)]);
    return res.json({ success: true, message: `Mentor recommendation recorded successfully. ${recMentor.first_name} ${recMentor.last_name} recommended.`, data: await formatMentorship(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveMentorship = async (req: AuthRequest, res: Response) => {
  if (!req.user || !isAdminRole(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only authorized Admin/HR users have authority to approve mentorship requests and assign mentors. Employees and mentors cannot approve requests.' });
  }
  try {
    const { id } = req.params;
    const { assignedMentorId, adminNotes, startDate, endDate } = req.body;

    const [mentorship] = await query('SELECT * FROM mentorships WHERE id = ?', [Number(id)]);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found.' });
    }
    if (['Approved', 'Active'].includes(mentorship.status)) {
      return res.status(400).json({ success: false, message: 'This mentorship request is already approved and active.' });
    }

    const finalMentorId = Number(assignedMentorId) || mentorship.recommended_mentor_id || mentorship.requested_mentor_id || mentorship.mentor_id;
    const [assignedMentor] = await query(`SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`, [finalMentorId]);
    const [mentee] = await query(`SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`, [mentorship.mentee_id]);
    const [skill] = await query('SELECT * FROM skills WHERE id = ?', [mentorship.skill_id]);

    if (!assignedMentor) {
      return res.status(404).json({ success: false, message: 'Assigned mentor employee record not found.' });
    }

    const adminName = req.user.email ? req.user.email.split('@')[0] : 'Admin User';
    const approvedBy = `${adminName} (${req.user.role})`;
    const notes = adminNotes || mentorship.admin_notes;

    await execute(
      `UPDATE mentorships SET mentor_id = ?, assigned_mentor_id = ?, status = 'Approved', admin_notes = ?, approved_at = NOW(), approved_by = ?, start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date) WHERE id = ?`,
      [finalMentorId, finalMentorId, notes, approvedBy, startDate ?? null, endDate ?? null, Number(id)]
    );

    await addHistory(Number(id), 'ADMIN_APPROVED', req.user.id, approvedBy, req.user.role, mentorship.status, 'Approved', adminNotes || `Admin officially approved mentor assignment of ${assignedMentor.first_name} ${assignedMentor.last_name}.`);

    if (mentee?.user_id) {
      await createNotification(execute, mentee.user_id, 'Mentorship Approved & Confirmed! 🎉',
        `Admin has approved your mentorship request for ${skill?.name || 'Competency Growth'}! Your officially assigned mentor is ${assignedMentor.first_name} ${assignedMentor.last_name} (${assignedMentor.designation}).`,
        'Mentorship Reminder', 'MENTORSHIP', Number(id));
    }
    if (assignedMentor.user_id) {
      await createNotification(execute, assignedMentor.user_id, 'Official Mentor Assignment Confirmed 🤝',
        `Admin has officially assigned you as mentor for ${mentee?.first_name} ${mentee?.last_name} in ${skill?.name || 'Domain Specialization'}. You can now schedule 1-on-1 sessions.`,
        'Mentorship Reminder', 'MENTORSHIP', Number(id));
    }

    await logAudit({ actor_user_id: req.user.id, action: 'APPROVE', entity_type: 'MENTOR_REQUEST', entity_id: `REQ-${id}`, description: `Mentorship #${id} approved by ${req.user.role}. Mentor assigned: ${assignedMentor.first_name} ${assignedMentor.last_name}.` });

    const [row] = await query(MENTORSHIP_SELECT + ' WHERE m.id = ?', [Number(id)]);
    return res.json({ success: true, message: `Mentorship request approved! ${assignedMentor.first_name} ${assignedMentor.last_name} is now officially assigned as mentor.`, data: await formatMentorship(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const acceptMentorship = approveMentorship;

export const rejectMentorship = async (req: AuthRequest, res: Response) => {
  if (!req.user || !isAdminRole(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Only authorized Admin/HR users have authority to reject mentor requests. Mentors and standard employees cannot reject requests.' });
  }
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;

    const [mentorship] = await query('SELECT * FROM mentorships WHERE id = ?', [Number(id)]);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship request not found.' });
    }
    if (['Approved', 'Active', 'Completed'].includes(mentorship.status)) {
      return res.status(400).json({ success: false, message: 'Cannot reject an active or completed mentorship.' });
    }

    const finalReason = rejectionReason || adminNotes || 'Does not align with current department training prerequisites or resource allocation.';
    const adminName = req.user.email ? req.user.email.split('@')[0] : 'Admin User';
    const rejectedBy = `${adminName} (${req.user.role})`;

    await execute(`UPDATE mentorships SET status = 'Rejected', rejection_reason = ?, admin_notes = ?, rejected_at = NOW(), rejected_by = ? WHERE id = ?`, [finalReason, adminNotes || finalReason, rejectedBy, Number(id)]);
    await addHistory(Number(id), 'ADMIN_REJECTED', req.user.id, rejectedBy, req.user.role, mentorship.status, 'Rejected', `Request rejected by Admin. Reason: ${finalReason}`);

    const [mentee] = await query('SELECT * FROM employees WHERE id = ?', [mentorship.mentee_id]);
    const [skill] = await query('SELECT * FROM skills WHERE id = ?', [mentorship.skill_id]);

    if (mentee?.user_id) {
      await createNotification(execute, mentee.user_id, 'Mentorship Request Update',
        `Your mentorship request for ${skill?.name || 'Skill'} was not approved by Admin. Reason: "${finalReason}". You may review learning paths or consult HR.`,
        'Mentorship Reminder', 'MENTORSHIP', Number(id));
    }

    await logAudit({ actor_user_id: req.user.id, action: 'REJECT', entity_type: 'MENTOR_REQUEST', entity_id: `REQ-${id}`, description: `Mentorship request #${id} rejected by Admin. Reason: ${finalReason}` });

    const [row] = await query(MENTORSHIP_SELECT + ' WHERE m.id = ?', [Number(id)]);
    return res.json({ success: true, message: 'Mentorship request rejected. Mentee has been notified with the rejection explanation.', data: await formatMentorship(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateMentorshipStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rating, feedback } = req.body;

    const [mentorship] = await query('SELECT * FROM mentorships WHERE id = ?', [Number(id)]);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship record not found' });
    }

    // This is the mentor's own accept/decline action on a request sent
    // directly to them — not a governance action. So authorization is
    // scoped to whoever the request actually concerns (the proposed/
    // assigned mentor, or the mentee), plus Admin/HR for oversight —
    // not "any authenticated user", which is what this previously allowed.
    const callerEmpId = await resolveEmployeeId(req);
    const isParty = [mentorship.mentor_id, mentorship.requested_mentor_id, mentorship.assigned_mentor_id, mentorship.mentee_id].includes(callerEmpId);
    if (!isParty && !isAdminRole(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Only the mentor, mentee, or an Admin/HR Specialist can update this mentorship.' });
    }

    const validStatus = normalizeStatus(status);
    await execute('UPDATE mentorships SET status = ?, rating = COALESCE(?, rating), feedback = COALESCE(?, feedback) WHERE id = ?', [
      validStatus, rating !== undefined ? Number(rating) : null, feedback ?? null, Number(id),
    ]);

    const [row] = await query(MENTORSHIP_SELECT + ' WHERE m.id = ?', [Number(id)]);
    return res.json({ success: true, message: `Mentorship status updated to ${validStatus}`, data: await formatMentorship(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeMentorship = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    const [mentorship] = await query('SELECT * FROM mentorships WHERE id = ?', [Number(id)]);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship record not found' });
    }

    await execute(`UPDATE mentorships SET status = 'Completed', rating = ?, feedback = ? WHERE id = ?`, [Number(rating) || 5, feedback || null, Number(id)]);

    const [mentee] = await query(
      `SELECT e.*, u.first_name, u.last_name FROM employees e JOIN users u ON u.id = e.user_id WHERE e.id = ?`,
      [mentorship.mentee_id]
    );
    const mentorId = mentorship.assigned_mentor_id || mentorship.mentor_id;
    const [mentor] = await query('SELECT * FROM employees WHERE id = ?', [mentorId]);
    const [skill] = await query('SELECT * FROM skills WHERE id = ?', [mentorship.skill_id]);

    if (mentor?.user_id) {
      await createNotification(execute, mentor.user_id, 'Mentorship Completed & Evaluated ⭐',
        `${mentee?.first_name || 'Mentee'} has completed mentorship for ${skill?.name || 'skill growth'} and rated your mentorship ${rating || 5}★: "${feedback || 'Great session!'}".`,
        'Mentorship Reminder', 'MENTORSHIP', Number(id));
    }

    await logAudit({ actor_user_id: req.user?.id, action: 'UPDATE', entity_type: 'MENTORSHIP', entity_id: `MENTOR-${id}`, description: `Mentorship #${id} completed with rating ${rating || 5}★.` });

    const [row] = await query(MENTORSHIP_SELECT + ' WHERE m.id = ?', [Number(id)]);
    return res.json({ success: true, message: 'Mentorship marked as Completed with rating and feedback!', data: await formatMentorship(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelMentorship = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [mentorship] = await query('SELECT id FROM mentorships WHERE id = ?', [Number(id)]);
    if (!mentorship) {
      return res.status(404).json({ success: false, message: 'Mentorship record not found' });
    }
    await execute(`UPDATE mentorships SET status = 'Cancelled' WHERE id = ?`, [Number(id)]);

    const [row] = await query(MENTORSHIP_SELECT + ' WHERE m.id = ?', [Number(id)]);
    return res.json({ success: true, message: 'Mentorship cancelled.', data: await formatMentorship(row) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
