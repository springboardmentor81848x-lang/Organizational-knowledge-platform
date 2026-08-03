package com.infosys.knowledgeplatform;

import com.infosys.knowledgeplatform.model.Article;
import com.infosys.knowledgeplatform.model.User;
import com.infosys.knowledgeplatform.repository.ArticleRepository;
import com.infosys.knowledgeplatform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User u1 = new User();
            u1.setName("Admin User");
            u1.setEmail("admin@infosys.com");
            u1.setRole("Admin");
            u1.setDepartment("IT");

            User u2 = new User();
            u2.setName("John Doe");
            u2.setEmail("john@infosys.com");
            u2.setRole("Employee");
            u2.setDepartment("HR");

            userRepository.saveAll(List.of(u1, u2));
        }

        if (articleRepository.count() == 0) {
            Article a1 = new Article();
            a1.setTitle("Company Holiday Schedule 2026");
            a1.setAuthor("HR Dept");
            a1.setDateStr(LocalDate.now());
            a1.setStatus("Published");

            Article a2 = new Article();
            a2.setTitle("Q3 Engineering OKRs");
            a2.setAuthor("Jane Smith");
            a2.setDateStr(LocalDate.now().minusDays(2));
            a2.setStatus("Draft");

            Article a3 = new Article();
            a3.setTitle("Frontend Styling Guide");
            a3.setAuthor("Frontend Team");
            a3.setDateStr(LocalDate.now().minusDays(5));
            a3.setStatus("Published");

            articleRepository.saveAll(List.of(a1, a2, a3));
        }
    }
}
