package com.orgskills.intelligence.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
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
 *
 * <h2>Why Content-Disposition is exposed</h2>
 * A cross-origin response only hands JavaScript the CORS-safelisted headers unless the server
 * names the others. Content-Disposition is not on that list, so the report downloads could not
 * read the filename the server had chosen and saved every report as a file literally named
 * "download", with no .pdf or .xlsx extension - which the operating system then refuses to open.
 * Development did not show this because the Vite proxy makes the API same-origin; it only
 * appeared once the frontend talked to the API directly.
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
        configuration.setExposedHeaders(List.of(HttpHeaders.CONTENT_DISPOSITION));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
