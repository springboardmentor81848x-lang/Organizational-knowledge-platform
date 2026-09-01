-- Migration 006: Learning Paths, Resources, Training Programs, and Assignments
USE okgip_db;

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
