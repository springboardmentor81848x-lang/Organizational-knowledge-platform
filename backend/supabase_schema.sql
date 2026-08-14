-- ==========================================
-- Supabase PostgreSQL Schema & Seeding (v2.0)
-- Organizational Knowledge Gap Intelligence Platform
-- Milestones 1 & 2 Complete Architecture
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables cleanly for schema refresh
DROP TABLE IF EXISTS learning_path_courses CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS peer_assessments CASCADE;
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS training_courses CASCADE;
DROP TABLE IF EXISTS mentorship_sessions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS skill_gap_snapshots CASCADE;
DROP TABLE IF EXISTS employee_skills CASCADE;
DROP TABLE IF EXISTS role_skill_benchmarks CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS skill_categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- 1. Organizations Table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    description TEXT,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_dept_per_org UNIQUE (name, organization_id)
);

-- 2. Roles Table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL UNIQUE,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table (Supports all 6 System Roles)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    system_role VARCHAR(30) NOT NULL CHECK (
        system_role IN ('EMPLOYEE', 'MANAGER', 'HR_SPECIALIST', 'DEPARTMENT_HEAD', 'L_AND_D_ADMIN', 'SYSTEM_ADMIN')
    ),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    role_title VARCHAR(100),
    avatar_url VARCHAR(255),
    bio TEXT,
    education TEXT,
    experience TEXT,
    company VARCHAR(100) DEFAULT 'KnowledgeIQ Enterprise',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Skill Categories Table
CREATE TABLE skill_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Skills Table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category_id UUID REFERENCES skill_categories(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Role Skill Benchmarks (Proficiency rating 1-5)
CREATE TABLE role_skill_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_level INT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
    is_critical BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_role_skill UNIQUE (role_id, skill_id)
);

-- 7. Employee Skills (Proficiency rating 1-5)
CREATE TABLE employee_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INT NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
    last_assessed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT idx_user_skill UNIQUE (user_id, skill_id)
);

-- 8. Peer Assessments Table (Milestone 1 & 2 Peer Review)
CREATE TABLE peer_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INT CHECK (proficiency_level BETWEEN 1 AND 5),
    feedback TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'COMPLETED', 'DECLINED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. Certifications Table
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(150) NOT NULL,
    credential_id VARCHAR(100),
    credential_url VARCHAR(500),
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(30) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'EXPIRED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Training Courses (Internal & External Resources)
CREATE TABLE training_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    target_level INT CHECK (target_level BETWEEN 1 AND 5),
    provider VARCHAR(100) DEFAULT 'Internal Academy',
    provider_type VARCHAR(30) DEFAULT 'INTERNAL' CHECK (provider_type IN ('INTERNAL', 'EXTERNAL')),
    course_url VARCHAR(500),
    duration_hours INT DEFAULT 8,
    cost NUMERIC(10,2) DEFAULT 0.00,
    difficulty_level VARCHAR(30) DEFAULT 'Intermediate',
    rating NUMERIC(3,2) DEFAULT 4.80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Course Enrollments
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'IN_PROGRESS' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CERTIFIED', 'EXPIRED')),
    progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT idx_user_course UNIQUE (user_id, course_id)
);

-- 12. Learning Paths & Courses (Milestone 2 Adaptive Paths)
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    target_role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_adaptive BOOLEAN DEFAULT TRUE,
    recommendation_score NUMERIC(5,2) DEFAULT 90.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE learning_path_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES training_courses(id) ON DELETE CASCADE,
    step_order INT DEFAULT 1,
    CONSTRAINT idx_path_course UNIQUE (learning_path_id, course_id)
);

-- 13. Mentorship Sessions
CREATE TABLE mentorship_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    focus_skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'COMPLETED', 'CANCELLED')),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- 14. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    related_entity_type VARCHAR(50),
    related_entity_id VARCHAR(100),
    action_url VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Skill Gap Snapshots (Trend Analysis)
CREATE TABLE skill_gap_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_gaps INT NOT NULL DEFAULT 0,
    critical_gaps INT NOT NULL DEFAULT 0,
    avg_gap_score DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    gap_percent INT NOT NULL DEFAULT 0,
    snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- SEED DATA MIGRATION FOR ALL 6 ROLES
-- ==========================================

-- Insert Departments
INSERT INTO departments (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Engineering', 'Software Engineering, Infrastructure & Cloud Services'),
('22222222-2222-2222-2222-222222222222', 'Data & AI', 'Machine Learning, Analytics & Data Science'),
('33333333-3333-3333-3333-333333333333', 'Product & Design', 'Product Management, UX/UI Design & Strategy'),
('44444444-4444-4444-4444-444444444444', 'Human Resources', 'Talent Management, L&D & Operations')
ON CONFLICT (name) DO NOTHING;

-- Insert Roles
INSERT INTO roles (id, title, department_id, description) VALUES
('a1111111-1111-1111-1111-111111111111', 'Senior Full Stack Engineer', '11111111-1111-1111-1111-111111111111', 'Leads web application design and implementation'),
('a2222222-2222-2222-2222-222222222222', 'Engineering Lead', '11111111-1111-1111-1111-111111111111', 'Manages engineering team technical strategy & delivery'),
('a3333333-3333-3333-3333-333333333333', 'Data Science Specialist', '22222222-2222-2222-2222-222222222222', 'Builds predictive analytics and machine learning models'),
('a4444444-4444-4444-4444-444444444444', 'HR Business Partner', '44444444-4444-4444-4444-444444444444', 'Oversees organizational talent intelligence'),
('a5555555-5555-5555-5555-555555555555', 'L&D Program Lead', '44444444-4444-4444-4444-444444444444', 'Curates internal and external learning catalogs')
ON CONFLICT (title) DO NOTHING;

-- Insert Skill Categories
INSERT INTO skill_categories (id, name, description) VALUES
('c1111111-1111-1111-1111-111111111111', 'Cloud & Architecture', 'Cloud platforms, microservices, micro-frontend, AWS, Docker'),
('c2222222-2222-2222-2222-222222222222', 'AI & Machine Learning', 'LLMs, PyTorch, Scikit-Learn, Deep Learning, Recommendation Systems'),
('c3333333-3333-3333-3333-333333333333', 'Security & Compliance', 'OAuth2, JWT, Cybersecurity Standards, Vulnerability Scanning'),
('c4444444-4444-4444-4444-444444444444', 'Leadership & Strategy', 'Team Coaching, Strategic Forecasting, Stakeholder Communication')
ON CONFLICT (name) DO NOTHING;

-- Insert Skills (Valid hex UUIDs)
INSERT INTO skills (id, name, category_id, description) VALUES
('b1111111-1111-1111-1111-111111111111', 'AWS Cloud Architecture', 'c1111111-1111-1111-1111-111111111111', 'Designing scalable cloud infrastructure on AWS'),
('b2222222-2222-2222-2222-222222222222', 'React.js & Micro-frontends', 'c1111111-1111-1111-1111-111111111111', 'Modern single-page applications and component architectures'),
('b3333333-3333-3333-3333-333333333333', 'Spring Boot & Microservices', 'c1111111-1111-1111-1111-111111111111', 'Java enterprise REST API services'),
('b4444444-4444-4444-4444-444444444444', 'AI & Recommendation Systems', 'c2222222-2222-2222-2222-222222222222', 'Building adaptive recommendation engines and vector models'),
('b5555555-5555-5555-5555-555555555555', 'Cybersecurity & OAuth2', 'c3333333-3333-3333-3333-333333333333', 'Enterprise access management, JWT, and threat assessment'),
('b6666666-6666-6666-6666-666666666666', 'Strategic Workforce Leadership', 'c4444444-4444-4444-4444-444444444444', 'Mentoring engineering teams and strategic forecasting')
ON CONFLICT (name) DO NOTHING;

-- Insert Role Skill Benchmarks (Proficiency 1-5)
INSERT INTO role_skill_benchmarks (role_id, skill_id, required_level, is_critical) VALUES
('a1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 4, true),
('a1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 5, true),
('a1111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 4, false),
('a1111111-1111-1111-1111-111111111111', 'b5555555-5555-5555-5555-555555555555', 4, true),
('a2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 5, true),
('a2222222-2222-2222-2222-222222222222', 'b6666666-6666-6666-6666-666666666666', 5, true)
ON CONFLICT DO NOTHING;

-- Insert Training Courses (Valid hex UUIDs for courses)
INSERT INTO training_courses (id, title, description, target_skill_id, target_level, provider, provider_type, course_url, duration_hours, cost, difficulty_level, rating) VALUES
('d1111111-1111-1111-1111-111111111111', 'Advanced AWS Cloud Solutions Architect', 'Master cloud architecture, microservices deployment, and serverless infrastructure', 'b1111111-1111-1111-1111-111111111111', 4, 'Coursera', 'EXTERNAL', 'https://www.coursera.org/learn/aws-cloud-architect', 16, 49.00, 'Advanced', 4.90),
('d2222222-2222-2222-2222-222222222222', 'React 18 & Micro-Frontend Mastery', 'Deep dive into state management, web workers, performance tuning, and React micro-frontends', 'b2222222-2222-2222-2222-222222222222', 5, 'KnowledgeIQ Academy', 'INTERNAL', 'https://academy.knowledgeiq.internal/courses/react-mastery', 12, 0.00, 'Advanced', 4.85),
('d3333333-3333-3333-3333-333333333333', 'Enterprise Spring Boot Microservices Security', 'Secure microservice REST endpoints with Spring Security, JWT, and OAuth2', 'b5555555-5555-5555-5555-555555555555', 4, 'Udemy', 'EXTERNAL', 'https://www.udemy.com/course/spring-boot-security-mastery', 10, 29.00, 'Intermediate', 4.75),
('d4444444-4444-4444-4444-444444444444', 'AI & Machine Learning Recommendation Engines', 'Build neural network and matrix factorization recommendation engines', 'b4444444-4444-4444-4444-444444444444', 4, 'LinkedIn Learning', 'EXTERNAL', 'https://www.linkedin.com/learning/ai-recommendation-systems', 14, 39.00, 'Advanced', 4.88)
ON CONFLICT DO NOTHING;

-- Insert Learning Paths (Valid hex UUIDs for learning paths)
INSERT INTO learning_paths (id, title, description, target_role_id, department_id, is_adaptive, recommendation_score) VALUES
('e1111111-1111-1111-1111-111111111111', 'Senior Full Stack & Cloud Mastery Path', 'Targeted path to elevate AWS, React, and OAuth2 security skills to Senior level', 'a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', true, 96.50),
('e2222222-2222-2222-2222-222222222222', 'AI & Data Engineering Accelerator', 'Specialized track for machine learning engineers and data specialists', 'a3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', true, 92.00)
ON CONFLICT DO NOTHING;

INSERT INTO learning_path_courses (learning_path_id, course_id, step_order) VALUES
('e1111111-1111-1111-1111-111111111111', 'd2222222-2222-2222-2222-222222222222', 1),
('e1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 2),
('e1111111-1111-1111-1111-111111111111', 'd3333333-3333-3333-3333-333333333333', 3)
ON CONFLICT DO NOTHING;
