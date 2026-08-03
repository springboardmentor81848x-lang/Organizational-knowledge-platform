USE okgip_db;

DROP TABLE IF EXISTS assessment_results;

CREATE TABLE assessment_results (

    result_id INT AUTO_INCREMENT PRIMARY KEY,

    assessment_id INT NOT NULL,

    employee_id INT NOT NULL,

    obtained_marks DECIMAL(5,2),

    percentage DECIMAL(5,2),

    competency_level_id INT,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_result_assessment
        FOREIGN KEY(assessment_id)
        REFERENCES assessments(assessment_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_result_competency
        FOREIGN KEY(competency_level_id)
        REFERENCES competency_levels(competency_level_id)

);