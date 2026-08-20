USE okgip_db;

DROP TABLE IF EXISTS skills;

CREATE TABLE skills (

    skill_id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT NOT NULL,

    skill_name VARCHAR(150) NOT NULL UNIQUE,

    skill_description TEXT,

    skill_type ENUM('Technical','Soft Skill','Domain') DEFAULT 'Technical',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_skill_category
        FOREIGN KEY(category_id)
        REFERENCES skill_categories(category_id)

);