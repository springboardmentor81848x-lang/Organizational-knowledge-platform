USE okgip_db;

DROP TABLE IF EXISTS assessment_types;

CREATE TABLE assessment_types (

    assessment_type_id INT AUTO_INCREMENT PRIMARY KEY,

    assessment_name VARCHAR(100) NOT NULL UNIQUE,

    description TEXT,

    total_marks INT,

    passing_marks INT,

    duration_minutes INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);

