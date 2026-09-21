package com.okip.security.config;

import java.util.List;

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
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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

    // =========================================================
    // CORS CONFIGURATION
    // =========================================================

    @Bean
    CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "https://okgip-frontend-nxes.onrender.com"
                ));

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                ));

        configuration.setAllowedHeaders(
        List.of("*")
);

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http

            // ==================== CSRF ====================

            .csrf(csrf -> csrf.disable())

            // ==================== CORS ====================

            .cors(Customizer.withDefaults())

            // ==================== SESSION ====================

            .sessionManagement(session ->
                    session.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS))

            // ==================== AUTHENTICATION ====================

            .authenticationProvider(authenticationProvider())

            // ==================== AUTHORIZATION ====================

            .authorizeHttpRequests(auth -> auth

                // =================================================
                // CORS PREFLIGHT
                // =================================================

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**")
                .permitAll()

                // =================================================
                // PUBLIC
                // =================================================

                .requestMatchers(
                        "/api/auth/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/api-docs/**")
                .permitAll()

                // =================================================
                // ADMIN
                // =================================================

                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // =================================================
                // HR
                // =================================================

                .requestMatchers("/api/hr/**")
                .hasRole("HR")

                // =================================================
                // EMPLOYEE PROFILE
                // =================================================

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

                // =================================================
                // MASTER SKILLS
                // =================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/master/skills/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/master/skills/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/master/skills/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/master/skills/**")
                .hasRole("ADMIN")

                // =================================================
                // MASTER JOB ROLES
                // =================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/master/job-roles/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/master/job-roles/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/master/job-roles/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/master/job-roles/**")
                .hasRole("ADMIN")

                // =================================================
                // JOB ROLE ASSIGNMENT
                // =================================================

                .requestMatchers(
        HttpMethod.POST,
        "/api/job-role-assignment/my-role")
                .hasRole("EMPLOYEE")

                .requestMatchers(
        HttpMethod.POST,
        "/api/job-role-assignment")
                   .hasAnyRole(
        "ADMIN",
        "HR",
        "MANAGER")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/job-role-assignment/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/job-role-assignment/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/job-role-assignment/my")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/job-role-assignment/employee/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                // =================================================
                // JOB ROLE COMPETENCIES
                // =================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/job-role-competencies/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/job-role-competencies/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/job-role-competencies/**")
                .hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/job-role-competencies/**")
                .hasRole("ADMIN")

                // =================================================
                // GAP ANALYSIS
                // =================================================

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/gap-analysis/run/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/gap-analysis/employee/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/gap-analysis/my")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                // =================================================
                // MANAGER WORKSPACE
                // =================================================

                .requestMatchers("/api/manager/**")
                .hasRole("MANAGER")

                // =================================================
                // ANALYTICS
                // =================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/analytics/team/**")
                .hasRole("MANAGER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/analytics/team")
                .hasRole("MANAGER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/analytics/employee/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/analytics/team/skill-heatmap")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/analytics/departments")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/analytics/my/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER",
                        "EMPLOYEE")

                // =================================================
                // MENTOR PROFILE
                // =================================================

                .requestMatchers("/api/mentor/**")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                // =================================================
                // MENTORSHIP
                // =================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/mentorship/recommendations")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/mentorship/requests")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/mentorship/requests")
                .hasRole("EMPLOYEE")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/mentorship/requests/*/accept")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/mentorship/requests/*/reject")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/mentorship/sessions")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/mentorship/requests/*/sessions")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/mentorship/sessions/*/complete")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/mentorship/sessions/*/feedback")
                .hasAnyRole(
                        "EMPLOYEE",
                        "MENTOR")

                // =================================================
                // AI RECOMMENDATION
                // =================================================

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/ai/recommendation/**")
                .hasAnyRole(
                        "ADMIN",
                        "HR",
                        "MANAGER")

                // =================================================
                // FALLBACK
                // =================================================

                .anyRequest()
                .authenticated()
            )

            // =================================================
            // JWT FILTER
            // =================================================

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // =========================================================
    // AUTHENTICATION PROVIDER
    // =========================================================

    @Bean
    AuthenticationProvider authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(userDetailsService);

        provider.setPasswordEncoder(passwordEncoder());

        return provider;
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}