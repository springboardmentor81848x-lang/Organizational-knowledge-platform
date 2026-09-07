-- Organizational Knowledge Gap Intelligence Platform
-- PostgreSQL Database Creation & Seed Data Script

-- 1. Create Database (Run separately if needed: CREATE DATABASE knowledge_gap;)
-- \c knowledge_gap;

-- Drop tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS ai_recommendations CASCADE;
DROP TABLE IF EXISTS skill_gaps CASCADE;
DROP TABLE IF EXISTS learning_paths CASCADE;
DROP TABLE IF EXISTS external_courses CASCADE;
DROP TABLE IF EXISTS competency_requirement CASCADE;
DROP TABLE IF EXISTS employee_skill CASCADE;
DROP TABLE IF EXISTS skill CASCADE;
DROP TABLE IF EXISTS employee CASCADE;
DROP TABLE IF EXISTS job_role CASCADE;
DROP TABLE IF EXISTS department CASCADE;
DROP TABLE IF EXISTS app_users CASCADE;

-- -------------------------------------------------------------
-- Table: app_users
-- -------------------------------------------------------------
CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
);

-- -------------------------------------------------------------
-- Table: department
-- -------------------------------------------------------------
CREATE TABLE department (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- -------------------------------------------------------------
-- Table: job_role
-- -------------------------------------------------------------
CREATE TABLE job_role (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    description TEXT
);

-- -------------------------------------------------------------
-- Table: employee
-- -------------------------------------------------------------
CREATE TABLE employee (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(50),
    department VARCHAR(255),
    role VARCHAR(50),
    job_role_id BIGINT,
    experience VARCHAR(255),
    education VARCHAR(255),
    bio TEXT
);

-- -------------------------------------------------------------
-- Table: skill
-- -------------------------------------------------------------
CREATE TABLE skill (
    id BIGSERIAL PRIMARY KEY,
    skill_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    level VARCHAR(50),
    description TEXT
);

-- -------------------------------------------------------------
-- Table: employee_skill
-- -------------------------------------------------------------
CREATE TABLE employee_skill (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level VARCHAR(50) NOT NULL
);

-- -------------------------------------------------------------
-- Table: competency_requirement
-- -------------------------------------------------------------
CREATE TABLE competency_requirement (
    id BIGSERIAL PRIMARY KEY,
    job_role_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    required_proficiency_level VARCHAR(50) NOT NULL
);

-- -------------------------------------------------------------
-- Table: skill_gaps
-- -------------------------------------------------------------
CREATE TABLE skill_gaps (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    job_role_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    current_proficiency VARCHAR(50),
    required_proficiency VARCHAR(50),
    gap_score INT,
    gap_level VARCHAR(50),
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Table: ai_recommendations
-- -------------------------------------------------------------
CREATE TABLE ai_recommendations (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    gap_level VARCHAR(50),
    recommendation TEXT,
    source VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -------------------------------------------------------------
-- Table: external_courses
-- -------------------------------------------------------------
CREATE TABLE external_courses (
    id BIGSERIAL PRIMARY KEY,
    course_name VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    skill_name VARCHAR(255),
    level VARCHAR(50),
    duration VARCHAR(50),
    url VARCHAR(512)
);

-- -------------------------------------------------------------
-- Table: learning_paths
-- -------------------------------------------------------------
CREATE TABLE learning_paths (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    target_level VARCHAR(50),
    estimated_hours INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================
-- SEED DATA INSERTIONS
-- Password for all seed users is 'password123' BCrypt encoded:
-- $2a$10$e.7y3g70aF7KkW2.vYv2ae39Gf2Z8T9z0jWqXh8OqV0.l9W.v/r6O
-- =============================================================

-- Departments
INSERT INTO department (id, name, description) VALUES
(1, 'Software Engineering', 'Core product design, architecture and platform backend development.'),
(2, 'Data & AI', 'Data engineering, machine learning analytics, and intelligence modeling.'),
(3, 'Product Management', 'Product strategy, roadmap planning, and UI/UX design execution.'),
(4, 'Human Resources', 'Talent acquisition, organizational development, and employee growth.');

-- Job Roles
INSERT INTO job_role (id, role_name, department, description) VALUES
(1, 'Senior Java Backend Engineer', 'Software Engineering', 'Architects scalable microservices and Spring Boot REST APIs.'),
(2, 'AI/ML Data Scientist', 'Data & AI', 'Builds predictive analytics, Llama models, and NLP intelligent platform features.'),
(3, 'Lead Product Manager', 'Product Management', 'Drives feature roadmap, agile milestones, and knowledge management.'),
(4, 'HR Talent Specialist', 'Human Resources', 'Oversees organizational competency evaluation and skill gap resolution.');

-- Skills Catalog
INSERT INTO skill (id, skill_name, category, level, description) VALUES
(1, 'Java & Spring Boot', 'Backend Development', 'Advanced', 'Building enterprise RESTful microservices with Spring Security and JPA.'),
(2, 'PostgreSQL Database Management', 'Database', 'Intermediate', 'Relational database schema design, indexing, and SQL optimization.'),
(3, 'AI/ML & LLM Integration', 'Data Science', 'Advanced', 'Implementing Machine Learning pipelines and HuggingFace LLM inference.'),
(4, 'Product Lifecycle Management', 'Management', 'Advanced', 'Agile milestone tracking, requirement scoping, and strategic planning.'),
(5, 'Docker & Containerization', 'DevOps', 'Intermediate', 'Packaging multi-tier applications with Docker container manifests.'),
(6, 'REST API Design', 'Backend Development', 'Advanced', 'Standardized OpenAPI / REST HTTP JSON interface design.'),
(7, 'Technical Documentation & Writing', 'Communication', 'Intermediate', 'Creating technical architecture diagrams and user-facing reports.');

-- Competency Requirements for Job Roles
-- Role 1: Senior Java Backend Engineer
INSERT INTO competency_requirement (job_role_id, skill_id, required_proficiency_level) VALUES
(1, 1, 'EXPERT'),
(1, 2, 'ADVANCED'),
(1, 5, 'INTERMEDIATE'),
(1, 6, 'EXPERT');

-- Role 2: AI/ML Data Scientist
INSERT INTO competency_requirement (job_role_id, skill_id, required_proficiency_level) VALUES
(2, 3, 'EXPERT'),
(2, 1, 'INTERMEDIATE'),
(2, 2, 'ADVANCED');

-- Role 3: Lead Product Manager
INSERT INTO competency_requirement (job_role_id, skill_id, required_proficiency_level) VALUES
(3, 4, 'EXPERT'),
(3, 7, 'ADVANCED'),
(3, 6, 'INTERMEDIATE');

-- Role 4: HR Talent Specialist
INSERT INTO competency_requirement (job_role_id, skill_id, required_proficiency_level) VALUES
(4, 7, 'EXPERT'),
(4, 4, 'INTERMEDIATE');

-- Seed Users (Password: password123)
-- BCrypt encoded hash for 'password123': $2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.
-- We use standard BCrypt hash produced by Spring Security
INSERT INTO app_users (id, full_name, email, password, role) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'EMPLOYEE'),
(2, 'Sarah Johnson', 'employee2@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'EMPLOYEE'),
(3, 'Vikram Mehta', 'manager@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'MANAGER'),
(4, 'Priya Patel', 'hr@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'HR'),
(5, 'System Admin', 'admin@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'ADMIN'),
(6, 'Elena Rostova', 'elena.rostova@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'EMPLOYEE'),
(7, 'Dev Patel', 'dev.patel@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'EMPLOYEE'),
(8, 'Anita Roy', 'anita.roy@kgap.com', '$2a$10$7793j7Z.qBw.H.j996V3ce3cM/5xKzPjVqJ8N4Jt9w3Z3L.L3b7K.', 'EMPLOYEE');

-- Seed Employees
INSERT INTO employee (id, first_name, last_name, email, phone_number, department, role, job_role_id, experience, education, bio) VALUES
(1, 'Aarav', 'Sharma', 'aarav.sharma@kgap.com', '+91-9876543210', 'Software Engineering', 'EMPLOYEE', 1, '3+ Years in Backend Services', 'B.Tech in Computer Science', 'Passionate software developer focusing on scalable Spring Boot APIs and cloud services.'),
(2, 'Sarah', 'Johnson', 'employee2@kgap.com', '+1-555-0102', 'Product Management', 'EMPLOYEE', 3, '5 Years in PM & Agile Strategy', 'MBA, Stanford University', 'Passionate about building products that users love and solving complex organizational problems with data-driven insights.'),
(3, 'Vikram', 'Mehta', 'manager@kgap.com', '+91-9876543211', 'Software Engineering', 'MANAGER', 1, '8+ Years in Engineering Management', 'M.Tech in Software Engineering', 'Engineering Lead driving platform backend architecture and cross-team execution.'),
(4, 'Priya', 'Patel', 'hr@kgap.com', '+91-9876543212', 'Human Resources', 'HR', 4, '6 Years in Organizational HR', 'MA in Human Resource Management', 'HR Lead specializing in organizational learning, competency mapping, and employee development.'),
(5, 'System', 'Admin', 'admin@kgap.com', '+91-9876543213', 'Software Engineering', 'ADMIN', 1, '10+ Years in Systems Administration', 'B.S. in Information Technology', 'Platform Administrator managing role permissions, system configuration, and organizational catalogs.'),
(6, 'Elena', 'Rostova', 'elena.rostova@kgap.com', '+1-555-0106', 'Software Engineering', 'EMPLOYEE', 1, '4+ Years Backend', 'M.S. in Computer Science', 'Specialist in Cloud Architecture and Kubernetes microservices.'),
(7, 'Dev', 'Patel', 'dev.patel@kgap.com', '+91-9876543217', 'Software Engineering', 'EMPLOYEE', 1, '5+ Years in Database Architecture', 'B.Tech in CS', 'Senior peer developer with deep expertise in PostgreSQL optimization and Microservices.'),
(8, 'Anita', 'Roy', 'anita.roy@kgap.com', '+91-9876543218', 'Software Engineering', 'EMPLOYEE', 1, '1 Year Junior Backend', 'B.Tech in IT', 'Junior developer focusing on Spring Boot basics.');

-- Employee Skills
-- Aarav Sharma (Emp 1, Java Backend)
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(1, 1, 'INTERMEDIATE'),
(1, 2, 'BEGINNER'),
(1, 5, 'BEGINNER'),
(1, 6, 'INTERMEDIATE');

-- Sarah Johnson (Emp 2, Product Manager)
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(2, 4, 'INTERMEDIATE'),
(2, 7, 'BEGINNER'),
(2, 6, 'BEGINNER');

-- Vikram Mehta (Emp 3, Manager)
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(3, 1, 'EXPERT'),
(3, 2, 'ADVANCED'),
(3, 5, 'ADVANCED'),
(3, 6, 'EXPERT');

-- Priya Patel (Emp 4, HR)
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(4, 7, 'EXPERT'),
(4, 4, 'ADVANCED');

-- Elena Rostova (Emp 6, Senior Cloud/Microservices)
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(6, 1, 'ADVANCED'),
(6, 5, 'ADVANCED'),
(6, 6, 'ADVANCED');

-- Dev Patel (Emp 7, Senior Database Architect)
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(7, 2, 'EXPERT'),
(7, 6, 'ADVANCED');

-- Anita Roy (Emp 8, Junior Backend)
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(8, 1, 'BEGINNER'),
(8, 2, 'BEGINNER');

-- Skill Gaps (Initial Analyzed State)
INSERT INTO skill_gaps (employee_id, job_role_id, skill_id, current_proficiency, required_proficiency, gap_score, gap_level, analyzed_at) VALUES
(1, 1, 1, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(1, 1, 2, 'BEGINNER', 'ADVANCED', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(1, 1, 5, 'BEGINNER', 'INTERMEDIATE', 1, 'LOW', CURRENT_TIMESTAMP),
(1, 1, 6, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(2, 3, 4, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(2, 3, 7, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),
(2, 3, 6, 'BEGINNER', 'INTERMEDIATE', 1, 'LOW', CURRENT_TIMESTAMP);

-- AI Recommendations Initial Seed Data
INSERT INTO ai_recommendations (employee_id, skill_id, gap_level, recommendation, source, created_at) VALUES
(2, 7, 'HIGH', 'Focus on Technical Documentation & Writing. Step 1: Complete Technical Communication Course. Step 2: Practice drafting software specification docs. Step 3: Review standard template frameworks.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP),
(2, 4, 'MEDIUM', 'Enhance Product Lifecycle Management. Step 1: Study Advanced Agile Leadership. Step 2: Participate in roadmap planning. Step 3: Earn PMP or Certified Scrum Master credential.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP),
(1, 1, 'MEDIUM', 'Master Advanced Spring Boot. Step 1: Study Spring Security & OAuth2. Step 2: Implement microservice caching with Redis. Step 3: Build reactive REST endpoints using Spring WebFlux.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP);

-- Reset Sequences to match inserted max IDs
SELECT setval(pg_get_serial_sequence('app_users', 'id'), COALESCE(MAX(id), 1)) FROM app_users;
SELECT setval(pg_get_serial_sequence('department', 'id'), COALESCE(MAX(id), 1)) FROM department;
SELECT setval(pg_get_serial_sequence('job_role', 'id'), COALESCE(MAX(id), 1)) FROM job_role;
SELECT setval(pg_get_serial_sequence('employee', 'id'), COALESCE(MAX(id), 1)) FROM employee;
SELECT setval(pg_get_serial_sequence('skill', 'id'), COALESCE(MAX(id), 1)) FROM skill;
SELECT setval(pg_get_serial_sequence('employee_skill', 'id'), COALESCE(MAX(id), 1)) FROM employee_skill;
SELECT setval(pg_get_serial_sequence('competency_requirement', 'id'), COALESCE(MAX(id), 1)) FROM competency_requirement;
SELECT setval(pg_get_serial_sequence('skill_gaps', 'id'), COALESCE(MAX(id), 1)) FROM skill_gaps;
SELECT setval(pg_get_serial_sequence('ai_recommendations', 'id'), COALESCE(MAX(id), 1)) FROM ai_recommendations;
