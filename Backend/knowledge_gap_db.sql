-- =============================================================
-- Organizational Knowledge Gap Intelligence Platform
-- Clean Fresh Seed Database Creation Script
-- =============================================================

-- Drop all existing tables completely in reverse dependency order
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
DROP TABLE IF EXISTS mentor_profile CASCADE;
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
-- Table: mentor_profile
-- -------------------------------------------------------------
CREATE TABLE mentor_profile (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    expertise VARCHAR(255),
    experience_years INT,
    availability VARCHAR(255),
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
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255),
    description TEXT,
    skill_name VARCHAR(255),
    level VARCHAR(50),
    duration_hours INT,
    course_link VARCHAR(512)
);

-- -------------------------------------------------------------
-- Table: learning_paths
-- -------------------------------------------------------------
CREATE TABLE learning_paths (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    skill_name VARCHAR(255),
    current_level VARCHAR(50),
    target_level VARCHAR(50),
    course_title VARCHAR(255),
    course_level VARCHAR(50),
    sequence_order INT,
    estimated_hours INT,
    course_link VARCHAR(512),
    provider VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =============================================================
-- EXPLICIT USER LIST SEED DATA
-- Password for ALL seed accounts is: password123
-- Verified Spring Security BCrypt Hash:
-- $2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6
-- =============================================================

-- 1. Departments
INSERT INTO department (id, name, description) VALUES
(1, 'Backend Engineering', 'Core product microservice design and Spring Boot REST platform APIs.'),
(2, 'Frontend Engineering', 'Modern UI/UX design with React and Android components.'),
(3, 'Data Science', 'Data engineering, machine learning analytics, and AI model integration.'),
(4, 'Cloud/DevOps', 'CI/CD pipeline automation, Kubernetes clusters, and cloud platform monitoring.'),
(5, 'Cybersecurity', 'Security auditing, IAM access controls, and compliance monitoring.'),
(6, 'Product', 'Product strategy, roadmap planning, and UI/UX design execution.'),
(7, 'Human Resources', 'Talent acquisition and organizational competency evaluation.');

-- 2. Job Roles
INSERT INTO job_role (id, role_name, department, description) VALUES
(1, 'Senior Java Backend Engineer', 'Backend Engineering', 'Architects scalable microservices and Spring Boot REST APIs.'),
(2, 'Frontend React Engineer', 'Frontend Engineering', 'Builds responsive Web dashboards and mobile-ready user interfaces.'),
(3, 'AI/ML Data Scientist', 'Data Science', 'Builds predictive analytics, LLM fine-tuning, and NLP platform features.'),
(4, 'Data Platform Engineer', 'Data Science', 'Constructs ETL pipelines, data warehouses, and streaming data feeds.'),
(5, 'Lead Product Manager', 'Product', 'Drives product vision, user journey milestones, and cross-team roadmaps.'),
(6, 'HR Talent Specialist', 'Human Resources', 'Oversees organizational competency evaluation and employee skill growth.'),
(7, 'Cloud DevOps Engineer', 'Cloud/DevOps', 'Manages CI/CD pipelines, Docker containers, and Cloud infrastructure.'),
(8, 'Cybersecurity Analyst', 'Cybersecurity', 'Audits cloud security posture, IAM access rules, and vulnerability patches.');

-- 3. Skills Catalog
INSERT INTO skill (id, skill_name, category, level, description) VALUES
(1, 'Java & Spring Boot', 'Backend Development', 'Advanced', 'Building enterprise RESTful microservices with Spring Security and JPA.'),
(2, 'PostgreSQL Database Management', 'Database', 'Intermediate', 'Relational database schema design, indexing, and SQL performance tuning.'),
(3, 'React & Modern Frontend', 'Frontend Development', 'Advanced', 'Single Page Application development using React, Hooks, and Redux.'),
(4, 'AI/ML & LLM Integration', 'Data Science', 'Advanced', 'Implementing Machine Learning pipelines and HuggingFace LLM inference.'),
(5, 'Docker & Containerization', 'DevOps', 'Intermediate', 'Packaging multi-tier applications with Docker container manifests.'),
(6, 'Kubernetes & Cloud Architecture', 'Cloud & DevOps', 'Advanced', 'Managing containerized deployments on cloud platforms.'),
(7, 'REST API Design', 'Backend Development', 'Advanced', 'Standardized OpenAPI / REST HTTP JSON interface design.'),
(8, 'Technical Documentation & Writing', 'Communication', 'Intermediate', 'Creating technical architecture diagrams and user-facing reports.'),
(9, 'Product Lifecycle Management', 'Management', 'Advanced', 'Agile milestone tracking, requirement scoping, and strategic planning.'),
(10, 'Cyber Risk Assessment', 'Cybersecurity', 'Advanced', 'Threat modeling, security compliance, and vulnerability scanning.'),
(11, 'Data Pipelines & BigQuery', 'Data Engineering', 'Advanced', 'Building automated ETL data pipelines and analytics queries.'),
(12, 'UI/UX Design & Prototyping', 'Design', 'Intermediate', 'Wireframing, design systems, and user journey mapping.');

-- 4. Competency Requirements per Job Role
INSERT INTO competency_requirement (job_role_id, skill_id, required_proficiency_level) VALUES
(1, 1, 'EXPERT'), (1, 2, 'ADVANCED'), (1, 5, 'INTERMEDIATE'), (1, 7, 'EXPERT'), (1, 8, 'INTERMEDIATE'),
(2, 3, 'EXPERT'), (2, 7, 'ADVANCED'), (2, 12, 'ADVANCED'), (2, 8, 'INTERMEDIATE'),
(3, 4, 'EXPERT'), (3, 11, 'ADVANCED'), (3, 1, 'INTERMEDIATE'), (3, 2, 'ADVANCED'),
(4, 11, 'EXPERT'), (4, 2, 'EXPERT'), (4, 5, 'ADVANCED'), (4, 6, 'INTERMEDIATE'),
(5, 9, 'EXPERT'), (5, 8, 'ADVANCED'), (5, 7, 'INTERMEDIATE'), (5, 12, 'INTERMEDIATE'),
(6, 8, 'EXPERT'), (6, 9, 'INTERMEDIATE'),
(7, 5, 'EXPERT'), (7, 6, 'EXPERT'), (7, 10, 'ADVANCED'), (7, 2, 'INTERMEDIATE'),
(8, 10, 'EXPERT'), (8, 6, 'ADVANCED'), (8, 8, 'ADVANCED');


-- 5. EXPLICIT SEED USERS & EMPLOYEES
-- Password for ALL users below is: password123
INSERT INTO app_users (id, full_name, email, password, role) VALUES
(1, 'System Admin', 'admin@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'ADMIN'),
(2, 'Vikram Mehta', 'manager@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MANAGER'),
(3, 'Priya Patel', 'hr@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'HR'),
(4, 'Aarav Sharma', 'aarav.sharma@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'EMPLOYEE'),
(5, 'Rohan Gupta', 'rohan.gupta@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'EMPLOYEE'),
(6, 'Ananya Roy', 'ananya.roy@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'EMPLOYEE'),
(7, 'David Miller', 'david.miller@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'EMPLOYEE'),
(8, 'Neha Singh', 'neha.singh@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'EMPLOYEE'),
(9, 'Sarah Johnson', 'employee2@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'EMPLOYEE'),
(10, 'Backend Dept Head', 'depthead.backend@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
(11, 'Frontend Dept Head', 'depthead.frontend@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
(12, 'Data Dept Head', 'depthead.data@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
(13, 'DevOps Dept Head', 'depthead.devops@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
(14, 'Security Dept Head', 'depthead.security@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
(15, 'Product Dept Head', 'depthead.product@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'DEPARTMENT_HEAD'),
(16, 'Michael Chen', 'mentor@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR'),
(17, 'L&D Admin', 'lnd.admin@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'LEARNING_DEVELOPMENT_ADMIN'),
(18, 'Alex Rivera', 'alex.rivera@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR'),
(19, 'Sarah Jenkins', 'sarah.jenkins@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR'),
(20, 'Ramesh Rao', 'ramesh.rao@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR'),
(21, 'Elena Vance', 'elena.vance@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR'),
(22, 'David Kim', 'david.kim@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR'),
(23, 'Sophia Martinez', 'sophia.martinez@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR'),
(24, 'Liam O''Connor', 'liam.oconnor@kgap.com', '$2a$10$mFxEqIPzY1kC6ex5mRf.zunDKbZyU2EnEnGZjdT7x1qYPOZ.F5Km6', 'MENTOR');

INSERT INTO employee (id, first_name, last_name, email, phone_number, department, role, job_role_id, experience, education, bio) VALUES
(1, 'System', 'Admin', 'admin@kgap.com', '+91-9876543213', 'Software Engineering', 'ADMIN', 1, '10+ Years Systems Admin', 'B.S. IT', 'Platform Administrator overseeing user roles and system catalogs.'),
(2, 'Vikram', 'Mehta', 'manager@kgap.com', '+91-9876543211', 'Backend Engineering', 'MANAGER', 1, '8+ Years Tech Lead', 'M.Tech SE', 'Engineering Lead driving backend microservice architecture.'),
(3, 'Priya', 'Patel', 'hr@kgap.com', '+91-9876543212', 'Human Resources', 'HR', 6, '6 Years HR Ops', 'MA HR', 'HR Specialist leading competency mapping and employee development.'),
(4, 'Aarav', 'Sharma', 'aarav.sharma@kgap.com', '+91-9876543210', 'Backend Engineering', 'EMPLOYEE', 1, '3+ Years Backend', 'B.Tech CS', 'Backend Java Engineer developing Spring Boot REST APIs.'),
(5, 'Rohan', 'Gupta', 'rohan.gupta@kgap.com', '+91-9876543214', 'Frontend Engineering', 'EMPLOYEE', 2, '2 Years Frontend', 'B.E. IT', 'Frontend React Engineer creating modern UI components.'),
(6, 'Ananya', 'Roy', 'ananya.roy@kgap.com', '+91-9876543215', 'Data Science', 'EMPLOYEE', 3, '4 Years Data Science', 'M.S. Data Analytics', 'AI/ML Data Scientist building LLM and NLP inference pipelines.'),
(7, 'David', 'Miller', 'david.miller@kgap.com', '+1-555-0108', 'Cloud/DevOps', 'EMPLOYEE', 7, '5 Years DevOps', 'B.S. Comp Eng', 'Cloud DevOps Engineer managing Kubernetes and CI/CD automation.'),
(8, 'Neha', 'Singh', 'neha.singh@kgap.com', '+91-9876543217', 'Cybersecurity', 'EMPLOYEE', 8, '3 Years Security', 'B.Tech Cyber Security', 'Cybersecurity Analyst auditing IAM rules and threat assessments.'),
(9, 'Sarah', 'Johnson', 'employee2@kgap.com', '+1-555-0102', 'Product', 'EMPLOYEE', 5, '5 Years PM Strategy', 'MBA, Stanford', 'Lead Product Manager guiding product roadmaps and user journey design.'),
(10, 'Backend', 'Dept Head', 'depthead.backend@kgap.com', '+91-9876543301', 'Backend Engineering', 'DEPARTMENT_HEAD', 1, '9+ Years Backend Leadership', 'M.Tech CS', 'Department Head for Backend Engineering.'),
(11, 'Frontend', 'Dept Head', 'depthead.frontend@kgap.com', '+91-9876543302', 'Frontend Engineering', 'DEPARTMENT_HEAD', 2, '8+ Years Frontend Leadership', 'B.Tech CS', 'Department Head for Frontend Engineering.'),
(12, 'Data', 'Dept Head', 'depthead.data@kgap.com', '+91-9876543303', 'Data Science', 'DEPARTMENT_HEAD', 3, '10+ Years Data Leadership', 'Ph.D. Statistics', 'Department Head for Data Science.'),
(13, 'DevOps', 'Dept Head', 'depthead.devops@kgap.com', '+91-9876543304', 'Cloud/DevOps', 'DEPARTMENT_HEAD', 7, '8+ Years DevOps Leadership', 'B.S. Comp Eng', 'Department Head for Cloud/DevOps.'),
(14, 'Security', 'Dept Head', 'depthead.security@kgap.com', '+91-9876543305', 'Cybersecurity', 'DEPARTMENT_HEAD', 8, '9+ Years Security Leadership', 'M.S. Cybersecurity', 'Department Head for Cybersecurity.'),
(15, 'Product', 'Dept Head', 'depthead.product@kgap.com', '+91-9876543306', 'Product', 'DEPARTMENT_HEAD', 5, '8+ Years Product Leadership', 'MBA', 'Department Head for Product.'),
(16, 'Michael', 'Chen', 'mentor@kgap.com', '+1-555-0151', 'Backend Engineering', 'MENTOR', 1, '12+ Years Mentoring', 'M.S. CS', 'Senior Mentor providing backend engineering guidance.'),
(17, 'L&D', 'Admin', 'lnd.admin@kgap.com', '+1-555-0152', NULL, 'LEARNING_DEVELOPMENT_ADMIN', 6, '7 Years L&D', 'MBA Learning Design', 'Org-wide Learning & Development administrator.'),
(18, 'Alex', 'Rivera', 'alex.rivera@kgap.com', '+1-555-0153', 'Engineering', 'MENTOR', 1, '15 Years', 'B.S. CS', 'Java performance tuning specialist.'),
(19, 'Sarah', 'Jenkins', 'sarah.jenkins@kgap.com', '+1-555-0154', 'Cloud', 'MENTOR', 7, '8 Years', 'M.S. Cloud', 'Cloud native infrastructure expert.'),
(20, 'Ramesh', 'Rao', 'ramesh.rao@kgap.com', '+91-9876543401', 'Engineering', 'MENTOR', 1, '5 Years', 'B.Tech', 'Strong background in enterprise Java.'),
(21, 'Elena', 'Vance', 'elena.vance@kgap.com', '+1-555-0155', 'Security', 'MENTOR', 8, '10 Years', 'Ph.D. Security', 'Expert in application security.'),
(22, 'David', 'Kim', 'david.kim@kgap.com', '+1-555-0156', 'Mobile', 'MENTOR', 2, '7 Years', 'B.S. Mobile', 'Android development expert.'),
(23, 'Sophia', 'Martinez', 'sophia.martinez@kgap.com', '+1-555-0157', 'Frontend', 'MENTOR', 2, '6 Years', 'M.S. UI', 'Modern web development specialist.'),
(24, 'Liam', 'O''Connor', 'liam.oconnor@kgap.com', '+1-555-0158', 'Engineering', 'MENTOR', 1, '9 Years', 'B.S. DB', 'DB performance and scaling expert.');


-- 6. Mentor Profiles
INSERT INTO mentor_profile (id, employee_id, expertise, experience_years, availability, bio) VALUES
(1, 4, 'Java', 3, 'Available', 'Strong proficiency in Java and suitable for the identified skill gap.'),
(2, 6, 'Java', 5, 'Available', 'Expert knowledge in high-performance Java systems.'),
(3, 16, 'System Design', 12, 'Busy', 'Expert in scalable architectures.'),
(4, 18, 'Java', 15, 'Available', 'Java performance tuning specialist.'),
(5, 19, 'Kubernetes', 8, 'Available', 'Cloud native infrastructure expert.'),
(6, 20, 'Java & Spring Boot', 5, 'Available', 'Strong background in enterprise Java.'),
(7, 21, 'Cybersecurity', 10, 'Available', 'Expert in application security.'),
(8, 22, 'Kotlin', 7, 'Available', 'Android development expert.'),
(9, 23, 'React', 6, 'Busy', 'Modern web development specialist.'),
(10, 24, 'PostgreSQL', 9, 'Available', 'DB performance and scaling expert.');


-- 7. Employee Skill Ratings
INSERT INTO employee_skill (employee_id, skill_id, proficiency_level) VALUES
(1, 1, 'EXPERT'), (1, 2, 'EXPERT'), (1, 5, 'EXPERT'),
(2, 1, 'EXPERT'), (2, 2, 'ADVANCED'), (2, 5, 'ADVANCED'), (2, 7, 'EXPERT'),
(3, 8, 'EXPERT'), (3, 9, 'ADVANCED'),
(4, 1, 'INTERMEDIATE'), (4, 2, 'BEGINNER'), (4, 5, 'BEGINNER'), (4, 7, 'INTERMEDIATE'),
(5, 3, 'INTERMEDIATE'), (5, 7, 'BEGINNER'), (5, 12, 'BEGINNER'), (5, 8, 'INTERMEDIATE'),
(6, 4, 'ADVANCED'), (6, 11, 'INTERMEDIATE'), (6, 1, 'BEGINNER'), (6, 2, 'INTERMEDIATE'),
(7, 5, 'ADVANCED'), (7, 6, 'INTERMEDIATE'), (7, 10, 'BEGINNER'), (7, 2, 'BEGINNER'),
(8, 10, 'ADVANCED'), (8, 6, 'BEGINNER'), (8, 8, 'INTERMEDIATE'),
(9, 9, 'INTERMEDIATE'), (9, 8, 'BEGINNER'), (9, 7, 'BEGINNER'), (9, 12, 'INTERMEDIATE');


-- 8. Skill Gaps Matrix
INSERT INTO skill_gaps (employee_id, job_role_id, skill_id, current_proficiency, required_proficiency, gap_score, gap_level, analyzed_at) VALUES
(4, 1, 1, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(4, 1, 2, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),
(4, 1, 5, 'BEGINNER', 'INTERMEDIATE', 1, 'LOW', CURRENT_TIMESTAMP),
(4, 1, 7, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),

(5, 2, 3, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(5, 2, 7, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),
(5, 2, 12, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),

(6, 3, 4, 'ADVANCED', 'EXPERT', 1, 'LOW', CURRENT_TIMESTAMP),
(6, 3, 11, 'INTERMEDIATE', 'ADVANCED', 1, 'LOW', CURRENT_TIMESTAMP),
(6, 3, 1, 'BEGINNER', 'INTERMEDIATE', 1, 'LOW', CURRENT_TIMESTAMP),

(7, 7, 5, 'ADVANCED', 'EXPERT', 1, 'LOW', CURRENT_TIMESTAMP),
(7, 7, 6, 'INTERMEDIATE', 'EXPERT', 2, 'HIGH', CURRENT_TIMESTAMP),
(7, 7, 10, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),

(8, 8, 10, 'ADVANCED', 'EXPERT', 1, 'LOW', CURRENT_TIMESTAMP),
(8, 8, 6, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),

(9, 5, 9, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(9, 5, 8, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),
(9, 5, 7, 'BEGINNER', 'INTERMEDIATE', 1, 'LOW', CURRENT_TIMESTAMP);


-- 9. AI Recommendations Initial Seed Data
INSERT INTO ai_recommendations (employee_id, skill_id, gap_level, recommendation, source, created_at) VALUES
(9, 8, 'HIGH', 'Focus on Technical Documentation & Writing. Step 1: Complete Technical Communication Course. Step 2: Practice drafting software specification docs.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP),
(4, 2, 'HIGH', 'Master PostgreSQL & Database Tuning. Step 1: Learn PostgreSQL indexing strategies. Step 2: Practice writing query execution plans (EXPLAIN ANALYZE).', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP),
(5, 7, 'HIGH', 'Enhance REST API Design. Step 1: Study OpenAPI 3.0 standards. Step 2: Practice building secure REST endpoints.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP),
(7, 6, 'HIGH', 'Master Kubernetes Orchestration. Step 1: Complete CKAD path. Step 2: Practice Helm deployments.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP);


-- 10. External Courses Initial Seed Data
INSERT INTO external_courses (id, title, provider, description, skill_name, level, duration_hours, course_link) VALUES
(1, 'Mastering Java 21 & Spring Boot Microservices', 'Udemy Academy', 'Comprehensive guide to enterprise microservices, Spring Security, and Hibernate JPA.', 'Java & Spring Boot', 'EXPERT', 40, 'https://www.udemy.com/course/spring-boot-masterclass/'),
(2, 'PostgreSQL Administration & Query Optimization', 'Coursera', 'Deep dive into relational database schema design, B-tree indexes, and SQL performance tuning.', 'PostgreSQL Database Management', 'ADVANCED', 25, 'https://www.coursera.org/specializations/postgresql-for-everybody'),
(3, 'Modern React 18, Redux & TypeScript', 'Pluralsight', 'Single Page Application development using modern React components, Hooks, and Redux Toolkit.', 'React & Modern Frontend', 'EXPERT', 35, 'https://www.pluralsight.com/courses/react-js-getting-started'),
(4, 'LLM Architecture & HuggingFace Fine-Tuning', 'DeepLearning.AI', 'Build AI/ML pipelines, implement HuggingFace Llama inference, and fine-tune models.', 'AI/ML & LLM Integration', 'EXPERT', 30, 'https://www.deeplearning.ai/courses/generative-ai-with-llms/'),
(5, 'Docker & Container Mastery for Developers', 'Udemy Academy', 'Package multi-tier applications with Docker container manifests and multi-stage builds.', 'Docker & Containerization', 'INTERMEDIATE', 15, 'https://www.udemy.com/course/docker-mastery/'),
(6, 'Certified Kubernetes Application Developer (CKAD)', 'Linux Foundation', 'Hands-on Kubernetes cluster orchestration, deployments, services, and cloud architecture.', 'Kubernetes & Cloud Architecture', 'EXPERT', 50, 'https://training.linuxfoundation.org/training/certified-kubernetes-application-developer-ckad/'),
(7, 'RESTful API Design & OpenAPI 3.0 Standard', 'LinkedIn Learning', 'Standardized REST API interface design, HTTP status codes, and API security practices.', 'REST API Design', 'EXPERT', 12, 'https://www.linkedin.com/learning/api-design-in-node-js-using-express-v4'),
(8, 'Technical Documentation & Writing', 'Google Tech Writing', 'Creating technical architecture diagrams, API docs, and user-facing reports.', 'Technical Documentation & Writing', 'ADVANCED', 10, 'https://developers.google.com/tech-writing'),
(9, 'Agile Product Management & Roadmap Execution', 'Product School', 'Agile milestone tracking, product vision scoping, and strategic cross-team planning.', 'Product Lifecycle Management', 'EXPERT', 20, 'https://productschool.com/'),
(10, 'Enterprise Cyber Risk Assessment & Vulnerability Audit', 'SANS Institute', 'Threat modeling, security compliance auditing, IAM access controls, and vulnerability scanning.', 'Cyber Risk Assessment', 'EXPERT', 45, 'https://www.sans.org/cyber-security-courses/security-strategic-planning-policy-leadership/'),
(11, 'Building BigQuery Data Pipelines & Data Lakes', 'Google Cloud Training', 'Building automated ETL data pipelines, BigQuery analytics, and streaming data feeds.', 'Data Pipelines & BigQuery', 'ADVANCED', 28, 'https://www.cloudskillsboost.google/course_templates/3'),
(12, 'Figma UI/UX Design & Component Design Systems', 'Interaction Design Foundation', 'Wireframing, modern design systems, user journey mapping, and interactive prototypes.', 'UI/UX Design & Prototyping', 'ADVANCED', 18, 'https://www.interaction-design.org/courses/design-systems-for-figma');


-- 11. Reset Sequences to match max inserted IDs
SELECT setval(pg_get_serial_sequence('app_users', 'id'), COALESCE(MAX(id), 1)) FROM app_users;
SELECT setval(pg_get_serial_sequence('department', 'id'), COALESCE(MAX(id), 1)) FROM department;
SELECT setval(pg_get_serial_sequence('job_role', 'id'), COALESCE(MAX(id), 1)) FROM job_role;
SELECT setval(pg_get_serial_sequence('employee', 'id'), COALESCE(MAX(id), 1)) FROM employee;
SELECT setval(pg_get_serial_sequence('skill', 'id'), COALESCE(MAX(id), 1)) FROM skill;
SELECT setval(pg_get_serial_sequence('employee_skill', 'id'), COALESCE(MAX(id), 1)) FROM employee_skill;
SELECT setval(pg_get_serial_sequence('competency_requirement', 'id'), COALESCE(MAX(id), 1)) FROM competency_requirement;
SELECT setval(pg_get_serial_sequence('skill_gaps', 'id'), COALESCE(MAX(id), 1)) FROM skill_gaps;
SELECT setval(pg_get_serial_sequence('ai_recommendations', 'id'), COALESCE(MAX(id), 1)) FROM ai_recommendations;
SELECT setval(pg_get_serial_sequence('external_courses', 'id'), COALESCE(MAX(id), 1)) FROM external_courses;
SELECT setval(pg_get_serial_sequence('learning_paths', 'id'), COALESCE(MAX(id), 1)) FROM learning_paths;
SELECT setval(pg_get_serial_sequence('mentor_profile', 'id'), COALESCE(MAX(id), 1)) FROM mentor_profile;
