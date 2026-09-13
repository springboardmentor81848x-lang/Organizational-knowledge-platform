package com.orgskills.intelligence.integration;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * A browser client has to distinguish "renew your token and retry" from "you are signed in and
 * this is refused". That only works if a missing or expired credential answers 401, so these
 * pin the status codes the client's refresh logic depends on.
 */
@SpringBootTest
@AutoConfigureMockMvc
class UnauthenticatedResponseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("A request with no credentials is answered 401, not 403")
    void missingCredentialsAnswer401() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.path").value("/api/auth/me"));
    }

    @Test
    @DisplayName("A request with an unusable token is answered 401 so the client knows to refresh")
    void invalidTokenAnswers401() throws Exception {
        mockMvc.perform(get("/api/analytics/organization")
                        .header("Authorization", "Bearer not.a.real.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Endpoints that are open by design still process the request")
    void permittedEndpointsAreUnaffected() throws Exception {
        // Login must remain reachable without credentials. Reaching bean validation — rather
        // than being turned away by the filter chain — is what proves it.
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
