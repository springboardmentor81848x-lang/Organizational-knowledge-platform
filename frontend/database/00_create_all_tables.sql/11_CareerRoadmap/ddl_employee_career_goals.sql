USE okgip_db;

DROP TABLE IF EXISTS employee_career_goals;

CREATE TABLE employee_career_goals (

    goal_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    career_path_id INT NOT NULL,

    target_completion_date DATE,

    goal_status ENUM(
        'Planned',
        'In Progress',
        'Completed'
    ) DEFAULT 'Planned',

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_goal_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id),

    CONSTRAINT fk_goal_path
        FOREIGN KEY(career_path_id)
        REFERENCES career_paths(career_path_id)

);