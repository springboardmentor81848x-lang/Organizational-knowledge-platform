DROP DATABASE IF EXISTS okgip_db;
CREATE DATABASE okgip_db;
USE okgip_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ==========================================
-- MODULE 01 : AUTHENTICATION
-- ==========================================
DROP TABLE IF EXISTS permissions;
CREATE TABLE permissions (
    permission_id INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    module_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS roles;
CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    account_status ENUM('Active','Inactive','Locked')
        DEFAULT 'Active',
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS user_roles;
CREATE TABLE user_roles (
    user_role_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    assigned_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_userrole_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_userrole_role
        FOREIGN KEY (role_id)
        REFERENCES roles(role_id)
        ON DELETE CASCADE
);

-- ==========================================
-- MODULE 02 : EMPLOYEE
-- ==========================================

DROP TABLE IF EXISTS departments;

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    department_code VARCHAR(20) UNIQUE,
    description TEXT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS designations;

CREATE TABLE designations (
    designation_id INT AUTO_INCREMENT PRIMARY KEY,
    designation_name VARCHAR(100) NOT NULL UNIQUE,
    designation_level VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS employees;

CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department_id INT,
    designation_id INT,
    joining_date DATE,
    experience_years DECIMAL(4,1),
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_department
    FOREIGN KEY (department_id)
    REFERENCES departments(department_id),

    CONSTRAINT fk_employee_designation
    FOREIGN KEY (designation_id)
    REFERENCES designations(designation_id)

);

DROP TABLE IF EXISTS employees;
CREATE TABLE employees (
    employee_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department_id INT,
    designation_id INT,
    joining_date DATE,
    experience_years DECIMAL(4,1),
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_employee_department
    FOREIGN KEY (department_id)
    REFERENCES departments(department_id),

    CONSTRAINT fk_employee_designation
    FOREIGN KEY (designation_id)
    REFERENCES designations(designation_id)

);

-- ==========================================
-- MODULE 02 : skills
-- ==========================================

DROP TABLE IF EXISTS skill_categories;

CREATE TABLE skill_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    status ENUM('Active','Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);
DROP TABLE IF EXISTS skills;

CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    skill_name VARCHAR(150) NOT NULL UNIQUE,
    skill_description TEXT,
    skill_type ENUM('Technical','Soft Skill','Domain') DEFAULT 'Technical',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_category
        FOREIGN KEY(category_id)
        REFERENCES skill_categories(category_id)
);



DROP TABLE IF EXISTS employee_skills;
CREATE TABLE employee_skills (
    employee_skill_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency_level ENUM(
        'Beginner',
        'Intermediate',
        'Advanced',
        'Expert'
    ) DEFAULT 'Beginner',
    experience_years DECIMAL(4,1),
    last_assessed DATE,
    verified_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_skill_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_skill_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE

);

-- ==========================================
-- MODULE 04 : COMPETENCY
-- ==========================================

DROP TABLE IF EXISTS competency_levels;

CREATE TABLE competency_levels (
    competency_level_id INT AUTO_INCREMENT PRIMARY KEY,
    level_name VARCHAR(50) NOT NULL UNIQUE,
    min_score INT NOT NULL,
    max_score INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);

DROP TABLE IF EXISTS employee_competencies;

CREATE TABLE employee_competencies (
    employee_competency_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    skill_id INT NOT NULL,
    competency_level_id INT NOT NULL,
    current_score DECIMAL(5,2),
    target_score DECIMAL(5,2),
    last_updated DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_comp_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_comp_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_comp_level
        FOREIGN KEY(competency_level_id)
        REFERENCES competency_levels(competency_level_id)

);

DROP TABLE IF EXISTS assessment_types;

CREATE TABLE assessment_types (
    assessment_type_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    total_marks INT,
    passing_marks INT,
    duration_minutes INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);
DROP TABLE IF EXISTS assessments;
CREATE TABLE assessments (
    assessment_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_type_id INT NOT NULL,
    assessment_title VARCHAR(150) NOT NULL,
    assessment_date DATE,
    created_by INT,
    status ENUM('Scheduled','Completed','Cancelled')
        DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_assessment_type
        FOREIGN KEY(assessment_type_id)
        REFERENCES assessment_types(assessment_type_id)

);
DROP TABLE IF EXISTS assessment_results;
CREATE TABLE assessment_results (
    result_id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    employee_id INT NOT NULL,
    obtained_marks DECIMAL(5,2),
    percentage DECIMAL(5,2),
    competency_level_id INT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_result_assessment
        FOREIGN KEY(assessment_id)
        REFERENCES assessments(assessment_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_competency
        FOREIGN KEY(competency_level_id)
        REFERENCES competency_levels(competency_level_id)

);

DROP TABLE IF EXISTS knowledge_gaps;

CREATE TABLE knowledge_gaps (
    gap_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    skill_id INT NOT NULL,
    current_competency_level INT NOT NULL,
    target_competency_level INT NOT NULL,
    gap_score DECIMAL(5,2),
    priority ENUM('Low','Medium','High','Critical')
        DEFAULT 'Medium',
    status ENUM('Open','In Progress','Closed')
        DEFAULT 'Open',
    identified_date DATE,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_gap_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_gap_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id),

    CONSTRAINT fk_gap_current_level
        FOREIGN KEY(current_competency_level)
        REFERENCES competency_levels(competency_level_id),

    CONSTRAINT fk_gap_target_level
        FOREIGN KEY(target_competency_level)
        REFERENCES competency_levels(competency_level_id)

);


DROP TABLE IF EXISTS gap_history;
CREATE TABLE gap_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    gap_id INT NOT NULL,
    previous_gap_score DECIMAL(5,2),
    updated_gap_score DECIMAL(5,2),
    improvement_percentage DECIMAL(5,2),
    remarks TEXT,
    updated_by INT,
    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gaphistory_gap
        FOREIGN KEY(gap_id)
        REFERENCES knowledge_gaps(gap_id)
        ON DELETE CASCADE

);

DROP TABLE IF EXISTS ai_recommendations;

CREATE TABLE ai_recommendations (
    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    skill_id INT NOT NULL,
    gap_id INT NOT NULL,
    recommendation_type ENUM(
        'Training',
        'Certification',
        'Mentoring',
        'Project'
    ) DEFAULT 'Training',
    recommendation_title VARCHAR(200) NOT NULL,
    recommendation_description TEXT,
    priority ENUM(
        'Low',
        'Medium',
        'High'
    ) DEFAULT 'Medium',
    recommendation_status ENUM(
        'Pending',
        'Accepted',
        'Rejected',
        'Completed'
    ) DEFAULT 'Pending',
    generated_by VARCHAR(100) DEFAULT 'AI Engine',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_ai_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id),

    CONSTRAINT fk_ai_gap
        FOREIGN KEY(gap_id)
        REFERENCES knowledge_gaps(gap_id)

);


DROP TABLE IF EXISTS recommendation_history;
CREATE TABLE recommendation_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    recommendation_id INT NOT NULL,
    employee_id INT NOT NULL,
    action_taken ENUM(
        'Viewed',
        'Accepted',
        'Rejected',
        'Completed'
    ) NOT NULL,

    remarks TEXT,

    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_recommendation
        FOREIGN KEY(recommendation_id)
        REFERENCES ai_recommendations(recommendation_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);


DROP TABLE IF EXISTS training_courses;

CREATE TABLE training_courses (

    course_id INT AUTO_INCREMENT PRIMARY KEY,

    course_name VARCHAR(150) NOT NULL,

    course_code VARCHAR(30) UNIQUE,

    provider_name VARCHAR(150),

    course_type ENUM(
        'Online',
        'Offline',
        'Hybrid'
    ) DEFAULT 'Online',

    duration_hours INT,

    skill_id INT NOT NULL,

    course_description TEXT,

    status ENUM(
        'Active',
        'Inactive'
    ) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_course_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id)

);

DROP TABLE IF EXISTS employee_training;

CREATE TABLE employee_training (

    employee_training_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    course_id INT NOT NULL,

    enrollment_date DATE,

    completion_date DATE,

    training_status ENUM(
        'Enrolled',
        'In Progress',
        'Completed',
        'Dropped'
    ) DEFAULT 'Enrolled',

    progress_percentage DECIMAL(5,2) DEFAULT 0,

    score DECIMAL(5,2),

    certificate_issued BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_training_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_training_course
        FOREIGN KEY(course_id)
        REFERENCES training_courses(course_id)

);


DROP TABLE IF EXISTS employee_training;

CREATE TABLE employee_training (

    employee_training_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    course_id INT NOT NULL,

    enrollment_date DATE,

    completion_date DATE,

    training_status ENUM(
        'Enrolled',
        'In Progress',
        'Completed',
        'Dropped'
    ) DEFAULT 'Enrolled',

    progress_percentage DECIMAL(5,2) DEFAULT 0,

    score DECIMAL(5,2),

    certificate_issued BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_training_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_training_course
        FOREIGN KEY(course_id)
        REFERENCES training_courses(course_id)

);

DROP TABLE IF EXISTS certifications;

CREATE TABLE certifications (

    certification_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    course_id INT NOT NULL,

    certification_name VARCHAR(150) NOT NULL,

    issuing_organization VARCHAR(150),

    certification_code VARCHAR(100) UNIQUE,

    issue_date DATE,

    expiry_date DATE,

    certificate_url VARCHAR(255),

    verification_status ENUM(
        'Pending',
        'Verified',
        'Rejected'
    ) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_certification_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_certification_course
        FOREIGN KEY(course_id)
        REFERENCES training_courses(course_id)

);

DROP TABLE IF EXISTS reports;

CREATE TABLE reports (

    report_id INT AUTO_INCREMENT PRIMARY KEY,

    report_name VARCHAR(150) NOT NULL,

    report_type ENUM(
        'Skill Gap',
        'Assessment',
        'Training',
        'Certification',
        'Performance'
    ) NOT NULL,

    generated_by INT,

    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    report_format ENUM(
        'PDF',
        'Excel',
        'CSV'
    ) DEFAULT 'PDF',

    report_path VARCHAR(255),

    remarks TEXT,

    CONSTRAINT fk_report_user
        FOREIGN KEY(generated_by)
        REFERENCES users(user_id)

);

DROP TABLE IF EXISTS career_paths;

CREATE TABLE career_paths (

    career_path_id INT AUTO_INCREMENT PRIMARY KEY,

    path_name VARCHAR(150) NOT NULL,

    description TEXT,

    target_designation_id INT NOT NULL,

    minimum_experience DECIMAL(4,1),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_career_designation
        FOREIGN KEY(target_designation_id)
        REFERENCES designations(designation_id)

);


DROP TABLE IF EXISTS employee_career_goals;

CREATE TABLE employee_career_goals (

    goal_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    career_path_id INT NOT NULL,

    target_completion_date DATE,

    goal_status ENUM(
        'Planned',
        'In Progress',
        'Completed'
    ) DEFAULT 'Planned',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_goal_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_goal_path
        FOREIGN KEY(career_path_id)
        REFERENCES career_paths(career_path_id)

);

DROP TABLE IF EXISTS career_progress;

CREATE TABLE career_progress (

    progress_id INT AUTO_INCREMENT PRIMARY KEY,

    goal_id INT NOT NULL,

    completed_courses INT DEFAULT 0,

    completed_skills INT DEFAULT 0,

    overall_progress DECIMAL(5,2) DEFAULT 0,

    last_updated DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_progress_goal
        FOREIGN KEY(goal_id)
        REFERENCES employee_career_goals(goal_id)
        ON DELETE CASCADE

);


DROP TABLE IF EXISTS article_categories;

CREATE TABLE article_categories (

    category_id INT AUTO_INCREMENT PRIMARY KEY,

    category_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    status ENUM('Active','Inactive') DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);


DROP TABLE IF EXISTS knowledge_articles;

CREATE TABLE knowledge_articles (

    article_id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,

    article_content LONGTEXT NOT NULL,

    author_id INT NOT NULL,

    published_date DATE,

    article_status ENUM(
        'Draft',
        'Published',
        'Archived'
    ) DEFAULT 'Draft',

    views INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_article_category
        FOREIGN KEY(category_id)
        REFERENCES article_categories(category_id),

    CONSTRAINT fk_article_author
        FOREIGN KEY(author_id)
        REFERENCES users(user_id)

);


DROP TABLE IF EXISTS article_bookmarks;

CREATE TABLE article_bookmarks (

    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,

    article_id INT NOT NULL,

    employee_id INT NOT NULL,

    bookmarked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookmark_article
        FOREIGN KEY(article_id)
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bookmark_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE

);

DROP TABLE IF EXISTS article_feedback;

CREATE TABLE article_feedback (

    feedback_id INT AUTO_INCREMENT PRIMARY KEY,

    article_id INT NOT NULL,

    employee_id INT NOT NULL,

    rating INT CHECK (rating BETWEEN 1 AND 5),

    comments TEXT,

    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_article
        FOREIGN KEY(article_id)
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_articlefeedback_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE

);

DROP TABLE IF EXISTS achievement_badges;

CREATE TABLE achievement_badges (

    badge_id INT AUTO_INCREMENT PRIMARY KEY,

    badge_name VARCHAR(100) NOT NULL UNIQUE,

    badge_description TEXT,

    badge_icon VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);

DROP TABLE IF EXISTS achievements;

CREATE TABLE achievements (

    achievement_id INT AUTO_INCREMENT PRIMARY KEY,

    achievement_name VARCHAR(150) NOT NULL,

    achievement_description TEXT,

    achievement_type ENUM(
        'Training',
        'Certification',
        'Performance',
        'Innovation',
        'Leadership'
    ) DEFAULT 'Performance',

    badge_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_achievement_badge
        FOREIGN KEY(badge_id)
        REFERENCES achievement_badges(badge_id)

);

DROP TABLE IF EXISTS employee_achievements;

CREATE TABLE employee_achievements (

    employee_achievement_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    achievement_id INT NOT NULL,

    awarded_date DATE,

    awarded_by INT,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_achievement_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_achievement
        FOREIGN KEY(achievement_id)
        REFERENCES achievements(achievement_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_awarded_by
        FOREIGN KEY(awarded_by)
        REFERENCES users(user_id)

);

DROP TABLE IF EXISTS mentors;

CREATE TABLE mentors (

    mentor_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    specialization VARCHAR(150),

    experience_years DECIMAL(4,1),

    mentor_status ENUM(
        'Active',
        'Inactive'
    ) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_mentor_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);


DROP TABLE IF EXISTS mentor_assignments;

CREATE TABLE mentor_assignments (

    assignment_id INT AUTO_INCREMENT PRIMARY KEY,

    mentor_id INT NOT NULL,

    employee_id INT NOT NULL,

    assigned_date DATE,

    assignment_status ENUM(
        'Active',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Active',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_mentor
        FOREIGN KEY(mentor_id)
        REFERENCES mentors(mentor_id),

    CONSTRAINT fk_assignment_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);

DROP TABLE IF EXISTS mentor_sessions;

CREATE TABLE mentor_sessions (

    session_id INT AUTO_INCREMENT PRIMARY KEY,

    assignment_id INT NOT NULL,

    session_title VARCHAR(150),

    session_date DATE,

    duration_minutes INT,

    meeting_link VARCHAR(255),

    session_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_session_assignment
        FOREIGN KEY(assignment_id)
        REFERENCES mentor_assignments(assignment_id)
        ON DELETE CASCADE

);

DROP TABLE IF EXISTS mentor_feedback;

CREATE TABLE mentor_feedback (

    feedback_id INT AUTO_INCREMENT PRIMARY KEY,

    session_id INT NOT NULL,

    employee_id INT NOT NULL,

    rating INT CHECK (rating BETWEEN 1 AND 5),

    feedback_comments TEXT,

    feedback_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mentorfeedback_session
        FOREIGN KEY(session_id)
        REFERENCES mentor_sessions(session_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_feedback_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);