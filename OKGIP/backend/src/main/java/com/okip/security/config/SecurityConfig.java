package com.okip.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.okip.security.filter.JwtAuthenticationFilter;

@EnableMethodSecurity
@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            UserDetailsService userDetailsService) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

            .csrf(csrf -> csrf.disable())

            .cors(Customizer.withDefaults())

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS))

            .authenticationProvider(authenticationProvider())

            .authorizeHttpRequests(auth -> auth

                // ==================== PUBLIC ====================

                .requestMatchers(
                        "/api/auth/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/api-docs/**")
                .permitAll()


                // ==================== ADMIN ====================

                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")


                // ==================== HR ====================

                .requestMatchers("/api/hr/**")
                .hasRole("HR")


                // ==================== EMPLOYEE PROFILE ====================

                .requestMatchers("/api/profile/**")
                .authenticated()

                .requestMatchers("/api/skills/**")
                .authenticated()

                .requestMatchers("/api/education/**")
                .authenticated()

                .requestMatchers("/api/experience/**")
                .authenticated()

                .requestMatchers("/api/certification/**")
                .authenticated()


                // ==================== MASTER SKILLS ====================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/master/skills/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/master/skills/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        org.springframework.http.HttpMethod.PUT,
                        "/api/master/skills/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/master/skills/**")
                .hasRole("ADMIN")


                // ==================== MASTER JOB ROLES ====================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/master/job-roles/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/master/job-roles/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        org.springframework.http.HttpMethod.PUT,
                        "/api/master/job-roles/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/master/job-roles/**")
                .hasRole("ADMIN")


                // ==================== JOB ROLE ASSIGNMENT ====================

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/job-role-assignment/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.PUT,
                        "/api/job-role-assignment/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/job-role-assignment/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/job-role-assignment/my")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/job-role-assignment/employee/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")


                // ==================== JOB ROLE COMPETENCIES ====================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/job-role-competencies/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/job-role-competencies/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        org.springframework.http.HttpMethod.PUT,
                        "/api/job-role-competencies/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/job-role-competencies/**")
                .hasRole("ADMIN")


                // ==================== GAP ANALYSIS ====================

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/gap-analysis/run/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/gap-analysis/employee/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/gap-analysis/my")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")


                // ==================== MANAGER WORKSPACE ====================

                .requestMatchers("/api/manager/**")
                .hasRole("MANAGER")


                // ==================== ANALYTICS ====================

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/team/**")
                .hasRole("MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/team")
                .hasRole("MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/employee/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/team/skill-heatmap")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/departments")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/my/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")


                // =========================================================
                // MENTOR PROFILE
                // =========================================================
                //
                // Mentor is an additional capability.
                // An employee does NOT need ROLE_MENTOR.
                //

                .requestMatchers("/api/mentor/**")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // =========================================================
                // MENTORSHIP
                // =========================================================

                // View recommended mentors
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/mentorship/recommendations")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // View mentorship requests
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/mentorship/requests")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // Employee sends a mentorship request
                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/mentorship/requests")
                .hasRole("EMPLOYEE")


                // Mentor accepts a mentorship request
                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/mentorship/requests/*/accept")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // Mentor rejects a mentorship request
                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/mentorship/requests/*/reject")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // View knowledge-sharing sessions
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/mentorship/sessions")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // Schedule a knowledge-sharing session
                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/mentorship/requests/*/sessions")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // Complete a session
                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/mentorship/sessions/*/complete")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // Submit session feedback
                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/mentorship/sessions/*/feedback")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")


                // ==================== AI RECOMMENDATION ====================

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/ai/recommendation/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")


                // ==================== FALLBACK ====================

                .anyRequest()
                .authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }


    @Bean
    AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }


    @Bean
    PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}