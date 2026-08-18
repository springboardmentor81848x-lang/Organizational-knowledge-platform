USE okgip_db;

DROP TABLE IF EXISTS mentor_sessions;

CREATE TABLE mentor_sessions (

    session_id INT AUTO_INCREMENT PRIMARY KEY,

    assignment_id INT NOT NULL,

    session_title VARCHAR(150),

    session_date DATE,

    duration_minutes INT,

    meeting_link VARCHAR(255),

    session_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mentor_session_assignment
        FOREIGN KEY(assignment_id)
        REFERENCES mentor_assignments(assignment_id)
        ON DELETE CASCADE

);