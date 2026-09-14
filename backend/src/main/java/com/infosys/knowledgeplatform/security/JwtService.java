package com.infosys.knowledgeplatform.security;

import com.infosys.knowledgeplatform.model.User;
import com.infosys.knowledgeplatform.service.RoleCatalogService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey secretKey;

    public JwtService(@Value("${app.auth.jwt-secret}") String secret) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(User user, List<String> permissions) {
        return Jwts.builder()
                .setSubject(user.getEmail())
                .addClaims(Map.of(
                        "name", user.getName(),
                        "role", user.getRole(),
                        "roleKey", RoleCatalogService.normalizeRole(user.getRole()),
                        "permissions", permissions
                ))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 12))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isValid(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception exception) {
            return false;
        }
    }

    public String getEmail(String token) {
        return parseToken(token).getSubject();
    }

    public String getRole(String token) {
        Object role = parseToken(token).get("role");
        return role == null ? "Employee" : role.toString();
    }
}