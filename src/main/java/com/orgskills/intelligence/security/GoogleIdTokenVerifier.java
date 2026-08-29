package com.orgskills.intelligence.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Set;

/**
 * Establishes who a Google ID token actually belongs to.
 *
 * <p>The identity is taken from Google's answer and nothing else. A caller cannot state which
 * account they are: the email, name and picture used to sign somebody in all come from the
 * verified token, and any values sent alongside it are ignored.
 *
 * <p>Verification checks four things, and all of them matter:
 * <ul>
 *   <li>the token is one Google itself vouches for, established by asking Google;</li>
 *   <li>its audience is this application, so a token minted for some other site cannot be
 *       replayed here;</li>
 *   <li>its issuer is Google;</li>
 *   <li>the address has been verified, so an unverified alias cannot impersonate a colleague.</li>
 * </ul>
 *
 * <p>Without a configured client id there is no audience to check against, so the feature is
 * refused outright rather than trusting a token that could have been issued for anyone.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleIdTokenVerifier {

    private static final String TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";
    private static final Set<String> GOOGLE_ISSUERS =
            Set.of("accounts.google.com", "https://accounts.google.com");

    private final ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Value("${app.oauth2.google.client-id:}")
    private String clientId;

    /** Whether Google sign-in is usable at all; the API reports this so a client can hide it. */
    public boolean isConfigured() {
        return clientId != null && !clientId.isBlank();
    }

    public record GoogleIdentity(String email, String fullName, String avatarUrl) {}

    public GoogleIdentity verify(String idToken) {
        if (!isConfigured()) {
            throw new UnauthorizedException(
                    "Google sign-in is not configured on this environment. Use your email and password.");
        }
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException("No Google ID token was supplied");
        }

        JsonNode claims = fetchClaims(idToken);

        String audience = claims.path("aud").asText(null);
        if (!clientId.equals(audience)) {
            // A token minted for another application is valid to Google and useless here.
            log.warn("Rejected a Google ID token issued for a different audience");
            throw new UnauthorizedException("This Google sign-in was not issued for this application");
        }

        String issuer = claims.path("iss").asText(null);
        if (issuer == null || !GOOGLE_ISSUERS.contains(issuer)) {
            throw new UnauthorizedException("This sign-in was not issued by Google");
        }

        long expiry = claims.path("exp").asLong(0);
        if (expiry <= 0 || Instant.ofEpochSecond(expiry).isBefore(Instant.now())) {
            throw new UnauthorizedException("This Google sign-in has expired. Try again.");
        }

        if (!claims.path("email_verified").asBoolean(false)) {
            throw new UnauthorizedException("This Google account has no verified email address");
        }

        String email = claims.path("email").asText(null);
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("This Google sign-in carried no email address");
        }

        return new GoogleIdentity(
                email.trim().toLowerCase(),
                claims.path("name").asText(null),
                claims.path("picture").asText(null));
    }

    private JsonNode fetchClaims(String idToken) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(TOKEN_INFO_URL + URLEncoder.encode(idToken, StandardCharsets.UTF_8)))
                    .timeout(Duration.ofSeconds(8))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                // Google refuses anything it did not sign, which is the forgery case.
                throw new UnauthorizedException("This Google sign-in could not be verified");
            }
            return objectMapper.readTree(response.body());
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new UnauthorizedException("Verifying the Google sign-in was interrupted");
        } catch (Exception ex) {
            log.warn("Could not reach Google to verify an ID token: {}", ex.getMessage());
            throw new UnauthorizedException("Google could not be reached to verify this sign-in");
        }
    }
}
