package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.dto.admin.UpdateUserStatusRequest;
import com.orgskills.intelligence.dto.auth.LoginRequest;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.AuditLogRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Deactivating an account has to stop the account being used, not merely stop it signing in
 * again.
 *
 * <p>These cases exist because it did not. The active flag was written to the database and read
 * only by the sign-in path: {@code CustomPrincipal.isEnabled()} returned a constant true, and the
 * JWT filter never asked. A deactivated employee kept full access for as long as the token
 * already in their hands stayed valid - a day, by this application's expiry.
 *
 * <p>The second case covers the audit trail, which recorded successes only. Audit writes joined
 * the caller's transaction, so a refused sign-in rolled the record of the refusal back along with
 * the refusal itself - losing precisely the events an audit trail exists to keep.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AccountDeactivationIntegrationTest {

    private static final String PASSWORD = "password123";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User employee;
    private User admin;

    @BeforeEach
    void setUp() {
        employee = persist("deactivation-subject@orgskills.com", "Subject Employee", Role.EMPLOYEE);
        admin = persist("deactivation-admin@orgskills.com", "Acting Admin", Role.SYSTEM_ADMIN);
    }

    @Test
    @DisplayName("A token issued before deactivation stops working the moment the account is deactivated")
    void tokenStopsWorkingOnDeactivation() throws Exception {
        String token = tokenFor(employee);

        mockMvc.perform(get("/api/enrollments").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        deactivate(employee);

        // Same token, still unexpired, still cryptographically valid.
        mockMvc.perform(get("/api/enrollments").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/notifications").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("A deactivated account cannot sign in, and the refusal is recorded")
    void deactivatedAccountCannotSignIn() throws Exception {
        deactivate(employee);
        long before = failedLoginCount();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest(employee.getEmail(), PASSWORD))))
                .andExpect(status().isUnauthorized());

        assertThat(failedLoginCount())
                .as("the refused sign-in must survive the rollback that refusing it causes")
                .isEqualTo(before + 1);
    }

    @Test
    @DisplayName("A rejected password is recorded too, not only successful sign-ins")
    void badPasswordIsRecorded() throws Exception {
        long before = failedLoginCount();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest(employee.getEmail(), "not-the-password"))))
                .andExpect(status().isUnauthorized());

        assertThat(failedLoginCount()).isEqualTo(before + 1);
    }

    @Test
    @DisplayName("Reactivating restores both sign-in and the tokens issued after it")
    void reactivationRestoresAccess() throws Exception {
        deactivate(employee);
        setActive(employee, true);

        mockMvc.perform(get("/api/enrollments").header("Authorization", "Bearer " + tokenFor(employee)))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(
                                new LoginRequest(employee.getEmail(), PASSWORD))))
                .andExpect(status().isOk());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    /** Deactivates through the real administration endpoint, not by writing the flag directly. */
    private void deactivate(User user) throws Exception {
        mockMvc.perform(put("/api/admin/users/" + user.getId() + "/status")
                        .header("Authorization", "Bearer " + tokenFor(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateUserStatusRequest(false))))
                .andExpect(status().isOk());
    }

    private void setActive(User user, boolean active) {
        User fresh = userRepository.findById(user.getId()).orElseThrow();
        fresh.setActive(active);
        userRepository.saveAndFlush(fresh);
    }

    private long failedLoginCount() {
        return auditLogRepository.findAll().stream()
                .filter(log -> "LOGIN_FAILED".equals(log.getAction()))
                .count();
    }

    private String tokenFor(User user) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new com.orgskills.intelligence.security.CustomPrincipal(
                        user.getId(), user.getEmail(), user.getPassword(), true,
                        List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))),
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
        return jwtTokenProvider.generateToken(authentication);
    }

    private User persist(String email, String fullName, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setFullName(fullName);
        user.setRole(role);
        user.setDepartment("Engineering");
        user.setJobTitle("Software Engineer");
        user.setActive(true);
        return userRepository.saveAndFlush(user);
    }
}
