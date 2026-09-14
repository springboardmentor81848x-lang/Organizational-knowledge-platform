package com.infosys.knowledgeplatform;

import com.infosys.knowledgeplatform.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**", "/h2-console/**").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/dashboard/**", "/api/learning-paths/**", "/api/articles/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/**", "/api/skills/**", "/api/training-programs/**", "/api/user-skills/**", "/api/employee-improvements/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/users/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST")
                .requestMatchers(HttpMethod.PUT, "/api/users/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST")
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST")
                .requestMatchers(HttpMethod.POST, "/api/training-programs/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "LEARNING_DEVELOPMENT_ADMIN_MENTOR", "HR_SPECIALIST", "DEPARTMENT_HEAD")
                .requestMatchers(HttpMethod.PUT, "/api/training-programs/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "LEARNING_DEVELOPMENT_ADMIN_MENTOR", "HR_SPECIALIST", "DEPARTMENT_HEAD")
                .requestMatchers(HttpMethod.DELETE, "/api/training-programs/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "LEARNING_DEVELOPMENT_ADMIN_MENTOR", "HR_SPECIALIST", "DEPARTMENT_HEAD")
                .requestMatchers(HttpMethod.POST, "/api/skills/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST", "DEPARTMENT_HEAD")
                .requestMatchers(HttpMethod.PUT, "/api/skills/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST", "DEPARTMENT_HEAD")
                .requestMatchers(HttpMethod.DELETE, "/api/skills/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST", "DEPARTMENT_HEAD")
                .requestMatchers(HttpMethod.POST, "/api/employee-improvements/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/employee-improvements/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/employee-improvements/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST")
                // Enrollment endpoints: employees can enroll/unenroll; admins/HR can manage records
                .requestMatchers(HttpMethod.POST, "/api/enrollments/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/enrollments/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/enrollments/**").hasAnyRole("SYSTEM_ADMINISTRATOR", "HR_SPECIALIST")
                // AI plan endpoint (server-side generation) - authenticated users may request
                .requestMatchers(HttpMethod.GET, "/api/ai-plan/**").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-API-KEY", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
