package com.infosys.knowledgeplatform.repository;

import com.infosys.knowledgeplatform.model.Article;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<Article, Long> {
}
