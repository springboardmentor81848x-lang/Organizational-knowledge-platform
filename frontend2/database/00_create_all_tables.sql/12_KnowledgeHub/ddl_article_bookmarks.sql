USE okgip_db;

DROP TABLE IF EXISTS article_bookmarks;

CREATE TABLE article_bookmarks (

    bookmark_id INT AUTO_INCREMENT PRIMARY KEY,

    article_id INT NOT NULL,

    employee_id INT NOT NULL,

    bookmarked_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_bookmark_article
        FOREIGN KEY(article_id)
        REFERENCES knowledge_articles(article_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bookmark_employee
        FOREIGN KEY(employee_id)
        REFERENCES employees(employee_id)
        ON DELETE CASCADE

);