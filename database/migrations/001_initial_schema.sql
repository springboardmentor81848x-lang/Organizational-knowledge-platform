-- Migration 001: Initial Database & Core Roles
CREATE DATABASE IF NOT EXISTS okgip_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE okgip_db;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_code VARCHAR(50) UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO roles (id, role_code, name, description) VALUES
(1, 'ROLE-000001', 'Admin', 'System Administrator'),
(2, 'ROLE-000002', 'Manager', 'Department & Team Manager'),
(3, 'ROLE-000003', 'HR Specialist', 'Human Resources Specialist'),
(4, 'ROLE-000004', 'Department Head', 'Executive Division Lead'),
(5, 'ROLE-000005', 'L&D Admin / Mentor', 'Learning & Development Administrator'),
(6, 'ROLE-000006', 'Employee', 'Standard Workforce Member')
ON DUPLICATE KEY UPDATE name=VALUES(name);
