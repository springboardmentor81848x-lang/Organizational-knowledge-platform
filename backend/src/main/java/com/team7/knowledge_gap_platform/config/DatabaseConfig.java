package com.team7.knowledge_gap_platform.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url}")
    private String rawUrl;

    @Value("${spring.datasource.username:postgres}")
    private String username;

    @Value("${spring.datasource.password:root123}")
    private String password;

    @Bean
    @Primary
    public DataSource dataSource() {
        String finalUrl = rawUrl != null ? rawUrl.trim() : "";
        String finalUser = username;
        String finalPass = password;

        try {
            // If the URL contains credentials or non-standard JDBC format (e.g. postgresql://user:pass@host/db)
            String parseable = finalUrl;
            if (parseable.startsWith("jdbc:postgresql://")) {
                parseable = "http://" + parseable.substring("jdbc:postgresql://".length());
            } else if (parseable.startsWith("jdbc:postgres://")) {
                parseable = "http://" + parseable.substring("jdbc:postgres://".length());
            } else if (parseable.startsWith("postgresql://")) {
                parseable = "http://" + parseable.substring("postgresql://".length());
            } else if (parseable.startsWith("postgres://")) {
                parseable = "http://" + parseable.substring("postgres://".length());
            }

            if (parseable.startsWith("http://")) {
                URI uri = URI.create(parseable);

                // Extract embedded credentials if provided in the URL
                if (uri.getUserInfo() != null && !uri.getUserInfo().isEmpty()) {
                    String[] creds = uri.getUserInfo().split(":", 2);
                    if (creds.length > 0 && !creds[0].isEmpty()) {
                        finalUser = creds[0];
                    }
                    if (creds.length > 1 && !creds[1].isEmpty()) {
                        finalPass = creds[1];
                    }
                }

                String host = uri.getHost() != null ? uri.getHost() : "localhost";
                int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                String path = uri.getPath() != null && !uri.getPath().isEmpty() ? uri.getPath() : "/knowledge_gap";

                // Standard clean PostgreSQL JDBC URL
                finalUrl = "jdbc:postgresql://" + host + ":" + port + path;
                log.info("Parsed and configured clean JDBC URL: {}", finalUrl);
            }
        } catch (Exception e) {
            log.warn("Could not parse database URL via URI parser, using default format: {}", e.getMessage());
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(finalUrl);
        dataSource.setUsername(finalUser);
        dataSource.setPassword(finalPass);
        dataSource.setDriverClassName("org.postgresql.Driver");
        return dataSource;
    }
}
