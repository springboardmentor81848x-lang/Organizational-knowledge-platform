import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  initDB,
  query,
  isPostgresConnected,
  memoryStore
} from "./db.js";

dotenv.config();

const app = express();

const PORT = Number(
  process.env.PORT || 5000
);

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());


// =========================================================
// ROLE BENCHMARKS
// =========================================================

const ROLE_BENCHMARKS = {
  "Software Developer": [
    ["Java", "Programming", "Advanced", 85],
    ["Spring Boot", "Framework", "Intermediate", 60],
    ["System Design", "Architecture", "Advanced", 85],
    ["Microservices", "Architecture", "Advanced", 85],
    ["Docker", "DevOps", "Intermediate", 60],
    ["AWS", "DevOps", "Intermediate", 60],
    ["Kubernetes", "DevOps", "Advanced", 85]
  ],

  "Senior Software Engineer": [
    ["Java", "Programming", "Advanced", 85],
    ["Spring Boot", "Framework", "Advanced", 85],
    ["System Design", "Architecture", "Expert", 95],
    ["Microservices", "Architecture", "Expert", 95],
    ["Docker", "DevOps", "Advanced", 85],
    ["AWS", "DevOps", "Advanced", 85],
    ["Kubernetes", "DevOps", "Advanced", 85]
  ],

  "DevOps Lead": [
    ["Kubernetes", "DevOps", "Expert", 95],
    ["Docker", "DevOps", "Advanced", 85],
    ["AWS", "DevOps", "Advanced", 85],
    ["Terraform", "DevOps", "Advanced", 85],
    ["CI/CD Automation", "DevOps", "Advanced", 85]
  ]
};


// =========================================================
// HELPERS
// =========================================================

const proficiencyText = (score) => {
  score = Number(score || 0);

  if (score >= 85) return "Advanced";
  if (score >= 60) return "Intermediate";
  if (score > 0) return "Beginner";

  return "Unaware";
};

const severity = (required, current) => {
  const gap = Math.max(
    0,
    Number(required || 0) -
      Number(current || 0)
  );

  if (gap >= 40) return "Critical";
  if (gap >= 20) return "Moderate";
  if (gap > 0) return "Minor";

  return "Met";
};

const ok = (res, data) =>
  res.json({
    success: true,
    data
  });

const fail = (res, error) =>
  res.status(500).json({
    success: false,
    error: error.message
  });

const num = (
  value,
  fallback = 0
) =>
  Number.isFinite(Number(value))
    ? Number(value)
    : fallback;


// =========================================================
// PROFILE
// =========================================================

async function getProfileId(userId) {
  let result = await query(
    `
    SELECT profile_id
    FROM employee_profile
    WHERE user_id=$1
    ORDER BY profile_id
    LIMIT 1
    `,
    [userId]
  );

  if (result.rows.length) {
    return result.rows[0].profile_id;
  }

  result = await query(
    `
    SELECT profile_id
    FROM employee_profiles
    WHERE user_id=$1
    ORDER BY profile_id
    LIMIT 1
    `,
    [userId]
  );

  return result.rows.length
    ? result.rows[0].profile_id
    : null;
}


async function getUserName(userId) {
  const result = await query(
    `
    SELECT full_name
    FROM users
    WHERE user_id=$1
    `,
    [userId]
  );

  return (
    result.rows[0]?.full_name ||
    `User ${userId}`
  );
}


// =========================================================
// GAP ANALYSIS
// =========================================================

async function calculateGap(
  userId,
  targetRole = "Software Developer"
) {
  if (!isPostgresConnected) {
    const skills =
      memoryStore.userSkills.filter(
        (item) =>
          item.user_id == userId
      );

    const requirements =
      ROLE_BENCHMARKS[targetRole] ||
      ROLE_BENCHMARKS[
        "Software Developer"
      ];

    const details =
      requirements.map(
        ([
          skill,
          category,
          required,
          requiredScore
        ]) => {
          const currentSkill =
            skills.find(
              (item) =>
                item.skill_name
                  .toLowerCase() ===
                skill.toLowerCase()
            );

          const currentScore =
            currentSkill?.score ?? 0;

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
              currentSkill?.proficiency_level ||
              proficiencyText(
                currentScore
              ),
            currentScore,
            level,
            class: level.toLowerCase(),
            gapScore: Math.max(
              0,
              requiredScore -
                currentScore
            )
          };
        }
      );

    const totalRequired =
      details.reduce(
        (sum, item) =>
          sum + item.requiredScore,
        0
      );

    const totalCurrent =
      details.reduce(
        (sum, item) =>
          sum + item.currentScore,
        0
      );

    return {
      userId: Number(userId),
      targetRole,
      criticalCount:
        details.filter(
          (item) =>
            item.level === "Critical"
        ).length,
      moderateCount:
        details.filter(
          (item) =>
            item.level === "Moderate"
        ).length,
      minorCount:
        details.filter(
          (item) =>
            item.level === "Minor"
        ).length,
      readinessScore: Math.round(
        (totalCurrent /
          (totalRequired || 1)) *
          100
      ),
      gapDetails: details,
      timestamp:
        new Date().toISOString()
    };
  }

  const skillRows =
    (
      await query(
        `
        SELECT
          es.skill_id,
          es.proficiency_level,
          s.skill_name,
          s.category
        FROM employee_skills es
        JOIN skills s
          ON s.skill_id=es.skill_id
        WHERE es.user_id=$1
        `,
        [userId]
      )
    ).rows;

  let requirements =
    (
      await query(
        `
        SELECT
          rs.skill_id,
          s.skill_name,
          COALESCE(
            s.category,
            'General'
          ) AS category,
          rs.required_proficiency
        FROM required_skills rs
        JOIN skills s
          ON s.skill_id=rs.skill_id
        WHERE LOWER(rs.role_name)=LOWER($1)
        ORDER BY rs.required_skill_id
        `,
        [targetRole]
      )
    ).rows;

  if (!requirements.length) {
    const benchmark =
      ROLE_BENCHMARKS[targetRole] ||
      ROLE_BENCHMARKS[
        "Software Developer"
      ];

    requirements =
      benchmark.map(
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

  const details =
    requirements.map((item) => {
      const currentSkill =
        skillRows.find(
          (skill) =>
            skill.skill_name
              .toLowerCase() ===
            item.skill_name.toLowerCase()
        );

      const currentScore =
        num(
          currentSkill?.proficiency_level,
          0
        );

      const requiredScore =
        num(
          item.required_proficiency,
          0
        );

      const level = severity(
        requiredScore,
        currentScore
      );

      return {
        skill: item.skill_name,
        category:
          item.category ||
          "General",
        required:
          proficiencyText(
            requiredScore
          ),
        requiredScore,
        current:
          proficiencyText(
            currentScore
          ),
        currentScore,
        level,
        class: level.toLowerCase(),
        gapScore: Math.max(
          0,
          requiredScore -
            currentScore
        )
      };
    });

  const totalRequired =
    details.reduce(
      (sum, item) =>
        sum + item.requiredScore,
      0
    );

  const totalCurrent =
    details.reduce(
      (sum, item) =>
        sum + item.currentScore,
      0
    );

  const result = {
    userId: Number(userId),
    targetRole,
    criticalCount:
      details.filter(
        (item) =>
          item.level === "Critical"
      ).length,
    moderateCount:
      details.filter(
        (item) =>
          item.level === "Moderate"
      ).length,
    minorCount:
      details.filter(
        (item) =>
          item.level === "Minor"
      ).length,
    readinessScore: Math.round(
      (totalCurrent /
        (totalRequired || 1)) *
        100
    ),
    gapDetails: details,
    timestamp:
      new Date().toISOString()
  };

  // Save latest gap snapshot
  await query(
    `
    DELETE FROM gap_analysis
    WHERE user_id=$1
    `,
    [userId]
  );

  for (const gap of details) {
    const skill =
      await query(
        `
        SELECT skill_id
        FROM skills
        WHERE LOWER(skill_name)=LOWER($1)
        LIMIT 1
        `,
        [gap.skill]
      );

    if (skill.rows.length) {
      await query(
        `
        INSERT INTO gap_analysis(
          user_id,
          skill_id,
          current_level,
          required_level,
          gap_score,
          priority
        )
        VALUES(
          $1,$2,$3,$4,$5,$6
        )
        `,
        [
          userId,
          skill.rows[0].skill_id,
          gap.currentScore,
          gap.requiredScore,
          gap.gapScore,
          gap.level
        ]
      );
    }
  }

  return result;
}


// =========================================================
// STATUS
// =========================================================

app.get(
  "/api/status",
  (req, res) => {
    res.json({
      status: "Online",
      database:
        isPostgresConnected
          ? "PostgreSQL Active"
          : "In-memory fallback",
      databaseName:
        process.env.PGDATABASE ||
        "knowledge_gap_platform",
      host:
        process.env.PGHOST ||
        "localhost",
      port: Number(
        process.env.PGPORT || 5432
      ),
      timestamp:
        new Date().toISOString()
    });
  }
);


// =========================================================
// USERS
// =========================================================

app.get(
  "/api/users",
  async (req, res) => {
    try {
      const result =
        await query(`
          SELECT
            u.user_id AS id,
            u.full_name AS name,
            u.email,
            u.status,
            r.role_name AS role
          FROM users u
          LEFT JOIN roles r
            ON r.role_id=u.role_id
          ORDER BY u.user_id
        `);

      ok(res, result.rows);
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// LOGIN
// =========================================================

app.post(
  "/api/login",
  async (req, res) => {
    try {
      const email =
        String(
          req.body.email || ""
        )
          .trim()
          .toLowerCase();

      if (!email) {
        return res.status(400).json({
          success: false,
          error: "Email is required"
        });
      }

      const result =
        await query(
          `
          SELECT
            u.user_id AS id,
            u.full_name AS name,
            u.email,
            u.status,
            r.role_name AS role
          FROM users u
          LEFT JOIN roles r
            ON r.role_id=u.role_id
          WHERE LOWER(u.email)=LOWER($1)
          LIMIT 1
          `,
          [email]
        );

      if (!result.rows.length) {
        return res.status(401).json({
          success: false,
          error:
            "No account found for this email"
        });
      }

      const user =
        result.rows[0];

      if (
        user.status &&
        String(user.status)
          .toLowerCase() !==
          "active"
      ) {
        return res.status(403).json({
          success: false,
          error:
            "This account is not active"
        });
      }

      ok(res, user);
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// COURSES
// =========================================================

app.get(
  "/api/courses",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(
          res,
          memoryStore.courses
        );
      }

      const result =
        await query(`
          SELECT
            course_id AS id,
            course_name AS title,
            provider,
            description,
            difficulty_level AS level,
            duration_hours,
            duration_hours || ' hrs' AS duration,
            category,
            category AS skill_name,
            4.5::numeric AS rating,
            course_url AS url,
            'BOOK' AS icon
          FROM training_courses
          ORDER BY course_id
        `);

      ok(res, result.rows);
    } catch (error) {
      /*
       * Some older database versions may not
       * have provider/course_url columns.
       * Fall back safely.
       */

      try {
        const result =
          await query(`
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
              'BOOK' AS icon
            FROM training_courses
            ORDER BY course_id
          `);

        ok(res, result.rows);
      } catch (secondError) {
        fail(res, secondError);
      }
    }
  }
);


// =========================================================
// GAP ANALYSIS
// =========================================================

app.post(
  "/api/gap-analysis/calculate",
  async (req, res) => {
    try {
      const data =
        await calculateGap(
          req.body.userId || 1,
          req.body.targetRole ||
            "Software Developer"
        );

      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  }
);


app.get(
  "/api/gap-analysis/:userId",
  async (req, res) => {
    try {
      const data =
        await calculateGap(
          req.params.userId,
          req.query.role ||
            "Software Developer"
        );

      ok(res, data);
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// AI RECOMMENDATIONS
// =========================================================

app.post(
  "/api/ai/recommendations",
  async (req, res) => {
    try {
      const gaps =
        Array.isArray(req.body.gaps)
          ? req.body.gaps
          : [];

      const role =
        req.body.targetRole ||
        "Software Developer";

      const userId =
        req.body.userId || 1;

      const actions =
        gaps
          .filter(
            (item) =>
              item.level !== "Met"
          )
          .sort(
            (a, b) =>
              Number(b.gapScore || 0) -
              Number(a.gapScore || 0)
          )
          .slice(0, 5)
          .map(
            (item) =>
              `Improve ${item.skill} through a structured course, hands-on practice and mentor review.`
          );

      if (isPostgresConnected) {
        for (
          const gap of gaps
            .filter(
              (item) =>
                item.level !== "Met"
            )
            .slice(0, 8)
        ) {
          await query(
            `
            INSERT INTO recommendations(
              user_id,
              skill_name,
              recommendation_text,
              priority
            )
            VALUES($1,$2,$3,$4)
            `,
            [
              userId,
              gap.skill,
              `Upskill ${gap.skill} for ${role} using training, practice and mentorship.`,
              gap.level
            ]
          );
        }
      }

      ok(res, {
        summary:
          actions.length
            ? `Based on your current skill gaps, prioritize ${actions.length} high-impact areas for your ${role} role.`
            : `Your current skills are well aligned with the ${role} role.`,
        priorityActions: actions,
        recommendedTrack:
          "Software Developer Upskilling Path",
        estimatedWeeks:
          Math.max(
            4,
            Math.min(
              10,
              gaps.length * 2
            )
          )
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// AI CHAT ASSISTANT
// =========================================================
// =========================================================
// AI CHAT ASSISTANT
// =========================================================

app.post("/api/ai/chat", async (req, res) => {
  try {
    const userId = req.body.userId || 1;
    const message = String(req.body.message || "").trim();
    const role = req.body.targetRole || "Software Developer";

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }

    const lowerMessage = message.toLowerCase();

    // General knowledge questions
    if (
      lowerMessage.includes("what is java") ||
      lowerMessage === "java" ||
      lowerMessage.includes("explain java")
    ) {
      return ok(res, {
        reply:
          "Java is a popular object-oriented programming language used to build web applications, backend systems, Android applications and enterprise software.\n\n" +
          "Main features of Java:\n" +
          "1. Object-Oriented\n" +
          "2. Platform Independent\n" +
          "3. Secure\n" +
          "4. Robust\n" +
          "5. Supports multithreading\n\n" +
          "For your Software Developer learning path, I recommend learning Core Java first, followed by Collections, JDBC, Spring Boot, REST APIs and SQL.",
        targetRole: role
      });
    }

    // Other basic technology questions
    if (
      lowerMessage.includes("what is sql") ||
      lowerMessage.includes("explain sql")
    ) {
      return ok(res, {
        reply:
          "SQL stands for Structured Query Language. It is used to store, retrieve, update and manage data in relational databases such as PostgreSQL and MySQL.\n\n" +
          "Important SQL topics include SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, constraints and subqueries.",
        targetRole: role
      });
    }

    if (
      lowerMessage.includes("what is spring boot") ||
      lowerMessage.includes("explain spring boot")
    ) {
      return ok(res, {
        reply:
          "Spring Boot is a Java framework used to build backend applications quickly. It simplifies configuration and provides features for creating REST APIs, connecting databases and developing production-ready applications.\n\n" +
          "For placement preparation, learn Spring Boot with REST APIs, Spring Data JPA, PostgreSQL and authentication.",
        targetRole: role
      });
    }

    // Get skill-gap information only when needed
    let gapData = {
      gapDetails: [],
      readinessScore: 0,
      criticalCount: 0,
      moderateCount: 0,
      minorCount: 0
    };

    try {
      gapData = await calculateGap(userId, role);
    } catch (gapError) {
      console.error("AI gap calculation error:", gapError.message);
    }

    const gaps = (gapData.gapDetails || [])
      .filter(item => item.level !== "Met")
      .sort(
        (a, b) =>
          Number(b.gapScore || 0) -
          Number(a.gapScore || 0)
      );

    const topGaps = gaps.slice(0, 5);

    const gapText = topGaps.length
      ? topGaps
          .map(
            item =>
              `${item.skill} (${item.level}, current ${item.current}, required ${item.required})`
          )
          .join(", ")
      : "No major skill gaps available";

    let reply = "";

    // Skill gaps
    if (
      lowerMessage.includes("skill") ||
      lowerMessage.includes("gap")
    ) {
      reply = topGaps.length
        ? `Based on your ${role} profile, focus on these skills first:\n\n` +
          topGaps
            .map(
              (item, index) =>
                `${index + 1}. ${item.skill} - ${item.level} gap`
            )
            .join("\n") +
          `\n\nStart with ${topGaps[0].skill}.`
        : `I could not find detailed skill-gap data for your profile right now.`;
    }

    // Courses
    else if (
      lowerMessage.includes("course") ||
      lowerMessage.includes("learn") ||
      lowerMessage.includes("training")
    ) {
      reply = topGaps.length
        ? `For your current gaps, start with ${topGaps[0].skill}.\n\n` +
          `Recommended learning order:\n` +
          topGaps
            .slice(0, 4)
            .map(
              (item, index) =>
                `${index + 1}. ${item.skill}`
            )
            .join("\n") +
          `\n\nOpen the Training section to choose courses from Infosys Springboard, Coursera or Udemy.`
        : "Open the Training section to explore courses related to your target role.";
    }

    // Learning path
    else if (
      lowerMessage.includes("path") ||
      lowerMessage.includes("roadmap") ||
      lowerMessage.includes("plan")
    ) {
      reply = topGaps.length
        ? `Your personalized learning path is:\n\n` +
          topGaps
            .map(
              (item, index) =>
                `${index + 1}. ${item.skill} - ${item.level}`
            )
            .join("\n") +
          `\n\nComplete each skill with theory, practice and a small project.`
        : "Start with Core Java, SQL, Spring Boot, REST APIs and build practical projects.";
    }

    // Readiness
    else if (
      lowerMessage.includes("ready") ||
      lowerMessage.includes("readiness")
    ) {
      reply =
        `Your current readiness score for ${role} is ${gapData.readinessScore || 0}%.\n\n` +
        `Critical gaps: ${gapData.criticalCount || 0}\n` +
        `Moderate gaps: ${gapData.moderateCount || 0}\n` +
        `Minor gaps: ${gapData.minorCount || 0}`;
    }

    // Default
    else {
      reply =
        `I can help you with your ${role} learning journey.\n\n` +
        `You can ask me things like:\n` +
        `• What skills should I improve?\n` +
        `• Which course should I take?\n` +
        `• Give me a learning path\n` +
        `• What is my readiness score?\n` +
        `• What is Java?\n` +
        `• What is Spring Boot?`;
    }

    return ok(res, {
      reply,
      targetRole: role,
      readinessScore: gapData.readinessScore || 0,
      skillGaps: topGaps
    });

  } catch (error) {
    console.error("AI Assistant error:", error);

    return res.status(500).json({
      success: false,
      error: "AI Assistant temporarily unavailable",
      reply:
        "I can currently help with Java, SQL, Spring Boot, courses, skill gaps and learning paths."
    });
  }
});
app.post(
  "/api/ai/chat",
  async (req, res) => {
    try {
      const userId =
        req.body.userId || 1;

      const message =
        String(
          req.body.message || ""
        ).trim();

      const role =
        req.body.targetRole ||
        "Software Developer";

      if (!message) {
        return res.status(400).json({
          success: false,
          error:
            "Message is required"
        });
      }

      const gapData =
        await calculateGap(
          userId,
          role
        );

      const gaps =
        (gapData.gapDetails || [])
          .filter(
            (item) =>
              item.level !== "Met"
          )
          .sort(
            (a, b) =>
              Number(b.gapScore || 0) -
              Number(a.gapScore || 0)
          );

      const topGaps =
        gaps.slice(0, 5);

      const gapText =
        topGaps.length
          ? topGaps
              .map(
                (item) =>
                  `${item.skill} (${item.level}, current ${item.current}, required ${item.required})`
              )
              .join(", ")
          : "No major skill gaps";

      const lowerMessage =
        message.toLowerCase();

      let reply = "";

      // -----------------------------------------------------
      // SKILL QUESTION
      // -----------------------------------------------------

      if (
        lowerMessage.includes(
          "skill"
        ) ||
        lowerMessage.includes(
          "gap"
        )
      ) {
        if (topGaps.length) {
          reply =
            `Based on your current ${role} profile, focus on these skills first:\n\n` +
            topGaps
              .map(
                (item, index) =>
                  `${index + 1}. ${item.skill} - ${item.level} gap`
              )
              .join("\n") +
            `\n\nStart with ${topGaps[0].skill}, then move to the next highest gap.`;
        } else {
          reply =
            `Your current skills are well aligned with the ${role} role. Focus on maintaining your skills and building advanced projects.`;
        }
      }

      // -----------------------------------------------------
      // COURSE QUESTION
      // -----------------------------------------------------

      else if (
        lowerMessage.includes(
          "course"
        ) ||
        lowerMessage.includes(
          "learn"
        ) ||
        lowerMessage.includes(
          "training"
        )
      ) {
        if (topGaps.length) {
          reply =
            `For your current gaps, I recommend starting with ${topGaps[0].skill}.\n\n` +
            `Learning order:\n` +
            topGaps
              .slice(0, 4)
              .map(
                (item, index) =>
                  `${index + 1}. ${item.skill}`
              )
              .join("\n") +
            `\n\nUse the Training section to choose a course from Infosys Springboard, Coursera or Udemy.`;
        } else {
          reply =
            "You can continue with advanced courses and practical projects related to your target role.";
        }
      }

      // -----------------------------------------------------
      // LEARNING PATH
      // -----------------------------------------------------

      else if (
        lowerMessage.includes(
          "path"
        ) ||
        lowerMessage.includes(
          "roadmap"
        ) ||
        lowerMessage.includes(
          "plan"
        )
      ) {
        if (topGaps.length) {
          reply =
            `Your personalized learning path is:\n\n` +
            topGaps
              .map(
                (item, index) =>
                  `${index + 1}. ${item.skill} - ${item.level}`
              )
              .join("\n") +
            `\n\nComplete each skill with theory, hands-on practice and a small project.`;
        } else {
          reply =
            "Your skills currently match the selected role well. Build advanced projects and continue improving your strongest areas.";
        }
      }

      // -----------------------------------------------------
      // READINESS
      // -----------------------------------------------------

      else if (
        lowerMessage.includes(
          "ready"
        ) ||
        lowerMessage.includes(
          "readiness"
        )
      ) {
        reply =
          `Your current readiness score for ${role} is ${gapData.readinessScore}%.\n\n` +
          `Critical gaps: ${gapData.criticalCount}\n` +
          `Moderate gaps: ${gapData.moderateCount}\n` +
          `Minor gaps: ${gapData.minorCount}`;
      }

      // -----------------------------------------------------
      // DEFAULT
      // -----------------------------------------------------

      else {
        reply =
          `I can help you with your ${role} learning journey.\n\n` +
          `Your current major gaps are: ${gapText}.\n\n` +
          `You can ask me:\n` +
          `• What skills should I improve?\n` +
          `• Which course should I take?\n` +
          `• Give me a learning path\n` +
          `• What is my readiness score?`;
      }

      ok(res, {
        reply,
        targetRole: role,
        readinessScore:
          gapData.readinessScore,
        skillGaps:
          topGaps
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// LEARNING PATH
// =========================================================

app.get(
  "/api/learning-paths/:userId",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, {
          title:
            "Software Developer Upskilling Path",
          targetRole:
            "Software Developer",
          totalDuration:
            "75 Hours",
          estimatedTime:
            "6 Weeks",
          stages: []
        });
      }

      let result =
        await query(
          `
          SELECT *
          FROM learning_paths
          WHERE user_id=$1
          ORDER BY
            created_at DESC NULLS LAST,
            learning_path_id DESC
          LIMIT 1
          `,
          [req.params.userId]
        );

      if (!result.rows.length) {
        const gapData =
          await calculateGap(
            req.params.userId,
            "Software Developer"
          );

        const gaps =
          gapData.gapDetails
            .filter(
              (item) =>
                item.level !== "Met"
            )
            .sort(
              (a, b) =>
                b.gapScore -
                a.gapScore
            );

        const steps =
          gaps.map(
            (item, index) => ({
              stage:
                index + 1,
              skill:
                item.skill,
              severity:
                item.level,
              estimatedHours:
                Math.max(
                  5,
                  Math.round(
                    item.gapScore /
                      2
                  )
                ),
              courses: []
            })
          );

        const total =
          steps.reduce(
            (sum, item) =>
              sum +
              item.estimatedHours,
            0
          );

        await query(
          `
          INSERT INTO learning_paths(
            user_id,
            title,
            description,
            estimated_hours,
            status,
            target_role,
            estimated_weeks,
            steps
          )
          VALUES(
            $1,$2,$3,$4,'Active',$5,$6,$7
          )
          `,
          [
            req.params.userId,
            "Personalized Software Developer Upskilling Path",
            "Generated from the latest skill-gap analysis.",
            total,
            "Software Developer",
            6,
            JSON.stringify(
              steps
            )
          ]
        );

        result =
          await query(
            `
            SELECT *
            FROM learning_paths
            WHERE user_id=$1
            ORDER BY
              created_at DESC NULLS LAST,
              learning_path_id DESC
            LIMIT 1
            `,
            [req.params.userId]
          );
      }

      const path =
        result.rows[0];

      ok(res, {
        id:
          path.learning_path_id,
        title:
          path.title,
        targetRole:
          path.target_role ||
          "Software Developer",
        totalDuration:
          `${path.estimated_hours || 0} Hours`,
        estimatedTime:
          `${path.estimated_weeks || 6} Weeks`,
        stages:
          path.steps || []
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// LEARNING
// =========================================================

app.get(
  "/api/learning/:userId",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const profile =
        await getProfileId(
          req.params.userId
        );

      if (!profile) {
        return ok(res, []);
      }

      const result =
        await query(
          `
          SELECT
            te.enrollment_id AS id,
            te.profile_id,
            te.course_id,
            tc.course_name AS title,
            tc.category AS skill_name,
            tc.duration_hours,
            tc.duration_hours || ' hrs'
              AS duration,
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
            te.enrollment_date
              AS enrolled_at,
            te.completion_date
              AS completed_at,
            te.certification_expiry
          FROM training_enrollment te
          JOIN training_courses tc
            ON tc.course_id=te.course_id
          WHERE te.profile_id=$1
          ORDER BY
            te.enrollment_date DESC NULLS LAST,
            te.enrollment_id DESC
          `,
          [profile]
        );

      ok(
        res,
        result.rows.map(
          (item) => ({
            ...item,
            provider:
              item.title
                ?.toLowerCase()
                .includes(
                  "microservice"
                )
                ? "Infosys Springboard"
                : item.title
                    ?.toLowerCase()
                    .includes(
                      "kubernetes"
                    ) ||
                  item.title
                    ?.toLowerCase()
                    .includes(
                      "docker"
                    )
                ? "Coursera"
                : "Udemy"
          })
        )
      );
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// ENROLLMENT
// =========================================================

app.post(
  "/api/learning/enroll",
  async (req, res) => {
    try {
      const userId =
        req.body.userId || 1;

      const courseId =
        req.body.courseId;

      if (!courseId) {
        return res.status(400).json({
          success: false,
          error:
            "courseId is required"
        });
      }

      if (!isPostgresConnected) {
        return ok(res, {
          id: Date.now(),
          user_id: userId,
          course_id: courseId,
          status: "In Progress",
          progress: 0
        });
      }

      const profile =
        await getProfileId(
          userId
        );

      if (!profile) {
        return res.status(400).json({
          success: false,
          error:
            `No employee profile found for user ${userId}`
        });
      }

      const course =
        await query(
          `
          SELECT duration_hours
          FROM training_courses
          WHERE course_id=$1
          `,
          [courseId]
        );

      if (!course.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            "Course not found"
        });
      }

      let result =
        await query(
          `
          SELECT enrollment_id
          FROM training_enrollment
          WHERE profile_id=$1
          AND course_id=$2
          LIMIT 1
          `,
          [
            profile,
            courseId
          ]
        );

      if (result.rows.length) {
        result =
          await query(
            `
            UPDATE training_enrollment
            SET
              status='In Progress',
              progress=
                COALESCE(
                  progress,
                  0
                ),
              started_at=
                COALESCE(
                  started_at,
                  CURRENT_TIMESTAMP
                ),
              updated_at=
                CURRENT_TIMESTAMP
            WHERE enrollment_id=$1
            RETURNING *
            `,
            [
              result.rows[0]
                .enrollment_id
            ]
          );
      } else {
        result =
          await query(
            `
            INSERT INTO training_enrollment(
              profile_id,
              course_id,
              enrollment_date,
              progress,
              status,
              started_at,
              total_modules,
              completed_modules
            )
            VALUES(
              $1,
              $2,
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
              profile,
              courseId
            ]
          );
      }

      await query(
        `
        INSERT INTO notifications(
          user_id,
          title,
          message,
          notification_type,
          is_read
        )
        VALUES(
          $1,
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
        id:
          result.rows[0]
            .enrollment_id
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// LEARNING PROGRESS
// =========================================================

app.patch(
  "/api/learning/:id/progress",
  async (req, res) => {
    try {
      const progress =
        Math.max(
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
          ? "Completed"
          : "In Progress";

      if (!isPostgresConnected) {
        return ok(res, {
          id: req.params.id,
          progress,
          status
        });
      }

      const result =
        await query(
          `
          UPDATE training_enrollment
          SET
            progress=$1,
            status=$2,
            completed_modules=
              ROUND(
                COALESCE(
                  total_modules,
                  1
                ) *
                $1 / 100.0
              ),
            started_at=
              COALESCE(
                started_at,
                CURRENT_TIMESTAMP
              ),
            completion_date=
              CASE
                WHEN $1=100
                THEN CURRENT_DATE
                ELSE completion_date
              END,
            completed_at=
              CASE
                WHEN $1=100
                THEN CURRENT_TIMESTAMP
                ELSE completed_at
              END,
            updated_at=
              CURRENT_TIMESTAMP
          WHERE enrollment_id=$3
          RETURNING *
          `,
          [
            progress,
            status,
            req.params.id
          ]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            "Enrollment not found"
        });
      }

      ok(res, {
        ...result.rows[0],
        id:
          result.rows[0]
            .enrollment_id
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// MENTORS
// =========================================================

app.get(
  "/api/mentors",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result =
        await query(`
          SELECT
            m.*,
            u.full_name AS name,
            u.email,
            r.role_name AS role
          FROM mentors m
          JOIN users u
            ON u.user_id=m.user_id
          LEFT JOIN roles r
            ON r.role_id=u.role_id
          ORDER BY
            m.rating DESC,
            m.id
        `);

      ok(
        res,
        result.rows.map(
          (mentor) => ({
            ...mentor,
            expertise:
              mentor.expertise ||
              [],
            wants_to_learn:
              mentor.wants_to_learn ||
              []
          })
        )
      );
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// SESSIONS
// =========================================================

app.get(
  "/api/sessions",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result =
        await query(`
          SELECT
            s.*,
            u.full_name AS host,
            COUNT(a.id)::int
              AS attendees
          FROM knowledge_sessions s
          JOIN mentors m
            ON m.id=s.mentor_id
          JOIN users u
            ON u.user_id=m.user_id
          LEFT JOIN session_attendees a
            ON a.session_id=s.id
          GROUP BY
            s.id,
            u.full_name
          ORDER BY
            s.session_date
        `);

      ok(res, result.rows);
    } catch (error) {
      fail(res, error);
    }
  }
);


app.post(
  "/api/sessions",
  async (req, res) => {
    try {
      const {
        mentorId,
        topic,
        description = "",
        sessionDate,
        durationMinutes = 60,
        capacity = 20,
        meetingUrl = ""
      } = req.body;

      if (
        !mentorId ||
        !topic ||
        !sessionDate
      ) {
        return res.status(400).json({
          success: false,
          error:
            "mentorId, topic and sessionDate are required"
        });
      }

      if (!isPostgresConnected) {
        return ok(res, req.body);
      }

      const result =
        await query(
          `
          INSERT INTO knowledge_sessions(
            mentor_id,
            topic,
            description,
            session_date,
            duration_minutes,
            capacity,
            meeting_url
          )
          VALUES(
            $1,$2,$3,$4,$5,$6,$7
          )
          RETURNING *
          `,
          [
            mentorId,
            topic,
            description,
            sessionDate,
            durationMinutes,
            capacity,
            meetingUrl
          ]
        );

      ok(res, result.rows[0]);
    } catch (error) {
      fail(res, error);
    }
  }
);


app.post(
  "/api/sessions/:id/rsvp",
  async (req, res) => {
    try {
      const userId =
        req.body.userId || 1;

      if (!isPostgresConnected) {
        return ok(res, {
          session_id:
            req.params.id,
          user_id: userId,
          status:
            "Registered"
        });
      }

      const session =
        await query(
          `
          SELECT capacity
          FROM knowledge_sessions
          WHERE id=$1
          `,
          [req.params.id]
        );

      if (!session.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            "Session not found"
        });
      }

      const count =
        await query(
          `
          SELECT COUNT(*)::int AS n
          FROM session_attendees
          WHERE session_id=$1
          AND status='Registered'
          `,
          [req.params.id]
        );

      if (
        count.rows[0].n >=
        session.rows[0].capacity
      ) {
        return res.status(409).json({
          success: false,
          error:
            "Session is full"
        });
      }

      const result =
        await query(
          `
          INSERT INTO session_attendees(
            session_id,
            user_id
          )
          VALUES($1,$2)
          ON CONFLICT(
            session_id,
            user_id
          )
          DO UPDATE SET
            status='Registered'
          RETURNING *
          `,
          [
            req.params.id,
            userId
          ]
        );

      await query(
        `
        INSERT INTO notifications(
          user_id,
          title,
          message,
          notification_type,
          is_read
        )
        VALUES(
          $1,
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
    } catch (error) {
      fail(res, error);
    }
  }
);


app.post(
  "/api/sessions/:id/feedback",
  async (req, res) => {
    try {
      const {
        userId = 1,
        rating,
        comment = ""
      } = req.body;

      if (
        !rating ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          success: false,
          error:
            "rating must be 1-5"
        });
      }

      if (!isPostgresConnected) {
        return ok(res, {
          session_id:
            req.params.id,
          user_id: userId,
          rating,
          comment
        });
      }

      const result =
        await query(
          `
          INSERT INTO session_feedback(
            session_id,
            user_id,
            rating,
            comment
          )
          VALUES($1,$2,$3,$4)
          ON CONFLICT(
            session_id,
            user_id
          )
          DO UPDATE SET
            rating=
              EXCLUDED.rating,
            comment=
              EXCLUDED.comment
          RETURNING *
          `,
          [
            req.params.id,
            userId,
            rating,
            comment
          ]
        );

      ok(res, result.rows[0]);
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// ASSESSMENTS
// =========================================================

app.get(
  "/api/assessments/:userId",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result =
        await query(
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
            ON te.enrollment_id=
              a.enrollment_id
          LEFT JOIN employee_profile ep
            ON ep.profile_id=
              te.profile_id
          LEFT JOIN users u
            ON u.user_id=
              COALESCE(
                a.subject_user_id,
                ep.user_id
              )
          WHERE
            COALESCE(
              a.subject_user_id,
              ep.user_id
            )=$1
            OR a.assessor_user_id=$1
          ORDER BY
            CASE
              WHEN COALESCE(
                a.status,
                'Pending'
              )='Pending'
              THEN 0
              ELSE 1
            END,
            a.due_date NULLS LAST,
            a.assessment_id DESC
          `,
          [req.params.userId]
        );

      ok(res, result.rows);
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// ASSESSMENT SUBMIT
// =========================================================

app.post(
  "/api/assessments/:id/submit",
  async (req, res) => {
    try {
      const answers =
        req.body.answers || [];

      if (!answers.length) {
        return res.status(400).json({
          success: false,
          error:
            "answers are required"
        });
      }

      if (!isPostgresConnected) {
        return ok(res, {
          id: Number(
            req.params.id
          ),
          status: "Completed",
          score: Math.round(
            answers.reduce(
              (sum, item) =>
                sum +
                num(item.score),
              0
            ) /
              answers.length
          )
        });
      }

      const assessment =
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
            ON te.enrollment_id=
              a.enrollment_id
          LEFT JOIN employee_profile ep
            ON ep.profile_id=
              te.profile_id
          WHERE
            a.assessment_id=$1
          `,
          [req.params.id]
        );

      if (!assessment.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            "Assessment not found"
        });
      }

      const item =
        assessment.rows[0];

      const score =
        Math.round(
          answers.reduce(
            (sum, answer) =>
              sum +
              Math.max(
                0,
                Math.min(
                  100,
                  num(
                    answer.score
                  )
                )
              ),
            0
          ) /
            answers.length
        );

      for (
        const answer of answers
      ) {
        await query(
          `
          INSERT INTO assessment_responses(
            assessment_id,
            question_no,
            score
          )
          VALUES($1,$2,$3)
          ON CONFLICT(
            assessment_id,
            question_no
          )
          DO UPDATE SET
            score=
              EXCLUDED.score
          `,
          [
            req.params.id,
            answer.questionNo ||
              1,
            Math.max(
              0,
              Math.min(
                100,
                num(
                  answer.score
                )
              )
            )
          ]
        );
      }

      const updated =
        await query(
          `
          UPDATE assessments
          SET
            status='Completed',
            score=$1,
            marks_obtained=$1,
            total_marks=100,
            assessment_date=CURRENT_DATE,
            subject_user_id=
              COALESCE(
                subject_user_id,
                $2
              ),
            completed_at=
              CURRENT_TIMESTAMP
          WHERE
            assessment_id=$3
          RETURNING *
          `,
          [
            score,
            item.resolved_user_id,
            req.params.id
          ]
        );

      if (
        item.resolved_user_id &&
        item.skill_name
      ) {
        const skill =
          await query(
            `
            SELECT skill_id
            FROM skills
            WHERE LOWER(skill_name)=
              LOWER($1)
            LIMIT 1
            `,
            [item.skill_name]
          );

        if (skill.rows.length) {
          await query(
            `
            INSERT INTO employee_skills(
              user_id,
              skill_id,
              proficiency_level,
              last_assessed_date,
              updated_at
            )
            VALUES(
              $1,$2,$3,
              CURRENT_DATE,
              CURRENT_TIMESTAMP
            )
            ON CONFLICT(
              user_id,
              skill_id
            )
            DO UPDATE SET
              proficiency_level=
                EXCLUDED.proficiency_level,
              last_assessed_date=
                CURRENT_DATE,
              updated_at=
                CURRENT_TIMESTAMP
            `,
            [
              item.resolved_user_id,
              skill.rows[0].skill_id,
              score
            ]
          );

          await query(
            `
            INSERT INTO notifications(
              user_id,
              title,
              message,
              notification_type,
              is_read
            )
            VALUES(
              $1,
              'Assessment completed',
              'Your assessment score was updated. Recalculate skill gaps to see the impact.',
              'ASSESSMENT',
              FALSE
            )
            `,
            [
              item.resolved_user_id
            ]
          );
        }
      }

      ok(res, {
        assessment:
          updated.rows[0],
        score
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// NOTIFICATIONS
// =========================================================

app.get(
  "/api/notifications/:userId",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result =
        await query(
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
          WHERE user_id=$1
          ORDER BY
            created_at DESC,
            notification_id DESC
          `,
          [req.params.userId]
        );

      ok(res, result.rows);
    } catch (error) {
      fail(res, error);
    }
  }
);


app.patch(
  "/api/notifications/:id/read",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, {
          id: req.params.id,
          read_at:
            new Date().toISOString()
        });
      }

      const result =
        await query(
          `
          UPDATE notifications
          SET is_read=TRUE
          WHERE notification_id=$1
          RETURNING
            notification_id AS id,
            user_id,
            title,
            message,
            notification_type AS type,
            is_read,
            created_at
          `,
          [req.params.id]
        );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          error:
            "Notification not found"
        });
      }

      ok(res, {
        ...result.rows[0],
        read_at:
          new Date().toISOString()
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


app.post(
  "/api/notifications/:userId/read-all",
  async (req, res) => {
    try {
      if (isPostgresConnected) {
        await query(
          `
          UPDATE notifications
          SET is_read=TRUE
          WHERE user_id=$1
          `,
          [req.params.userId]
        );
      }

      ok(res, {
        updated: true
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// RESOURCES
// =========================================================

app.get(
  "/api/resources",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result =
        await query(`
          SELECT
            kr.*,
            u.full_name AS author_name
          FROM knowledge_resources kr
          LEFT JOIN users u
            ON u.user_id=
              kr.author_user_id
          ORDER BY
            kr.created_at DESC,
            kr.id DESC
        `);

      ok(res, result.rows);
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// COMMUNITIES
// =========================================================

app.get(
  "/api/communities",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const result =
        await query(`
          SELECT
            c.*,
            COUNT(cm.id)::int AS members
          FROM communities c
          LEFT JOIN community_members cm
            ON cm.community_id=c.id
          GROUP BY c.id
          ORDER BY c.name
        `);

      ok(res, result.rows);
    } catch (error) {
      fail(res, error);
    }
  }
);


app.post(
  "/api/communities/:id/join",
  async (req, res) => {
    try {
      const userId =
        req.body.userId || 1;

      if (!isPostgresConnected) {
        return ok(res, {
          community_id:
            req.params.id,
          user_id: userId
        });
      }

      const result =
        await query(
          `
          INSERT INTO community_members(
            community_id,
            user_id
          )
          VALUES($1,$2)
          ON CONFLICT(
            community_id,
            user_id
          )
          DO NOTHING
          RETURNING *
          `,
          [
            req.params.id,
            userId
          ]
        );

      ok(
        res,
        result.rows[0] || {
          community_id:
            Number(
              req.params.id
            ),
          user_id: userId,
          status:
            "Already a member"
        }
      );
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// RENEWALS
// =========================================================

app.get(
  "/api/learning/renewals/:userId",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, []);
      }

      const profile =
        await getProfileId(
          req.params.userId
        );

      if (!profile) {
        return ok(res, []);
      }

      const result =
        await query(
          `
          SELECT
            te.enrollment_id AS id,
            tc.course_name AS title,
            te.certification_expiry,
            te.status
          FROM training_enrollment te
          JOIN training_courses tc
            ON tc.course_id=
              te.course_id
          WHERE
            te.profile_id=$1
            AND te.certification_expiry
              IS NOT NULL
          ORDER BY
            te.certification_expiry
          `,
          [profile]
        );

      ok(
        res,
        result.rows.map(
          (item) => ({
            ...item,
            provider:
              item.title
                ?.toLowerCase()
                .includes(
                  "microservice"
                )
                ? "Infosys Springboard"
                : item.title
                    ?.toLowerCase()
                    .includes(
                      "docker"
                    ) ||
                  item.title
                    ?.toLowerCase()
                    .includes(
                      "kubernetes"
                    )
                ? "Coursera"
                : "Udemy"
          })
        )
      );
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// ANALYTICS
// =========================================================

app.get(
  "/api/analytics/:userId",
  async (req, res) => {
    try {
      if (!isPostgresConnected) {
        return ok(res, {
          enrolledCourses: 0,
          completedCourses: 0,
          averageProgress: "0.0",
          averageAssessmentScore:
            "0.0",
          criticalGaps: 0,
          moderateGaps: 0,
          minorGaps: 0,
          readinessScore: 0
        });
      }

      const profile =
        await getProfileId(
          req.params.userId
        );

      const enrollment =
        profile
          ? (
              await query(
                `
                SELECT
                  COUNT(*)::int
                    AS enrolled,
                  COUNT(*)
                    FILTER(
                      WHERE status='Completed'
                    )::int
                    AS completed,
                  COALESCE(
                    AVG(progress),
                    0
                  )::numeric
                    AS avg_progress
                FROM training_enrollment
                WHERE profile_id=$1
                `,
                [profile]
              )
            ).rows[0]
          : {
              enrolled: 0,
              completed: 0,
              avg_progress: 0
            };

      const assessment =
        (
          await query(
            `
            SELECT
              COALESCE(
                AVG(score),
                0
              )::numeric AS avg_score
            FROM assessments a
            LEFT JOIN training_enrollment te
              ON te.enrollment_id=
                a.enrollment_id
            LEFT JOIN employee_profile ep
              ON ep.profile_id=
                te.profile_id
            WHERE
              COALESCE(
                a.subject_user_id,
                ep.user_id
              )=$1
              AND a.status='Completed'
            `,
            [req.params.userId]
          )
        ).rows[0];

      const gaps =
        await calculateGap(
          req.params.userId,
          "Software Developer"
        );

      ok(res, {
        enrolledCourses:
          enrollment.enrolled,
        completedCourses:
          enrollment.completed,
        averageProgress:
          Number(
            enrollment.avg_progress ||
              0
          ).toFixed(1),
        averageAssessmentScore:
          Number(
            assessment.avg_score ||
              0
          ).toFixed(1),
        criticalGaps:
          gaps.criticalCount,
        moderateGaps:
          gaps.moderateCount,
        minorGaps:
          gaps.minorCount,
        readinessScore:
          gaps.readinessScore
      });
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// REPORTS
// =========================================================

app.get(
  "/api/reports/:type/:userId",
  async (req, res) => {
    try {
      const type =
        req.params.type;

      const userId =
        req.params.userId;

      if (!isPostgresConnected) {
        return ok(res, []);
      }

      let rows = [];

      if (type === "learning") {
        const profile =
          await getProfileId(
            userId
          );

        if (profile) {
          rows =
            (
              await query(
                `
                SELECT
                  tc.course_name AS title,
                  tc.category AS skill_name,
                  te.status,
                  te.progress,
                  te.enrollment_date
                    AS enrolled_at,
                  te.completion_date
                    AS completed_at
                FROM training_enrollment te
                JOIN training_courses tc
                  ON tc.course_id=
                    te.course_id
                WHERE
                  te.profile_id=$1
                ORDER BY
                  te.enrollment_date DESC
                `,
                [profile]
              )
            ).rows;
        }
      } else if (
        type === "assessments"
      ) {
        rows =
          (
            await query(
              `
              SELECT
                assessment_id AS id,
                title,
                type,
                category,
                status,
                score,
                due_date,
                completed_at
              FROM assessments a
              LEFT JOIN training_enrollment te
                ON te.enrollment_id=
                  a.enrollment_id
              LEFT JOIN employee_profile ep
                ON ep.profile_id=
                  te.profile_id
              WHERE
                COALESCE(
                  a.subject_user_id,
                  ep.user_id
                )=$1
              ORDER BY
                a.created_at DESC NULLS LAST,
                a.assessment_id DESC
              `,
              [userId]
            )
          ).rows;
      } else {
        rows =
          (
            await calculateGap(
              userId,
              "Software Developer"
            )
          ).gapDetails;
      }

      ok(res, rows);
    } catch (error) {
      fail(res, error);
    }
  }
);


// =========================================================
// START SERVER
// =========================================================

await initDB();

app.listen(
  PORT,
  () =>
    console.log(
      `Knowledge Gap API running on port ${PORT}`
    )
);