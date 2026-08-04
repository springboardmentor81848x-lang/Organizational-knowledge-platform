-- data.sql
INSERT INTO users (name, email, role, department) VALUES 
('Alice Smith', 'alice@example.com', 'Senior Frontend', 'Engineering'),
('Bob Jones', 'bob@example.com', 'Backend Engineer', 'Engineering'),
('Carol White', 'carol@example.com', 'DevOps', 'Platform'),
('Dave Brown', 'dave@example.com', 'Marketing Lead', 'Marketing');

INSERT INTO skills (name, category, description) VALUES
('React', 'Frontend', 'React.js and UI components'),
('CSS', 'Frontend', 'Cascading Style Sheets & Design'),
('Java', 'Backend', 'Java 17 backend dev'),
('Spring Boot', 'Backend', 'Microservices with Spring'),
('AWS', 'DevOps', 'Cloud infrastructure'),
('SEO', 'Marketing', 'Search engine optimization');

INSERT INTO user_skills (user_id, skill_id, proficiency_level, required_level) VALUES
(1, 1, 5, 4), -- Alice knows React well
(1, 2, 5, 4),
(1, 3, 2, 3), -- Alice has backend gap
(2, 3, 4, 5), -- Bob has Java gap
(2, 4, 3, 5), -- Bob has Spring gap
(3, 5, 5, 4),
(4, 6, 2, 4); -- Dave has major SEO gap

INSERT INTO training_programs (title, provider, url, target_skill_category, duration_hours) VALUES
('Advanced Spring Boot Microservices', 'Internal Dept', 'http://internal/learning', 'Backend', 12),
('AWS Solutions Architect Prep', 'Coursera', 'https://coursera.org/...', 'DevOps', 40),
('Kafka Real-time Streams', 'Udemy', 'https://udemy.com/...', 'Backend', 8),
('SEO Fundamentals', 'LinkedIn Learning', 'https://linkedin.com/...', 'Marketing', 4);
