USE okgip_db;

DROP TABLE IF EXISTS employee_training;

CREATE TABLE employee_training (

    employee_training_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    course_id INT NOT NULL,

    enrollment_date DATE,

    completion_date DATE,

    training_status ENUM(
        'Enrolled',
        'In Progress',
        'Completed',
        'Dropped'
    ) DEFAULT 'Enrolled',

    progress_percentage DECIMAL(5,2) DEFAULT 0,

    score DECIMAL(5,2),

    certificate_issued BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_training_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_training_course
        FOREIGN KEY(course_id)
        REFERENCES training_courses(course_id)

);