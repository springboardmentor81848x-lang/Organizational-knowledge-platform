package com.okip.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.okip.security.filter.JwtAuthenticationFilter;

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
    SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

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

            			    .requestMatchers("/api/admin/**")
            			    .hasRole("ADMIN")

            			    .requestMatchers("/api/hr/**")
            			    .hasRole("HR")

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