package com.infosys.knowledgeplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

// Excluding security auto-configuration temporarily so we can test the API without setting up full JWT yet
@SpringBootApplication(exclude = { SecurityAutoConfiguration.class })
public class KnowledgePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(KnowledgePlatformApplication.class, args);
    }
}
