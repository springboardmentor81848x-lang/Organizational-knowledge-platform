-- schema.sql
DROP TABLE IF EXISTS user_skills;
DROP TABLE IF EXISTS employee_skills;
DROP TABLE IF EXISTS enrollments;
DROP TABLE IF EXISTS skills;
DROP TABLE IF EXISTS training_programs;
DROP TABLE IF EXISTS employee_improvements;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(100),
    target_role VARCHAR(150),
    department VARCHAR(100)
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    description TEXT
);

CREATE TABLE user_skills (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    skill_id INT REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INT CHECK (proficiency_level BETWEEN 1 AND 5),
    required_level INT CHECK (required_level BETWEEN 1 AND 5)
);

CREATE TABLE training_programs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(100),
    url VARCHAR(500),
    target_skill_category VARCHAR(100),
    duration_hours INT
);

CREATE TABLE employee_improvements (
    id SERIAL PRIMARY KEY,
    employee_email VARCHAR(255) UNIQUE NOT NULL,
    employee_name VARCHAR(255),
    role VARCHAR(100),
    target_role VARCHAR(100),
    overall_score INT,
    gap_summary TEXT,
    enrolled_courses TEXT,
    improvement_summary TEXT,
    last_updated TIMESTAMP
);

CREATE TABLE employee_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_email VARCHAR(255) NOT NULL,
    skill_id BIGINT,
    skill_name VARCHAR(255),
    proficiency INT,
    target_proficiency INT,
    updated_at TIMESTAMP NULL
);

CREATE TABLE enrollments (
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
