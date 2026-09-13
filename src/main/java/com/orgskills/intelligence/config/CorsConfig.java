package com.orgskills.intelligence.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Which origins the browser is allowed to call this API from.
 *
 * <h2>Why this is configuration rather than a literal</h2>
 * The three localhost ports were hardcoded, which meant a deployed build could not talk to the
 * API at all: the browser would refuse every request, and the failure shows up in the frontend
 * as an unexplained network error rather than as anything pointing back here. The defaults are
 * still the development ports, so a fresh checkout works with nothing set, and a deployment sets
 * CORS_ALLOWED_ORIGINS to its real origin.
 *
 * <p>Deliberately a list of exact origins and not a wildcard. Credentials are allowed on these
 * requests, and the browser refuses to combine {@code allowCredentials} with {@code *} - so a
 * wildcard here would not be a laxer policy, it would be a broken one.
 */
@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
