USE okgip_db;

DROP TABLE IF EXISTS recommendation_history;

CREATE TABLE recommendation_history (

    history_id INT AUTO_INCREMENT PRIMARY KEY,

    recommendation_id INT NOT NULL,

    employee_id INT NOT NULL,

    action_taken ENUM(
        'Viewed',
        'Accepted',
        'Rejected',
        'Completed'
    ) NOT NULL,

    remarks TEXT,

    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_recommendation
        FOREIGN KEY(recommendation_id)
        REFERENCES ai_recommendations(recommendation_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_history_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);