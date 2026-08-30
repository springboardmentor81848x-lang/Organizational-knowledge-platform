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

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                        "/api/auth/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/v3/api-docs/**",
                        "/api-docs/**")
                .permitAll()

                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/hr/**").hasRole("HR")

                .requestMatchers("/api/profile/**").authenticated()
                .requestMatchers("/api/skills/**").authenticated()
                .requestMatchers("/api/education/**").authenticated()
                .requestMatchers("/api/experience/**").authenticated()
                .requestMatchers("/api/certification/**").authenticated()
                .requestMatchers("/api/trainings/**").authenticated()
                .requestMatchers("/api/ai/**").authenticated()

                // Mentorship endpoints
                .requestMatchers("/api/mentorships/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Knowledge Session endpoints
                .requestMatchers("/api/knowledge-sessions/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Knowledge Resource endpoints
                .requestMatchers("/api/knowledge-resources/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Skill Assessment endpoints
                .requestMatchers("/api/assessments/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Notification endpoints
                .requestMatchers("/api/notifications/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                // Report & Export endpoints
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/master/skills/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
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

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/master/job-roles/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
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

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/job-role-assignment/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(
                        org.springframework.http.HttpMethod.PUT,
                        "/api/job-role-assignment/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(
                        org.springframework.http.HttpMethod.DELETE,
                        "/api/job-role-assignment/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/job-role-assignment/my")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/job-role-assignment/employee/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/job-role-competencies/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
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

                .requestMatchers(
                        org.springframework.http.HttpMethod.POST,
                        "/api/gap-analysis/run/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/gap-analysis/employee/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/gap-analysis/my")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/employee/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/team")
                .hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/departments")
                .hasAnyRole("ADMIN", "HR")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/my/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/dashboard/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/manager/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER")
                .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/analytics/hr/**")
                .hasAnyRole("ADMIN", "HR")

                .requestMatchers(
                        "/api/training-enrollments/**")
                .hasAnyRole("ADMIN", "HR", "MANAGER", "EMPLOYEE")

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
