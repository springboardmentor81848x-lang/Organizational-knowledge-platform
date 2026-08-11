-- PostgreSQL Seed Data for Knowledge Gap Analysis Platform

-- Insert Default User
INSERT INTO users (id, name, email, role, target_role) 
VALUES (1, 'R Amrutha', 'amrutha@example.com', 'Employee', 'Software Developer')
ON CONFLICT (id) DO NOTHING;

-- Insert Role Requirements
INSERT INTO role_requirements (role_name, skill_name, category, required_level, required_score) VALUES
('Software Developer', 'Java', 'Programming', 'Advanced', 85),
('Software Developer', 'Spring Boot', 'Framework', 'Intermediate', 60),
('Software Developer', 'System Design', 'Architecture', 'Advanced', 85),
('Software Developer', 'Microservices', 'Architecture', 'Advanced', 85),
('Software Developer', 'Docker', 'DevOps', 'Intermediate', 60),
('Software Developer', 'AWS', 'DevOps', 'Intermediate', 60),
('Software Developer', 'Kubernetes', 'DevOps', 'Advanced', 85),
('Software Developer', 'SQL', 'Database', 'Intermediate', 60),
('Software Developer', 'React', 'Frontend', 'Intermediate', 60),

('Senior Software Engineer', 'System Design', 'Architecture', 'Expert', 95),
('Senior Software Engineer', 'Microservices', 'Architecture', 'Expert', 95),
('Senior Software Engineer', 'Java', 'Programming', 'Expert', 95),
('Senior Software Engineer', 'Docker', 'DevOps', 'Advanced', 85),
('Senior Software Engineer', 'Kubernetes', 'DevOps', 'Advanced', 85),
('Senior Software Engineer', 'AWS', 'DevOps', 'Advanced', 85)
ON CONFLICT (role_name, skill_name) DO NOTHING;

-- Insert User Skills
INSERT INTO user_skills (user_id, skill_name, category, proficiency_level, score) VALUES
(1, 'Java', 'Programming', 'Advanced', 85),
(1, 'Spring Boot', 'Framework', 'Intermediate', 60),
(1, 'SQL', 'Database', 'Intermediate', 55),
(1, 'System Design', 'Architecture', 'Intermediate', 60),
(1, 'Microservices', 'Architecture', 'Beginner', 35),
(1, 'Docker', 'DevOps', 'Beginner', 35),
(1, 'AWS', 'DevOps', 'Beginner', 35),
(1, 'Kubernetes', 'DevOps', 'Beginner', 30),
(1, 'React', 'Frontend', 'Intermediate', 60)
ON CONFLICT DO NOTHING;

-- Insert External Learning Catalog Courses
INSERT INTO courses (title, provider, description, level, duration, category, skill_name, rating, url, color, icon) VALUES
('Infosys Springboard: Java Microservices Deep Dive', 'Infosys Springboard', 'Master building production-ready Microservices using Spring Boot, Spring Cloud, and API Gateway.', 'Advanced', '18 hrs', 'Architecture', 'Microservices', 4.9, 'https://springboard.infosys.com', '#007cc3', '🚀'),
('Infosys Springboard: Enterprise System Design & Architecture', 'Infosys Springboard', 'Learn high-level system design, fault tolerance, caching, and distributed data handling.', 'Advanced', '22 hrs', 'Architecture', 'System Design', 4.9, 'https://springboard.infosys.com', '#007cc3', '🕸️'),
('Coursera: Cloud Application Development with Docker & Kubernetes', 'Coursera', 'Containerize applications and deploy scalable cluster applications on Cloud infrastructure.', 'Intermediate', '16 hrs', 'DevOps', 'Docker', 4.8, 'https://www.coursera.org', '#0056D2', '🐳'),
('Udemy: Ultimate AWS Certified Solutions Architect', 'Udemy', 'Comprehensive AWS Cloud training covering EC2, S3, RDS, Serverless, IAM, and Security.', 'Intermediate', '25 hrs', 'DevOps', 'AWS', 4.7, 'https://www.udemy.com', '#A435F0', '☁️'),
('Coursera: Kubernetes in Production & Orchestration', 'Coursera', 'Deploy, manage, and scale enterprise container workloads using Kubernetes and Helm.', 'Advanced', '20 hrs', 'DevOps', 'Kubernetes', 4.8, 'https://www.coursera.org', '#0056D2', '☸️'),
('Infosys Springboard: React & Redux Modern Frontend', 'Infosys Springboard', 'Build modern interactive Web applications with React Hooks, Context, and Redux Toolkit.', 'Intermediate', '15 hrs', 'Frontend', 'React', 4.7, 'https://springboard.infosys.com', '#007cc3', '⚛️'),
('Udemy: Advanced SQL & Relational Database Design', 'Udemy', 'Master complex queries, indexing, query execution plans, and schema optimization.', 'Intermediate', '12 hrs', 'Database', 'SQL', 4.6, 'https://www.udemy.com', '#A435F0', '🗄️')
ON CONFLICT DO NOTHING;
