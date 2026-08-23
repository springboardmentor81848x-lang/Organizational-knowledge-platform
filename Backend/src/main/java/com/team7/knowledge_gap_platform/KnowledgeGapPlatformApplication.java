package com.team7.knowledge_gap_platform;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.team7.knowledge_gap_platform.service.DatabaseSeederService;


@SpringBootApplication
public class KnowledgeGapPlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(KnowledgeGapPlatformApplication.class, args);
    }

    @Bean
    CommandLineRunner init(DatabaseSeederService seederService) {
        return args -> {
            System.out.println("Starting automatic database seeding...");
            String result = seederService.seedAll();
            System.out.println(result);
        };
    }
}

