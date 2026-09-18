package com.orgskills.intelligence.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

/**
 * Initialises the Firebase Admin SDK so the backend can verify ID tokens issued by
 * Firebase Authentication.
 *
 * <p>The SDK is only initialised when a service account path is configured. Without one the
 * feature stays dormant: the {@link com.orgskills.intelligence.security.FirebaseTokenVerifier}
 * refuses every request and the login page hides the buttons, rather than showing controls
 * that cannot work.
 */
@Configuration
@Slf4j
public class FirebaseConfig {

    @Value("${app.firebase.service-account-path:}")
    private String serviceAccountPath;

    @PostConstruct
    public void init() {
        if (serviceAccountPath == null || serviceAccountPath.isBlank()) {
            log.info("Firebase service account not configured — Firebase Auth is disabled");
            return;
        }

        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("FirebaseApp already initialised, skipping");
            return;
        }

        java.io.File file = new java.io.File(serviceAccountPath);
        if (!file.exists()) {
            java.io.File alt = new java.io.File("Backend", serviceAccountPath);
            if (alt.exists()) {
                file = alt;
            }
        }

        try (FileInputStream serviceAccount = new FileInputStream(file)) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialised from {}", serviceAccountPath);
        } catch (IOException e) {
            log.error("Failed to initialise Firebase Admin SDK: {}", e.getMessage());
        }
    }

    @Bean
    public FirebaseAuth firebaseAuth() {
        if (FirebaseApp.getApps().isEmpty()) {
            // Return null when not configured; the verifier checks this.
            return null;
        }
        return FirebaseAuth.getInstance();
    }
}
