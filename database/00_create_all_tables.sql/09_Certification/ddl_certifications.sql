USE okgip_db;

DROP TABLE IF EXISTS certifications;

CREATE TABLE certifications (

    certification_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    course_id INT NOT NULL,

    certification_name VARCHAR(150) NOT NULL,

    issuing_organization VARCHAR(150),

    certification_code VARCHAR(100) UNIQUE,

    issue_date DATE,

    expiry_date DATE,

    certificate_url VARCHAR(255),

    verification_status ENUM(
        'Pending',
        'Verified',
        'Rejected'
    ) DEFAULT 'Pending',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_certification_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_certification_course
        FOREIGN KEY(course_id)
        REFERENCES training_courses(course_id)

);