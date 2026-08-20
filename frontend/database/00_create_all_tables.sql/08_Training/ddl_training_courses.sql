USE okgip_db;

DROP TABLE IF EXISTS training_courses;

CREATE TABLE training_courses (

    course_id INT AUTO_INCREMENT PRIMARY KEY,

    course_name VARCHAR(150) NOT NULL,

    course_code VARCHAR(30) UNIQUE,

    provider_name VARCHAR(150),

    course_type ENUM(
        'Online',
        'Offline',
        'Hybrid'
    ) DEFAULT 'Online',

    duration_hours INT,

    skill_id INT NOT NULL,

    course_description TEXT,

    status ENUM(
        'Active',
        'Inactive'
    ) DEFAULT 'Active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_course_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id)

);