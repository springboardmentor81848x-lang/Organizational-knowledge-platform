package com.team7.knowledge_gap_platform.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.team7.knowledge_gap_platform.security.JwtAuthenticationFilter;
import com.team7.knowledge_gap_platform.service.CustomUserDetailsService;

@Configuration
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            CustomUserDetailsService customUserDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.customUserDetailsService = customUserDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(customUserDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS))

                .authenticationProvider(authenticationProvider())

                .authorizeHttpRequests(auth -> auth

                        // Public APIs
                        .requestMatchers(
                                "/auth/**"
                        ).permitAll()

                        // Employee + Manager + HR + Admin + DepartmentHead + Mentor: Core Skill Access
                        .requestMatchers(
                                "/skill-gaps/employee/**",
                                "/heatmap/employee/**",
                                "/recommendations/employee/**",
                                "/recommendations/generate/**",
                                "/learning-paths/employee/**",
                                "/learning-paths/generate/**",
                                "/assessments/**",
                                "/employee-skills/**",
                                "/mentors/**",
                                "/mentorship-requests/**",
                                "/mentorship-sessions/**",
                                "/mentor-feedback/**",
                                "/knowledge-sessions/**",
                                "/knowledge-session-registrations/**",
                                "/knowledge-session-feedback/**",
                                "/training-enrollments/**",
                                "/training-milestones/**"
                        )
                        .hasAnyAuthority("ROLE_EMPLOYEE", "ROLE_MANAGER", "ROLE_HR", "ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD", "ROLE_MENTOR", "ROLE_LEARNING_DEVELOPMENT_ADMIN")

                        // Organizational access: Manager/HR/Admin/DepartmentHead
                        .requestMatchers(
                                "/knowledge-gaps/**",
                                "/skill-gaps/**",
                                "/heatmap/**",
                                "/course-recommendations/**",
                                "/recommendations/**",
                                "/learning-paths/**"
                        )
                        .hasAnyAuthority("ROLE_MANAGER", "ROLE_HR", "ROLE_ADMIN", "ROLE_DEPARTMENT_HEAD")

                        // L&D Admin specific: Catalog management
                        .requestMatchers(
                                "/external-courses/**",
                                "/training-programs/**"
                        )
                        .hasAnyAuthority("ROLE_HR", "ROLE_ADMIN", "ROLE_LEARNING_DEVELOPMENT_ADMIN")

                        // System Admin specific: User/Permission management
                        .requestMatchers(
                                "/users/**",
                                "/permissions/**",
                                "/system-settings/**"
                        )
                        .hasAuthority("ROLE_SYSTEM_ADMIN")

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("authorization", "content-type", "x-auth-token"));
        configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}