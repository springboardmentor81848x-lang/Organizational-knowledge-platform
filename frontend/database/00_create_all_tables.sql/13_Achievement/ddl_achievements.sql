USE okgip_db;

DROP TABLE IF EXISTS achievements;

CREATE TABLE achievements (

    achievement_id INT AUTO_INCREMENT PRIMARY KEY,

    achievement_name VARCHAR(150) NOT NULL,

    achievement_description TEXT,

    achievement_type ENUM(
        'Training',
        'Certification',
        'Performance',
        'Innovation',
        'Leadership'
    ) DEFAULT 'Performance',

    badge_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_achievement_badge
        FOREIGN KEY(badge_id)
        REFERENCES achievement_badges(badge_id)

);