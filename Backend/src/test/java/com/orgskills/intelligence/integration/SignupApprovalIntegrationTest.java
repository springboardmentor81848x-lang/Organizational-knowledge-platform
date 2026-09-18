package com.orgskills.intelligence.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AccessStatus;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Sign-up is a request for access, not a way in.
 *
 * <p>These pin the property the whole feature rests on: an account created by self-service
 * sign-up holds a working password and still cannot sign in until somebody with the authority
 * grants it. Without that, the approval would be decorative — anybody could register and use the
 * platform, which is exactly what the emailed code used to prevent.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SignupApprovalIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;

    private static final String APPLICANT = "applicant@orgskills.test";
    private static final String PASSWORD = "password123";

    private String approverToken;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.findByEmail(APPLICANT).ifPresent(userRepository::delete);
        approverToken = tokenFor(seedApprover());
    }

    @Test
    @DisplayName("Signing up returns no tokens and leaves the account pending")
    void signupCreatesAPendingAccount() throws Exception {
        signUp().andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(APPLICANT))
                .andExpect(jsonPath("$.message").exists())
                // The absence of these is the point: sign-up must not hand out a session.
                .andExpect(jsonPath("$.accessToken").doesNotExist())
                .andExpect(jsonPath("$.refreshToken").doesNotExist());

        assertThat(userRepository.findByEmail(APPLICANT))
                .get()
                .extracting(User::getAccessStatus)
                .isEqualTo(AccessStatus.PENDING);
    }

    @Test
    @DisplayName("A pending account cannot sign in, even with the right password")
    void pendingAccountCannotSignIn() throws Exception {
        signUp();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", APPLICANT, "password", PASSWORD))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("approved")));
    }

    @Test
    @DisplayName("Once approved, the same credentials sign in")
    void approvalLetsThemIn() throws Exception {
        signUp();
        Long applicantId = userRepository.findByEmail(APPLICANT).orElseThrow().getId();

        mockMvc.perform(post("/api/access-requests/" + applicantId + "/approve")
                        .header("Authorization", "Bearer " + approverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("note", "Confirmed."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", APPLICANT, "password", PASSWORD))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    @DisplayName("A refusal keeps its reason and is what the applicant is told at sign-in")
    void refusalIsExplained() throws Exception {
        signUp();
        Long applicantId = userRepository.findByEmail(APPLICANT).orElseThrow().getId();

        mockMvc.perform(post("/api/access-requests/" + applicantId + "/reject")
                        .header("Authorization", "Bearer " + approverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("note", "Not a current employee."))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REJECTED"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", APPLICANT, "password", PASSWORD))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(
                        org.hamcrest.Matchers.containsString("Not a current employee.")));
    }

    @Test
    @DisplayName("Re-applying cannot wipe a refusal")
    void refusedAddressCannotSignUpAgain() throws Exception {
        signUp();
        Long applicantId = userRepository.findByEmail(APPLICANT).orElseThrow().getId();

        mockMvc.perform(post("/api/access-requests/" + applicantId + "/reject")
                        .header("Authorization", "Bearer " + approverToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("note", "No."))))
                .andExpect(status().isOk());

        signUp().andExpect(status().isBadRequest());

        assertThat(userRepository.findByEmail(APPLICANT))
                .get()
                .extracting(User::getAccessStatus)
                .isEqualTo(AccessStatus.REJECTED);
    }

    @Test
    @DisplayName("The pending queue is closed to an ordinary employee")
    void employeesCannotReadTheQueue() throws Exception {
        User employee = new User();
        employee.setEmail("plain.employee@orgskills.test");
        employee.setPassword(passwordEncoder.encode(PASSWORD));
        employee.setFullName("Plain Employee");
        employee.setRole(Role.EMPLOYEE);
        employee.setDepartment("Engineering");
        employee.setJobTitle("Developer");
        employee.setActive(true);
        userRepository.save(employee);

        mockMvc.perform(get("/api/access-requests/pending")
                        .header("Authorization", "Bearer " + tokenFor(employee)))
                .andExpect(status().isForbidden());
    }

    // ── Helpers ─────────────────────────────────────────────────────────────────

    private org.springframework.test.web.servlet.ResultActions signUp() throws Exception {
        return mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of(
                        "email", APPLICANT,
                        "password", PASSWORD,
                        "fullName", "Applicant Person",
                        "department", "Engineering",
                        "jobTitle", "Developer",
                        "targetJobTitle", "Software Engineer",
                        "targetDepartment", "Engineering"))));
    }

    private User seedApprover() {
        return userRepository.findByEmail("approver@orgskills.test").orElseGet(() -> {
            User approver = new User();
            approver.setEmail("approver@orgskills.test");
            approver.setPassword(passwordEncoder.encode(PASSWORD));
            approver.setFullName("Approver Person");
            approver.setRole(Role.HR_ADMIN);
            approver.setDepartment("Human Resources");
            approver.setJobTitle("HR Administrator");
            approver.setActive(true);
            return userRepository.save(approver);
        });
    }

    private String tokenFor(User user) throws Exception {
        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", user.getEmail(), "password", PASSWORD))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(body).path("accessToken").asText();
    }

    private String json(Map<String, ?> body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }
}
