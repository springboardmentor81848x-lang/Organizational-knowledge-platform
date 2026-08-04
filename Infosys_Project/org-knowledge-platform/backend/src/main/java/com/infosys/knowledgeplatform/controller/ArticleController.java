package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.Article;
import com.infosys.knowledgeplatform.repository.ArticleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
@CrossOrigin(origins = "http://localhost:5173")
public class ArticleController {

    @Autowired
    private ArticleRepository articleRepository;

    @GetMapping
    public List<Article> getAllArticles() {
        return articleRepository.findAll();
    }

    @GetMapping("/{id}")
    public Article getArticleById(@PathVariable Long id) {
        return articleRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Article createArticle(@RequestBody Article article) {
        return articleRepository.save(article);
    }

    @PutMapping("/{id}")
    public Article updateArticle(@PathVariable Long id, @RequestBody Article articleDetails) {
        Article article = articleRepository.findById(id).orElse(null);
        if (article != null) {
            article.setTitle(articleDetails.getTitle());
            article.setAuthor(articleDetails.getAuthor());
            article.setDateStr(articleDetails.getDateStr());
            article.setStatus(articleDetails.getStatus());
            return articleRepository.save(article);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteArticle(@PathVariable Long id) {
        articleRepository.deleteById(id);
    }
}
