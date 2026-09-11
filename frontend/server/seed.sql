INSERT INTO users (id,name,email,role,target_role) VALUES
(1,'Bingi Prashanthi','prashanthi123@org.com','Employee','Software Developer'),
(2,'Rahul Kumar','rahul@example.com','Mentor','Senior Software Engineer'),
(3,'Sneha Patil','sneha@example.com','Mentor','DevOps Lead'),
(4,'Vikram Malhotra','vikram@example.com','Mentor','Full Stack Architect')
ON CONFLICT (id) DO NOTHING;
SELECT setval('users_id_seq',(SELECT COALESCE(MAX(id),1) FROM users));
INSERT INTO skills(name,category) VALUES
('Java','Programming'),('Spring Boot','Framework'),('System Design','Architecture'),('Microservices','Architecture'),('Docker','DevOps'),('AWS','DevOps'),('Kubernetes','DevOps'),('SQL','Database'),('React','Frontend'),('Terraform','DevOps'),('CI/CD Automation','DevOps') ON CONFLICT(name) DO NOTHING;
INSERT INTO user_skills(user_id,skill_name,category,proficiency_level,score) VALUES
(1,'Java','Programming','Advanced',85),(1,'Spring Boot','Framework','Intermediate',60),(1,'SQL','Database','Intermediate',55),(1,'System Design','Architecture','Intermediate',60),(1,'Microservices','Architecture','Beginner',35),(1,'Docker','DevOps','Beginner',35),(1,'AWS','DevOps','Beginner',35),(1,'Kubernetes','DevOps','Beginner',30)
ON CONFLICT(user_id,skill_name) DO UPDATE SET score=EXCLUDED.score,proficiency_level=EXCLUDED.proficiency_level;
INSERT INTO role_requirements(role_name,skill_name,category,required_level,required_score) VALUES
('Software Developer','Java','Programming','Advanced',85),('Software Developer','Spring Boot','Framework','Intermediate',60),('Software Developer','System Design','Architecture','Advanced',85),('Software Developer','Microservices','Architecture','Advanced',85),('Software Developer','Docker','DevOps','Intermediate',60),('Software Developer','AWS','DevOps','Intermediate',60),('Software Developer','Kubernetes','DevOps','Advanced',85)
ON CONFLICT(role_name,skill_name) DO NOTHING;
INSERT INTO courses(title,provider,description,level,duration,category,skill_name,rating,url,icon) VALUES
('Java Microservices Deep Dive','Infosys Springboard','Production-ready microservices with Spring Boot and API Gateway.','Advanced','18 hrs','Architecture','Microservices',4.9,'https://springboard.infosys.com','🚀'),
('Enterprise System Design','Infosys Springboard','Distributed systems, caching, resilience and architecture patterns.','Advanced','22 hrs','Architecture','System Design',4.9,'https://springboard.infosys.com','🕸️'),
('Cloud Application Development with Docker','Coursera','Containerize applications and operate scalable workloads.','Intermediate','16 hrs','DevOps','Docker',4.8,'https://www.coursera.org','🐳'),
('Ultimate AWS Solutions Architect','Udemy','AWS compute, storage, databases, networking and IAM.','Intermediate','25 hrs','DevOps','AWS',4.7,'https://www.udemy.com','☁️'),
('Kubernetes in Production','Coursera','Deploy, manage and scale Kubernetes workloads.','Advanced','20 hrs','DevOps','Kubernetes',4.8,'https://www.coursera.org','☸️')
ON CONFLICT DO NOTHING;
INSERT INTO mentors(user_id,expertise,wants_to_learn,department,bio,rating,sessions_count) VALUES
(2,'["Java","Spring Boot","Kafka"]','["Kubernetes","Rust"]','Cloud Engineering','Senior architect focused on distributed systems and Java platforms.',4.9,14),
(3,'["Docker","AWS","CI/CD Automation"]','["Spring Security","React"]','Infrastructure','Cloud and DevOps specialist helping teams ship reliably.',4.8,22),
(4,'["React","System Design","TypeScript"]','["GraphQL","Kubernetes"]','UI/UX Platform','Frontend architect and performance mentor.',4.9,19)
ON CONFLICT(user_id) DO NOTHING;
INSERT INTO knowledge_sessions(mentor_id,topic,description,session_date,duration_minutes,capacity,status,meeting_url)
SELECT m.id,'Deep Dive into Spring Boot 3 & JWT Security','Practical architecture and security review.',CURRENT_TIMESTAMP + INTERVAL '7 days',60,30,'Upcoming','https://meet.google.com/' FROM mentors m WHERE m.user_id=2
AND NOT EXISTS(SELECT 1 FROM knowledge_sessions WHERE topic='Deep Dive into Spring Boot 3 & JWT Security');
INSERT INTO knowledge_sessions(mentor_id,topic,description,session_date,duration_minutes,capacity,status,meeting_url)
SELECT m.id,'Containerizing Spring Applications with Docker','Hands-on containerization patterns.',CURRENT_TIMESTAMP + INTERVAL '11 days',60,30,'Upcoming','https://meet.google.com/' FROM mentors m WHERE m.user_id=3
AND NOT EXISTS(SELECT 1 FROM knowledge_sessions WHERE topic='Containerizing Spring Applications with Docker');
INSERT INTO assessments(title,type,category,due_date,questions_count,estimated_minutes,status,subject_user_id,skill_name)
SELECT 'Spring Boot & Microservices Self-Assessment','Self Assessment','Backend',CURRENT_DATE+7,15,20,'Pending',1,'Microservices'
WHERE NOT EXISTS (SELECT 1 FROM assessments WHERE title='Spring Boot & Microservices Self-Assessment' AND subject_user_id=1);
INSERT INTO assessments(title,type,category,due_date,questions_count,estimated_minutes,status,subject_user_id,skill_name)
SELECT '360-Degree Peer Assessment: Rahul Kumar','Peer Review','Peer Feedback',CURRENT_DATE+10,10,15,'Pending',1,'System Design'
WHERE NOT EXISTS (SELECT 1 FROM assessments WHERE title='360-Degree Peer Assessment: Rahul Kumar' AND subject_user_id=1);
INSERT INTO assessments(title,type,category,due_date,questions_count,estimated_minutes,status,subject_user_id,skill_name)
SELECT 'SQL & Relational Databases Evaluation','Self Assessment','Database',CURRENT_DATE-10,10,15,'Completed',1,'SQL'
WHERE NOT EXISTS (SELECT 1 FROM assessments WHERE title='SQL & Relational Databases Evaluation' AND subject_user_id=1);
INSERT INTO enrollments(user_id,course_id,status,progress,completed_modules,total_modules)
SELECT 1,c.id,'In Progress',65,8,12 FROM courses c WHERE c.title LIKE 'Java Microservices%' AND NOT EXISTS(SELECT 1 FROM enrollments e WHERE e.user_id=1 AND e.course_id=c.id);
INSERT INTO enrollments(user_id,course_id,status,progress,completed_modules,total_modules)
SELECT 1,c.id,'In Progress',40,4,10 FROM courses c WHERE c.title='Enterprise System Design' AND NOT EXISTS(SELECT 1 FROM enrollments e WHERE e.user_id=1 AND e.course_id=c.id);
INSERT INTO notifications(user_id,title,message,type)
SELECT 1,'Critical skill gap detected','Microservices and Kubernetes require immediate upskilling.','GAP_ALERT' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=1 AND title='Critical skill gap detected');
INSERT INTO notifications(user_id,title,message,type)
SELECT 1,'Learning milestone','You reached 65% progress in Java Microservices Deep Dive.','MILESTONE' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=1 AND title='Learning milestone');
INSERT INTO notifications(user_id,title,message,type)
SELECT 1,'Mentorship reminder','A knowledge-sharing session is available this week.','MENTORSHIP' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=1 AND title='Mentorship reminder');
INSERT INTO notifications(user_id,title,message,type)
SELECT 1,'Assessment due','Your Spring Boot & Microservices self-assessment is due soon.','ASSESSMENT' WHERE NOT EXISTS (SELECT 1 FROM notifications WHERE user_id=1 AND title='Assessment due');

INSERT INTO knowledge_resources(title,resource_type,skill_name,description,url,author_user_id) SELECT 'Spring Boot Security Checklist','Article','Spring Boot','Practical security checklist for production APIs.','https://spring.io/guides',2 WHERE NOT EXISTS(SELECT 1 FROM knowledge_resources WHERE title='Spring Boot Security Checklist');
INSERT INTO knowledge_resources(title,resource_type,skill_name,description,url,author_user_id) SELECT 'Kubernetes Production Guide','Resource','Kubernetes','Deployment and operations reference.','https://kubernetes.io/docs/',3 WHERE NOT EXISTS(SELECT 1 FROM knowledge_resources WHERE title='Kubernetes Production Guide');
INSERT INTO communities(name,description,owner_user_id) SELECT 'Cloud Native Engineering','Share Docker, Kubernetes, AWS and microservices knowledge.',3 WHERE NOT EXISTS(SELECT 1 FROM communities WHERE name='Cloud Native Engineering');
INSERT INTO communities(name,description,owner_user_id) SELECT 'Java Backend Guild','Peer learning community for Java and Spring developers.',2 WHERE NOT EXISTS(SELECT 1 FROM communities WHERE name='Java Backend Guild');
