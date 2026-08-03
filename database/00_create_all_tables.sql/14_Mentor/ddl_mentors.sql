USE okgip_db;

DROP TABLE IF EXISTS mentors;

CREATE TABLE mentors (

    mentor_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    specialization VARCHAR(150),

    experience_years DECIMAL(4,1),

    mentor_status ENUM(
        'Active',
        'Inactive'
    ) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_mentor_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);