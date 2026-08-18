USE okgip_db;

DROP TABLE IF EXISTS career_progress;

CREATE TABLE career_progress (

    progress_id INT AUTO_INCREMENT PRIMARY KEY,

    goal_id INT NOT NULL,

    completed_courses INT DEFAULT 0,

    completed_skills INT DEFAULT 0,

    overall_progress DECIMAL(5,2) DEFAULT 0,

    last_updated DATE,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_progress_goal
        FOREIGN KEY(goal_id)
        REFERENCES employee_career_goals(goal_id)
        ON DELETE CASCADE

);