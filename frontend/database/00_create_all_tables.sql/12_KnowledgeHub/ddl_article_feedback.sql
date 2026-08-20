USE okgip_db;

DROP TABLE IF EXISTS article_feedback;

CREATE TABLE article_feedback (

    feedback_id INT AUTO_INCREMENT PRIMARY KEY,

    article_id INT NOT NULL,

    employee_id INT NOT NULL,

    rating INT CHECK (rating BETWEEN 1 AND 5),

    comments TEXT,

    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_feedback_article
        FOREIGN KEY(article_id)
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_feedback_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE

);