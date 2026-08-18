USE okgip_db;

DROP TABLE IF EXISTS achievement_badges;

CREATE TABLE achievement_badges (

    badge_id INT AUTO_INCREMENT PRIMARY KEY,

    badge_name VARCHAR(100) NOT NULL UNIQUE,

    badge_description TEXT,

    badge_icon VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP

);