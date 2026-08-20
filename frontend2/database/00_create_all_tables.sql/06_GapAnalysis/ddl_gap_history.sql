USE okgip_db;

DROP TABLE IF EXISTS gap_history;

CREATE TABLE gap_history (

    history_id INT AUTO_INCREMENT PRIMARY KEY,

    gap_id INT NOT NULL,

    previous_gap_score DECIMAL(5,2),

    updated_gap_score DECIMAL(5,2),

    improvement_percentage DECIMAL(5,2),

    remarks TEXT,

    updated_by INT,

    updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_gaphistory_gap
        FOREIGN KEY(gap_id)
        REFERENCES knowledge_gaps(gap_id)
        ON DELETE CASCADE

);