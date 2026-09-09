-- Safe demo data for Milestone 3. Existing application data is preserved.

-- Add a few training courses only when they do not already exist.
INSERT INTO training_courses(course_name, category, difficulty_level, duration_hours, description)
SELECT 'Java Microservices Deep Dive','Architecture','Advanced',18,'Production-ready microservices with Spring Boot and API Gateway.'
WHERE NOT EXISTS (SELECT 1 FROM training_courses WHERE course_name='Java Microservices Deep Dive');
INSERT INTO training_courses(course_name, category, difficulty_level, duration_hours, description)
SELECT 'Enterprise System Design','Architecture','Advanced',22,'Distributed systems, caching, resilience and architecture patterns.'
WHERE NOT EXISTS (SELECT 1 FROM training_courses WHERE course_name='Enterprise System Design');
INSERT INTO training_courses(course_name, category, difficulty_level, duration_hours, description)
SELECT 'Cloud Application Development with Docker','DevOps','Intermediate',16,'Containerize applications and operate scalable workloads.'
WHERE NOT EXISTS (SELECT 1 FROM training_courses WHERE course_name='Cloud Application Development with Docker');
INSERT INTO training_courses(course_name, category, difficulty_level, duration_hours, description)
SELECT 'Ultimate AWS Solutions Architect','DevOps','Intermediate',25,'AWS compute, storage, databases, networking and IAM.'
WHERE NOT EXISTS (SELECT 1 FROM training_courses WHERE course_name='Ultimate AWS Solutions Architect');
INSERT INTO training_courses(course_name, category, difficulty_level, duration_hours, description)
SELECT 'Kubernetes in Production','DevOps','Advanced',20,'Deploy, manage and scale Kubernetes workloads.'
WHERE NOT EXISTS (SELECT 1 FROM training_courses WHERE course_name='Kubernetes in Production');

-- Create mentor profiles for existing non-primary users where possible.
INSERT INTO mentors(user_id, expertise, wants_to_learn, department, bio, rating, sessions_count)
SELECT u.user_id, '["Java","Spring Boot","System Design"]'::jsonb, '["Kubernetes","Cloud"]'::jsonb,
       COALESCE(r.role_name,'Engineering'), 'Knowledge-sharing mentor from the existing organization database.', 4.8, 0
FROM users u
LEFT JOIN roles r ON r.role_id=u.role_id
WHERE u.user_id <> 1
  AND NOT EXISTS (SELECT 1 FROM mentors m WHERE m.user_id=u.user_id)
ORDER BY u.user_id
LIMIT 3;

-- Sessions require mentors; seed one or two if mentors exist.
INSERT INTO knowledge_sessions(mentor_id,topic,description,session_date,duration_minutes,capacity,status,meeting_url)
SELECT m.id,'Spring Boot Architecture & Security','Practical architecture and security review.',CURRENT_TIMESTAMP + INTERVAL '7 days',60,30,'Upcoming','https://meet.google.com/'
FROM mentors m
WHERE NOT EXISTS (SELECT 1 FROM knowledge_sessions WHERE topic='Spring Boot Architecture & Security')
ORDER BY m.id LIMIT 1;
INSERT INTO knowledge_sessions(mentor_id,topic,description,session_date,duration_minutes,capacity,status,meeting_url)
SELECT m.id,'Containerizing Applications with Docker','Hands-on containerization patterns.',CURRENT_TIMESTAMP + INTERVAL '11 days',60,30,'Upcoming','https://meet.google.com/'
FROM mentors m
WHERE NOT EXISTS (SELECT 1 FROM knowledge_sessions WHERE topic='Containerizing Applications with Docker')
ORDER BY m.id DESC LIMIT 1;

-- Create assessment records only when the existing DB has a training enrollment for user 1.
INSERT INTO assessments(enrollment_id,title,type,category,due_date,questions_count,estimated_minutes,status,subject_user_id,skill_name)
SELECT te.enrollment_id,'Spring Boot & Microservices Self-Assessment','Self Assessment','Backend',CURRENT_DATE+7,10,15,'Pending',u.user_id,'Microservices'
FROM training_enrollment te
JOIN employee_profile ep ON ep.profile_id=te.profile_id
JOIN users u ON u.user_id=ep.user_id
WHERE u.user_id=1
  AND NOT EXISTS (SELECT 1 FROM assessments a WHERE a.subject_user_id=1 AND a.title='Spring Boot & Microservices Self-Assessment')
ORDER BY te.enrollment_id LIMIT 1;

INSERT INTO assessments(enrollment_id,title,type,category,due_date,questions_count,estimated_minutes,status,subject_user_id,skill_name)
SELECT te.enrollment_id,'SQL & Relational Databases Evaluation','Self Assessment','Database',CURRENT_DATE-3,10,15,'Completed',u.user_id,'SQL'
FROM training_enrollment te
JOIN employee_profile ep ON ep.profile_id=te.profile_id
JOIN users u ON u.user_id=ep.user_id
WHERE u.user_id=1
  AND NOT EXISTS (SELECT 1 FROM assessments a WHERE a.subject_user_id=1 AND a.title='SQL & Relational Databases Evaluation')
ORDER BY te.enrollment_id LIMIT 1;

-- Notifications use the existing schema's boolean read flag.
INSERT INTO notifications(user_id,title,message,notification_type,is_read)
SELECT 1,'Critical skill gap detected','Review your latest skill gaps and recommended learning actions.','GAP_ALERT',FALSE
WHERE EXISTS (SELECT 1 FROM users WHERE user_id=1)
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=1 AND title='Critical skill gap detected');
INSERT INTO notifications(user_id,title,message,notification_type,is_read)
SELECT 1,'Mentorship reminder','A knowledge-sharing session is available this week.','MENTORSHIP',FALSE
WHERE EXISTS (SELECT 1 FROM users WHERE user_id=1)
  AND NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=1 AND title='Mentorship reminder');

INSERT INTO knowledge_resources(title,resource_type,skill_name,description,url,author_user_id)
SELECT 'Spring Boot Security Guide','Article','Spring Boot','Practical reference for securing production APIs.','https://spring.io/guides',u.user_id
FROM users u WHERE u.user_id=1
AND NOT EXISTS (SELECT 1 FROM knowledge_resources WHERE title='Spring Boot Security Guide');
INSERT INTO knowledge_resources(title,resource_type,skill_name,description,url,author_user_id)
SELECT 'Kubernetes Documentation','Resource','Kubernetes','Deployment and operations reference.','https://kubernetes.io/docs/',u.user_id
FROM users u WHERE u.user_id=1
AND NOT EXISTS (SELECT 1 FROM knowledge_resources WHERE title='Kubernetes Documentation');

INSERT INTO communities(name,description,owner_user_id)
SELECT 'Cloud Native Engineering','Share Docker, Kubernetes, AWS and microservices knowledge.',u.user_id
FROM users u WHERE u.user_id=1
AND NOT EXISTS (SELECT 1 FROM communities WHERE name='Cloud Native Engineering');
INSERT INTO communities(name,description,owner_user_id)
SELECT 'Java Backend Guild','Peer learning community for Java and Spring developers.',u.user_id
FROM users u WHERE u.user_id=1
AND NOT EXISTS (SELECT 1 FROM communities WHERE name='Java Backend Guild');
