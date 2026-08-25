package com.knowledgegap.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
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
@EnableMethodSecurity
public class SecurityConfig {

    private final JWTAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JWTAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // CORS
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        /*
         * Allow both Vite development ports.
         * This preserves your existing configuration.
         */
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:5173",
                        "http://localhost:5174"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
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

    // =========================================================
    // SECURITY
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

            // =================================================
            // CORS
            // =================================================

            .cors(cors ->
                    cors.configurationSource(
                            corsConfigurationSource()
                    )
            )

            // =================================================
            // CSRF
            // =================================================

            .csrf(AbstractHttpConfigurer::disable)

            // =================================================
            // SESSION
            // =================================================

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // =================================================
            // AUTHORIZATION
            // =================================================

            .authorizeHttpRequests(auth -> auth

                // -------------------------------------------------
                // OPTIONS
                // -------------------------------------------------

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                // -------------------------------------------------
                // AUTHENTICATION
                // -------------------------------------------------

                .requestMatchers(
                        "/api/auth/**"
                ).permitAll()

                // -------------------------------------------------
                // EMPLOYEES
                // TEMPORARILY PERMITTED FOR DEVELOPMENT
                // -------------------------------------------------

                .requestMatchers(
                        "/api/employees/**"
                ).permitAll()

                // -------------------------------------------------
                // ASSESSMENT EVALUATION
                // TEMPORARILY PERMITTED FOR DEVELOPMENT
                // -------------------------------------------------

                .requestMatchers(
                        "/api/assessment-evaluation/**"
                ).permitAll()
                

                // -------------------------------------------------
                // WORKFORCE SKILLS
                // -------------------------------------------------
                
                .requestMatchers(
                        HttpMethod.GET,
                        "/api/hr/workforce-skills"
                ).permitAll()

                // -------------------------------------------------
                // AI
                // -------------------------------------------------

                .requestMatchers(
                        "/api/ai/**"
                ).permitAll()

                // -------------------------------------------------
                // SWAGGER
                // -------------------------------------------------

                .requestMatchers(
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**"
                ).permitAll()


                // -------------------------------------------------
                // HR
                // -------------------------------------------------

                .requestMatchers(
                        "/api/hr/**"
                ).hasRole("HR")

                // -------------------------------------------------
                // MANAGER
                // -------------------------------------------------

                .requestMatchers(
                        "/api/manager/**"
                ).hasRole("MANAGER")

                // -------------------------------------------------
                // DEPARTMENT HEAD
                // -------------------------------------------------

                .requestMatchers(
                        "/api/department-head/**"
                ).hasRole("DEPARTMENT_HEAD")

                // -------------------------------------------------
                // SYSTEM ADMINISTRATOR
                // -------------------------------------------------

                .requestMatchers(
                        "/api/system-admin/**"
                ).hasRole("SYSTEM_ADMINISTRATOR")

                // -------------------------------------------------
                // EMPLOYEE
                // -------------------------------------------------

                .requestMatchers(
                        "/api/employee/**"
                ).hasRole("EMPLOYEE")

                // -------------------------------------------------
                // EVERYTHING ELSE
                // -------------------------------------------------

                .anyRequest().authenticated()
            )

            // =================================================
            // JWT FILTER
            // =================================================

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}