package com.orgskills.intelligence.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.orgskills.intelligence.exception.UnauthorizedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Component;

/**
 * Verifies Firebase ID tokens using the Firebase Admin SDK.
 *
 * <p>The identity is taken from the verified token and nothing else. A caller cannot state
 * which account they are: the email, name and picture used to sign somebody in all come from
 * the token that Firebase itself vouched for.
 *
 * <p>Without a configured {@link FirebaseAuth} bean the feature is refused outright. The
 * frontend hides the buttons, so this is a safety net rather than something a real user hits.
 */
@Component
@Slf4j
public class FirebaseTokenVerifier {

    @Nullable
    private final FirebaseAuth firebaseAuth;

    public FirebaseTokenVerifier(@Nullable FirebaseAuth firebaseAuth) {
        this.firebaseAuth = firebaseAuth;
    }

    /** Whether Firebase sign-in is usable at all. */
    public boolean isConfigured() {
        return firebaseAuth != null;
    }

    public record FirebaseIdentity(String email, String fullName, String avatarUrl, String provider) {}

    /**
     * Verifies a Firebase ID token and extracts the identity.
     *
     * @param idToken the raw token string from the client
     * @return the verified identity
     * @throws UnauthorizedException if verification fails for any reason
     */
    public FirebaseIdentity verify(String idToken) {
        if (!isConfigured()) {
            throw new UnauthorizedException(
                    "Firebase sign-in is not configured on this environment. Use your email and password.");
        }
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException("No Firebase ID token was supplied");
        }

        try {
            FirebaseToken decodedToken = firebaseAuth.verifyIdToken(idToken);

            String email = decodedToken.getEmail();
            if (email == null || email.isBlank()) {
                throw new UnauthorizedException("The Firebase token carried no email address");
            }
            if (!decodedToken.isEmailVerified()) {
                throw new UnauthorizedException("The Firebase account has no verified email address");
            }

            // The sign-in provider is embedded in the token claims by Firebase.
            String provider = decodedToken.getClaims().containsKey("firebase")
                    ? extractProvider(decodedToken)
                    : "unknown";

            return new FirebaseIdentity(
                    email.trim().toLowerCase(),
                    decodedToken.getName(),
                    decodedToken.getPicture(),
                    provider);
        } catch (FirebaseAuthException e) {
            log.warn("Firebase token verification failed: {}", e.getMessage());
            throw new UnauthorizedException("The Firebase sign-in could not be verified");
        }
    }

    @SuppressWarnings("unchecked")
    private String extractProvider(FirebaseToken token) {
        try {
            Object firebase = token.getClaims().get("firebase");
            if (firebase instanceof java.util.Map<?, ?> map) {
                Object signInProvider = map.get("sign_in_provider");
                return signInProvider != null ? signInProvider.toString() : "unknown";
            }
        } catch (Exception e) {
            log.debug("Could not extract sign-in provider from Firebase token: {}", e.getMessage());
        }
        return "unknown";
    }
}
