package com.orgskills.intelligence.security;

import io.jsonwebtoken.Claims;
import org.springframework.security.core.GrantedAuthority;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /**
     * The placeholder in application.yml, which exists so a fresh checkout runs with nothing set.
     *
     * <p>It is long enough to pass the length check below, which is what made it dangerous: a
     * deployment that forgets JWT_SECRET starts perfectly and signs every token with a value
     * printed in the repository. Anyone holding it can mint a token for any account, including
     * SYSTEM_ADMIN, and no amount of correct authorisation code downstream would notice - the
     * signature checks out. So its use is announced as loudly as a log line can manage.
     */
    private static final String PLACEHOLDER_SECRET = "change-me-to-a-secure-32-char-minimum-secret";

    private SecretKey key;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT secret must be at least 32 characters long");
        }
        if (PLACEHOLDER_SECRET.equals(jwtSecret)) {
            log.error("****************************************************************");
            log.error("JWT_SECRET is not set, so the built-in placeholder is being used.");
            log.error("That value is published in this repository. Anyone who has read it");
            log.error("can forge a token for any account, including SYSTEM_ADMIN.");
            log.error("Fine for local development; set JWT_SECRET before anyone else can");
            log.error("reach this instance. Any 32+ character random string will do.");
            log.error("****************************************************************");
        }
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        CustomPrincipal principal = (CustomPrincipal) authentication.getPrincipal();
        Instant now = Instant.now();
        Instant expiry = now.plusMillis(jwtExpirationMs);

        // The role travels in the token so a client can render role-appropriate navigation on
        // the first paint, without waiting for a profile round trip. It is a snapshot: the
        // server still authorises from the database on every request, and a role changed
        // mid-session only reaches the client when the token is next refreshed.
        String role = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .findFirst()
                .map(authority -> authority.substring("ROLE_".length()))
                .orElse(null);

        return Jwts.builder()
                .subject(principal.getUserId().toString())
                .claim("email", principal.getUsername())
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(key)
                .compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.parseLong(claims.getSubject());
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
