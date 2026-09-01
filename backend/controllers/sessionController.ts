import { Response } from 'express';
import { query, execute } from '../config/mysqlDb';
import { AuthRequest } from '../middleware/auth';
import { logAudit } from '../services/auditLogger';
import { createNotification } from '../utils/codes';

// NOTE: `knowledge_sessions.location/average_rating/effectiveness_score` and
// `session_registrations.rating/feedback` (+ 'ATTENDED' status) are added via
// schema_updates.sql. Field aliases below (host_mentor_id, session_date,
// max_capacity, attendance_status) preserve the original API shape the
// frontend expects, mapped onto the real column names.

const SESSION_SELECT = `
  SELECT ks.*, ks.host_employee_id AS host_mentor_id, ks.scheduled_at AS session_date, ks.capacity AS max_capacity,
         CONCAT(u.first_name,' ',u.last_name) AS host_mentor_name, u.email AS host_mentor_email, he.designation AS host_mentor_designation,
         s.name AS skill_name
  FROM knowledge_sessions ks
  LEFT JOIN employees he ON he.id = ks.host_employee_id
  LEFT JOIN users u ON u.id = he.user_id
  LEFT JOIN skills s ON s.id = ks.skill_id
`;

async function loadRegistrations(sessionId: number) {
  const rows = await query(
    `SELECT sr.*, sr.status AS attendance_status, CONCAT(u.first_name,' ',u.last_name) AS employee_name,
            u.email AS employee_email, e.designation, d.name AS department_name
     FROM session_registrations sr
     JOIN employees e ON e.id = sr.employee_id
     JOIN users u ON u.id = e.user_id
     LEFT JOIN departments d ON d.id = e.department_id
     WHERE sr.session_id = ?`,
    [sessionId]
  );
  return rows;
}

async function shapeSession(row: any, userEmpId: number) {
  const registrations = await loadRegistrations(row.id);
  const registeredCount = registrations.filter((r: any) => r.attendance_status !== 'CANCELLED').length;
  const userReg = registrations.find((r: any) => r.employee_id === userEmpId && r.attendance_status !== 'CANCELLED');

  return {
    ...row,
    host_mentor_name: row.host_mentor_name || 'Senior Architect',
    host_mentor_email: row.host_mentor_email || '',
    host_mentor_designation: row.host_mentor_designation || 'Lead Engineer',
    skill_name: row.skill_name || 'Engineering & Architecture',
    registered_count: registeredCount,
    is_user_registered: !!userReg,
    user_attendance_status: userReg?.attendance_status || null,
    user_rating: userReg?.rating || null,
    user_feedback: userReg?.feedback || null,
    registrations,
  };
}

async function recalcSessionEffectiveness(sessionId: number) {
  const registrations = await query('SELECT status, rating FROM session_registrations WHERE session_id = ?', [sessionId]);
  const ratings = registrations.filter((r: any) => r.rating).map((r: any) => r.rating as number);
  const attendedCount = registrations.filter((r: any) => r.status === 'ATTENDED').length;
  const totalRegistered = registrations.filter((r: any) => r.status !== 'CANCELLED').length;

  let avgRating = 5.0;
  let effectivenessScore = 90;
  if (ratings.length > 0) {
    avgRating = Math.round((ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length) * 10) / 10;
    const attendanceRatio = totalRegistered > 0 ? attendedCount / totalRegistered : 1;
    effectivenessScore = Math.min(100, Math.round((avgRating / 5) * 80 + attendanceRatio * 20));
  }
  await execute('UPDATE knowledge_sessions SET average_rating = ?, effectiveness_score = ? WHERE id = ?', [avgRating, effectivenessScore, sessionId]);
}

async function resolveEmployeeId(req: AuthRequest, fallback?: number): Promise<number> {
  if (fallback) return fallback;
  const [emp] = await query('SELECT id FROM employees WHERE user_id = ?', [req.user?.id]);
  return emp?.id ?? req.user?.employeeId ?? -1;
}

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userEmpId = await resolveEmployeeId(req);
    const rows = await query(SESSION_SELECT);
    const list = await Promise.all(rows.map((r: any) => shapeSession(r, userEmpId)));
    return res.json({ success: true, count: list.length, data: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSessionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [row] = await query(SESSION_SELECT + ' WHERE ks.id = ?', [Number(id)]);
    if (!row) {
      return res.status(404).json({ success: false, message: 'Knowledge session not found' });
    }
    const userEmpId = await resolveEmployeeId(req);
    return res.json({ success: true, data: await shapeSession(row, userEmpId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, hostMentorId, skillId, sessionDate, durationMinutes, maxCapacity, meetingLink, location } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Session title is required.' });
    }

    const mentorId = Number(hostMentorId) || (await resolveEmployeeId(req));
    const sId = Number(skillId) || 1;
    const capacity = Number(maxCapacity) || 20;
    const duration = Number(durationMinutes) || 60;

    const result = await execute(
      `INSERT INTO knowledge_sessions (title, description, skill_id, host_employee_id, scheduled_at, duration_minutes, capacity, meeting_link, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'SCHEDULED')`,
      [
        title,
        description || 'Interactive technical knowledge sharing and architecture deep dive.',
        sId,
        mentorId,
        sessionDate || new Date(Date.now() + 48 * 60 * 60 * 1000),
        duration,
        capacity,
        meetingLink || 'https://meet.google.com/okgip-knowledge-hub',
        location || 'Virtual / Google Meet',
      ]
    );

    const [row] = await query(SESSION_SELECT + ' WHERE ks.id = ?', [result.insertId]);

    await logAudit({
      actor_user_id: req.user?.id,
      action: 'CREATE',
      entity_type: 'KNOWLEDGE_SESSION',
      entity_id: `SESSION-${result.insertId}`,
      new_values: row,
      description: `Created knowledge sharing session: ${title}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Knowledge sharing session scheduled successfully!',
      data: await shapeSession(row, mentorId),
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Roles allowed to shift a session's scheduled time — keeps published
// schedules authoritative instead of editable by anyone with a link.
const SCHEDULE_AUTHORITY_ROLES = ['Admin', 'System Administrator', 'HR Specialist', 'L&D Admin', 'L&D Admin / Mentor'];

export const editSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [existing] = await query('SELECT * FROM knowledge_sessions WHERE id = ?', [Number(id)]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const { title, description, sessionDate, durationMinutes, maxCapacity, meetingLink, location, skillId, hostMentorId } = req.body;

    // A mentor can reschedule a session they host — "workshop creation" is
    // explicitly their responsibility. Only reaching into someone ELSE's
    // schedule requires Admin/HR/L&D Admin governance authority.
    const [callerEmp] = await query('SELECT id FROM employees WHERE user_id = ?', [req.user?.id]);
    const isOwnSession = callerEmp && existing.host_employee_id === callerEmp.id;

    if (sessionDate && !isOwnSession && !SCHEDULE_AUTHORITY_ROLES.includes(req.user?.role || '')) {
      return res.status(403).json({
        success: false,
        message: 'Session times are locked to keep published schedules authoritative. Only the session host, Admin, HR, or L&D Admin can reschedule a session — everything else about this session can still be edited.',
      });
    }

    await execute(
      `UPDATE knowledge_sessions SET
        title = COALESCE(?, title), description = COALESCE(?, description), scheduled_at = COALESCE(?, scheduled_at),
        duration_minutes = COALESCE(?, duration_minutes), capacity = COALESCE(?, capacity), meeting_link = COALESCE(?, meeting_link),
        location = COALESCE(?, location), skill_id = COALESCE(?, skill_id), host_employee_id = COALESCE(?, host_employee_id)
       WHERE id = ?`,
      [
        title ?? null, description !== undefined ? description : null, sessionDate ?? null,
        durationMinutes ? Number(durationMinutes) : null, maxCapacity ? Number(maxCapacity) : null, meetingLink !== undefined ? meetingLink : null,
        location !== undefined ? location : null, skillId ? Number(skillId) : null, hostMentorId ? Number(hostMentorId) : null,
        Number(id),
      ]
    );

    const [row] = await query(SESSION_SELECT + ' WHERE ks.id = ?', [Number(id)]);
    const userEmpId = await resolveEmployeeId(req);

    await logAudit({
      actor_user_id: req.user?.id,
      action: 'UPDATE',
      entity_type: 'KNOWLEDGE_SESSION',
      entity_id: `SESSION-${id}`,
      new_values: row,
      description: `Updated knowledge session: ${row.title}`,
    });

    return res.json({ success: true, message: 'Knowledge sharing session updated successfully.', data: await shapeSession(row, userEmpId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [session] = await query('SELECT * FROM knowledge_sessions WHERE id = ?', [Number(id)]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await execute(`UPDATE knowledge_sessions SET status = 'CANCELLED' WHERE id = ?`, [Number(id)]);

    const registered = await query(
      `SELECT sr.*, e.user_id FROM session_registrations sr JOIN employees e ON e.id = sr.employee_id WHERE sr.session_id = ?`,
      [Number(id)]
    );
    for (const r of registered) {
      if (r.user_id) {
        await createNotification(
          execute, r.user_id, 'Session Cancelled ⚠️',
          `The knowledge sharing session "${session.title}" scheduled for ${new Date(session.scheduled_at).toLocaleDateString()} has been cancelled.`,
          'System', 'KNOWLEDGE_SESSION', session.id
        );
      }
    }

    await logAudit({
      actor_user_id: req.user?.id, action: 'CANCEL', entity_type: 'KNOWLEDGE_SESSION',
      entity_id: `SESSION-${id}`, description: `Cancelled session ${session.title}`,
    });

    const [row] = await query(SESSION_SELECT + ' WHERE ks.id = ?', [Number(id)]);
    const userEmpId = await resolveEmployeeId(req);
    return res.json({ success: true, message: 'Session has been cancelled and attendees notified.', data: await shapeSession(row, userEmpId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const completeSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [session] = await query('SELECT * FROM knowledge_sessions WHERE id = ?', [Number(id)]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await execute(`UPDATE knowledge_sessions SET status = 'COMPLETED' WHERE id = ?`, [Number(id)]);
    await recalcSessionEffectiveness(Number(id));

    const registered = await query(
      `SELECT sr.*, e.user_id FROM session_registrations sr JOIN employees e ON e.id = sr.employee_id WHERE sr.session_id = ? AND sr.status != 'CANCELLED'`,
      [Number(id)]
    );
    for (const r of registered) {
      if (r.user_id) {
        await createNotification(
          execute, r.user_id, 'Session Completed – Please Share Feedback! ⭐',
          `"${session.title}" has concluded. Rate the session to help refine peer learning quality.`,
          'System', 'KNOWLEDGE_SESSION', session.id
        );
      }
    }

    const [row] = await query(SESSION_SELECT + ' WHERE ks.id = ?', [Number(id)]);
    const userEmpId = await resolveEmployeeId(req);
    return res.json({ success: true, message: 'Session marked as completed. Feedback requests sent to attendees.', data: await shapeSession(row, userEmpId) });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const registerForSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;
    const empId = await resolveEmployeeId(req, employeeId ? Number(employeeId) : undefined);

    const [session] = await query('SELECT * FROM knowledge_sessions WHERE id = ?', [Number(id)]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }
    if (session.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Cannot register for a cancelled session.' });
    }

    const [{ currentCount }] = await query(
      `SELECT COUNT(*) AS currentCount FROM session_registrations WHERE session_id = ? AND status != 'CANCELLED'`,
      [Number(id)]
    );
    if (currentCount >= session.capacity) {
      return res.status(400).json({ success: false, message: `Session has reached maximum participant capacity (${session.capacity} attendees).` });
    }

    await execute(
      `INSERT INTO session_registrations (session_id, employee_id, status) VALUES (?, ?, 'REGISTERED')
       ON DUPLICATE KEY UPDATE status = 'REGISTERED', cancelled_at = NULL`,
      [Number(id), empId]
    );
    await recalcSessionEffectiveness(Number(id));

    const [emp] = await query('SELECT user_id FROM employees WHERE id = ?', [empId]);
    if (emp?.user_id) {
      await createNotification(
        execute, emp.user_id, 'Session Registration Confirmed! 📅',
        `You are registered for "${session.title}". Meeting link: ${session.meeting_link}`,
        'Training Assigned', 'KNOWLEDGE_SESSION', session.id
      );
    }

    const [reg] = await query('SELECT * FROM session_registrations WHERE session_id = ? AND employee_id = ?', [Number(id), empId]);
    return res.status(201).json({ success: true, message: 'Successfully registered for knowledge session!', data: reg });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelSessionRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const { id, employeeId } = req.params;
    const empId = await resolveEmployeeId(req, employeeId ? Number(employeeId) : undefined);

    const [reg] = await query('SELECT * FROM session_registrations WHERE session_id = ? AND employee_id = ?', [Number(id), empId]);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration record not found.' });
    }

    await execute(`UPDATE session_registrations SET status = 'CANCELLED', cancelled_at = NOW() WHERE id = ?`, [reg.id]);
    await recalcSessionEffectiveness(Number(id));

    return res.json({ success: true, message: 'Session registration cancelled.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, attendanceStatus } = req.body;

    const [reg] = await query('SELECT * FROM session_registrations WHERE session_id = ? AND employee_id = ?', [Number(id), Number(employeeId)]);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration record not found' });
    }

    const status = attendanceStatus || 'ATTENDED';
    await execute('UPDATE session_registrations SET status = ? WHERE id = ?', [status, reg.id]);
    await recalcSessionEffectiveness(Number(id));

    const [updated] = await query('SELECT * FROM session_registrations WHERE id = ?', [reg.id]);
    return res.json({ success: true, message: `Attendance marked as ${status}`, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const submitSessionFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { employeeId, rating, feedback } = req.body;
    const empId = await resolveEmployeeId(req, employeeId ? Number(employeeId) : undefined);

    const [session] = await query('SELECT * FROM knowledge_sessions WHERE id = ?', [Number(id)]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await execute(
      `INSERT INTO session_registrations (session_id, employee_id, status, rating, feedback) VALUES (?, ?, 'ATTENDED', ?, ?)
       ON DUPLICATE KEY UPDATE rating = VALUES(rating), feedback = VALUES(feedback), status = 'ATTENDED'`,
      [Number(id), empId, Number(rating), feedback || '']
    );
    await recalcSessionEffectiveness(Number(id));

    const [updatedSession] = await query('SELECT average_rating, effectiveness_score FROM knowledge_sessions WHERE id = ?', [Number(id)]);
    const [reg] = await query('SELECT * FROM session_registrations WHERE session_id = ? AND employee_id = ?', [Number(id), empId]);

    return res.json({
      success: true,
      message: 'Feedback and rating submitted! Session effectiveness score calculated.',
      data: { average_rating: updatedSession.average_rating, effectiveness_score: updatedSession.effectiveness_score, user_feedback: reg },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
