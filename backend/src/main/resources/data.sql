-- =============================================================
-- SEED DATA INSERTIONS
-- Password for all seed users is 'password123'
-- =============================================================

-- 1. Departments
INSERT INTO department (id, department_name, description) VALUES
(1, 'Software Engineering', 'Core product design, architecture and platform backend development.'),
(2, 'Data & AI', 'Data engineering, machine learning analytics, and intelligence modeling.'),
(3, 'Product Management', 'Product strategy, roadmap planning, and UI/UX design execution.'),
(4, 'Human Resources', 'Talent acquisition, organizational development, and employee growth.')
ON CONFLICT (id) DO NOTHING;

-- 2. Job Roles
INSERT INTO job_role (id, role_name, department_name, description) VALUES
(1, 'Senior Java Backend Engineer', 'Software Engineering', 'Architects scalable microservices and Spring Boot REST APIs.'),
(2, 'AI/ML Data Scientist', 'Data & AI', 'Builds predictive analytics, Llama models, and NLP intelligent platform features.'),
(3, 'Lead Product Manager', 'Product Management', 'Drives feature roadmap, agile milestones, and knowledge management.'),
(4, 'HR Talent Specialist', 'Human Resources', 'Oversees organizational competency evaluation and skill gap resolution.')
ON CONFLICT (id) DO NOTHING;

-- 3. Skills Catalog
INSERT INTO skill (id, skill_name, category, level, description) VALUES
(1, 'Java & Spring Boot', 'Backend Development', 'Advanced', 'Building enterprise RESTful microservices with Spring Security and JPA.'),
(2, 'PostgreSQL Database Management', 'Database', 'Intermediate', 'Relational database schema design, indexing, and SQL optimization.'),
(3, 'AI/ML & LLM Integration', 'Data Science', 'Advanced', 'Implementing Machine Learning pipelines and HuggingFace LLM inference.'),
(4, 'Product Lifecycle Management', 'Management', 'Advanced', 'Agile milestone tracking, requirement scoping, and strategic planning.'),
(5, 'Docker & Containerization', 'DevOps', 'Intermediate', 'Packaging multi-tier applications with Docker container manifests.'),
(6, 'REST API Design', 'Backend Development', 'Advanced', 'Standardized OpenAPI / REST HTTP JSON interface design.'),
(7, 'Technical Documentation & Writing', 'Communication', 'Intermediate', 'Creating technical architecture diagrams and user-facing reports.')
ON CONFLICT (id) DO NOTHING;

-- 4. Competency Requirements
INSERT INTO competency_requirement (id, job_role_id, skill_id, required_proficiency_level) VALUES
(1, 1, 1, 'EXPERT'),
(2, 1, 2, 'ADVANCED'),
(3, 1, 5, 'INTERMEDIATE'),
(4, 1, 6, 'EXPERT'),
(5, 2, 3, 'EXPERT'),
(6, 2, 1, 'INTERMEDIATE'),
(7, 2, 2, 'ADVANCED'),
(8, 3, 4, 'EXPERT'),
(9, 3, 7, 'ADVANCED'),
(10, 3, 6, 'INTERMEDIATE'),
(11, 4, 7, 'EXPERT'),
(12, 4, 4, 'INTERMEDIATE')
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Users (Password: password123)
-- BCrypt verified hash for 'password123' (generated & verified with Python bcrypt)
INSERT INTO app_users (id, full_name, email, password, role) VALUES
(1, 'Aarav Sharma', 'aarav.sharma@kgap.com', '$2b$10$IwXlUVfkFiSHW3yGNeU33.M8wL8pTkleF4H5JwNqXJks3S9ruRRGS', 'EMPLOYEE'),
(2, 'Sarah Johnson', 'employee2@kgap.com', '$2b$10$IwXlUVfkFiSHW3yGNeU33.M8wL8pTkleF4H5JwNqXJks3S9ruRRGS', 'EMPLOYEE'),
(3, 'Vikram Mehta', 'manager@kgap.com', '$2b$10$IwXlUVfkFiSHW3yGNeU33.M8wL8pTkleF4H5JwNqXJks3S9ruRRGS', 'MANAGER'),
(4, 'Priya Patel', 'hr@kgap.com', '$2b$10$IwXlUVfkFiSHW3yGNeU33.M8wL8pTkleF4H5JwNqXJks3S9ruRRGS', 'HR'),
(5, 'System Admin', 'admin@kgap.com', '$2b$10$IwXlUVfkFiSHW3yGNeU33.M8wL8pTkleF4H5JwNqXJks3S9ruRRGS', 'ADMIN')
ON CONFLICT (id) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role;

-- 6. Seed Employees
INSERT INTO employee (id, first_name, last_name, email, phone_number, department, role, job_role_id, experience, education, bio) VALUES
(1, 'Aarav', 'Sharma', 'aarav.sharma@kgap.com', '+91-9876543210', 'Software Engineering', 'EMPLOYEE', 1, '3+ Years in Backend Services', 'B.Tech in Computer Science', 'Passionate software developer focusing on scalable Spring Boot APIs and cloud services.'),
(2, 'Sarah', 'Johnson', 'employee2@kgap.com', '+1-555-0102', 'Product Management', 'EMPLOYEE', 3, '5 Years in PM & Agile Strategy', 'MBA, Stanford University', 'Passionate about building products that users love and solving complex organizational problems with data-driven insights.'),
(3, 'Vikram', 'Mehta', 'manager@kgap.com', '+91-9876543211', 'Software Engineering', 'MANAGER', 1, '8+ Years in Engineering Management', 'M.Tech in Software Engineering', 'Engineering Lead driving platform backend architecture and cross-team execution.'),
(4, 'Priya', 'Patel', 'hr@kgap.com', '+91-9876543212', 'Human Resources', 'HR', 4, '6 Years in Organizational HR', 'MA in Human Resource Management', 'HR Lead specializing in organizational learning, competency mapping, and employee development.'),
(5, 'System', 'Admin', 'admin@kgap.com', '+91-9876543213', 'Software Engineering', 'ADMIN', 1, '10+ Years in Systems Administration', 'B.S. in Information Technology', 'Platform Administrator managing role permissions, system configuration, and organizational catalogs.')
ON CONFLICT (id) DO NOTHING;

-- 7. Employee Skills
INSERT INTO employee_skill (id, employee_id, skill_id, proficiency_level) VALUES
(1, 1, 1, 'INTERMEDIATE'),
(2, 1, 2, 'BEGINNER'),
(3, 1, 5, 'BEGINNER'),
(4, 1, 6, 'INTERMEDIATE'),
(5, 2, 4, 'INTERMEDIATE'),
(6, 2, 7, 'BEGINNER'),
(7, 2, 6, 'BEGINNER'),
(8, 3, 1, 'EXPERT'),
(9, 3, 2, 'ADVANCED'),
(10, 3, 5, 'ADVANCED'),
(11, 3, 6, 'EXPERT'),
(12, 4, 7, 'EXPERT'),
(13, 4, 4, 'ADVANCED')
ON CONFLICT (id) DO NOTHING;

-- 8. Skill Gaps
INSERT INTO skill_gaps (id, employee_id, job_role_id, skill_id, current_proficiency, required_proficiency, gap_score, gap_level, analyzed_at) VALUES
(1, 1, 1, 1, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(2, 1, 1, 2, 'BEGINNER', 'ADVANCED', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(3, 1, 1, 5, 'BEGINNER', 'INTERMEDIATE', 1, 'LOW', CURRENT_TIMESTAMP),
(4, 1, 1, 6, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(5, 2, 3, 4, 'INTERMEDIATE', 'EXPERT', 2, 'MEDIUM', CURRENT_TIMESTAMP),
(6, 2, 3, 7, 'BEGINNER', 'ADVANCED', 2, 'HIGH', CURRENT_TIMESTAMP),
(7, 2, 3, 6, 'BEGINNER', 'INTERMEDIATE', 1, 'LOW', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 9. AI Recommendations
INSERT INTO ai_recommendations (id, employee_id, skill_id, gap_level, recommendation, model_name, generated_at) VALUES
(1, 2, 7, 'HIGH', 'Focus on Technical Documentation & Writing. Step 1: Complete Technical Communication Course. Step 2: Practice drafting software specification docs. Step 3: Review standard template frameworks.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP),
(2, 2, 4, 'MEDIUM', 'Enhance Product Lifecycle Management. Step 1: Study Advanced Agile Leadership. Step 2: Participate in roadmap planning. Step 3: Earn PMP or Certified Scrum Master credential.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP),
(3, 1, 1, 'MEDIUM', 'Master Advanced Spring Boot. Step 1: Study Spring Security & OAuth2. Step 2: Implement microservice caching with Redis. Step 3: Build reactive REST endpoints using Spring WebFlux.', 'HuggingFace/Llama-3.1-8B-Instruct', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 10. External Courses
INSERT INTO external_courses (id, provider, title, description, skill_name, level, duration_hours, course_link) VALUES
(1, 'Udemy', 'Spring Boot 3, Spring 6 & Hibernate for Beginners', 'Complete Spring Boot guide from basics to advanced microservices.', 'Java & Spring Boot', 'Beginner', 30, 'https://www.udemy.com'),
(2, 'Coursera', 'Mastering PostgreSQL 16', 'Comprehensive database administration, indexing and SQL optimization.', 'PostgreSQL Database Management', 'Intermediate', 20, 'https://www.coursera.org'),
(3, 'Udemy', 'Docker and Kubernetes: The Complete Guide', 'Container orchestration and Docker packaging for microservices.', 'Docker & Containerization', 'Intermediate', 22, 'https://www.udemy.com')
ON CONFLICT (id) DO NOTHING;

-- 11. Learning Paths
INSERT INTO learning_paths (id, employee_id, skill_id, current_level, target_level, course_title, course_level, sequence_order, estimated_hours, course_link, created_at) VALUES
(1, 1, 1, 'INTERMEDIATE', 'EXPERT', 'Full-Stack Java Cloud Mastery', 'Advanced', 1, 40, 'https://www.udemy.com', CURRENT_TIMESTAMP),
(2, 2, 7, 'BEGINNER', 'ADVANCED', 'Executive Technical Communication', 'Intermediate', 1, 25, 'https://www.coursera.org', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Reset PostgreSQL Sequences safely
SELECT setval(pg_get_serial_sequence('app_users', 'id'), COALESCE((SELECT MAX(id) FROM app_users), 1));
SELECT setval(pg_get_serial_sequence('department', 'id'), COALESCE((SELECT MAX(id) FROM department), 1));
SELECT setval(pg_get_serial_sequence('job_role', 'id'), COALESCE((SELECT MAX(id) FROM job_role), 1));
SELECT setval(pg_get_serial_sequence('employee', 'id'), COALESCE((SELECT MAX(id) FROM employee), 1));
SELECT setval(pg_get_serial_sequence('skill', 'id'), COALESCE((SELECT MAX(id) FROM skill), 1));
SELECT setval(pg_get_serial_sequence('employee_skill', 'id'), COALESCE((SELECT MAX(id) FROM employee_skill), 1));
SELECT setval(pg_get_serial_sequence('competency_requirement', 'id'), COALESCE((SELECT MAX(id) FROM competency_requirement), 1));
SELECT setval(pg_get_serial_sequence('skill_gaps', 'id'), COALESCE((SELECT MAX(id) FROM skill_gaps), 1));
SELECT setval(pg_get_serial_sequence('ai_recommendations', 'id'), COALESCE((SELECT MAX(id) FROM ai_recommendations), 1));
SELECT setval(pg_get_serial_sequence('external_courses', 'id'), COALESCE((SELECT MAX(id) FROM external_courses), 1));
SELECT setval(pg_get_serial_sequence('learning_paths', 'id'), COALESCE((SELECT MAX(id) FROM learning_paths), 1));
