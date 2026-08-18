USE okgip_db;

DROP TABLE IF EXISTS mentor_assignments;

CREATE TABLE mentor_assignments (

    assignment_id INT AUTO_INCREMENT PRIMARY KEY,

    mentor_id INT NOT NULL,

    employee_id INT NOT NULL,

    assigned_date DATE,

    assignment_status ENUM(
        'Active',
        'Completed',
        'Cancelled'
    ) DEFAULT 'Active',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignment_mentor
        FOREIGN KEY(mentor_id)
        REFERENCES mentors(mentor_id),

    CONSTRAINT fk_assignment_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);