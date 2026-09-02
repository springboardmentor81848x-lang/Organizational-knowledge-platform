-- Migration 005: Skill Assessments, Questions, Attempts, and Results
USE okgip_db;

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
