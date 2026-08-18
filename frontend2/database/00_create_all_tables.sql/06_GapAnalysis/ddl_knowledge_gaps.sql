USE okgip_db;

DROP TABLE IF EXISTS knowledge_gaps;

CREATE TABLE knowledge_gaps (

    gap_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    skill_id INT NOT NULL,

    current_competency_level INT NOT NULL,

    target_competency_level INT NOT NULL,

    gap_score DECIMAL(5,2),

    priority ENUM('Low','Medium','High','Critical')
        DEFAULT 'Medium',

    status ENUM('Open','In Progress','Closed')
        DEFAULT 'Open',

    identified_date DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_gap_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_gap_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id),

    CONSTRAINT fk_gap_current_level
        FOREIGN KEY(current_competency_level)
        REFERENCES competency_levels(competency_level_id),

    CONSTRAINT fk_gap_target_level
        FOREIGN KEY(target_competency_level)
        REFERENCES competency_levels(competency_level_id)

);