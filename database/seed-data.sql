-- =========================================================
-- OKGIP Seed Data SQL Script with Public Codes & Audit Logs
-- Database Name: okgip_db
-- =========================================================

USE okgip_db;

-- 1. Insert Roles
INSERT INTO roles (id, role_code, name, description) VALUES
(1, 'ROLE-000001', 'Admin', 'System Administrator'),
(2, 'ROLE-000002', 'Manager', 'Engineering & Team Manager'),
(3, 'ROLE-000003', 'HR Specialist', 'Human Resources Specialist'),
(4, 'ROLE-000004', 'Department Head', 'Executive Division Lead'),
(5, 'ROLE-000005', 'L&D Admin / Mentor', 'Learning & Development Administrator'),
(6, 'ROLE-000006', 'Employee', 'Standard Workforce Member')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Core Users
-- Note: Passwords are hashed with bcrypt ('admin123' and 'emp123')
INSERT INTO users (id, user_code, email, password_hash, first_name, last_name, status) VALUES
(1, 'USER-000001', 'admin@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'Alex', 'Morgan', 'ACTIVE'),
(2, 'USER-000002', 'sarah.m@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'Sarah', 'Jenkins', 'ACTIVE'),
(3, 'USER-000003', 'alex.r@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'Alex', 'Rivera', 'ACTIVE'),
(4, 'USER-000004', 'priya.s@okgip.com', '$2a$10$e7x1LgK9dG3f9e.S8Z0J..A.gG7Y43mS', 'Priya', 'Sharma', 'ACTIVE')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- Assign User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), (2, 2), (3, 6), (4, 3)
ON DUPLICATE KEY UPDATE role_id=VALUES(role_id);

-- 3. Insert Departments
INSERT INTO departments (id, department_code, name, code, description) VALUES
(1, 'DEPT-000001', 'Software Engineering', 'ENG', 'Full Stack Cloud Development and Microservices'),
(2, 'DEPT-000002', 'Data Science & AI', 'AI', 'Machine Learning, Predictive Analytics & BI'),
(3, 'DEPT-000003', 'Cloud Infrastructure & Security', 'SEC', 'DevOps, CI/CD, Cyber Security and Kubernetes'),
(4, 'DEPT-000004', 'Human Resources', 'HR', 'Talent acquisition, corporate learning & employee wellness')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Employees
INSERT INTO employees (id, employee_code, user_id, department_id, designation, joining_date, employment_status, casual_leave_balance, medical_leave_balance, performance_score) VALUES
(1, 'EMP-000001', 1, 1, 'Chief System Administrator', '2022-01-15', 'ACTIVE', 12, 10, 98.5),
(2, 'EMP-000002', 2, 1, 'Engineering Manager', '2022-03-01', 'ACTIVE', 10, 10, 94.0),
(3, 'EMP-000003', 3, 1, 'Senior Full Stack Engineer', '2023-05-10', 'ACTIVE', 11, 8, 88.5),
(4, 'EMP-000004', 4, 4, 'HR & Talent Specialist', '2023-08-01', 'ACTIVE', 12, 10, 91.0)
ON DUPLICATE KEY UPDATE first_name=VALUES(first_name);

-- 5. Insert Skills
INSERT INTO skills (id, skill_code, name, category, description) VALUES
(1, 'SKILL-000001', 'React & TypeScript', 'Frontend', 'Modern SPA architecture, state management, and type safety'),
(2, 'SKILL-000002', 'Spring Boot', 'Backend', 'Java enterprise microservices, JPA/Hibernate, REST API'),
(3, 'SKILL-000003', 'Docker & Containers', 'DevOps', 'Containerization, Docker Compose, and environment portability'),
(4, 'SKILL-000004', 'Kubernetes Orchestration', 'Cloud', 'Cluster deployment, scaling, pods, and ingress routing'),
(5, 'SKILL-000005', 'MySQL Database Design', 'Database', 'Relational schema design, query optimization, and indexing')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 6. Insert Employee Skills
INSERT INTO employee_skills (id, employee_skill_code, employee_id, skill_id, current_proficiency, verified_by) VALUES
(1, 'EKS-000001', 3, 1, 4, 'Automated Skill Assessment'),
(2, 'EKS-000002', 3, 2, 3, 'Automated Skill Assessment'),
(3, 'EKS-000003', 3, 3, 2, 'Self Assessed'),
(4, 'EKS-000004', 3, 4, 1, 'Pending Verification'),
(5, 'EKS-000005', 3, 5, 4, 'Peer Verified')
ON DUPLICATE KEY UPDATE current_proficiency=VALUES(current_proficiency);

-- 7. Insert Knowledge Gaps
INSERT INTO knowledge_gaps (id, gap_code, employee_id, skill_id, current_proficiency, required_proficiency, gap_score, priority, status) VALUES
(1, 'GAP-000001', 3, 3, 2, 4, 2, 'HIGH', 'IN_TRAINING'),
(2, 'GAP-000002', 3, 4, 1, 4, 3, 'HIGH', 'IDENTIFIED')
ON DUPLICATE KEY UPDATE gap_score=VALUES(gap_score);

-- 8. Insert Skill Assessments
INSERT INTO skill_assessments (id, assessment_code, skill_id, title, description, pass_score) VALUES
(1, 'ASM-000001', 3, 'Docker Essentials Certification Quiz', 'Evaluates knowledge of containers, Dockerfiles, volumes, and networks.', 70),
(2, 'ASM-000002', 4, 'Kubernetes Administrator Basics', 'Evaluates pods, deployments, services, and cluster ingress rules.', 75)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 9. Insert Training Programs
INSERT INTO training_programs (id, training_code, title, description, category, target_skill_id, min_proficiency_gain, duration_hours, provider) VALUES
(1, 'TRN-000001', 'Docker Containerization Masterclass', 'Comprehensive guide to containerizing microservices.', 'DevOps', 3, 2, 10, 'Coursera / Internal Academy'),
(2, 'TRN-000002', 'Production-Grade Kubernetes Deployment', 'Hands-on training on managing Kubernetes clusters in cloud environments.', 'Cloud Native', 4, 2, 16, 'Udemy / Cloud Academy')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 10. Insert Leave Types & Requests
INSERT INTO leave_types (id, type_code, name, description, default_days) VALUES
(1, 'LVT-000001', 'Casual Leave', 'Short-term personal time off', 12),
(2, 'LVT-000002', 'Medical Leave', 'Health and sick leave', 10),
(3, 'LVT-000003', 'Privilege Leave', 'Annual vacation leave', 15)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO leave_requests (id, leave_code, employee_id, leave_type, start_date, end_date, duration_days, reason, status) VALUES
(1, 'LV-000001', 3, 'Casual Leave', '2026-08-20', '2026-08-21', 2, 'Family function attendance', 'Pending')
ON DUPLICATE KEY UPDATE reason=VALUES(reason);

-- 11. Insert Sample Audit Logs
INSERT INTO audit_logs (id, audit_code, actor_user_id, action, entity_type, entity_id, old_values, new_values, description, ip_address) VALUES
(1, 'AUD-000001', 1, 'INITIALIZE', 'SYSTEM', 'OKGIP_DB', NULL, NULL, 'OKGIP Database Architecture initialized with public unique ID system.', '127.0.0.1'),
(2, 'AUD-000002', 1, 'UPDATE', 'EMPLOYEE', 'EMP-000003', '{"department": "ECE"}', '{"department": "CSE"}', 'Department reassignment from ECE to CSE by Administrator.', '192.168.1.10'),
(3, 'AUD-000003', 3, 'SUBMIT', 'ASSESSMENT', 'ASM-000001', '{"score": 45, "level": 2}', '{"score": 85, "level": 4}', 'Assessment ASM-000001 completed with score 85%. Level updated from 2 to 4.', '192.168.1.45'),
(4, 'AUD-000004', 2, 'APPROVE', 'LEAVE_REQUEST', 'LV-000001', '{"status": "Pending"}', '{"status": "Approved"}', 'Manager approved casual leave request LV-000001.', '192.168.1.12')
ON DUPLICATE KEY UPDATE description=VALUES(description);
