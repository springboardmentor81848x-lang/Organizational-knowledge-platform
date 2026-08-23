-- Seed Assessments for Skills
INSERT INTO assessment (id, title, skill_id, total_questions, assessment_type) VALUES
(1, 'Java & Spring Boot Self Assessment', 1, 5, 'SELF'),
(2, 'PostgreSQL Database Management Self Assessment', 2, 5, 'SELF'),
(3, 'React & Modern Frontend Self Assessment', 3, 5, 'SELF'),
(4, 'AI/ML & LLM Integration Self Assessment', 4, 5, 'SELF'),
(5, 'Docker & Containerization Self Assessment', 5, 5, 'SELF'),
(6, 'Kubernetes & Cloud Architecture Self Assessment', 6, 5, 'SELF'),
(7, 'REST API Design Self Assessment', 7, 5, 'SELF'),
(8, 'Technical Documentation & Writing Self Assessment', 8, 5, 'SELF'),
(9, 'Product Lifecycle Management Self Assessment', 9, 5, 'SELF'),
(10, 'Cyber Risk Assessment Self Assessment', 10, 5, 'SELF'),
(11, 'Data Pipelines & BigQuery Self Assessment', 11, 5, 'SELF'),
(12, 'UI/UX Design & Prototyping Self Assessment', 12, 5, 'SELF'),

(13, 'Java & Spring Boot Peer Assessment', 1, 5, 'PEER'),
(14, 'PostgreSQL Database Management Peer Assessment', 2, 5, 'PEER'),
(15, 'React & Modern Frontend Peer Assessment', 3, 5, 'PEER'),
(16, 'AI/ML & LLM Integration Peer Assessment', 4, 5, 'PEER'),
(17, 'Docker & Containerization Peer Assessment', 5, 5, 'PEER'),
(18, 'Kubernetes & Cloud Architecture Peer Assessment', 6, 5, 'PEER'),
(19, 'REST API Design Peer Assessment', 7, 5, 'PEER'),
(20, 'Technical Documentation & Writing Peer Assessment', 8, 5, 'PEER'),
(21, 'Product Lifecycle Management Peer Assessment', 9, 5, 'PEER'),
(22, 'Cyber Risk Assessment Peer Assessment', 10, 5, 'PEER'),
(23, 'Data Pipelines & BigQuery Peer Assessment', 11, 5, 'PEER'),
(24, 'UI/UX Design & Prototyping Peer Assessment', 12, 5, 'PEER'),

(25, 'Java & Spring Boot Manager Assessment', 1, 5, 'MANAGER'),
(26, 'PostgreSQL Database Management Manager Assessment', 2, 5, 'MANAGER'),
(27, 'React & Modern Frontend Manager Assessment', 3, 5, 'MANAGER'),
(28, 'AI/ML & LLM Integration Manager Assessment', 4, 5, 'MANAGER'),
(29, 'Docker & Containerization Manager Assessment', 5, 5, 'MANAGER'),
(30, 'Kubernetes & Cloud Architecture Manager Assessment', 6, 5, 'MANAGER'),
(31, 'REST API Design Manager Assessment', 7, 5, 'MANAGER'),
(32, 'Technical Documentation & Writing Manager Assessment', 8, 5, 'MANAGER'),
(33, 'Product Lifecycle Management Manager Assessment', 9, 5, 'MANAGER'),
(34, 'Cyber Risk Assessment Manager Assessment', 10, 5, 'MANAGER'),
(35, 'Data Pipelines & BigQuery Manager Assessment', 11, 5, 'MANAGER'),
(36, 'UI/UX Design & Prototyping Manager Assessment', 12, 5, 'MANAGER')
ON CONFLICT (id) DO NOTHING;

-- Questions for Java & Spring Boot (Assessment 1)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(1, 1, 'Which annotation is used to mark a class as a Spring Boot application?', '@Controller', '@RestController', '@SpringBootApplication', '@Service', 'C'),
(2, 1, 'What is the default port of a Spring Boot application?', '8081', '8080', '9090', '3000', 'B'),
(3, 1, 'Which dependency is used to connect Spring Boot with a database?', 'Spring Boot DevTools', 'Spring Data JPA', 'Spring Web', 'Spring Security', 'B'),
(4, 1, 'What does the @Autowired annotation do?', 'Creates a new object', 'Injects a dependency', 'Deletes a dependency', 'Updates a dependency', 'B'),
(5, 1, 'Which interface is used for creating CRUD operations in Spring Data JPA?', 'JPARepository', 'CrudRepository', 'PagingAndSortingRepository', 'All of the above', 'D')
ON CONFLICT (id) DO NOTHING;

-- Questions for PostgreSQL (Assessment 2)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(6, 2, 'Which command is used to create a new database in PostgreSQL?', 'CREATE DATABASE', 'NEW DATABASE', 'ADD DATABASE', 'INSERT DATABASE', 'A'),
(7, 2, 'What is the default port for PostgreSQL?', '3306', '5432', '1521', '27017', 'B'),
(8, 2, 'Which data type is used for auto-incrementing primary keys in PostgreSQL?', 'AUTO_INCREMENT', 'SERIAL', 'IDENTITY', 'SEQUENCE', 'B'),
(9, 2, 'How do you filter results in a SELECT statement?', 'WHERE', 'FILTER', 'HAVING', 'GROUP BY', 'A'),
(10, 2, 'Which JOIN returns all records when there is a match in either left or right table?', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN', 'D')
ON CONFLICT (id) DO NOTHING;

-- Questions for React & Modern Frontend (Assessment 3)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(11, 3, 'What is React?', 'A library for building user interfaces', 'A database management system', 'A programming language', 'A web server', 'A'),
(12, 3, 'Which hook is used for managing state in functional components?', 'useEffect', 'useContext', 'useState', 'useReducer', 'C'),
(13, 3, 'What is JSX?', 'A database query language', 'JavaScript XML', 'A CSS preprocessor', 'A package manager', 'B'),
(14, 3, 'How do you pass data from a parent component to a child component?', 'Using state', 'Using context', 'Using props', 'Using hooks', 'C'),
(15, 3, 'Which hook is used for side effects in React?', 'useState', 'useMemo', 'useEffect', 'useCallback', 'C')
ON CONFLICT (id) DO NOTHING;

-- Questions for AI/ML (Assessment 4)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(16, 4, 'What is supervised learning?', 'Learning from unlabeled data', 'Learning from labeled data', 'Learning through trial and error', 'Learning without human intervention', 'B'),
(17, 4, 'What does LLM stand for?', 'Large Language Model', 'Linear Logical Model', 'Long Learning Machine', 'Latent Language Matrix', 'A'),
(18, 4, 'Which metric is commonly used for evaluating classification models?', 'Mean Squared Error', 'Accuracy', 'R-squared', 'Standard Deviation', 'B'),
(19, 4, 'What is overfitting?', 'Model performs well on training data but poorly on test data', 'Model performs poorly on both training and test data', 'Model is too simple to capture patterns', 'Model is perfectly balanced', 'A'),
(20, 4, 'Which library is most popular for Deep Learning in Python?', 'Pandas', 'NumPy', 'PyTorch', 'Matplotlib', 'C')
ON CONFLICT (id) DO NOTHING;

-- Questions for Docker (Assessment 5)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(21, 5, 'What is a Docker image?', 'A running instance of a container', 'A read-only template used to create containers', 'A physical server', 'A network protocol', 'B'),
(22, 5, 'Which command is used to build a Docker image?', 'docker start', 'docker build', 'docker run', 'docker pull', 'B'),
(23, 5, 'What file is used to define the steps to create a Docker image?', 'docker.config', 'Makefile', 'Dockerfile', 'package.json', 'C'),
(24, 5, 'What is the purpose of Docker Compose?', 'To compile Java code', 'To manage multiple containers as a single service', 'To design UI', 'To query databases', 'B'),
(25, 5, 'Which command list all running Docker containers?', 'docker images', 'docker ps', 'docker ls', 'docker info', 'B')
ON CONFLICT (id) DO NOTHING;

-- Questions for Kubernetes (Assessment 6)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(26, 6, 'What is a Pod in Kubernetes?', 'The smallest deployable unit', 'A type of database', 'A networking hardware', 'A programming language', 'A'),
(27, 6, 'What is the CLI tool for Kubernetes?', 'kube-start', 'k8s-cli', 'kubectl', 'kubemanager', 'C'),
(28, 6, 'What is a Service in Kubernetes?', 'A way to expose an application running on a set of Pods', 'A background task', 'A UI component', 'A deployment script', 'A'),
(29, 6, 'What is a Namespace used for?', 'To group resources within a cluster', 'To name Pods', 'To define image versions', 'To store secrets', 'A'),
(30, 6, 'What is a ReplicaSet?', 'Ensures a specified number of pod replicas are running', 'A set of backup images', 'A load balancer', 'A monitoring tool', 'A')
ON CONFLICT (id) DO NOTHING;

-- Questions for REST API Design (Assessment 7)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(31, 7, 'What does REST stand for?', 'Representational State Transfer', 'Random Extended State Task', 'Resource Easy Standard Transfer', 'Remote Simple Text', 'A'),
(32, 7, 'Which HTTP method is typically used to update a resource?', 'GET', 'POST', 'PUT', 'DELETE', 'C'),
(33, 7, 'What is the standard data format for REST APIs?', 'XML', 'HTML', 'JSON', 'CSV', 'C'),
(34, 7, 'What is the HTTP status code for "Not Found"?', '200', '400', '404', '500', 'C'),
(35, 7, 'What is idempotency in REST?', 'Multiple identical requests have the same effect as a single request', 'Requests are always faster the second time', 'Requests must be authenticated', 'Data is encrypted', 'A')
ON CONFLICT (id) DO NOTHING;

-- Questions for Technical Documentation (Assessment 8)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(36, 8, 'What is the primary goal of technical documentation?', 'To make code look good', 'To explain complex information clearly', 'To increase lines of code', 'To prevent users from using the product', 'B'),
(37, 8, 'Which format is commonly used for technical documentation?', 'Markdown', 'JPG', 'MP3', 'EXE', 'A'),
(38, 8, 'What is an API reference document?', 'A list of employees', 'A guide for developers on how to use an API', 'A marketing brochure', 'A legal contract', 'B'),
(39, 8, 'Why is versioning important in documentation?', 'To track changes over time', 'To make files larger', 'To hide older information', 'It is not important', 'A'),
(40, 8, 'What is a "README" file?', 'A file providing information about other files in a directory', 'A file containing user passwords', 'A script to delete files', 'A hidden configuration file', 'A')
ON CONFLICT (id) DO NOTHING;

-- Questions for Product Lifecycle (Assessment 9)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(41, 9, 'What is the "Minimum Viable Product" (MVP)?', 'A product with only essential features to satisfy early customers', 'A product that is cheap to build', 'A product with no features', 'A prototype that is never released', 'A'),
(42, 9, 'What is the "Agile" methodology?', 'A rigid project plan', 'An iterative approach to software development', 'A waterfall process', 'A one-time development phase', 'B'),
(43, 9, 'What is a "Sprint" in Scrum?', 'A long-term project', 'A short, fixed period of time to complete specific work', 'A running race', 'A type of database query', 'B'),
(44, 9, 'What is "Product Market Fit"?', 'A marketing campaign', 'When a product satisfies a strong market demand', 'When a product is physically small', 'When a product has a lot of colors', 'B'),
(45, 9, 'What is the role of a Product Manager?', 'To write all the code', 'To bridge the gap between business, design, and engineering', 'To test hardware', 'To manage the office building', 'B')
ON CONFLICT (id) DO NOTHING;

-- Questions for Cyber Risk (Assessment 10)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(46, 10, 'What is "Phishing"?', 'Catching fish', 'Attempting to acquire sensitive information by masquerading as a trustworthy entity', 'A type of computer virus', 'A network firewall', 'B'),
(47, 10, 'What does "MFA" stand for?', 'Multi-Factor Authentication', 'Main Firewall Access', 'Multi-Functional Algorithm', 'Master File Archive', 'A'),
(48, 10, 'What is a "Vulnerability"?', 'A strong security feature', 'A weakness in an information system that could be exploited', 'A type of data backup', 'An encryption key', 'B'),
(49, 10, 'What is the "Least Privilege" principle?', 'Giving everyone admin access', 'Giving users only the access they need to perform their job', 'Giving no access to anyone', 'Randomizing user permissions', 'B'),
(50, 10, 'What is an "Encryption Key"?', 'A password for the building', 'A piece of information used to encode and decode data', 'A hardware component', 'A type of internet connection', 'B')
ON CONFLICT (id) DO NOTHING;

-- Questions for Data Pipelines (Assessment 11)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(51, 11, 'What is "ETL"?', 'Extract, Transform, Load', 'Extended Task List', 'Enter Total Level', 'Execute Time Limit', 'A'),
(52, 11, 'What is a "Data Warehouse"?', 'A place to store physical computers', 'A central repository of integrated data from different sources', 'A temporary file storage', 'A type of network router', 'B'),
(53, 11, 'What is BigQuery?', 'A NoSQL database', 'A fully-managed, serverless data warehouse on GCP', 'A code editor', 'A cloud storage bucket', 'B'),
(54, 11, 'What is a "Data Pipeline"?', 'A physical pipe for data', 'A set of data processing steps', 'A database index', 'A UI library', 'B'),
(55, 11, 'What is the difference between Batch and Stream processing?', 'Batch processes data in groups; Stream processes data in real-time', 'Batch is faster than Stream', 'Stream is only for video', 'There is no difference', 'A')
ON CONFLICT (id) DO NOTHING;

-- Questions for UI/UX (Assessment 12)
INSERT INTO assessment_question (id, assessment_id, question_text, optionA, optionB, optionC, optionD, correct_answer) VALUES
(56, 12, 'What is UI?', 'User Interface', 'Universal Intelligence', 'Unique Identifier', 'User Insight', 'A'),
(57, 12, 'What is UX?', 'User Experience', 'Unix Exchange', 'User Extension', 'User X-ray', 'A'),
(58, 12, 'What is a Wireframe?', 'A high-fidelity prototype', 'A low-fidelity visual guide that represents the framework of a website', 'A 3D model', 'A CSS file', 'B'),
(59, 12, 'What is Typography in design?', 'The art of arranging type to make written language legible and appealing', 'The study of topographic maps', 'A type of programming language', 'The process of printing photos', 'A'),
(60, 12, 'Why is user research important?', 'To guess what users want', 'To understand user needs and behaviors', 'To make the design more expensive', 'It is not important', 'B')
ON CONFLICT (id) DO NOTHING;

-- Reset sequences
SELECT setval(pg_get_serial_sequence('assessment', 'id'), COALESCE(MAX(id), 1)) FROM assessment;
SELECT setval(pg_get_serial_sequence('assessment_question', 'id'), COALESCE(MAX(id), 1)) FROM assessment_question;

-- Seed Mentorship Requests
INSERT INTO mentorship_request (id, mentee_id, mentor_id, skill_id, learning_goal, message, status, created_at, updated_at) VALUES
(1, 4, 16, 1, 'Master Java Microservices', 'Looking for guidance on Spring Security and performance tuning.', 'ACCEPTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 4, 18, 1, 'Java Performance Optimization', 'Need help understanding GC logs and thread dump analysis.', 'ACCEPTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 5, 23, 3, 'Advanced React State Management', 'Want to learn Redux Toolkit and custom hooks best practices.', 'ACCEPTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 6, 24, 2, 'PostgreSQL Indexing & Partitioning', 'Seeking advice on query execution plans and database scaling.', 'ACCEPTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(5, 7, 19, 6, 'Kubernetes Deployment Strategies', 'Need help with Helm charts and blue-green deployments.', 'ACCEPTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(6, 1, 16, 1, 'Enterprise Architecture Review', 'Discussing microservices transition strategy.', 'ACCEPTED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Seed Mentorship Sessions (Upcoming and Past)
INSERT INTO mentorship_session (id, mentorship_request_id, mentor_id, mentee_id, scheduled_at, duration_minutes, meeting_link, status, notes, created_at, updated_at) VALUES
-- Upcoming Sessions for Employee 4 (Aarav Sharma)
(1, 1, 16, 4, '2026-08-25T10:00:00', 45, 'https://meet.google.com/kgap-demo-java', 'SCHEDULED', 'Java Spring Boot REST & Microservices Architecture Review', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 2, 18, 4, '2026-08-28T14:30:00', 60, 'https://meet.google.com/kgap-demo-perf', 'SCHEDULED', 'JVM Performance Tuning & Memory Leak Debugging', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Past Sessions for Employee 4 (Aarav Sharma)
(3, 1, 16, 4, '2026-08-10T11:00:00', 45, 'https://meet.google.com/kgap-demo-intro', 'COMPLETED', 'Initial Mentorship Kickoff & Goal Alignment', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(4, 2, 18, 4, '2026-08-15T15:00:00', 60, 'https://meet.google.com/kgap-demo-spring', 'COMPLETED', 'Spring Security & JWT Authentication Deep Dive', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Upcoming Sessions for Employee 5 (Rohan Gupta)
(5, 3, 23, 5, '2026-08-26T11:30:00', 45, 'https://meet.google.com/kgap-demo-react', 'SCHEDULED', 'React 18 State Management & Custom Hooks', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Past Sessions for Employee 5 (Rohan Gupta)
(6, 3, 23, 5, '2026-08-12T16:00:00', 45, 'https://meet.google.com/kgap-demo-frontend', 'COMPLETED', 'Frontend Component Design System Review', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Upcoming Sessions for Employee 6 (Ananya Roy)
(7, 4, 24, 6, '2026-08-27T10:00:00', 60, 'https://meet.google.com/kgap-demo-sql', 'SCHEDULED', 'PostgreSQL Query Optimization & Indexing Strategies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Upcoming Sessions for Employee 7 (David Miller)
(8, 5, 19, 7, '2026-08-29T13:00:00', 60, 'https://meet.google.com/kgap-demo-k8s', 'SCHEDULED', 'Kubernetes Helm Charts & CI/CD Deployment Pipelines', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Sessions for Mentor 16 (Michael Chen as Mentor)
(9, 6, 16, 1, '2026-08-30T15:00:00', 60, 'https://meet.google.com/kgap-demo-arch', 'SCHEDULED', 'Enterprise Systems Architecture & Cloud Strategy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Reset sequences for mentorship tables
SELECT setval(pg_get_serial_sequence('mentorship_request', 'id'), COALESCE(MAX(id), 1)) FROM mentorship_request;
SELECT setval(pg_get_serial_sequence('mentorship_session', 'id'), COALESCE(MAX(id), 1)) FROM mentorship_session;