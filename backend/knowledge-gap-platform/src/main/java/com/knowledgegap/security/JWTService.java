package com.knowledgegap.security;

import java.util.Date;
import java.util.function.Function;

import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class JWTService {

    // =========================================================
    // SECRET KEY
    // =========================================================

    private static final String SECRET_KEY =
            "mySecretKeyForKnowledgeGapPlatformAuthentication123456";

    // =========================================================
    // GENERATE JWT TOKEN
    // =========================================================

    public String generateToken(
            String email,
            String role) {

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000 * 60 * 60
                        )
                )
                .signWith(
                        SignatureAlgorithm.HS256,
                        SECRET_KEY
                )
                .compact();
    }

    // =========================================================
    // EXTRACT USERNAME / EMAIL
    // =========================================================

    public String extractUsername(
            String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }

    // =========================================================
    // EXTRACT ROLE
    // =========================================================

    public String extractRole(
            String token) {

        return extractClaim(
                token,
                claims ->
                        claims.get(
                                "role",
                                String.class
                        )
        );
    }

    // =========================================================
    // EXTRACT EXPIRATION
    // =========================================================

    public Date extractExpiration(
            String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }

    // =========================================================
    // EXTRACT CLAIM
    // =========================================================

    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        final Claims claims =
                extractAllClaims(token);

        return claimsResolver.apply(claims);
    }

    // =========================================================
    // PARSE TOKEN
    // =========================================================

    private Claims extractAllClaims(
            String token) {

        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    // =========================================================
    // CHECK EXPIRATION
    // =========================================================

    public boolean isTokenExpired(
            String token) {

        return extractExpiration(token)
                .before(new Date());
    }

    // =========================================================
    // VALIDATE TOKEN
    // =========================================================

    public boolean validateToken(
            String token,
            String email) {

        final String username =
                extractUsername(token);

        return username != null
                && username.equals(email)
                && !isTokenExpired(token);
    }
}