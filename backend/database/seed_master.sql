-- ============================================================================
-- OKGIP seed_master.sql (v3 — governance reset)
-- Completely wipes existing user/employee data and seeds exactly 20 users
-- across all 6 roles, per an explicit 20-user matrix (2 System Admins,
-- 2 HR Specialists, 2 L&D Admins, 2 Department Heads, 2 Managers,
-- 10 Employees — every Employee in a distinct department).
--
-- ⚠️  DESTRUCTIVE. Run schema_updates.sql first if you haven't. Back up
-- first if you want to keep any existing account (including admin@okgip.org
-- and anything from earlier seed rounds) — there is no undo.
--
-- On "System Administrator" as a role: your roles table has no separate
-- System Administrator row — it's the same 'Admin' role_id, just a display
-- label (confirmed earlier: the User Management dropdown's "System
-- Administrator" option submits value="Admin"). The 2 System Administrator
-- users below are assigned DB role 'Admin'; their designation field says
-- "System Administrator" / "Security Administrator" for display.
--
-- On TRUNCATE scope: the task asked to truncate users, employees,
-- user_roles, knowledge_gaps, mentor_profiles, and employee_learning_paths.
-- Two adjustments made for correctness:
--   1. employee_learning_paths doesn't exist in this schema — the real
--      table is `learning_paths` (employee_id is a direct FK on it, no
--      separate join table needed). Truncating that instead.
--   2. Expanded the truncate list to every table that FKs to employees/
--      users (mentorships, employee_skills, training_assignments,
--      certificates, tasks, leave_requests, messages, notifications, etc).
--      Truncating only the 6 originally-listed tables while leaving these
--      populated would orphan them against employee/user IDs that no
--      longer exist — and since TRUNCATE resets AUTO_INCREMENT back to 1,
--      the NEW employees would silently inherit old rows that happen to
--      reuse the same low IDs (e.g. old mentorship row referencing
--      employee_id=5 would suddenly appear to belong to whoever the new
--      employee #5 is). That's silent data corruption, not a clean reset.
-- ============================================================================

-- SET SQL_SAFE_UPDATES = 0 covers every UPDATE/DELETE in this entire
-- script — MySQL Workbench's safe-update mode blocks any UPDATE/DELETE
-- whose WHERE clause doesn't reference a key column the way it expects,
-- which several statements below (the department_head_id reset, and the
-- department-head JOIN updates) don't satisfy even though they do use real
-- key columns. Disabled for the whole script, restored at the very end.
SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE mentor_request_history;
TRUNCATE TABLE mentorships;
TRUNCATE TABLE mentor_profiles;
TRUNCATE TABLE mentor_requests;
TRUNCATE TABLE employee_skills;
TRUNCATE TABLE knowledge_gaps;
TRUNCATE TABLE learning_path_items;
TRUNCATE TABLE learning_paths;
TRUNCATE TABLE learning_resource_completions;
TRUNCATE TABLE training_assignments;
TRUNCATE TABLE certificates;
TRUNCATE TABLE session_registrations;
TRUNCATE TABLE knowledge_sessions;
TRUNCATE TABLE community_group_members;
TRUNCATE TABLE community_posts;
TRUNCATE TABLE community_groups;
TRUNCATE TABLE leave_requests;
TRUNCATE TABLE tasks;
TRUNCATE TABLE messages;
TRUNCATE TABLE notifications;
TRUNCATE TABLE ai_chat_logs;
TRUNCATE TABLE password_reset_tokens;
TRUNCATE TABLE assessment_results;
TRUNCATE TABLE employee_badges;

-- Clear the department_head_id self-references before truncating employees,
-- so the FK doesn't matter either way (checks are off, but tidy regardless).
UPDATE departments SET department_head_id = NULL;

TRUNCATE TABLE user_roles;
TRUNCATE TABLE employees;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

SET @seed_password_hash = '$2b$10$0RwvBrxxmhmUqdCugp58AOQG8QR0stBQSC4gXbvZYVM83mTasqq4u';

-- ----------------------------------------------------------------------------
-- Departments — one per user below, so every Employee (and everyone else)
-- has a real, distinct department to belong to.
-- ----------------------------------------------------------------------------

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-101', 'IT Infrastructure & System Operations', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'IT Infrastructure & System Operations');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-102', 'Enterprise Security & Access Control', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Enterprise Security & Access Control');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-103', 'Human Resources & Onboarding', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Human Resources & Onboarding');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-104', 'HR Operations & Compliance', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'HR Operations & Compliance');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-105', 'L&D & Talent Development', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'L&D & Talent Development');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-106', 'Corporate Upskilling & Training', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Corporate Upskilling & Training');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-107', 'Engineering & R&D', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Engineering & R&D');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-108', 'Data & Analytics Division', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Data & Analytics Division');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-109', 'Software Engineering Team', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Software Engineering Team');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-110', 'Cloud Infrastructure Team', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Cloud Infrastructure Team');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-111', 'VLSI & Embedded Systems', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'VLSI & Embedded Systems');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-112', 'Cloud & DevOps', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Cloud & DevOps');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-113', 'Data Engineering & AI', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Data Engineering & AI');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-114', 'Cybersecurity & Compliance', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Cybersecurity & Compliance');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-115', 'Frontend Engineering', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Frontend Engineering');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-116', 'Backend Systems Engineering', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Backend Systems Engineering');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-117', 'Mobile Application Development', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Mobile Application Development');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-118', 'Quality Assurance & Automation', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Quality Assurance & Automation');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-119', 'Product Management & Strategy', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Product Management & Strategy');

INSERT INTO departments (department_code, name, status)
SELECT 'DEPT-120', 'Network & Systems Architecture', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM departments WHERE name = 'Network & Systems Architecture');


-- ----------------------------------------------------------------------------
-- 20 users
-- ----------------------------------------------------------------------------
INSERT INTO users (user_code, email, password_hash, first_name, last_name, phone_number, status) VALUES
  ('USER-SEED-01', 'aarav.sharma@gmail.com', @seed_password_hash, 'Aarav', 'Sharma', '+91-98101-10137', 'ACTIVE'),
  ('USER-SEED-02', 'neha.verma@gmail.com', @seed_password_hash, 'Neha', 'Verma', '+91-98102-10274', 'ACTIVE'),
  ('USER-SEED-03', 'ananya.iyer@gmail.com', @seed_password_hash, 'Ananya', 'Iyer', '+91-98103-10411', 'ACTIVE'),
  ('USER-SEED-04', 'rajesh.kumar@gmail.com', @seed_password_hash, 'Rajesh', 'Kumar', '+91-98104-10548', 'ACTIVE'),
  ('USER-SEED-05', 'priya.patel@gmail.com', @seed_password_hash, 'Priya', 'Patel', '+91-98105-10685', 'ACTIVE'),
  ('USER-SEED-06', 'suresh.menon@gmail.com', @seed_password_hash, 'Suresh', 'Menon', '+91-98106-10822', 'ACTIVE'),
  ('USER-SEED-07', 'vikram.malhotra@gmail.com', @seed_password_hash, 'Vikram', 'Malhotra', '+91-98107-10959', 'ACTIVE'),
  ('USER-SEED-08', 'sunita.rao@gmail.com', @seed_password_hash, 'Sunita', 'Rao', '+91-98108-11096', 'ACTIVE'),
  ('USER-SEED-09', 'amit.joshi@gmail.com', @seed_password_hash, 'Amit', 'Joshi', '+91-98109-11233', 'ACTIVE'),
  ('USER-SEED-10', 'deepa.nair@gmail.com', @seed_password_hash, 'Deepa', 'Nair', '+91-98110-11370', 'ACTIVE'),
  ('USER-SEED-11', 'sneha.reddy@gmail.com', @seed_password_hash, 'Sneha', 'Reddy', '+91-98111-11507', 'ACTIVE'),
  ('USER-SEED-12', 'rohan.gupta@gmail.com', @seed_password_hash, 'Rohan', 'Gupta', '+91-98112-11644', 'ACTIVE'),
  ('USER-SEED-13', 'kavya.nair@gmail.com', @seed_password_hash, 'Kavya', 'Nair', '+91-98113-11781', 'ACTIVE'),
  ('USER-SEED-14', 'siddharth.joshi@gmail.com', @seed_password_hash, 'Siddharth', 'Joshi', '+91-98114-11918', 'ACTIVE'),
  ('USER-SEED-15', 'meera.deshmukh@gmail.com', @seed_password_hash, 'Meera', 'Deshmukh', '+91-98115-12055', 'ACTIVE'),
  ('USER-SEED-16', 'arjun.kapoor@gmail.com', @seed_password_hash, 'Arjun', 'Kapoor', '+91-98116-12192', 'ACTIVE'),
  ('USER-SEED-17', 'pooja.hegde@gmail.com', @seed_password_hash, 'Pooja', 'Hegde', '+91-98117-12329', 'ACTIVE'),
  ('USER-SEED-18', 'rahul.saxena@gmail.com', @seed_password_hash, 'Rahul', 'Saxena', '+91-98118-12466', 'ACTIVE'),
  ('USER-SEED-19', 'divya.pillai@gmail.com', @seed_password_hash, 'Divya', 'Pillai', '+91-98119-12603', 'ACTIVE'),
  ('USER-SEED-20', 'karthik.subbaraj@gmail.com', @seed_password_hash, 'Karthik', 'Subbaraj', '+91-98120-12740', 'ACTIVE');

-- ----------------------------------------------------------------------------
-- Role assignments
-- ----------------------------------------------------------------------------
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Admin' AND u.email IN ('aarav.sharma@gmail.com','neha.verma@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'HR Specialist' AND u.email IN ('ananya.iyer@gmail.com','rajesh.kumar@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'L&D Admin / Mentor' AND u.email IN ('priya.patel@gmail.com','suresh.menon@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Department Head' AND u.email IN ('vikram.malhotra@gmail.com','sunita.rao@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Manager' AND u.email IN ('amit.joshi@gmail.com','deepa.nair@gmail.com');

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE r.name = 'Employee' AND u.email IN ('sneha.reddy@gmail.com','rohan.gupta@gmail.com','kavya.nair@gmail.com','siddharth.joshi@gmail.com','meera.deshmukh@gmail.com','arjun.kapoor@gmail.com','pooja.hegde@gmail.com','rahul.saxena@gmail.com','divya.pillai@gmail.com','karthik.subbaraj@gmail.com');

-- ----------------------------------------------------------------------------
-- Employee records (virtual ID cards) — OKGIP-EMP-2026-01 through -20
-- ----------------------------------------------------------------------------
INSERT INTO employees (employee_code, user_id, department_id, designation, joining_date, employment_status, phone, avatar_url)
SELECT 'OKGIP-EMP-2026-01', u.id, d.id, 'System Administrator', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'aarav.sharma@gmail.com' AND d.name = 'IT Infrastructure & System Operations'
UNION ALL SELECT 'OKGIP-EMP-2026-02', u.id, d.id, 'Security Administrator', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'neha.verma@gmail.com' AND d.name = 'Enterprise Security & Access Control'
UNION ALL SELECT 'OKGIP-EMP-2026-03', u.id, d.id, 'HR Specialist', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'ananya.iyer@gmail.com' AND d.name = 'Human Resources & Onboarding'
UNION ALL SELECT 'OKGIP-EMP-2026-04', u.id, d.id, 'HR Operations Specialist', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'rajesh.kumar@gmail.com' AND d.name = 'HR Operations & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-05', u.id, d.id, 'L&D Administrator', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'priya.patel@gmail.com' AND d.name = 'L&D & Talent Development'
UNION ALL SELECT 'OKGIP-EMP-2026-06', u.id, d.id, 'Training Program Manager', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'suresh.menon@gmail.com' AND d.name = 'Corporate Upskilling & Training'
UNION ALL SELECT 'OKGIP-EMP-2026-07', u.id, d.id, 'Department Head', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'vikram.malhotra@gmail.com' AND d.name = 'Engineering & R&D'
UNION ALL SELECT 'OKGIP-EMP-2026-08', u.id, d.id, 'Department Head', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'sunita.rao@gmail.com' AND d.name = 'Data & Analytics Division'
UNION ALL SELECT 'OKGIP-EMP-2026-09', u.id, d.id, 'Engineering Team Lead', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'amit.joshi@gmail.com' AND d.name = 'Software Engineering Team'
UNION ALL SELECT 'OKGIP-EMP-2026-10', u.id, d.id, 'Cloud Infrastructure Team Lead', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'deepa.nair@gmail.com' AND d.name = 'Cloud Infrastructure Team'
UNION ALL SELECT 'OKGIP-EMP-2026-11', u.id, d.id, 'VLSI Design Engineer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'sneha.reddy@gmail.com' AND d.name = 'VLSI & Embedded Systems'
UNION ALL SELECT 'OKGIP-EMP-2026-12', u.id, d.id, 'Cloud Engineer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'rohan.gupta@gmail.com' AND d.name = 'Cloud & DevOps'
UNION ALL SELECT 'OKGIP-EMP-2026-13', u.id, d.id, 'Data Engineer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'kavya.nair@gmail.com' AND d.name = 'Data Engineering & AI'
UNION ALL SELECT 'OKGIP-EMP-2026-14', u.id, d.id, 'Security Engineer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'siddharth.joshi@gmail.com' AND d.name = 'Cybersecurity & Compliance'
UNION ALL SELECT 'OKGIP-EMP-2026-15', u.id, d.id, 'Frontend Developer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'meera.deshmukh@gmail.com' AND d.name = 'Frontend Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-16', u.id, d.id, 'Backend Developer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'arjun.kapoor@gmail.com' AND d.name = 'Backend Systems Engineering'
UNION ALL SELECT 'OKGIP-EMP-2026-17', u.id, d.id, 'Mobile App Developer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'pooja.hegde@gmail.com' AND d.name = 'Mobile Application Development'
UNION ALL SELECT 'OKGIP-EMP-2026-18', u.id, d.id, 'QA Automation Engineer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'rahul.saxena@gmail.com' AND d.name = 'Quality Assurance & Automation'
UNION ALL SELECT 'OKGIP-EMP-2026-19', u.id, d.id, 'Product Analyst', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'divya.pillai@gmail.com' AND d.name = 'Product Management & Strategy'
UNION ALL SELECT 'OKGIP-EMP-2026-20', u.id, d.id, 'Network Engineer', CURDATE(), 'ACTIVE', u.phone_number, '/default-avatar.jpg' FROM users u, departments d WHERE u.email = 'karthik.subbaraj@gmail.com' AND d.name = 'Network & Systems Architecture';

-- ----------------------------------------------------------------------------
-- Assign each Department Head to actually head their department
-- ----------------------------------------------------------------------------
UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-07'
SET d.department_head_id = e.id
WHERE d.name = 'Engineering & R&D';

UPDATE departments d
JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-08'
SET d.department_head_id = e.id
WHERE d.name = 'Data & Analytics Division';

-- ----------------------------------------------------------------------------
-- Initial mentor_profiles for the 2 L&D Admin / Mentor users
-- ----------------------------------------------------------------------------
INSERT INTO mentor_profiles (employee_id, bio, max_active_mentees, is_available)
SELECT e.id, 'L&D lead available for peer mentorship and skill development guidance.', 5, 1
FROM employees e WHERE e.employee_code = 'OKGIP-EMP-2026-05';

INSERT INTO mentor_profiles (employee_id, bio, max_active_mentees, is_available)
SELECT e.id, 'L&D lead available for peer mentorship and skill development guidance.', 5, 1
FROM employees e WHERE e.employee_code = 'OKGIP-EMP-2026-06';


-- ----------------------------------------------------------------------------
-- Everything below this point (skills, gaps, mentorships, sessions,
-- learning paths, AI chat history) was originally a separate file
-- (enrich_seed_data.sql) — merged in here so one script does the full
-- reset + identity + activity data seed end to end.
-- ----------------------------------------------------------------------------


-- ----------------------------------------------------------------------------
-- Two skills that were in an earlier seed round but got lost in the
-- governance-reset rewrite of seed_master.sql.
-- ----------------------------------------------------------------------------
INSERT INTO skills (skill_code, name, category, description, status)
SELECT 'SKL-000007', 'Java & Spring Boot Backend Engineering', 'Technical',
       'Enterprise Java, Spring Boot microservices, JPA/Hibernate, and REST API design.', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'Java & Spring Boot Backend Engineering');

INSERT INTO skills (skill_code, name, category, description, status)
SELECT 'SKL-000008', 'VLSI & Digital Hardware Design', 'Technical',
       'RTL design, Verilog/VHDL, chip verification, and semiconductor architecture.', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM skills WHERE name = 'VLSI & Digital Hardware Design');

-- A few learning resources for those two skills — they had none before,
-- so any learning path built against them would have nothing to show.
INSERT INTO learning_resources (resource_code, platform, title, url, skill_id, difficulty, resource_type, duration_minutes, description, is_free, sequence_order)
SELECT 'RES-7-1', 'YouTube', 'Spring Boot 3 Full Course', 'https://www.youtube.com/results?search_query=Spring+Boot+3+full+course', s.id, 'Beginner', 'Video', 300, 'REST APIs, dependency injection, and Spring Data JPA from scratch.', 1, 1
FROM skills s WHERE s.name = 'Java & Spring Boot Backend Engineering'
AND NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_code = 'RES-7-1');

INSERT INTO learning_resources (resource_code, platform, title, url, skill_id, difficulty, resource_type, duration_minutes, description, is_free, sequence_order)
SELECT 'RES-7-2', 'Coursera', 'Java Programming and Software Engineering Fundamentals', 'https://www.coursera.org/search?query=Java+Programming+Software+Engineering', s.id, 'Intermediate', 'Course', 1800, 'Object-oriented design, testing, and Java enterprise patterns.', 0, 2
FROM skills s WHERE s.name = 'Java & Spring Boot Backend Engineering'
AND NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_code = 'RES-7-2');

INSERT INTO learning_resources (resource_code, platform, title, url, skill_id, difficulty, resource_type, duration_minutes, description, is_free, sequence_order)
SELECT 'RES-8-1', 'NPTEL', 'VLSI Design Verification and Test', 'https://nptel.ac.in/courses/vlsi', s.id, 'Intermediate', 'Course', 2400, 'RTL design flow, testbenches, and verification methodology.', 1, 1
FROM skills s WHERE s.name = 'VLSI & Digital Hardware Design'
AND NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_code = 'RES-8-1');

INSERT INTO learning_resources (resource_code, platform, title, url, skill_id, difficulty, resource_type, duration_minutes, description, is_free, sequence_order)
SELECT 'RES-8-2', 'YouTube', 'Verilog HDL Crash Course', 'https://www.youtube.com/results?search_query=Verilog+HDL+crash+course', s.id, 'Beginner', 'Video', 180, 'Verilog syntax, RTL modeling, and simple ALU/FSM design examples.', 1, 2
FROM skills s WHERE s.name = 'VLSI & Digital Hardware Design'
AND NOT EXISTS (SELECT 1 FROM learning_resources WHERE resource_code = 'RES-8-2');

-- ----------------------------------------------------------------------------
-- department_required_skills — the 20 new departments had ZERO of these,
-- which is the direct cause of every Skills Matrix cell reading N/A: the
-- matrix computes required-vs-current per department, and there was no
-- "required" side at all for these departments.
-- ----------------------------------------------------------------------------
INSERT INTO department_required_skills (dept_req_code, department_id, skill_id, required_proficiency)
SELECT CONCAT('DRS-', d.id, '-', s.id), d.id, s.id, v.req
FROM (
  SELECT 'IT Infrastructure & System Operations' AS dept, 'Cloud Infrastructure (AWS/GCP/Docker)' AS skill, 4 AS req
  UNION ALL SELECT 'IT Infrastructure & System Operations', 'SQL & Database Optimization', 3
  UNION ALL SELECT 'Enterprise Security & Access Control', 'Cybersecurity & Risk Audit', 5
  UNION ALL SELECT 'Human Resources & Onboarding', 'Agile Leadership & Team Management', 3
  UNION ALL SELECT 'HR Operations & Compliance', 'Agile Leadership & Team Management', 3
  UNION ALL SELECT 'HR Operations & Compliance', 'Cybersecurity & Risk Audit', 2
  UNION ALL SELECT 'L&D & Talent Development', 'Agile Leadership & Team Management', 4
  UNION ALL SELECT 'Corporate Upskilling & Training', 'Agile Leadership & Team Management', 4
  UNION ALL SELECT 'Engineering & R&D', 'React & Frontend Development', 4
  UNION ALL SELECT 'Engineering & R&D', 'Node.js & Backend Development', 4
  UNION ALL SELECT 'Data & Analytics Division', 'SQL & Database Optimization', 5
  UNION ALL SELECT 'Data & Analytics Division', 'Cloud Infrastructure (AWS/GCP/Docker)', 3
  UNION ALL SELECT 'Software Engineering Team', 'React & Frontend Development', 4
  UNION ALL SELECT 'Software Engineering Team', 'Node.js & Backend Development', 3
  UNION ALL SELECT 'Cloud Infrastructure Team', 'Cloud Infrastructure (AWS/GCP/Docker)', 5
  UNION ALL SELECT 'VLSI & Embedded Systems', 'VLSI & Digital Hardware Design', 5
  UNION ALL SELECT 'Cloud & DevOps', 'Cloud Infrastructure (AWS/GCP/Docker)', 4
  UNION ALL SELECT 'Data Engineering & AI', 'SQL & Database Optimization', 4
  UNION ALL SELECT 'Data Engineering & AI', 'Cloud Infrastructure (AWS/GCP/Docker)', 3
  UNION ALL SELECT 'Cybersecurity & Compliance', 'Cybersecurity & Risk Audit', 5
  UNION ALL SELECT 'Frontend Engineering', 'React & Frontend Development', 4
  UNION ALL SELECT 'Backend Systems Engineering', 'Node.js & Backend Development', 4
  UNION ALL SELECT 'Backend Systems Engineering', 'Java & Spring Boot Backend Engineering', 4
  UNION ALL SELECT 'Mobile Application Development', 'React & Frontend Development', 3
  UNION ALL SELECT 'Quality Assurance & Automation', 'Node.js & Backend Development', 2
  UNION ALL SELECT 'Quality Assurance & Automation', 'Agile Leadership & Team Management', 3
  UNION ALL SELECT 'Product Management & Strategy', 'Agile Leadership & Team Management', 4
  UNION ALL SELECT 'Network & Systems Architecture', 'Cloud Infrastructure (AWS/GCP/Docker)', 4
  UNION ALL SELECT 'Network & Systems Architecture', 'Cybersecurity & Risk Audit', 3
) v
JOIN departments d ON d.name = v.dept
JOIN skills s ON s.name = v.skill
WHERE NOT EXISTS (SELECT 1 FROM department_required_skills drs WHERE drs.department_id = d.id AND drs.skill_id = s.id);

-- ----------------------------------------------------------------------------
-- employee_skills — real self/manager-assessed proficiency for most of the
-- 20 users. Deliberately mixed: some below their department's requirement
-- (real gaps, so the platform has something to actually recommend training
-- for), some at/above (so "met" cases show too).
-- ----------------------------------------------------------------------------
INSERT INTO employee_skills (employee_skill_code, employee_id, skill_id, current_proficiency, assessed_date, verified_by)
SELECT CONCAT('ESK-', e.id, '-', s.id), e.id, s.id, v.prof, DATE_SUB(CURDATE(), INTERVAL v.days_ago DAY), v.verifier
FROM (
  SELECT 'OKGIP-EMP-2026-01' AS emp, 'Cloud Infrastructure (AWS/GCP/Docker)' AS skill, 3 AS prof, 40 AS days_ago, 'Self Assessment' AS verifier
  UNION ALL SELECT 'OKGIP-EMP-2026-01', 'SQL & Database Optimization', 3, 40, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-02', 'Cybersecurity & Risk Audit', 4, 35, 'Manager Evaluation'
  UNION ALL SELECT 'OKGIP-EMP-2026-03', 'Agile Leadership & Team Management', 3, 50, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-04', 'Agile Leadership & Team Management', 3, 45, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-04', 'Cybersecurity & Risk Audit', 2, 45, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-05', 'Agile Leadership & Team Management', 5, 60, 'Manager Evaluation'
  UNION ALL SELECT 'OKGIP-EMP-2026-06', 'Agile Leadership & Team Management', 4, 55, 'Manager Evaluation'
  UNION ALL SELECT 'OKGIP-EMP-2026-07', 'React & Frontend Development', 4, 30, 'Manager Evaluation'
  UNION ALL SELECT 'OKGIP-EMP-2026-07', 'Node.js & Backend Development', 4, 30, 'Manager Evaluation'
  UNION ALL SELECT 'OKGIP-EMP-2026-08', 'SQL & Database Optimization', 5, 25, 'Manager Evaluation'
  UNION ALL SELECT 'OKGIP-EMP-2026-08', 'Cloud Infrastructure (AWS/GCP/Docker)', 3, 25, 'Manager Evaluation'
  UNION ALL SELECT 'OKGIP-EMP-2026-09', 'React & Frontend Development', 3, 20, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-09', 'Node.js & Backend Development', 3, 20, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-10', 'Cloud Infrastructure (AWS/GCP/Docker)', 4, 18, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-11', 'VLSI & Digital Hardware Design', 2, 12, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-12', 'Cloud Infrastructure (AWS/GCP/Docker)', 2, 10, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-13', 'SQL & Database Optimization', 2, 9, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-13', 'Cloud Infrastructure (AWS/GCP/Docker)', 2, 9, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-14', 'Cybersecurity & Risk Audit', 2, 8, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-15', 'React & Frontend Development', 2, 7, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-16', 'Node.js & Backend Development', 3, 6, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-16', 'Java & Spring Boot Backend Engineering', 2, 6, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-17', 'React & Frontend Development', 2, 5, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-18', 'Node.js & Backend Development', 1, 4, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-18', 'Agile Leadership & Team Management', 2, 4, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-19', 'Agile Leadership & Team Management', 3, 3, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-20', 'Cloud Infrastructure (AWS/GCP/Docker)', 2, 2, 'Self Assessment'
  UNION ALL SELECT 'OKGIP-EMP-2026-20', 'Cybersecurity & Risk Audit', 2, 2, 'Self Assessment'
) v
JOIN employees e ON e.employee_code = v.emp
JOIN skills s ON s.name = v.skill
ON DUPLICATE KEY UPDATE current_proficiency = VALUES(current_proficiency), assessed_date = VALUES(assessed_date);

-- ----------------------------------------------------------------------------
-- Mentorships — real lifecycle mix: two Approved/active, one still pending
-- admin review, one fully Completed with rating/feedback. Mentors are the
-- 2 L&D Admin / Mentor users.
-- ----------------------------------------------------------------------------
INSERT INTO mentorships (mentorship_code, mentor_id, requested_mentor_id, assigned_mentor_id, mentee_id, skill_id, goal, start_date, end_date, status, admin_notes, approved_by, requested_at, approved_at)
SELECT 'MNT-SEED-01', mentor.id, mentor.id, mentor.id, mentee.id, skill.id,
       'Close the VLSI design proficiency gap ahead of the next hardware review cycle.',
       CURDATE() - INTERVAL 20 DAY, CURDATE() + INTERVAL 70 DAY, 'Approved',
       'Approved — strong domain overlap with L&D training focus.', 'System Admin (Seed)', NOW() - INTERVAL 25 DAY, NOW() - INTERVAL 20 DAY
FROM employees mentor
JOIN employees mentee ON mentee.employee_code = 'OKGIP-EMP-2026-11'
JOIN skills skill ON skill.name = 'VLSI & Digital Hardware Design'
WHERE mentor.employee_code = 'OKGIP-EMP-2026-05'
  AND NOT EXISTS (SELECT 1 FROM mentorships WHERE mentorship_code = 'MNT-SEED-01');

INSERT INTO mentorships (mentorship_code, mentor_id, requested_mentor_id, assigned_mentor_id, mentee_id, skill_id, goal, start_date, end_date, status, admin_notes, approved_by, requested_at, approved_at)
SELECT 'MNT-SEED-02', mentor.id, mentor.id, mentor.id, mentee.id, skill.id,
       'Improve backend architecture skills — targeting Java/Spring Boot proficiency.',
       CURDATE() - INTERVAL 10 DAY, CURDATE() + INTERVAL 80 DAY, 'Approved',
       'Approved by HR — good department overlap.', 'System Admin (Seed)', NOW() - INTERVAL 14 DAY, NOW() - INTERVAL 10 DAY
FROM employees mentor
JOIN employees mentee ON mentee.employee_code = 'OKGIP-EMP-2026-16'
JOIN skills skill ON skill.name = 'Java & Spring Boot Backend Engineering'
WHERE mentor.employee_code = 'OKGIP-EMP-2026-06'
  AND NOT EXISTS (SELECT 1 FROM mentorships WHERE mentorship_code = 'MNT-SEED-02');

INSERT INTO mentorships (mentorship_code, mentor_id, requested_mentor_id, mentee_id, skill_id, goal, start_date, end_date, status, requested_at)
SELECT 'MNT-SEED-03', mentor.id, mentor.id, mentee.id, skill.id,
       'Requesting mentorship to prepare for the internal cloud certification track.',
       CURDATE(), CURDATE() + INTERVAL 90 DAY, 'Pending Admin Review', NOW() - INTERVAL 2 DAY
FROM employees mentor
JOIN employees mentee ON mentee.employee_code = 'OKGIP-EMP-2026-12'
JOIN skills skill ON skill.name = 'Cloud Infrastructure (AWS/GCP/Docker)'
WHERE mentor.employee_code = 'OKGIP-EMP-2026-10'
  AND NOT EXISTS (SELECT 1 FROM mentorships WHERE mentorship_code = 'MNT-SEED-03');

INSERT INTO mentorships (mentorship_code, mentor_id, requested_mentor_id, assigned_mentor_id, mentee_id, skill_id, goal, start_date, end_date, status, admin_notes, approved_by, requested_at, approved_at, rating, feedback)
SELECT 'MNT-SEED-04', mentor.id, mentor.id, mentor.id, mentee.id, skill.id,
       'Frontend architecture and component design mentorship — completed successfully.',
       CURDATE() - INTERVAL 100 DAY, CURDATE() - INTERVAL 10 DAY, 'Completed',
       'Approved.', 'System Admin (Seed)', NOW() - INTERVAL 105 DAY, NOW() - INTERVAL 100 DAY,
       5, 'Excellent guidance on component architecture — really helped close the gap quickly.'
FROM employees mentor
JOIN employees mentee ON mentee.employee_code = 'OKGIP-EMP-2026-15'
JOIN skills skill ON skill.name = 'React & Frontend Development'
WHERE mentor.employee_code = 'OKGIP-EMP-2026-07'
  AND NOT EXISTS (SELECT 1 FROM mentorships WHERE mentorship_code = 'MNT-SEED-04');

INSERT INTO mentor_request_history (request_id, action, performed_by_name, performed_by_role, old_status, new_status, comments)
SELECT m.id, 'REQUEST_SUBMITTED', 'Rohan Gupta', 'Employee', 'NONE', 'Pending Admin Review', 'Initial mentorship request submitted.'
FROM mentorships m WHERE m.mentorship_code = 'MNT-SEED-03'
  AND NOT EXISTS (SELECT 1 FROM mentor_request_history h WHERE h.request_id = m.id AND h.action = 'REQUEST_SUBMITTED');

-- ----------------------------------------------------------------------------
-- Knowledge sessions — one already completed with attendance/feedback, two
-- upcoming/scheduled with live registrations.
-- ----------------------------------------------------------------------------
INSERT INTO knowledge_sessions (title, description, skill_id, host_employee_id, scheduled_at, duration_minutes, capacity, meeting_link, location, status, average_rating, effectiveness_score)
SELECT 'Agile Leadership for New Managers', 'Practical facilitation techniques, sprint planning, and team coaching fundamentals.',
       skill.id, host.id, NOW() - INTERVAL 15 DAY, 60, 25, 'https://meet.google.com/okgip-agile-leadership', 'Virtual / Google Meet', 'COMPLETED', 4.7, 92
FROM employees host JOIN skills skill ON skill.name = 'Agile Leadership & Team Management'
WHERE host.employee_code = 'OKGIP-EMP-2026-05'
  AND NOT EXISTS (SELECT 1 FROM knowledge_sessions WHERE title = 'Agile Leadership for New Managers');

INSERT INTO knowledge_sessions (title, description, skill_id, host_employee_id, scheduled_at, duration_minutes, capacity, meeting_link, location, status)
SELECT 'Spring Boot Microservices Deep Dive', 'Resilient service patterns, circuit breakers, and observability for backend teams.',
       skill.id, host.id, NOW() + INTERVAL 6 DAY, 90, 20, 'https://meet.google.com/okgip-spring-boot', 'Virtual / Google Meet', 'SCHEDULED'
FROM employees host JOIN skills skill ON skill.name = 'Java & Spring Boot Backend Engineering'
WHERE host.employee_code = 'OKGIP-EMP-2026-06'
  AND NOT EXISTS (SELECT 1 FROM knowledge_sessions WHERE title = 'Spring Boot Microservices Deep Dive');

INSERT INTO knowledge_sessions (title, description, skill_id, host_employee_id, scheduled_at, duration_minutes, capacity, meeting_link, location, status)
SELECT 'Cloud Cost Optimization Workshop', 'Right-sizing infrastructure and reducing cloud spend without losing reliability.',
       skill.id, host.id, NOW() + INTERVAL 11 DAY, 75, 30, 'https://meet.google.com/okgip-cloud-cost', 'Virtual / Google Meet', 'SCHEDULED'
FROM employees host JOIN skills skill ON skill.name = 'Cloud Infrastructure (AWS/GCP/Docker)'
WHERE host.employee_code = 'OKGIP-EMP-2026-10'
  AND NOT EXISTS (SELECT 1 FROM knowledge_sessions WHERE title = 'Cloud Cost Optimization Workshop');

-- Registrations for the completed session — attended, with feedback/rating.
INSERT INTO session_registrations (session_id, employee_id, status, rating, feedback)
SELECT ks.id, e.id, 'ATTENDED', 5, 'Very actionable — used the sprint planning template the same week.'
FROM knowledge_sessions ks JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-09'
WHERE ks.title = 'Agile Leadership for New Managers'
  AND NOT EXISTS (SELECT 1 FROM session_registrations sr WHERE sr.session_id = ks.id AND sr.employee_id = e.id);

INSERT INTO session_registrations (session_id, employee_id, status, rating, feedback)
SELECT ks.id, e.id, 'ATTENDED', 4, 'Good overview, would like a follow-up on retrospectives specifically.'
FROM knowledge_sessions ks JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-19'
WHERE ks.title = 'Agile Leadership for New Managers'
  AND NOT EXISTS (SELECT 1 FROM session_registrations sr WHERE sr.session_id = ks.id AND sr.employee_id = e.id);

-- Registrations for the two upcoming sessions — just REGISTERED so far.
INSERT INTO session_registrations (session_id, employee_id, status)
SELECT ks.id, e.id, 'REGISTERED'
FROM knowledge_sessions ks JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-16'
WHERE ks.title = 'Spring Boot Microservices Deep Dive'
  AND NOT EXISTS (SELECT 1 FROM session_registrations sr WHERE sr.session_id = ks.id AND sr.employee_id = e.id);

INSERT INTO session_registrations (session_id, employee_id, status)
SELECT ks.id, e.id, 'REGISTERED'
FROM knowledge_sessions ks JOIN employees e ON e.employee_code = 'OKGIP-EMP-2026-12'
WHERE ks.title = 'Cloud Cost Optimization Workshop'
  AND NOT EXISTS (SELECT 1 FROM session_registrations sr WHERE sr.session_id = ks.id AND sr.employee_id = e.id);

-- ----------------------------------------------------------------------------
-- Learning paths with real, mixed progress — not everyone at 0%. Uses the
-- actual learning_resources rows for the matching skill.
-- ----------------------------------------------------------------------------
INSERT INTO learning_paths (path_code, employee_id, skill_id, title, target_level, priority, status, progress_percentage)
SELECT 'LP-SEED-01', e.id, s.id, CONCAT(s.name, ' Mastery Path'), 5, 'High', 'IN_PROGRESS', 50
FROM employees e JOIN skills s ON s.name = 'VLSI & Digital Hardware Design'
WHERE e.employee_code = 'OKGIP-EMP-2026-11'
  AND NOT EXISTS (SELECT 1 FROM learning_paths WHERE path_code = 'LP-SEED-01');

INSERT INTO learning_paths (path_code, employee_id, skill_id, title, target_level, priority, status, progress_percentage)
SELECT 'LP-SEED-02', e.id, s.id, CONCAT(s.name, ' Mastery Path'), 4, 'High', 'IN_PROGRESS', 50
FROM employees e JOIN skills s ON s.name = 'Java & Spring Boot Backend Engineering'
WHERE e.employee_code = 'OKGIP-EMP-2026-16'
  AND NOT EXISTS (SELECT 1 FROM learning_paths WHERE path_code = 'LP-SEED-02');

INSERT INTO learning_paths (path_code, employee_id, skill_id, title, target_level, priority, status, progress_percentage)
SELECT 'LP-SEED-03', e.id, s.id, CONCAT(s.name, ' Mastery Path'), 4, 'Medium', 'COMPLETED', 100
FROM employees e JOIN skills s ON s.name = 'React & Frontend Development'
WHERE e.employee_code = 'OKGIP-EMP-2026-15'
  AND NOT EXISTS (SELECT 1 FROM learning_paths WHERE path_code = 'LP-SEED-03');

INSERT INTO learning_paths (path_code, employee_id, skill_id, title, target_level, priority, status, progress_percentage)
SELECT 'LP-SEED-04', e.id, s.id, CONCAT(s.name, ' Mastery Path'), 4, 'Medium', 'IN_PROGRESS', 0
FROM employees e JOIN skills s ON s.name = 'Cloud Infrastructure (AWS/GCP/Docker)'
WHERE e.employee_code = 'OKGIP-EMP-2026-12'
  AND NOT EXISTS (SELECT 1 FROM learning_paths WHERE path_code = 'LP-SEED-04');

-- Items: mark roughly the first half of each path's resources Completed to
-- match the progress_percentage set above (the app recalculates this live
-- off item statuses on next load, so keep these consistent).
INSERT INTO learning_path_items (learning_path_id, resource_id, sequence_order, status, completed_at)
SELECT lp.id, lr.id, lr.sequence_order,
       IF(lr.sequence_order <= (SELECT COUNT(*) FROM learning_resources WHERE skill_id = lp.skill_id) / 2, 'Completed', 'Pending'),
       IF(lr.sequence_order <= (SELECT COUNT(*) FROM learning_resources WHERE skill_id = lp.skill_id) / 2, NOW() - INTERVAL 5 DAY, NULL)
FROM learning_paths lp
JOIN learning_resources lr ON lr.skill_id = lp.skill_id
WHERE lp.path_code IN ('LP-SEED-01', 'LP-SEED-02', 'LP-SEED-04')
  AND NOT EXISTS (SELECT 1 FROM learning_path_items lpi WHERE lpi.learning_path_id = lp.id AND lpi.resource_id = lr.id);

INSERT INTO learning_path_items (learning_path_id, resource_id, sequence_order, status, completed_at)
SELECT lp.id, lr.id, lr.sequence_order, 'Completed', NOW() - INTERVAL 15 DAY
FROM learning_paths lp
JOIN learning_resources lr ON lr.skill_id = lp.skill_id
WHERE lp.path_code = 'LP-SEED-03'
  AND NOT EXISTS (SELECT 1 FROM learning_path_items lpi WHERE lpi.learning_path_id = lp.id AND lpi.resource_id = lr.id);

-- ----------------------------------------------------------------------------
-- AI Assistant chat history — a few real logged conversations so the
-- assistant doesn't look untouched either.
-- ----------------------------------------------------------------------------
INSERT INTO ai_chat_logs (user_id, employee_id, message, reply, source)
SELECT u.id, e.id,
       'What skill gaps do I currently have?',
       'Based on your latest assessment, your biggest gap is in VLSI & Digital Hardware Design — you are at Level 2 against a department requirement of Level 5. I would recommend the VLSI Design Verification and Test course and connecting with your assigned mentor.',
       'RULES'
FROM users u JOIN employees e ON e.user_id = u.id
WHERE u.email = 'sneha.reddy@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM ai_chat_logs WHERE user_id = u.id AND message = 'What skill gaps do I currently have?');

INSERT INTO ai_chat_logs (user_id, employee_id, message, reply, source)
SELECT u.id, e.id,
       'Recommend a training course for backend development',
       'Based on active skill deficits, I would recommend: 1) Spring Boot 3 Full Course, 2) Java Programming and Software Engineering Fundamentals. You can enroll directly from the Training page.',
       'RULES'
FROM users u JOIN employees e ON e.user_id = u.id
WHERE u.email = 'arjun.kapoor@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM ai_chat_logs WHERE user_id = u.id AND message = 'Recommend a training course for backend development');

INSERT INTO ai_chat_logs (user_id, employee_id, message, reply, source)
SELECT u.id, e.id,
       'How many employees have critical skill gaps right now?',
       'There are several employees with high-priority skill gaps across departments — check the Gap Intelligence dashboard for the live, filterable breakdown by department and skill.',
       'RULES'
FROM users u JOIN employees e ON e.user_id = u.id
WHERE u.email = 'aarav.sharma@gmail.com'
  AND NOT EXISTS (SELECT 1 FROM ai_chat_logs WHERE user_id = u.id AND message = 'How many employees have critical skill gaps right now?');

SET SQL_SAFE_UPDATES = 1;

-- ============================================================================
-- Done. Reload the Skills Matrix / Learning Path / Mentorship pages —
-- they should now show real proficiency levels, gaps, mentors, and
-- attended sessions instead of N/A and 0%.
-- ============================================================================
