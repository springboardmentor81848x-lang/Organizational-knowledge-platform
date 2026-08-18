USE okgip_db;

DROP TABLE IF EXISTS career_paths;

CREATE TABLE career_paths (

    career_path_id INT AUTO_INCREMENT PRIMARY KEY,

    path_name VARCHAR(150) NOT NULL,

    description TEXT,

    target_designation_id INT NOT NULL,

    minimum_experience DECIMAL(4,1),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_career_designation
        FOREIGN KEY(target_designation_id)
        REFERENCES designations(designation_id)

);