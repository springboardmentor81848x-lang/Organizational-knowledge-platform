USE okgip_db;

DROP TABLE IF EXISTS mentor_feedback;

CREATE TABLE mentor_feedback (

    feedback_id INT AUTO_INCREMENT PRIMARY KEY,

    session_id INT NOT NULL,

    employee_id INT NOT NULL,

    rating INT CHECK (rating BETWEEN 1 AND 5),

    feedback_comments TEXT,

    feedback_date DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mentor_feedback_session
        FOREIGN KEY(session_id)
        REFERENCES mentor_sessions(session_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_mentor_feedback_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)

);