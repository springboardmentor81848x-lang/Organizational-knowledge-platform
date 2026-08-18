USE okgip_db;

DROP TABLE IF EXISTS competency_levels;

CREATE TABLE competency_levels (

    competency_level_id INT AUTO_INCREMENT PRIMARY KEY,

    level_name VARCHAR(50) NOT NULL UNIQUE,

    min_score INT NOT NULL,

    max_score INT NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);