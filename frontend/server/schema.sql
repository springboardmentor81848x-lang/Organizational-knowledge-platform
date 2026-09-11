-- Organizational Knowledge Gap Intelligence Platform - complete schema
CREATE TABLE IF NOT EXISTS users (
 id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(150) UNIQUE NOT NULL,
 role VARCHAR(80) NOT NULL, target_role VARCHAR(100) NOT NULL DEFAULT 'Software Developer', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS skills (id SERIAL PRIMARY KEY, name VARCHAR(100) UNIQUE NOT NULL, category VARCHAR(80) NOT NULL);
CREATE TABLE IF NOT EXISTS user_skills (
 id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, skill_name VARCHAR(100) NOT NULL,
 category VARCHAR(80) NOT NULL, proficiency_level VARCHAR(30) NOT NULL, score INT NOT NULL CHECK(score BETWEEN 0 AND 100), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(user_id, skill_name)
);
CREATE TABLE IF NOT EXISTS role_requirements (
 id SERIAL PRIMARY KEY, role_name VARCHAR(100) NOT NULL, skill_name VARCHAR(100) NOT NULL, category VARCHAR(80) NOT NULL,
 required_level VARCHAR(30) NOT NULL, required_score INT NOT NULL CHECK(required_score BETWEEN 0 AND 100), UNIQUE(role_name, skill_name)
);
CREATE TABLE IF NOT EXISTS gap_analysis_results (
 id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, target_role VARCHAR(100) NOT NULL,
 critical_gaps_count INT DEFAULT 0, moderate_gaps_count INT DEFAULT 0, minor_gaps_count INT DEFAULT 0, gap_details JSONB NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS courses (
 id SERIAL PRIMARY KEY, title VARCHAR(150) NOT NULL, provider VARCHAR(80) NOT NULL, description TEXT NOT NULL, level VARCHAR(30) NOT NULL,
 duration VARCHAR(30) NOT NULL, category VARCHAR(80) NOT NULL, skill_name VARCHAR(100) NOT NULL, rating NUMERIC(2,1) DEFAULT 4.5,
 url VARCHAR(255) NOT NULL, color VARCHAR(20) DEFAULT '#3b82f6', icon VARCHAR(20) DEFAULT '📚'
);
CREATE TABLE IF NOT EXISTS learning_paths (
 id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, path_name VARCHAR(150) NOT NULL, target_role VARCHAR(100) NOT NULL,
 total_hours INT NOT NULL, estimated_weeks INT NOT NULL, steps JSONB NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS enrollments (
 id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, course_id INT REFERENCES courses(id) ON DELETE CASCADE,
 status VARCHAR(30) NOT NULL DEFAULT 'Not Started', progress INT NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
 completed_modules INT NOT NULL DEFAULT 0, total_modules INT NOT NULL DEFAULT 1, enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 started_at TIMESTAMP, completed_at TIMESTAMP, certification_expiry DATE, UNIQUE(user_id, course_id)
);
CREATE TABLE IF NOT EXISTS assessments (
 id SERIAL PRIMARY KEY, title VARCHAR(180) NOT NULL, type VARCHAR(40) NOT NULL, category VARCHAR(80) NOT NULL,
 due_date DATE, questions_count INT NOT NULL DEFAULT 10, estimated_minutes INT NOT NULL DEFAULT 15, status VARCHAR(30) NOT NULL DEFAULT 'Pending',
 score NUMERIC(5,2), assessor_user_id INT REFERENCES users(id) ON DELETE SET NULL, subject_user_id INT REFERENCES users(id) ON DELETE SET NULL,
 skill_name VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, completed_at TIMESTAMP
);
CREATE TABLE IF NOT EXISTS assessment_responses (
 id SERIAL PRIMARY KEY, assessment_id INT REFERENCES assessments(id) ON DELETE CASCADE, question_no INT NOT NULL, score INT NOT NULL CHECK(score BETWEEN 0 AND 100),
 UNIQUE(assessment_id, question_no)
);
CREATE TABLE IF NOT EXISTS mentors (
 id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, expertise JSONB NOT NULL DEFAULT '[]', wants_to_learn JSONB NOT NULL DEFAULT '[]',
 department VARCHAR(100), bio TEXT, rating NUMERIC(2,1) DEFAULT 4.5, sessions_count INT DEFAULT 0, UNIQUE(user_id)
);
CREATE TABLE IF NOT EXISTS knowledge_sessions (
 id SERIAL PRIMARY KEY, mentor_id INT REFERENCES mentors(id) ON DELETE CASCADE, topic VARCHAR(180) NOT NULL, description TEXT,
 session_date TIMESTAMP NOT NULL, duration_minutes INT NOT NULL DEFAULT 60, capacity INT NOT NULL DEFAULT 20, status VARCHAR(30) DEFAULT 'Upcoming', meeting_url VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS session_attendees (
 id SERIAL PRIMARY KEY, session_id INT REFERENCES knowledge_sessions(id) ON DELETE CASCADE, user_id INT REFERENCES users(id) ON DELETE CASCADE,
 status VARCHAR(30) DEFAULT 'Registered', registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(session_id, user_id)
);
CREATE TABLE IF NOT EXISTS notifications (
 id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(180) NOT NULL, message TEXT NOT NULL,
 type VARCHAR(50) NOT NULL, read_at TIMESTAMP, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_subject ON assessments(subject_user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON knowledge_sessions(session_date);

CREATE TABLE IF NOT EXISTS session_feedback (id SERIAL PRIMARY KEY, session_id INT REFERENCES knowledge_sessions(id) ON DELETE CASCADE, user_id INT REFERENCES users(id) ON DELETE CASCADE, rating INT NOT NULL CHECK(rating BETWEEN 1 AND 5), comment TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(session_id,user_id));
CREATE TABLE IF NOT EXISTS knowledge_resources (id SERIAL PRIMARY KEY, title VARCHAR(180) NOT NULL, resource_type VARCHAR(40) NOT NULL, skill_name VARCHAR(100), description TEXT, url VARCHAR(500) NOT NULL, author_user_id INT REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS communities (id SERIAL PRIMARY KEY, name VARCHAR(150) UNIQUE NOT NULL, description TEXT, owner_user_id INT REFERENCES users(id) ON DELETE SET NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS community_members (id SERIAL PRIMARY KEY, community_id INT REFERENCES communities(id) ON DELETE CASCADE, user_id INT REFERENCES users(id) ON DELETE CASCADE, joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE(community_id,user_id));
