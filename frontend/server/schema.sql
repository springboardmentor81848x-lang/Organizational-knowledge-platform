-- PostgreSQL Database Schema for Knowledge Gap Analysis Platform

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    target_role VARCHAR(50) NOT NULL DEFAULT 'Software Developer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    proficiency_level VARCHAR(30) NOT NULL,
    score INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_requirements (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    required_level VARCHAR(30) NOT NULL,
    required_score INT NOT NULL,
    UNIQUE(role_name, skill_name)
);

CREATE TABLE IF NOT EXISTS gap_analysis_results (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(100) NOT NULL,
    critical_gaps_count INT DEFAULT 0,
    moderate_gaps_count INT DEFAULT 0,
    minor_gaps_count INT DEFAULT 0,
    gap_details JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    provider VARCHAR(80) NOT NULL,
    description TEXT NOT NULL,
    level VARCHAR(30) NOT NULL,
    duration VARCHAR(30) NOT NULL,
    category VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    rating NUMERIC(2,1) DEFAULT 4.5,
    url VARCHAR(255) NOT NULL,
    color VARCHAR(20) DEFAULT '#3b82f6',
    icon VARCHAR(20) DEFAULT '📚'
);

CREATE TABLE IF NOT EXISTS learning_paths (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    path_name VARCHAR(150) NOT NULL,
    target_role VARCHAR(100) NOT NULL,
    total_hours INT NOT NULL,
    estimated_weeks INT NOT NULL,
    steps JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
