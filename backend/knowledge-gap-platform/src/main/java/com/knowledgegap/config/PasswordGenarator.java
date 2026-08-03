package com.knowledgegap.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordGenarator implements CommandLineRunner {

    private final PasswordEncoder passwordEncoder;

    public PasswordGenarator(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        System.out.println("Encoded Password: " + passwordEncoder.encode("password123"));
    }
}