-- Migration 004: Skills, Department Required Skills, Employee Skills, and Knowledge Gaps
USE okgip_db;

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
