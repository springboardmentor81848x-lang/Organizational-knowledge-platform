-- V2__milestone3.sql
-- Milestone 3 Database Schema Changes

-- Mentorship
CREATE TABLE mentorships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mentor_id BIGINT NOT NULL,
    mentee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    start_date DATETIME,
    end_date DATETIME,
    FOREIGN KEY (mentor_id) REFERENCES users(id),
    FOREIGN KEY (mentee_id) REFERENCES users(id),
    FOREIGN KEY (skill_id) REFERENCES skills(id),
    UNIQUE KEY uk_mentorship (mentor_id, mentee_id, skill_id)
);

-- Knowledge Sessions
CREATE TABLE knowledge_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    host_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    capacity INT NOT NULL,
    FOREIGN KEY (host_id) REFERENCES users(id)
);

-- Session Registrations
CREATE TABLE session_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    session_id BIGINT NOT NULL,
    attendee_id BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'REGISTERED',
    registered_at DATETIME NOT NULL,
    FOREIGN KEY (session_id) REFERENCES knowledge_sessions(id),
    FOREIGN KEY (attendee_id) REFERENCES users(id),
    UNIQUE KEY uk_session_registration (session_id, attendee_id)
);

-- Learning Milestones
CREATE TABLE learning_milestones (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achieved_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Assessments
CREATE TABLE assessments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(50) NOT NULL, -- SELF, PEER, MANAGER
    target_skill_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (target_skill_id) REFERENCES skills(id)
);

-- Assessment Results
CREATE TABLE assessment_results (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assessment_id BIGINT NOT NULL,
    evaluator_id BIGINT NOT NULL,
    evaluatee_id BIGINT NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 1 AND 5),
    feedback TEXT,
    submitted_at DATETIME NOT NULL,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id),
    FOREIGN KEY (evaluatee_id) REFERENCES users(id),
    UNIQUE KEY uk_assessment_result (assessment_id, evaluator_id, evaluatee_id)
);

-- Notifications
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Enrollment Constraints & Data Fix (Converting strings to FKs would be complex with existing data, 
-- but since this is a dev/test setup, we'll redefine the table if it was previously auto-generated. 
-- Assuming it didn't exist in V1__init.sql and we manage it via Flyway now).
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    employee_email VARCHAR(255),
    program_id BIGINT NOT NULL,
    program_title VARCHAR(255),
    provider VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED',
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    enrolled_at DATETIME,
    completed_at DATETIME
);

-- Add explicit relationships to enrollments
ALTER TABLE enrollments 
ADD COLUMN user_id BIGINT;

-- Note: In a real prod migration we'd do an UPDATE to map employee_email to user_id.
-- Since this is an audit/fix, we will assume user_id is the new standard.
ALTER TABLE enrollments ADD CONSTRAINT fk_enrollment_user FOREIGN KEY (user_id) REFERENCES users(id);
ALTER TABLE enrollments ADD CONSTRAINT fk_enrollment_program FOREIGN KEY (program_id) REFERENCES training_programs(id);
ALTER TABLE enrollments ADD CONSTRAINT uk_enrollment_user_program UNIQUE (user_id, program_id);

-- Indexes for performance
CREATE INDEX idx_user_skills_combo ON user_skills(user_id, skill_id);
CREATE INDEX idx_enrollments_user_status ON enrollments(user_id, status);
CREATE INDEX idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee ON mentorships(mentee_id);
CREATE INDEX idx_knowledge_sessions_date ON knowledge_sessions(session_date);
CREATE INDEX idx_assessment_results_evaluatee ON assessment_results(evaluatee_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
