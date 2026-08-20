USE okgip_db;

DROP TABLE IF EXISTS reports;

CREATE TABLE reports (

    report_id INT AUTO_INCREMENT PRIMARY KEY,

    report_name VARCHAR(150) NOT NULL,

    report_type ENUM(
        'Skill Gap',
        'Assessment',
        'Training',
        'Certification',
        'Performance'
    ) NOT NULL,

    generated_by INT,

    generated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    report_format ENUM(
        'PDF',
        'Excel',
        'CSV'
    ) DEFAULT 'PDF',

    report_path VARCHAR(255),

    remarks TEXT,

    CONSTRAINT fk_report_user
        FOREIGN KEY(generated_by)
        REFERENCES users(user_id)

);