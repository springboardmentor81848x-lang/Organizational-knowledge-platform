USE okgip_db;

DROP TABLE IF EXISTS assessments;

CREATE TABLE assessments (

    assessment_id INT AUTO_INCREMENT PRIMARY KEY,

    assessment_type_id INT NOT NULL,

    assessment_title VARCHAR(150) NOT NULL,

    assessment_date DATE,

    created_by INT,

    status ENUM('Scheduled','Completed','Cancelled')
        DEFAULT 'Scheduled',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_assessment_type
        FOREIGN KEY(assessment_type_id)
        REFERENCES assessment_types(assessment_type_id)

);