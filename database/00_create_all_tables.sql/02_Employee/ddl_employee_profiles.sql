USE okgip_db;
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