CREATE TABLE IF NOT EXISTS employee_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL,
    skill_id BIGINT,
    skill_name VARCHAR(255),
    proficiency INT,
    target_proficiency INT,
    updated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL,
    program_id BIGINT,
    program_title VARCHAR(255),
    provider VARCHAR(255),
    status VARCHAR(50),
    progress_percent INT,
    enrolled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL
);
