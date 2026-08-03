USE okgip_db;

DROP TABLE IF EXISTS ai_recommendations;

CREATE TABLE ai_recommendations (

    recommendation_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    skill_id INT NOT NULL,

    gap_id INT NOT NULL,

    recommendation_type ENUM(
        'Training',
        'Certification',
        'Mentoring',
        'Project'
    ) DEFAULT 'Training',

    recommendation_title VARCHAR(200) NOT NULL,

    recommendation_description TEXT,

    priority ENUM(
        'Low',
        'Medium',
        'High'
    ) DEFAULT 'Medium',

    recommendation_status ENUM(
        'Pending',
        'Accepted',
        'Rejected',
        'Completed'
    ) DEFAULT 'Pending',

    generated_by VARCHAR(100) DEFAULT 'AI Engine',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_ai_skill
        FOREIGN KEY(skill_id)
        REFERENCES skills(skill_id),

    CONSTRAINT fk_ai_gap
        FOREIGN KEY(gap_id)
        REFERENCES knowledge_gaps(gap_id)

);