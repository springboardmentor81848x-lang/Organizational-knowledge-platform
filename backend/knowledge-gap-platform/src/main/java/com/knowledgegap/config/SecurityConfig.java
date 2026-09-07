
package com.knowledgegap.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.knowledgegap.security.JWTAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JWTAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // ============================================================
    // SECURITY FILTER CHAIN
    // ============================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            // ----------------------------------------------------
            // CORS
            // ----------------------------------------------------
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )

            // ----------------------------------------------------
            // CSRF
            // ----------------------------------------------------
            .csrf(csrf -> csrf.disable())

            // ----------------------------------------------------
            // SESSION
            // ----------------------------------------------------
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // ----------------------------------------------------
            // AUTHORIZATION
            // ----------------------------------------------------
            .authorizeHttpRequests(auth -> auth

                // ------------------------------------------------
                // AUTHENTICATION APIs
                // ------------------------------------------------
                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                // ------------------------------------------------
                // AI APIs
                // ------------------------------------------------
                // Temporarily public so we can test the AI
                // endpoints from Postman without a JWT token.
                .requestMatchers(
                    "/api/ai/**"
                ).permitAll()

                // ------------------------------------------------
                // SWAGGER
                // ------------------------------------------------
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()

                // ------------------------------------------------
                // MANAGER DASHBOARD
                // ------------------------------------------------
                .requestMatchers(
                    "/api/manager-dashboard/**"
                ).hasRole("MANAGER")

                // ------------------------------------------------
                // MANAGER APIs
                // ------------------------------------------------
                .requestMatchers(
                    "/api/manager/**"
                ).hasRole("MANAGER")

                // ------------------------------------------------
                // HR APIs
                // ------------------------------------------------
                .requestMatchers(
                    "/api/hr/**"
                ).hasRole("HR")

                // ------------------------------------------------
                // MENTOR APIs
                // ------------------------------------------------
                .requestMatchers(
                    "/api/mentor/**"
                ).hasRole("MENTOR")

                // ------------------------------------------------
                // DEPARTMENT HEAD APIs
                // ------------------------------------------------
                .requestMatchers(
                    "/api/department-head/**"
                ).hasRole("DEPARTMENT_HEAD")

                // ------------------------------------------------
                // SYSTEM ADMINISTRATOR APIs
                // ------------------------------------------------
                .requestMatchers(
                    "/api/admin/**"
                ).hasRole("SYSTEM_ADMINISTRATOR")

                // ------------------------------------------------
                // EVERYTHING ELSE
                // ------------------------------------------------
                .anyRequest().authenticated()
            )

            // ----------------------------------------------------
            // JWT FILTER
            // ----------------------------------------------------
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // ============================================================
    // PASSWORD ENCODER
    // ============================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // ============================================================
    // CORS CONFIGURATION
    // ============================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of(
                "http://localhost:5173",
                "http://localhost:5174",
                "http://127.0.0.1:5173",
                "http://127.0.0.1:5174"
            )
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "PATCH",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type",
                "Accept"
            )
        );

        configuration.setExposedHeaders(
            List.of("Authorization")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
            "/**",
            configuration
        );

        return source;
    }
}
