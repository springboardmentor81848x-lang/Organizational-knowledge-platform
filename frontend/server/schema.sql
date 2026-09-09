-- Compatibility migration for the existing knowledge_gap_platform database.
-- This file is intentionally non-destructive: it preserves existing tables/data.

-- Existing learning path table: add Milestone-3 fields only when absent.
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS target_role VARCHAR(100);
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS estimated_weeks INTEGER;
ALTER TABLE learning_paths ADD COLUMN IF NOT EXISTS steps JSONB;

-- Existing training enrollment table: add progress-tracking fields only when absent.
ALTER TABLE training_enrollment ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE training_enrollment ADD COLUMN IF NOT EXISTS completed_modules INTEGER DEFAULT 0;
ALTER TABLE training_enrollment ADD COLUMN IF NOT EXISTS total_modules INTEGER DEFAULT 1;
ALTER TABLE training_enrollment ADD COLUMN IF NOT EXISTS certification_expiry DATE;
ALTER TABLE training_enrollment ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Existing assessment table: retain original columns and add Milestone-3 workflow fields.
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS title VARCHAR(180);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS type VARCHAR(40);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS category VARCHAR(80);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS questions_count INTEGER DEFAULT 10;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER DEFAULT 15;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'Pending';
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS score NUMERIC(5,2);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assessor_user_id BIGINT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS subject_user_id BIGINT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS skill_name VARCHAR(100);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

-- Assessment answers.
CREATE TABLE IF NOT EXISTS assessment_responses (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER NOT NULL REFERENCES assessments(assessment_id) ON DELETE CASCADE,
  question_no INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK(score BETWEEN 0 AND 100),
  UNIQUE(assessment_id, question_no)
);

-- Knowledge-sharing and mentorship.
CREATE TABLE IF NOT EXISTS mentors (
  id SERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
  expertise JSONB NOT NULL DEFAULT '[]',
  wants_to_learn JSONB NOT NULL DEFAULT '[]',
  department VARCHAR(100),
  bio TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  sessions_count INTEGER DEFAULT 0,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS knowledge_sessions (
  id SERIAL PRIMARY KEY,
  mentor_id INTEGER NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
  topic VARCHAR(180) NOT NULL,
  description TEXT,
  session_date TIMESTAMP NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  capacity INTEGER NOT NULL DEFAULT 20,
  status VARCHAR(30) DEFAULT 'Upcoming',
  meeting_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_attendees (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES knowledge_sessions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  status VARCHAR(30) DEFAULT 'Registered',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS session_feedback (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES knowledge_sessions(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS knowledge_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  resource_type VARCHAR(40) NOT NULL,
  skill_name VARCHAR(100),
  description TEXT,
  url VARCHAR(500) NOT NULL,
  author_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS communities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) UNIQUE NOT NULL,
  description TEXT,
  owner_user_id BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS community_members (
  id SERIAL PRIMARY KEY,
  community_id INTEGER NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(community_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_m3_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_m3_training_enrollment_profile ON training_enrollment(profile_id);
CREATE INDEX IF NOT EXISTS idx_m3_assessment_enrollment ON assessments(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_m3_sessions_date ON knowledge_sessions(session_date);
