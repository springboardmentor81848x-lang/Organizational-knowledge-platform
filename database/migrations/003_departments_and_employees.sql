-- Migration 003: Departments and Employees
USE okgip_db;

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
