package com.okip.config;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {

    private static final String RENDER_SECRET_PATH =
            "/etc/secrets/firebase-service-account.json";

    private static final String LOCAL_RESOURCE_PATH =
            "firebase/firebase-service-account.json";

    @PostConstruct
    public void initializeFirebase() throws IOException {

        // Prevent duplicate Firebase initialization
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        InputStream serviceAccount = null;

        try {
            // 1. Check Render Secret File first
            Path renderSecret = Path.of(RENDER_SECRET_PATH);

            if (Files.exists(renderSecret)) {

                serviceAccount = Files.newInputStream(renderSecret);

                System.out.println(
                        "🔥 Firebase service account loaded from Render Secret File.");

            } else {

                // 2. Fallback to local classpath file
                serviceAccount = getClass()
                        .getClassLoader()
                        .getResourceAsStream(LOCAL_RESOURCE_PATH);

                if (serviceAccount == null) {
                    throw new IllegalStateException(
                            "Firebase service account JSON file not found in "
                            + "Render Secret File or local resources.");
                }

                System.out.println(
                        "🔥 Firebase service account loaded from local resources.");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(
                            GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);

            System.out.println(
                    "🔥 Firebase Admin SDK initialized successfully.");

        } finally {

            if (serviceAccount != null) {
                serviceAccount.close();
            }
        }
    }
}