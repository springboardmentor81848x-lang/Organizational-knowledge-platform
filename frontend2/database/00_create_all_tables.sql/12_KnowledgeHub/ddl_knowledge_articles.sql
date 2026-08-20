USE okgip_db;

DROP TABLE IF EXISTS knowledge_articles;

CREATE TABLE knowledge_articles (

    article_id INT AUTO_INCREMENT PRIMARY KEY,

    category_id INT NOT NULL,

    title VARCHAR(200) NOT NULL,

    article_content LONGTEXT NOT NULL,

    author_id INT NOT NULL,

    published_date DATE,

    article_status ENUM(
        'Draft',
        'Published',
        'Archived'
    ) DEFAULT 'Draft',

    views INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_article_category
        FOREIGN KEY(category_id)
        REFERENCES article_categories(category_id),

    CONSTRAINT fk_article_author
        FOREIGN KEY(author_id)
        REFERENCES users(user_id)

);