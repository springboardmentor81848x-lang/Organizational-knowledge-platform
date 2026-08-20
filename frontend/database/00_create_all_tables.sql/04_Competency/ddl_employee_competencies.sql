USE okgip_db;

DROP TABLE IF EXISTS employee_competencies;

CREATE TABLE employee_competencies (

    employee_competency_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    skill_id INT NOT NULL,

    competency_level_id INT NOT NULL,

    current_score DECIMAL(5,2),

    target_score DECIMAL(5,2),

    last_updated DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_comp_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_comp_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_comp_level
        FOREIGN KEY(competency_level_id)
        REFERENCES competency_levels(competency_level_id)

);