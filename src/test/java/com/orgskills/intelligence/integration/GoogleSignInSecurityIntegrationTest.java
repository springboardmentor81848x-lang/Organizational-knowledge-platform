package com.orgskills.intelligence.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Google sign-in previously took the caller at their word: it read the email from the request
 * body, looked up or created that account, and issued a session. Anyone who could reach the
 * endpoint could mint a token for any address, including a system administrator, with a
 * fabricated ID token.
 *
 * <p>These pin it shut. The identity must come from a token Google vouches for, and with no
 * client id configured there is no audience to check against, so the whole feature is refused
 * rather than trusting a token that could have been issued for anybody.
 */
@SpringBootTest
@AutoConfigureMockMvc
class GoogleSignInSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("A fabricated token naming an administrator no longer issues a session")
    void forgedIdentityIsRefused() throws Exception {
        mockMvc.perform(post("/api/auth/oauth2/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idToken":"completely-made-up","email":"admin@orgskills.com"}
                                """))
                .andExpect(status().isUnauthorized())
                // The decisive part: no credentials come back, whatever the body claimed.
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.user").doesNotExist());
    }

    @Test
    @DisplayName("An email supplied alongside a token is never treated as an identity")
    void suppliedEmailIsNotAnIdentity() throws Exception {
        mockMvc.perform(post("/api/auth/oauth2/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idToken":"x","email":"someone.new@orgskills.com","fullName":"Made Up"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.user").doesNotExist());
    }

    @Test
    @DisplayName("A request with no token at all is rejected by validation")
    void missingTokenIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/oauth2/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Password sign-in is unaffected")
    void passwordSignInStillWorks() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"employee@orgskills.com","password":"password123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.user.role").value("EMPLOYEE"));
    }
}
