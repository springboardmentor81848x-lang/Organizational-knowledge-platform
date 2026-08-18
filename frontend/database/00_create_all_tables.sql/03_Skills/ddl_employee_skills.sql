USE okgip_db;

DROP TABLE IF EXISTS employee_skills;

CREATE TABLE employee_skills (

    employee_skill_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    skill_id INT NOT NULL,

    proficiency_level ENUM(
        'Beginner',
        'Intermediate',
        'Advanced',
        'Expert'
    ) DEFAULT 'Beginner',

    experience_years DECIMAL(4,1),

    last_assessed DATE,

    verified_by INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_skill_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_skill_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id)
        ON DELETE CASCADE

);