USE okgip_db;

DROP TABLE IF EXISTS employee_achievements;

CREATE TABLE employee_achievements (

    employee_achievement_id INT AUTO_INCREMENT PRIMARY KEY,

    employee_id INT NOT NULL,

    achievement_id INT NOT NULL,

    awarded_date DATE,

    awarded_by INT,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_emp_achievement_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_achievement
        FOREIGN KEY(achievement_id)
        REFERENCES achievements(achievement_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_emp_awarded_by
        FOREIGN KEY(awarded_by)
        REFERENCES users(user_id)

);