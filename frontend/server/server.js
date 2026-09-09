import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB, query, isPostgresConnected, memoryStore } from './db.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

app.use(cors());
app.use(express.json());

/* =========================================================
   ROLE BENCHMARKS
========================================================= */

const ROLE_BENCHMARKS = {
  'Software Developer': [
    ['Java', 'Programming', 'Advanced', 85],
    ['Spring Boot', 'Framework', 'Intermediate', 60],
    ['System Design', 'Architecture', 'Advanced', 85],
    ['Microservices', 'Architecture', 'Advanced', 85],
    ['Docker', 'DevOps', 'Intermediate', 60],
    ['AWS', 'DevOps', 'Intermediate', 60],
    ['Kubernetes', 'DevOps', 'Advanced', 85]
  ],

  'Senior Software Engineer': [
    ['Java', 'Programming', 'Advanced', 85],
    ['Spring Boot', 'Framework', 'Advanced', 85],
    ['System Design', 'Architecture', 'Expert', 95],
    ['Microservices', 'Architecture', 'Expert', 95],
    ['Docker', 'DevOps', 'Advanced', 85],
    ['AWS', 'DevOps', 'Advanced', 85],
    ['Kubernetes', 'DevOps', 'Advanced', 85]
  ],

  'DevOps Lead': [
    ['Kubernetes', 'DevOps', 'Expert', 95],
    ['Docker', 'DevOps', 'Advanced', 85],
    ['AWS', 'DevOps', 'Advanced', 85],
    ['Terraform', 'DevOps', 'Advanced', 85],
    ['CI/CD Automation', 'DevOps', 'Advanced', 85]
  ]
};

/* =========================================================
   HELPERS
========================================================= */

const proficiencyText = score =>
  score >= 85
    ? 'Advanced'
    : score >= 60
      ? 'Intermediate'
      : score > 0
        ? 'Beginner'
        : 'Unaware';

const severity = (required, current) => {
  const gap = Math.max(0, required - current);

  if (gap >= 40) return 'Critical';
  if (gap >= 20) return 'Moderate';
  if (gap > 0) return 'Minor';

  return 'Met';
};

const ok = (res, data) => {
  return res.json({
    success: true,
    data
  });
};

const fail = (res, error) => {
  console.error('API ERROR:', error);

  return res.status(500).json({
    success: false,
    error: error.message
  });
};

const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/* =========================================================
   USER / PROFILE HELPERS
========================================================= */

async function getProfileId(userId) {
  const uid = Number(userId);

  let result = await query(
    `
    SELECT profile_id
    FROM employee_profile
    WHERE user_id = $1::integer
    ORDER BY profile_id
    LIMIT 1
    `,
    [uid]
  );

  if (result.rows.length) {
    return result.rows[0].profile_id;
  }

  result = await query(
    `
    SELECT profile_id
    FROM employee_profiles
    WHERE user_id = $1::integer
    ORDER BY profile_id
    LIMIT 1
    `,
    [uid]
  );

  return result.rows.length
    ? result.rows[0].profile_id
    : null;
}

async function getUserName(userId) {
  const uid = Number(userId);

  const result = await query(
    `
    SELECT full_name
    FROM users
    WHERE user_id = $1::integer
    `,
    [uid]
  );

  return result.rows[0]?.full_name || `User ${uid}`;
}

/* =========================================================
   GAP ANALYSIS
========================================================= */

async function calculateGap(
  userId,
  targetRole = 'Software Developer'
) {
  const uid = Number(userId);

  /* In-memory fallback */
  if (!isPostgresConnected) {
    const skills = memoryStore.userSkills.filter(
      x => x.user_id == uid
    );

    const reqs =
      ROLE_BENCHMARKS[targetRole] ||
      ROLE_BENCHMARKS['Software Developer'];

    const details = reqs.map(
      ([skill, category, required, requiredScore]) => {
        const s = skills.find(
          x =>
            x.skill_name?.toLowerCase() ===
            skill.toLowerCase()
        );

        const currentScore = s?.score ?? 0;
        const level = severity(
          requiredScore,
          currentScore
        );

        return {
          skill,
          category,
          required,
          requiredScore,
          current:
            s?.proficiency_level ||
            proficiencyText(currentScore),
          currentScore,
          level,
          class: level.toLowerCase(),
          gapScore: Math.max(
            0,
            requiredScore - currentScore
          )
        };
      }
    );

    const totalRequired = details.reduce(
      (sum, x) => sum + x.requiredScore,
      0
    );

    const totalCurrent = details.reduce(
      (sum, x) => sum + x.currentScore,
      0
    );

    return {
      userId: uid,
      targetRole,
      criticalCount: details.filter(
        x => x.level === 'Critical'
      ).length,
      moderateCount: details.filter(
        x => x.level === 'Moderate'
      ).length,
      minorCount: details.filter(
        x => x.level === 'Minor'
      ).length,
      readinessScore: Math.round(
        (totalCurrent / (totalRequired || 1)) * 100
      ),
      gapDetails: details,
      timestamp: new Date().toISOString()
    };
  }

  /* Get employee skills */
  const skillRows = (
    await query(
      `
      SELECT
        es.skill_id,
        es.proficiency_level,
        s.skill_name,
        s.category
      FROM employee_skills es
      JOIN skills s
        ON s.skill_id = es.skill_id
      WHERE es.user_id = $1::integer
      `,
      [uid]
    )
  ).rows;

  /* Get role requirements */
  let reqs = (
    await query(
      `
      SELECT
        rs.skill_id,
        s.skill_name,
        COALESCE(s.category, 'General') AS category,
        rs.required_proficiency
      FROM required_skills rs
      JOIN skills s
        ON s.skill_id = rs.skill_id
      WHERE LOWER(rs.role_name) = LOWER($1::text)
      ORDER BY rs.required_skill_id
      `,
      [targetRole]
    )
  ).rows;

  /* Use fallback benchmarks if no DB requirements */
  if (!reqs.length) {
    const benchmark =
      ROLE_BENCHMARKS[targetRole] ||
      ROLE_BENCHMARKS['Software Developer'];

    reqs = benchmark.map(
      ([
        skill_name,
        category,
        required,
        required_proficiency
      ]) => ({
        skill_name,
        category,
        required_level: required,
        required_proficiency
      })
    );
  }

  const details = reqs.map(r => {
    const s = skillRows.find(
      x =>
        x.skill_name?.toLowerCase() ===
        r.skill_name?.toLowerCase()
    );

    const currentScore = num(
      s?.proficiency_level,
      0
    );

    const requiredScore = num(
      r.required_proficiency,
      0
    );

    const level = severity(
      requiredScore,
      currentScore
    );

    return {
      skill: r.skill_name,
      category: r.category || 'General',
      required: proficiencyText(requiredScore),
      requiredScore,
      current: proficiencyText(currentScore),
      currentScore,
      level,
      class: level.toLowerCase(),
      gapScore: Math.max(
        0,
        requiredScore - currentScore
      )
    };
  });

  const totalRequired = details.reduce(
    (sum, x) => sum + x.requiredScore,
    0
  );

  const totalCurrent = details.reduce(
    (sum, x) => sum + x.currentScore,
    0
  );

  const result = {
    userId: uid,
    targetRole,

    criticalCount: details.filter(
      x => x.level === 'Critical'
    ).length,

    moderateCount: details.filter(
      x => x.level === 'Moderate'
    ).length,

    minorCount: details.filter(
      x => x.level === 'Minor'
    ).length,

    readinessScore: Math.round(
      (totalCurrent / (totalRequired || 1)) * 100
    ),

    gapDetails: details,
    timestamp: new Date().toISOString()
  };

  /* Save latest gap snapshot */
  await query(
    `
    DELETE FROM gap_analysis
    WHERE user_id = $1::integer
    `,
    [uid]
  );

  for (const d of details) {
    const skill = await query(
      `
      SELECT skill_id
      FROM skills
      WHERE LOWER(skill_name) = LOWER($1::text)
      LIMIT 1
      `,
      [d.skill]
    );

    if (skill.rows.length) {
      await query(
        `
        INSERT INTO gap_analysis
        (
          user_id,
          skill_id,
          current_level,
          required_level,
          gap_score,
          priority
        )
        VALUES
        (
          $1::integer,
          $2::integer,
          $3::integer,
          $4::integer,
          $5::integer,
          $6::text
        )
        `,
        [
          uid,
          Number(skill.rows[0].skill_id),
          d.currentScore,
          d.requiredScore,
          d.gapScore,
          d.level
        ]
      );
    }
  }

  return result;
}

/* =========================================================
   STATUS
========================================================= */

app.get('/api/status', (req, res) => {
  res.json({
    status: 'Online',
    database: isPostgresConnected
      ? 'PostgreSQL Active'
      : 'In-memory fallback',
    databaseName:
      process.env.PGDATABASE ||
      'knowledge_gap_platform',
    host:
      process.env.PGHOST ||
      'localhost',
    port: Number(
      process.env.PGPORT || 5432
    ),
    timestamp: new Date().toISOString()
  });
});

/* =========================================================
   USERS
========================================================= */

app.get('/api/users', async (req, res) => {
  try {
    const result = await query(`
      SELECT
        u.user_id AS id,
        u.full_name AS name,
        u.email,
        u.status,
        r.role_name AS role
      FROM users u
      LEFT JOIN roles r
        ON r.role_id = u.role_id
      ORDER BY u.user_id
    `);

    ok(res, result.rows);
  } catch (e) {
    fail(res, e);
  }
});

/* =========================================================
   COURSES
========================================================= */

app.get('/api/courses', async (req, res) => {
  try {
    if (!isPostgresConnected) {
      return ok(res, memoryStore.courses);
    }

    const result = await query(`
      SELECT
        course_id AS id,
        course_name AS title,
        'Internal Training Catalog' AS provider,
        description,
        difficulty_level AS level,
        duration_hours,
        duration_hours || ' hrs' AS duration,
        category,
        category AS skill_name,
        4.5::numeric AS rating,
        '' AS url,
        '📚' AS icon
      FROM training_courses
      ORDER BY course_id
    `);

    ok(res, result.rows);
  } catch (e) {
    fail(res, e);
  }
});

/* =========================================================
   GAP ANALYSIS APIs
========================================================= */

app.post(
  '/api/gap-analysis/calculate',
  async (req, res) => {
    try {
      const userId =
        req.body.userId || 1;

      const targetRole =
        req.body.targetRole ||
        'Software Developer';

      const data = await calculateGap(
        userId,
        targetRole
      );

      ok(res, data);
    } catch (e) {
      fail(res, e);
    }
  }
);

app.get(
  '/api/gap-analysis/:userId',
  async (req, res) => {
    try {
      const role =
        req.query.role ||
        'Software Developer';

      const data = await calculateGap(
        req.params.userId,
        role
      );

      ok(res, data);
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   AI RECOMMENDATIONS
========================================================= */

app.post(
  '/api/ai/recommendations',
  async (req, res) => {
    try {
      const gaps = req.body.gaps || [];

      const role =
        req.body.targetRole ||
        'Software Developer';

      const actions = gaps
        .filter(x => x.level !== 'Met')
        .sort(
          (a, b) =>
            b.gapScore - a.gapScore
        )
        .slice(0, 5)
        .map(
          x =>
            `Build ${x.skill} through a structured course, hands-on project and mentor review.`
        );

      if (isPostgresConnected) {
        for (
          const g of gaps
            .filter(x => x.level !== 'Met')
            .slice(0, 8)
        ) {
          await query(
            `
            INSERT INTO recommendations
            (
              user_id,
              skill_name,
              recommendation_text,
              priority
            )
            VALUES
            (
              $1::integer,
              $2::text,
              $3::text,
              $4::text
            )
            `,
            [
              Number(req.body.userId || 1),
              g.skill,
              `Upskill ${g.skill} for ${role} using training, practice and mentorship.`,
              g.level
            ]
          );
        }
      }

      ok(res, {
        summary: `Prioritize ${actions.length || gaps.length} high-impact skill gaps for ${role}.`,
        priorityActions: actions,
        recommendedTrack:
          'Cloud Native & Microservices Upskilling Path',
        estimatedWeeks: 6
      });
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   LEARNING PATHS
========================================================= */

app.get(
  '/api/learning-paths/:userId',
  async (req, res) => {
    try {
      const uid = Number(
        req.params.userId
      );

      if (!isPostgresConnected) {
        return ok(res, {
          title:
            'Full Stack Architect & Cloud Engineer Pathway',
          targetRole:
            'Software Developer',
          totalDuration:
            '75 Hours',
          estimatedTime:
            '6 Weeks',
          stages: []
        });
      }

      let result = await query(
        `
        SELECT *
        FROM learning_paths
        WHERE user_id = $1::integer
        ORDER BY created_at DESC NULLS LAST,
                 learning_path_id DESC
        LIMIT 1
        `,
        [uid]
      );

      if (!result.rows.length) {
        const gap = await calculateGap(
          uid,
          'Software Developer'
        );

        const gaps = gap.gapDetails
          .filter(
            x => x.level !== 'Met'
          )
          .sort(
            (a, b) =>
              b.gapScore - a.gapScore
          );

        const steps = gaps.map(
          (x, index) => ({
            stage: index + 1,
            skill: x.skill,
            severity: x.level,
            estimatedHours:
              Math.max(
                5,
                Math.round(
                  x.gapScore / 2
                )
              ),
            courses: []
          })
        );

        const total = steps.reduce(
          (sum, x) =>
            sum + x.estimatedHours,
          0
        );

        await query(
          `
          INSERT INTO learning_paths
          (
            user_id,
            title,
            description,
            estimated_hours,
            status,
            target_role,
            estimated_weeks,
            steps
          )
          VALUES
          (
            $1::integer,
            $2::text,
            $3::text,
            $4::integer,
            'Active',
            $5::text,
            $6::integer,
            $7::jsonb
          )
          `,
          [
            uid,
            'Personalized Software Developer Upskilling Path',
            'Generated from the latest skill-gap analysis.',
            total,
            'Software Developer',
            6,
            JSON.stringify(steps)
          ]
        );

        result = await query(
          `
          SELECT *
          FROM learning_paths
          WHERE user_id = $1::integer
          ORDER BY created_at DESC NULLS LAST,
                   learning_path_id DESC
          LIMIT 1
          `,
          [uid]
        );
      }

      const p = result.rows[0];

      ok(res, {
        id: p.learning_path_id,
        title: p.title,
        targetRole:
          p.target_role ||
          'Software Developer',
        totalDuration:
          `${p.estimated_hours || 0} Hours`,
        estimatedTime:
          `${p.estimated_weeks || 6} Weeks`,
        stages:
          p.steps || []
      });
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   LEARNING PROGRESS
========================================================= */

app.get(
  '/api/learning/:userId',
  async (req, res) => {
    try {
      const uid = Number(
        req.params.userId
      );

      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const profile =
        await getProfileId(uid);

      if (!profile) {
        return ok(res, []);
      }

      const result = await query(
        `
        SELECT
          te.enrollment_id AS id,
          te.profile_id,
          te.course_id,
          tc.course_name AS title,
          'Internal Training Catalog' AS provider,
          tc.category AS skill_name,
          tc.duration_hours,
          tc.duration_hours || ' hrs' AS duration,
          COALESCE(
            te.status,
            'Not Started'
          ) AS status,
          COALESCE(
            te.progress,
            0
          ) AS progress,
          COALESCE(
            te.completed_modules,
            0
          ) AS completed_modules,
          COALESCE(
            te.total_modules,
            1
          ) AS total_modules,
          te.enrollment_date AS enrolled_at,
          te.completion_date AS completed_at,
          te.certification_expiry
        FROM training_enrollment te
        JOIN training_courses tc
          ON tc.course_id = te.course_id
        WHERE te.profile_id = $1::integer
        ORDER BY
          te.enrollment_date DESC NULLS LAST,
          te.enrollment_id DESC
        `,
        [Number(profile)]
      );

      ok(res, result.rows);
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   ENROLL COURSE
========================================================= */

app.post(
  '/api/learning/enroll',
  async (req, res) => {
    try {
      const userId =
        Number(req.body.userId || 1);

      const courseId =
        Number(req.body.courseId);

      if (!courseId) {
        return res.status(400).json({
          success: false,
          error:
            'courseId is required'
        });
      }

      if (!isPostgresConnected) {
        return ok(res, {
          id: Date.now(),
          user_id: userId,
          course_id: courseId,
          status: 'In Progress',
          progress: 0
        });
      }

      const profile =
        await getProfileId(userId);

      if (!profile) {
        return res.status(400).json({
          success: false,
          error:
            `No employee profile found for user ${userId}`
        });
      }

      const course = await query(
        `
        SELECT duration_hours
        FROM training_courses
        WHERE course_id = $1::integer
        `,
        [courseId]
      );

      if (!course.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            'Course not found'
        });
      }

      let result = await query(
        `
        SELECT enrollment_id
        FROM training_enrollment
        WHERE profile_id = $1::integer
          AND course_id = $2::integer
        LIMIT 1
        `,
        [
          Number(profile),
          courseId
        ]
      );

      if (result.rows.length) {
        result = await query(
          `
          UPDATE training_enrollment
          SET
            status = 'In Progress',
            progress = COALESCE(progress, 0),
            started_at =
              COALESCE(
                started_at,
                CURRENT_TIMESTAMP
              ),
            updated_at =
              CURRENT_TIMESTAMP
          WHERE enrollment_id = $1::integer
          RETURNING *
          `,
          [
            Number(
              result.rows[0]
                .enrollment_id
            )
          ]
        );
      } else {
        result = await query(
          `
          INSERT INTO training_enrollment
          (
            profile_id,
            course_id,
            enrollment_date,
            progress,
            status,
            started_at,
            total_modules,
            completed_modules
          )
          VALUES
          (
            $1::integer,
            $2::integer,
            CURRENT_DATE,
            0,
            'In Progress',
            CURRENT_TIMESTAMP,
            10,
            0
          )
          RETURNING *
          `,
          [
            Number(profile),
            courseId
          ]
        );
      }

      await query(
        `
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          notification_type,
          is_read
        )
        VALUES
        (
          $1::integer,
          'Training enrolled',
          'You are enrolled in a new learning course.',
          'TRAINING',
          FALSE
        )
        `,
        [userId]
      );

      ok(res, {
        ...result.rows[0],
        id: result.rows[0].enrollment_id
      });
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   UPDATE LEARNING PROGRESS
========================================================= */

app.patch(
  '/api/learning/:id/progress',
  async (req, res) => {
    try {
      const enrollmentId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          enrollmentId
        )
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Invalid enrollment ID'
        });
      }

      const progress = Math.max(
        0,
        Math.min(
          100,
          num(
            req.body.progress,
            0
          )
        )
      );

      const status =
        progress === 100
          ? 'Completed'
          : 'In Progress';

      if (!isPostgresConnected) {
        return ok(res, {
          id: enrollmentId,
          progress,
          status
        });
      }

      const result = await query(
        `
        UPDATE training_enrollment
        SET
          progress = $1::integer,
          status = $2::text,
          completed_modules =
            ROUND(
              COALESCE(
                total_modules,
                1
              ) * $1::numeric / 100
            ),
          started_at =
            COALESCE(
              started_at,
              CURRENT_TIMESTAMP
            ),
          completion_date =
            CASE
              WHEN $1::integer = 100
              THEN CURRENT_DATE
              ELSE completion_date
            END,
          completed_at =
            CASE
              WHEN $1::integer = 100
              THEN CURRENT_TIMESTAMP
              ELSE completed_at
            END,
          updated_at =
            CURRENT_TIMESTAMP
        WHERE enrollment_id =
          $3::integer
        RETURNING *
        `,
        [
          progress,
          status,
          enrollmentId
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            'Enrollment not found'
        });
      }

      ok(res, {
        ...result.rows[0],
        id:
          result.rows[0]
            .enrollment_id
      });
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   MENTORS
========================================================= */

app.get(
  '/api/mentors',
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result = await query(`
        SELECT
          m.*,
          u.full_name AS name,
          u.email,
          r.role_name AS role
        FROM mentors m
        JOIN users u
          ON u.user_id = m.user_id
        LEFT JOIN roles r
          ON r.role_id = u.role_id
        ORDER BY
          m.rating DESC,
          m.id
      `);

      ok(
        res,
        result.rows.map(
          m => ({
            ...m,
            expertise:
              m.expertise || [],
            wants_to_learn:
              m.wants_to_learn || []
          })
        )
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   KNOWLEDGE SESSIONS
========================================================= */

app.get(
  '/api/sessions',
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result = await query(`
        SELECT
          s.*,
          u.full_name AS host,
          COUNT(a.id)::int AS attendees
        FROM knowledge_sessions s
        JOIN mentors m
          ON m.id = s.mentor_id
        JOIN users u
          ON u.user_id = m.user_id
        LEFT JOIN session_attendees a
          ON a.session_id = s.id
        GROUP BY
          s.id,
          u.full_name
        ORDER BY
          s.session_date
      `);

      ok(res, result.rows);
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   CREATE KNOWLEDGE SESSION
========================================================= */

app.post(
  '/api/sessions',
  async (req, res) => {
    try {
      const {
        mentorId,
        topic,
        description = '',
        sessionDate,
        durationMinutes = 60,
        capacity = 20,
        meetingUrl = ''
      } = req.body;

      if (
        !mentorId ||
        !topic ||
        !sessionDate
      ) {
        return res.status(400).json({
          success: false,
          error:
            'mentorId, topic and sessionDate are required'
        });
      }

      if (!isPostgresConnected) {
        return ok(res, req.body);
      }

      const result = await query(
        `
        INSERT INTO knowledge_sessions
        (
          mentor_id,
          topic,
          description,
          session_date,
          duration_minutes,
          capacity,
          meeting_url
        )
        VALUES
        (
          $1::integer,
          $2::text,
          $3::text,
          $4::timestamp,
          $5::integer,
          $6::integer,
          $7::text
        )
        RETURNING *
        `,
        [
          Number(mentorId),
          topic,
          description,
          sessionDate,
          Number(durationMinutes),
          Number(capacity),
          meetingUrl
        ]
      );

      ok(
        res,
        result.rows[0]
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   SESSION RSVP
========================================================= */

app.post(
  '/api/sessions/:id/rsvp',
  async (req, res) => {
    try {
      const sessionId =
        Number(req.params.id);

      const userId =
        Number(
          req.body.userId || 1
        );

      if (!isPostgresConnected) {
        return ok(res, {
          session_id: sessionId,
          user_id: userId,
          status: 'Registered'
        });
      }

      const session =
        await query(
          `
          SELECT capacity
          FROM knowledge_sessions
          WHERE id = $1::integer
          `,
          [sessionId]
        );

      if (!session.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            'Session not found'
        });
      }

      const count =
        await query(
          `
          SELECT COUNT(*)::int AS count
          FROM session_attendees
          WHERE session_id = $1::integer
            AND status = 'Registered'
          `,
          [sessionId]
        );

      if (
        count.rows[0].count >=
        session.rows[0].capacity
      ) {
        return res.status(409).json({
          success: false,
          error:
            'Session is full'
        });
      }

      const result =
        await query(
          `
          INSERT INTO session_attendees
          (
            session_id,
            user_id
          )
          VALUES
          (
            $1::integer,
            $2::integer
          )
          ON CONFLICT
          (
            session_id,
            user_id
          )
          DO UPDATE
          SET status = 'Registered'
          RETURNING *
          `,
          [
            sessionId,
            userId
          ]
        );

      await query(
        `
        INSERT INTO notifications
        (
          user_id,
          title,
          message,
          notification_type,
          is_read
        )
        VALUES
        (
          $1::integer,
          'Mentorship RSVP confirmed',
          'Your knowledge-sharing session registration is confirmed.',
          'MENTORSHIP',
          FALSE
        )
        `,
        [userId]
      );

      ok(
        res,
        result.rows[0]
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   SESSION FEEDBACK
========================================================= */

app.post(
  '/api/sessions/:id/feedback',
  async (req, res) => {
    try {
      const sessionId =
        Number(req.params.id);

      const {
        userId = 1,
        rating,
        comment = ''
      } = req.body;

      if (
        !rating ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          success: false,
          error:
            'rating must be 1-5'
        });
      }

      if (!isPostgresConnected) {
        return ok(res, {
          session_id: sessionId,
          user_id: Number(userId),
          rating,
          comment
        });
      }

      const result =
        await query(
          `
          INSERT INTO session_feedback
          (
            session_id,
            user_id,
            rating,
            comment
          )
          VALUES
          (
            $1::integer,
            $2::integer,
            $3::integer,
            $4::text
          )
          ON CONFLICT
          (
            session_id,
            user_id
          )
          DO UPDATE SET
            rating = EXCLUDED.rating,
            comment = EXCLUDED.comment
          RETURNING *
          `,
          [
            sessionId,
            Number(userId),
            Number(rating),
            comment
          ]
        );

      ok(
        res,
        result.rows[0]
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   ASSESSMENTS - GET
========================================================= */

app.get(
  '/api/assessments/:userId',
  async (req, res) => {
    try {
      const userId =
        Number(req.params.userId);

      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result = await query(
        `
        SELECT
          a.assessment_id AS id,
          a.enrollment_id,

          COALESCE(
            a.title,
            a.assessment_name,
            'Assessment'
          ) AS title,

          a.assessment_name,

          COALESCE(
            a.type,
            'Self Assessment'
          ) AS type,

          COALESCE(
            a.category,
            'General'
          ) AS category,

          a.due_date,

          COALESCE(
            a.questions_count,
            10
          ) AS questions_count,

          COALESCE(
            a.estimated_minutes,
            15
          ) AS estimated_minutes,

          COALESCE(
            a.status,
            CASE
              WHEN a.marks_obtained IS NOT NULL
              THEN 'Completed'
              ELSE 'Pending'
            END
          ) AS status,

          a.score,
          a.skill_name,
          a.assessor_user_id,

          COALESCE(
            a.subject_user_id,
            ep.user_id
          ) AS subject_user_id,

          COALESCE(
            u.full_name,
            'Employee'
          ) AS subject_name,

          a.created_at,
          a.completed_at,
          a.total_marks,
          a.marks_obtained,
          a.assessment_date

        FROM assessments a

        LEFT JOIN training_enrollment te
          ON te.enrollment_id =
             a.enrollment_id

        LEFT JOIN employee_profile ep
          ON ep.profile_id =
             te.profile_id

        LEFT JOIN users u
          ON u.user_id =
             COALESCE(
               a.subject_user_id,
               ep.user_id
             )

        WHERE
          COALESCE(
            a.subject_user_id,
            ep.user_id
          ) = $1::integer

          OR a.assessor_user_id =
             $1::integer

        ORDER BY
          CASE
            WHEN COALESCE(
              a.status,
              'Pending'
            ) = 'Pending'
            THEN 0
            ELSE 1
          END,

          a.due_date NULLS LAST,
          a.assessment_id DESC
        `,
        [userId]
      );

      ok(
        res,
        result.rows
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   ASSESSMENT SUBMISSION
   FIXED VERSION
========================================================= */

app.post(
  '/api/assessments/:id/submit',
  async (req, res) => {
    try {
      /* Convert URL parameter immediately */
      const assessmentId =
        Number(req.params.id);

      if (
        !Number.isInteger(
          assessmentId
        )
      ) {
        return res.status(400).json({
          success: false,
          error:
            'Invalid assessment ID'
        });
      }

      const answers =
        Array.isArray(
          req.body.answers
        )
          ? req.body.answers
          : [];

      if (!answers.length) {
        return res.status(400).json({
          success: false,
          error:
            'answers are required'
        });
      }

      /* Clean answer values */
      const cleanAnswers =
        answers.map(
          (answer, index) => ({
            questionNo:
              Number(
                answer.questionNo ??
                answer.question_no ??
                index + 1
              ),

            score: Math.max(
              0,
              Math.min(
                100,
                Number(
                  answer.score || 0
                )
              )
            )
          })
        );

      /* Calculate average score */
      const totalScore =
        cleanAnswers.reduce(
          (sum, answer) =>
            sum + answer.score,
          0
        );

      const finalScore =
        Math.round(
          totalScore /
          cleanAnswers.length
        );

      /* Memory fallback */
      if (!isPostgresConnected) {
        return ok(res, {
          assessment_id:
            assessmentId,
          status:
            'Completed',
          score:
            finalScore
        });
      }

      /*
       * IMPORTANT:
       * Every PostgreSQL parameter below is explicitly
       * converted to the correct type.
       */

      const assessmentResult =
        await query(
          `
          SELECT
            a.*,
            COALESCE(
              a.subject_user_id,
              ep.user_id
            ) AS resolved_user_id
          FROM assessments a

          LEFT JOIN training_enrollment te
            ON te.enrollment_id =
               a.enrollment_id

          LEFT JOIN employee_profile ep
            ON ep.profile_id =
               te.profile_id

          WHERE a.assessment_id =
                $1::integer
          `,
          [assessmentId]
        );

      if (
        !assessmentResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          error:
            'Assessment not found'
        });
      }

      const assessment =
        assessmentResult.rows[0];

      const resolvedUserId =
        assessment.resolved_user_id
          ? Number(
              assessment.resolved_user_id
            )
          : null;

      /* -----------------------------------------------------
         SAVE ANSWERS
      ----------------------------------------------------- */

      for (
        const answer of cleanAnswers
      ) {
        /*
         * Delete existing answer for this question first.
         * This avoids depending on a UNIQUE constraint.
         */
        await query(
          `
          DELETE FROM assessment_responses
          WHERE assessment_id =
                $1::integer
            AND question_no =
                $2::integer
          `,
          [
            assessmentId,
            Number(
              answer.questionNo
            )
          ]
        );

        await query(
          `
          INSERT INTO assessment_responses
          (
            assessment_id,
            question_no,
            score
          )
          VALUES
          (
            $1::integer,
            $2::integer,
            $3::integer
          )
          `,
          [
            assessmentId,
            Number(
              answer.questionNo
            ),
            Number(
              answer.score
            )
          ]
        );
      }

      /* -----------------------------------------------------
         UPDATE ASSESSMENT
      ----------------------------------------------------- */

      const updatedResult =
        await query(
          `
          UPDATE assessments
          SET
            status =
              'Completed',

            score =
              $1::integer,

            marks_obtained =
              $1::integer,

            total_marks =
              100,

            assessment_date =
              CURRENT_DATE,

            subject_user_id =
              COALESCE(
                subject_user_id,
                $2::integer
              ),

            completed_at =
              CURRENT_TIMESTAMP

          WHERE assessment_id =
                $3::integer

          RETURNING *
          `,
          [
            finalScore,
            resolvedUserId,
            assessmentId
          ]
        );

      if (
        !updatedResult.rows.length
      ) {
        return res.status(404).json({
          success: false,
          error:
            'Assessment could not be updated'
        });
      }

      /* -----------------------------------------------------
         UPDATE EMPLOYEE SKILL
      ----------------------------------------------------- */

      if (
        resolvedUserId &&
        assessment.skill_name
      ) {
        const skillResult =
          await query(
            `
            SELECT skill_id
            FROM skills
            WHERE LOWER(skill_name) =
                  LOWER($1::text)
            LIMIT 1
            `,
            [
              assessment.skill_name
            ]
          );

        if (
          skillResult.rows.length
        ) {
          const skillId =
            Number(
              skillResult.rows[0]
                .skill_id
            );

          /*
           * Update existing skill if present.
           * Otherwise insert it.
           */

          const existingSkill =
            await query(
              `
              SELECT user_id
              FROM employee_skills
              WHERE user_id =
                    $1::integer
                AND skill_id =
                    $2::integer
              LIMIT 1
              `,
              [
                resolvedUserId,
                skillId
              ]
            );

          if (
            existingSkill.rows.length
          ) {
            await query(
              `
              UPDATE employee_skills
              SET
                proficiency_level =
                  $1::integer,

                last_assessed_date =
                  CURRENT_DATE,

                updated_at =
                  CURRENT_TIMESTAMP

              WHERE user_id =
                    $2::integer
                AND skill_id =
                    $3::integer
              `,
              [
                finalScore,
                resolvedUserId,
                skillId
              ]
            );
          } else {
            await query(
              `
              INSERT INTO employee_skills
              (
                user_id,
                skill_id,
                proficiency_level,
                last_assessed_date,
                updated_at
              )
              VALUES
              (
                $1::integer,
                $2::integer,
                $3::integer,
                CURRENT_DATE,
                CURRENT_TIMESTAMP
              )
              `,
              [
                resolvedUserId,
                skillId,
                finalScore
              ]
            );
          }

          /* Notification */
          await query(
            `
            INSERT INTO notifications
            (
              user_id,
              title,
              message,
              notification_type,
              is_read
            )
            VALUES
            (
              $1::integer,
              'Assessment completed',
              'Your assessment score was updated. Recalculate skill gaps to see the impact.',
              'ASSESSMENT',
              FALSE
            )
            `,
            [resolvedUserId]
          );
        }
      }

      /* Final response */
      return ok(res, {
        assessment:
          updatedResult.rows[0],
        score:
          finalScore,
        answeredQuestions:
          cleanAnswers.length
      });

    } catch (e) {
      console.error(
        'ASSESSMENT SUBMIT ERROR:',
        e
      );

      return fail(res, e);
    }
  }
);

/* =========================================================
   NOTIFICATIONS
========================================================= */

app.get(
  '/api/notifications/:userId',
  async (req, res) => {
    try {
      const userId =
        Number(req.params.userId);

      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result = await query(
        `
        SELECT
          notification_id AS id,
          user_id,
          title,
          message,
          notification_type AS type,
          is_read,

          CASE
            WHEN is_read
            THEN created_at
            ELSE NULL
          END AS read_at,

          created_at

        FROM notifications

        WHERE user_id =
              $1::integer

        ORDER BY
          created_at DESC,
          notification_id DESC
        `,
        [userId]
      );

      ok(
        res,
        result.rows
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   MARK NOTIFICATION READ
========================================================= */

app.patch(
  '/api/notifications/:id/read',
  async (req, res) => {
    try {
      const notificationId =
        Number(req.params.id);

      if (!isPostgresConnected) {
        return ok(res, {
          id: notificationId,
          read_at:
            new Date().toISOString()
        });
      }

      const result =
        await query(
          `
          UPDATE notifications
          SET is_read = TRUE
          WHERE notification_id =
                $1::integer
          RETURNING
            notification_id AS id,
            user_id,
            title,
            message,
            notification_type AS type,
            is_read,
            created_at
          `,
          [notificationId]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            'Notification not found'
        });
      }

      ok(res, {
        ...result.rows[0],
        read_at:
          new Date().toISOString()
      });
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   MARK ALL NOTIFICATIONS READ
========================================================= */

app.post(
  '/api/notifications/:userId/read-all',
  async (req, res) => {
    try {
      const userId =
        Number(req.params.userId);

      if (isPostgresConnected) {
        await query(
          `
          UPDATE notifications
          SET is_read = TRUE
          WHERE user_id =
                $1::integer
          `,
          [userId]
        );
      }

      ok(res, {
        updated: true
      });
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   KNOWLEDGE RESOURCES
========================================================= */

app.get(
  '/api/resources',
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result = await query(`
        SELECT
          kr.*,
          u.full_name AS author_name
        FROM knowledge_resources kr
        LEFT JOIN users u
          ON u.user_id =
             kr.author_user_id
        ORDER BY
          kr.created_at DESC,
          kr.id DESC
      `);

      ok(
        res,
        result.rows
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   COMMUNITIES
========================================================= */

app.get(
  '/api/communities',
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result = await query(`
        SELECT
          c.*,
          COUNT(cm.id)::int AS members
        FROM communities c
        LEFT JOIN community_members cm
          ON cm.community_id =
             c.id
        GROUP BY c.id
        ORDER BY c.name
      `);

      ok(
        res,
        result.rows
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   JOIN COMMUNITY
========================================================= */

app.post(
  '/api/communities/:id/join',
  async (req, res) => {
    try {
      const communityId =
        Number(req.params.id);

      const userId =
        Number(
          req.body.userId || 1
        );

      if (!isPostgresConnected) {
        return ok(res, {
          community_id:
            communityId,
          user_id:
            userId
        });
      }

      const result =
        await query(
          `
          INSERT INTO community_members
          (
            community_id,
            user_id
          )
          VALUES
          (
            $1::integer,
            $2::integer
          )
          ON CONFLICT
          (
            community_id,
            user_id
          )
          DO NOTHING
          RETURNING *
          `,
          [
            communityId,
            userId
          ]
        );

      ok(
        res,
        result.rows[0] || {
          community_id:
            communityId,
          user_id:
            userId,
          status:
            'Already a member'
        }
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   CERTIFICATION RENEWALS
========================================================= */

app.get(
  '/api/learning/renewals/:userId',
  async (req, res) => {
    try {
      const userId =
        Number(req.params.userId);

      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const profile =
        await getProfileId(userId);

      if (!profile) {
        return ok(res, []);
      }

      const result =
        await query(
          `
          SELECT
            te.enrollment_id AS id,
            tc.course_name AS title,
            'Internal Training Catalog' AS provider,
            te.certification_expiry,
            te.status
          FROM training_enrollment te
          JOIN training_courses tc
            ON tc.course_id =
               te.course_id
          WHERE te.profile_id =
                $1::integer
            AND te.certification_expiry
                IS NOT NULL
          ORDER BY
            te.certification_expiry
          `,
          [Number(profile)]
        );

      ok(
        res,
        result.rows
      );
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   ANALYTICS
========================================================= */

app.get(
  '/api/analytics/:userId',
  async (req, res) => {
    try {
      const userId =
        Number(req.params.userId);

      if (!isPostgresConnected) {
        return ok(res, {
          enrolledCourses: 0,
          completedCourses: 0,
          averageProgress: '0.0',
          averageAssessmentScore: '0.0',
          criticalGaps: 0,
          moderateGaps: 0,
          minorGaps: 0,
          readinessScore: 0
        });
      }

      const profile =
        await getProfileId(userId);

      let enrollmentStats = {
        enrolled: 0,
        completed: 0,
        avg_progress: 0
      };

      if (profile) {
        enrollmentStats =
          (
            await query(
              `
              SELECT
                COUNT(*)::int AS enrolled,

                COUNT(*)
                FILTER (
                  WHERE status =
                        'Completed'
                )::int AS completed,

                COALESCE(
                  AVG(progress),
                  0
                )::numeric AS avg_progress

              FROM training_enrollment

              WHERE profile_id =
                    $1::integer
              `,
              [Number(profile)]
            )
          ).rows[0];
      }

      const assessmentStats =
        (
          await query(
            `
            SELECT
              COALESCE(
                AVG(a.score),
                0
              )::numeric AS avg_score

            FROM assessments a

            LEFT JOIN training_enrollment te
              ON te.enrollment_id =
                 a.enrollment_id

            LEFT JOIN employee_profile ep
              ON ep.profile_id =
                 te.profile_id

            WHERE
              COALESCE(
                a.subject_user_id,
                ep.user_id
              ) = $1::integer

              AND a.status =
                  'Completed'
            `,
            [userId]
          )
        ).rows[0];

      const gap =
        await calculateGap(
          userId,
          'Software Developer'
        );

      ok(res, {
        enrolledCourses:
          enrollmentStats.enrolled,

        completedCourses:
          enrollmentStats.completed,

        averageProgress:
          Number(
            enrollmentStats.avg_progress ||
              0
          ).toFixed(1),

        averageAssessmentScore:
          Number(
            assessmentStats.avg_score ||
              0
          ).toFixed(1),

        criticalGaps:
          gap.criticalCount,

        moderateGaps:
          gap.moderateCount,

        minorGaps:
          gap.minorCount,

        readinessScore:
          gap.readinessScore
      });
    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   REPORTS
========================================================= */

app.get(
  '/api/reports/:type/:userId',
  async (req, res) => {
    try {
      const type =
        req.params.type;

      const userId =
        Number(req.params.userId);

      if (!isPostgresConnected) {
        return ok(res, []);
      }

      let rows = [];

      if (type === 'learning') {
        const profile =
          await getProfileId(
            userId
          );

        if (profile) {
          rows = (
            await query(
              `
              SELECT
                tc.course_name AS title,
                'Internal Training Catalog' AS provider,
                tc.category AS skill_name,
                te.status,
                te.progress,
                te.enrollment_date AS enrolled_at,
                te.completion_date AS completed_at

              FROM training_enrollment te

              JOIN training_courses tc
                ON tc.course_id =
                   te.course_id

              WHERE te.profile_id =
                    $1::integer

              ORDER BY
                te.enrollment_date DESC
              `,
              [Number(profile)]
            )
          ).rows;
        }

      } else if (
        type === 'assessments'
      ) {
        rows = (
          await query(
            `
            SELECT
              a.assessment_id AS id,
              a.title,
              a.type,
              a.category,
              a.status,
              a.score,
              a.due_date,
              a.completed_at

            FROM assessments a

            LEFT JOIN training_enrollment te
              ON te.enrollment_id =
                 a.enrollment_id

            LEFT JOIN employee_profile ep
              ON ep.profile_id =
                 te.profile_id

            WHERE
              COALESCE(
                a.subject_user_id,
                ep.user_id
              ) = $1::integer

            ORDER BY
              a.created_at DESC NULLS LAST,
              a.assessment_id DESC
            `,
            [userId]
          )
        ).rows;

      } else {
        rows = (
          await calculateGap(
            userId,
            'Software Developer'
          )
        ).gapDetails;
      }

      ok(
        res,
        rows
      );

    } catch (e) {
      fail(res, e);
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

await initDB();

app.listen(
  PORT,
  () => {
    console.log(
      `🚀 Knowledge Gap API running on port ${PORT}`
    );
  }
);