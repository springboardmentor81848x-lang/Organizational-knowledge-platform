-- =========================================================
-- OKGIP (Organizational Knowledge Gap & Intelligence Platform)
-- Master MySQL Database Schema Architecture
-- Database Name: okgip_db
-- =========================================================

CREATE DATABASE IF NOT EXISTS okgip_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE okgip_db;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_code VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(50),
    profile_photo TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_code (user_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. USER_ROLES JUNCTION TABLE
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_role (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    department_code VARCHAR(50) UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(20),
    description TEXT,
    department_head_id BIGINT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dept_code (department_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS employees (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(50) UNIQUE,
    user_id BIGINT UNIQUE,
    department_id BIGINT,
    designation VARCHAR(150),
    manager_id BIGINT,
    joining_date DATE,
    employment_status VARCHAR(50) DEFAULT 'ACTIVE',
    phone VARCHAR(50),
    avatar_url TEXT,
    casual_leave_balance INT DEFAULT 12,
    medical_leave_balance INT DEFAULT 10,
    performance_score DOUBLE DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_emp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_emp_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    INDEX idx_emp_code (employee_code),
    INDEX idx_emp_dept (department_id),
    INDEX idx_emp_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. SKILLS TABLE
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_code VARCHAR(50) UNIQUE,
    name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(100),
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_skill_code (skill_code),
    INDEX idx_skill_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. DEPARTMENT REQUIRED SKILLS
CREATE TABLE IF NOT EXISTS department_required_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dept_req_code VARCHAR(50) UNIQUE,
    department_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    required_proficiency INT NOT NULL DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_dept_skill (department_id, skill_id),
    CONSTRAINT fk_drs_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    CONSTRAINT fk_drs_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. EMPLOYEE SKILLS TABLE
CREATE TABLE IF NOT EXISTS employee_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_skill_code VARCHAR(50) UNIQUE,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    current_proficiency INT NOT NULL DEFAULT 1,
    assessed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_by VARCHAR(150) DEFAULT 'Automated Assessment Engine',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emp_skill (employee_id, skill_id),
    CONSTRAINT fk_eks_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_eks_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_emp_skills_emp (employee_id),
    INDEX idx_emp_skills_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. KNOWLEDGE GAPS TABLE
CREATE TABLE IF NOT EXISTS knowledge_gaps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    gap_code VARCHAR(50) UNIQUE,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    required_proficiency INT NOT NULL,
    current_proficiency INT NOT NULL,
    gap_score INT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'IDENTIFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_emp_skill_gap (employee_id, skill_id),
    CONSTRAINT fk_gap_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_gap_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_gaps_emp (employee_id),
    INDEX idx_gaps_priority (priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. SKILL ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS skill_assessments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assessment_code VARCHAR(50) UNIQUE,
    skill_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    pass_score INT DEFAULT 70,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ass_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_ass_code (assessment_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. ASSESSMENT QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS assessment_questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_code VARCHAR(50) UNIQUE,
    assessment_id BIGINT NOT NULL,
    question TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255) NOT NULL,
    option_d VARCHAR(255) NOT NULL,
    correct_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_q_ass FOREIGN KEY (assessment_id) REFERENCES skill_assessments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. ASSESSMENT RESULTS TABLE
CREATE TABLE IF NOT EXISTS assessment_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    result_code VARCHAR(50) UNIQUE,
    employee_id BIGINT NOT NULL,
    assessment_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    score INT NOT NULL,
    passed BOOLEAN NOT NULL,
    new_proficiency_level INT NOT NULL,
    previous_proficiency_level INT DEFAULT 0,
    gap_before INT DEFAULT 0,
    gap_after INT DEFAULT 0,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_res_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_res_ass FOREIGN KEY (assessment_id) REFERENCES skill_assessments(id) ON DELETE CASCADE,
    CONSTRAINT fk_res_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_results_emp (employee_id),
    INDEX idx_results_code (result_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. LEARNING PATHS TABLE
CREATE TABLE IF NOT EXISTS learning_paths (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    path_code VARCHAR(50) UNIQUE,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    target_level INT DEFAULT 4,
    progress_percentage INT DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lp_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_lp_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_lp_code (path_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. LEARNING RESOURCES TABLE
CREATE TABLE IF NOT EXISTS learning_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    resource_code VARCHAR(50) UNIQUE,
    learning_path_id BIGINT,
    platform VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    skill_id BIGINT,
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    resource_type VARCHAR(50) DEFAULT 'Course',
    duration_minutes INT DEFAULT 180,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lr_lp FOREIGN KEY (learning_path_id) REFERENCES learning_paths(id) ON DELETE CASCADE,
    CONSTRAINT fk_lr_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 15. TRAINING PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS training_programs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    training_code VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    target_skill_id BIGINT,
    min_proficiency_gain INT DEFAULT 1,
    duration_hours INT DEFAULT 8,
    provider VARCHAR(100) DEFAULT 'Internal Academy',
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tp_skill FOREIGN KEY (target_skill_id) REFERENCES skills(id) ON DELETE SET NULL,
    INDEX idx_trn_code (training_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 16. TRAINING ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS training_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_code VARCHAR(50) UNIQUE,
    training_program_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    assigned_by BIGINT,
    assigned_date DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Assigned',
    progress_percentage INT DEFAULT 0,
    certificate_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ta_tp FOREIGN KEY (training_program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
    CONSTRAINT fk_ta_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_asn_code (assignment_code),
    INDEX idx_asn_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 17. LEAVE TYPES TABLE
CREATE TABLE IF NOT EXISTS leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    default_days INT DEFAULT 12,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 18. LEAVE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    leave_code VARCHAR(50) UNIQUE,
    employee_id BIGINT NOT NULL,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INT DEFAULT 1,
    reason TEXT,
    current_approver_id BIGINT,
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lv_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_leave_code (leave_code),
    INDEX idx_leave_emp (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 19. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_code VARCHAR(50) UNIQUE,
    recipient_user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) DEFAULT 'SYSTEM',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id VARCHAR(100),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_user FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_code (notification_code),
    INDEX idx_notif_user (recipient_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 20. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    audit_code VARCHAR(50) NOT NULL UNIQUE,
    actor_user_id BIGINT,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSON,
    new_values JSON,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_code (audit_code),
    INDEX idx_audit_actor (actor_user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 21. BADGES TABLE
CREATE TABLE IF NOT EXISTS badges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    badge_code VARCHAR(50) UNIQUE,
    title VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(100),
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 22. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS certificates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    certificate_code VARCHAR(50) UNIQUE,
    employee_id BIGINT NOT NULL,
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(100),
    issue_date DATE,
    certificate_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cert_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 23. TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_code VARCHAR(50) UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to BIGINT NOT NULL,
    assigned_by BIGINT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'PENDING',
    deadline DATE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tsk_to FOREIGN KEY (assigned_to) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_tsk_by FOREIGN KEY (assigned_by) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 24. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    message_code VARCHAR(50) UNIQUE,
    sender_id BIGINT NOT NULL,
    recipient_id BIGINT,
    is_announcement BOOLEAN DEFAULT FALSE,
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_msg_recip FOREIGN KEY (recipient_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 25. AI RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS ai_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rec_code VARCHAR(50) UNIQUE,
    employee_id BIGINT NOT NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rec_emp FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
