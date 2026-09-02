-- ============================================================================
-- OKGIP schema_updates.sql  (v2 — version-safe)
-- Run this against your existing `defaultdb` Aiven MySQL database (the one
-- dumped in database.sql) BEFORE starting the backend.
--
-- v2 fixes a real bug in the previous version: `ADD COLUMN IF NOT EXISTS`
-- only works on MySQL 8.0.29+. On older 8.0.x (common on Aiven), that syntax
-- is a parse error — and MySQL's error recovery can misattribute the failure
-- to an unrelated table/column, which is why you may have seen an
-- `is_announcement` / `notifications` error that didn't match the statement
-- it pointed at.
--
-- This version never uses ADD COLUMN IF NOT EXISTS. Instead it defines one
-- small helper procedure that checks information_schema.COLUMNS before
-- adding each column via dynamic SQL. That works on every MySQL 5.7+/8.0
-- version and is safe to re-run — already-added columns are skipped.
-- ============================================================================

DELIMITER $$

DROP PROCEDURE IF EXISTS okgip_add_column_if_missing $$
CREATE PROCEDURE okgip_add_column_if_missing(
  IN tbl VARCHAR(64), IN col VARCHAR(64), IN coldef VARCHAR(255)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = tbl AND COLUMN_NAME = col
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', coldef);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$

DROP PROCEDURE IF EXISTS okgip_add_fk_if_missing $$
CREATE PROCEDURE okgip_add_fk_if_missing(
  IN constraint_name VARCHAR(64), IN tbl VARCHAR(64), IN ddl_fragment VARCHAR(500)
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE() AND CONSTRAINT_NAME = constraint_name
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', tbl, '` ADD CONSTRAINT `', constraint_name, '` ', ddl_fragment);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$

DELIMITER ;

-- ----------------------------------------------------------------------------
-- messages: add a subject line (frontend composes subject + body)
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('messages', 'subject', 'VARCHAR(255) NULL AFTER is_announcement');

-- ----------------------------------------------------------------------------
-- notifications: priority + deep link, used by the dispatch/notifications UI
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('notifications', 'priority', 'VARCHAR(20) NULL');
CALL okgip_add_column_if_missing('notifications', 'link', 'VARCHAR(500) NULL');

-- ----------------------------------------------------------------------------
-- tasks: progress tracking (0-100), used by the Tasks board
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('tasks', 'progress_percentage', 'INT NOT NULL DEFAULT 0');

-- ----------------------------------------------------------------------------
-- certificates: verification + expiry + link back to the training assignment
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('certificates', 'verification_code', 'VARCHAR(100) NULL');
CALL okgip_add_column_if_missing('certificates', 'training_assignment_id', 'BIGINT NULL');
CALL okgip_add_column_if_missing('certificates', 'expiry_date', 'DATE NULL');
CALL okgip_add_column_if_missing('certificates', 'status', 'VARCHAR(20) NOT NULL DEFAULT ''Valid''');

-- ----------------------------------------------------------------------------
-- Target Roles / career-ladder feature — no backing tables existed at all
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS target_roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  target_role_code VARCHAR(50) UNIQUE,
  title VARCHAR(255) NOT NULL,
  department_id BIGINT NULL,
  level ENUM('Junior','Mid','Senior','Lead','Principal','Executive') NOT NULL DEFAULT 'Mid',
  description TEXT,
  salary_band VARCHAR(100),
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_target_roles_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS target_role_skills (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  target_role_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  required_proficiency INT NOT NULL DEFAULT 4,
  CONSTRAINT fk_trs_target_role FOREIGN KEY (target_role_id) REFERENCES target_roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_trs_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CALL okgip_add_column_if_missing('employees', 'target_role_id', 'BIGINT NULL');
CALL okgip_add_fk_if_missing('fk_employees_target_role', 'employees', 'FOREIGN KEY (target_role_id) REFERENCES target_roles(id) ON DELETE SET NULL');

-- ----------------------------------------------------------------------------
-- Knowledge sessions: location + computed effectiveness metrics
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('knowledge_sessions', 'location', 'VARCHAR(255) NULL');
CALL okgip_add_column_if_missing('knowledge_sessions', 'average_rating', 'DECIMAL(3,1) NOT NULL DEFAULT 5.0');
CALL okgip_add_column_if_missing('knowledge_sessions', 'effectiveness_score', 'DECIMAL(5,1) NOT NULL DEFAULT 90.0');

-- session_registrations.status needs an 'ATTENDED' state in addition to the
-- existing REGISTERED/CANCELLED, plus rating/feedback for post-session review.
-- MODIFY COLUMN is naturally idempotent (safe to re-run) so no guard needed.
ALTER TABLE session_registrations
  MODIFY COLUMN status ENUM('REGISTERED','CANCELLED','ATTENDED') NOT NULL DEFAULT 'REGISTERED';
CALL okgip_add_column_if_missing('session_registrations', 'rating', 'INT NULL');
CALL okgip_add_column_if_missing('session_registrations', 'feedback', 'TEXT NULL');

-- ----------------------------------------------------------------------------
-- Leave requests: approver metadata used by the approval workflow
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('leave_requests', 'approver_role', 'VARCHAR(50) NULL');
CALL okgip_add_column_if_missing('leave_requests', 'approver_comments', 'TEXT NULL');
CALL okgip_add_column_if_missing('leave_requests', 'approved_by', 'VARCHAR(255) NULL');
CALL okgip_add_column_if_missing('leave_requests', 'approved_at', 'TIMESTAMP NULL');
CALL okgip_add_column_if_missing('leave_requests', 'rejected_at', 'TIMESTAMP NULL');

-- ----------------------------------------------------------------------------
-- Assessment results: 360 / peer / manager evaluation metadata
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('assessment_results', 'assessment_type', 'VARCHAR(30) NULL');
CALL okgip_add_column_if_missing('assessment_results', 'assessor_id', 'BIGINT NULL');
CALL okgip_add_column_if_missing('assessment_results', 'feedback', 'TEXT NULL');

-- ----------------------------------------------------------------------------
-- Training programs / assignments: structured modules & milestones (JSON —
-- always read/written as a whole unit per assignment, not fully normalized),
-- plus certification + progress-tracking fields.
-- ----------------------------------------------------------------------------
CALL okgip_add_column_if_missing('training_programs', 'modules', 'JSON NULL');
CALL okgip_add_column_if_missing('training_programs', 'milestones', 'JSON NULL');

CALL okgip_add_column_if_missing('training_assignments', 'start_date', 'DATE NULL');
CALL okgip_add_column_if_missing('training_assignments', 'expected_completion_date', 'DATE NULL');
CALL okgip_add_column_if_missing('training_assignments', 'actual_completion_date', 'DATE NULL');
CALL okgip_add_column_if_missing('training_assignments', 'recommendation_reason', 'TEXT NULL');
CALL okgip_add_column_if_missing('training_assignments', 'modules', 'JSON NULL');
CALL okgip_add_column_if_missing('training_assignments', 'milestones', 'JSON NULL');
CALL okgip_add_column_if_missing('training_assignments', 'certificate_number', 'VARCHAR(100) NULL');
CALL okgip_add_column_if_missing('training_assignments', 'certificate_expiry_date', 'DATE NULL');
CALL okgip_add_column_if_missing('training_assignments', 'is_certified', 'TINYINT(1) NOT NULL DEFAULT 0');
CALL okgip_add_column_if_missing('training_assignments', 'completed_at', 'TIMESTAMP NULL');

-- ----------------------------------------------------------------------------
-- Mentorship admin-approval workflow. Your dump has a simpler mentor_profiles
-- / mentor_requests pair (direct request -> accept/reject); the frontend's
-- mentorship module needs a richer multi-stage flow (mentee proposes ->
-- Admin/HR recommends a mentor -> Admin/HR approves -> complete), with a
-- full per-request audit trail. Rather than force that workflow onto the
-- simpler tables, this adds a parallel `mentorships` + history table.
-- `mentor_profiles` / `mentor_requests` remain as-is and are simply unused
-- by this feature.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mentorships (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  mentorship_code VARCHAR(50) UNIQUE,
  mentor_id BIGINT NOT NULL,
  requested_mentor_id BIGINT NULL,
  recommended_mentor_id BIGINT NULL,
  assigned_mentor_id BIGINT NULL,
  mentee_id BIGINT NOT NULL,
  skill_id BIGINT NOT NULL,
  goal TEXT,
  start_date DATE NULL,
  end_date DATE NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pending Admin Review',
  admin_notes TEXT NULL,
  rejection_reason TEXT NULL,
  rating INT NULL,
  feedback TEXT NULL,
  requested_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  recommended_at TIMESTAMP NULL,
  approved_at TIMESTAMP NULL,
  rejected_at TIMESTAMP NULL,
  approved_by VARCHAR(255) NULL,
  rejected_by VARCHAR(255) NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mentorships_mentor FOREIGN KEY (mentor_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_mentorships_requested_mentor FOREIGN KEY (requested_mentor_id) REFERENCES employees(id) ON DELETE SET NULL,
  CONSTRAINT fk_mentorships_recommended_mentor FOREIGN KEY (recommended_mentor_id) REFERENCES employees(id) ON DELETE SET NULL,
  CONSTRAINT fk_mentorships_assigned_mentor FOREIGN KEY (assigned_mentor_id) REFERENCES employees(id) ON DELETE SET NULL,
  CONSTRAINT fk_mentorships_mentee FOREIGN KEY (mentee_id) REFERENCES employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_mentorships_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS mentor_request_history (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  request_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  performed_by_id BIGINT NULL,
  performed_by_name VARCHAR(255) NULL,
  performed_by_role VARCHAR(50) NULL,
  old_status VARCHAR(30) NULL,
  new_status VARCHAR(30) NULL,
  comments TEXT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mrh_request FOREIGN KEY (request_id) REFERENCES mentorships(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- Community of Practice groups — explicitly required by the Milestone 3 doc
-- (Section 4: "Community of practice groups") but had no backing at all
-- until now. A group is built around one skill/topic; any employee can
-- join/leave; posts are simple threaded knowledge-sharing within the group
-- (separate from the 1:1 mentorship workflow and formal knowledge_sessions).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS community_groups (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  skill_id BIGINT NULL,
  created_by BIGINT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cg_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL,
  CONSTRAINT fk_cg_creator FOREIGN KEY (created_by) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS community_group_members (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
  joined_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_group_member (group_id, employee_id),
  CONSTRAINT fk_cgm_group FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_cgm_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS community_posts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  group_id BIGINT NOT NULL,
  employee_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cp_group FOREIGN KEY (group_id) REFERENCES community_groups(id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- Clean up helper procedures — they're not needed at runtime, only for this
-- migration script.
-- ----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS okgip_add_column_if_missing;
DROP PROCEDURE IF EXISTS okgip_add_fk_if_missing;

-- ============================================================================
-- Done. This script is safe to re-run: CREATE TABLE uses IF NOT EXISTS,
-- every ALTER TABLE goes through the column-existence check above, and the
-- one MODIFY COLUMN statement is naturally idempotent.
-- ============================================================================
