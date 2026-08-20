USE okgip_db;

DROP TABLE IF EXISTS designations;

CREATE TABLE designations (

    designation_id INT AUTO_INCREMENT PRIMARY KEY,

    designation_name VARCHAR(100) NOT NULL UNIQUE,

    designation_level VARCHAR(50),

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP

);