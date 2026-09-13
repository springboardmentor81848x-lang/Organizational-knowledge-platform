package com.orgskills.intelligence.integration;

import com.orgskills.intelligence.dto.employee.EmployeeProfileResponse;
import com.orgskills.intelligence.dto.employee.TargetRoleRequest;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.EmployeeProfileRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.service.EmployeeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Choosing a target role after sign-up, and reading a profile that does not exist yet.
 *
 * <p>These two travel together because they are the same account's first two problems. Somebody
 * who skipped the target-role question at sign-up - or whose account an administrator created -
 * arrives with neither a target role nor a saved profile, and until this change both of those
 * were dead ends: the profile screen returned a server error, and there was no screen anywhere
 * that let them answer the target-role question afterwards.
 */
@SpringBootTest
@DisplayName("Target role selection, and the profile of an account that has never saved one")
class TargetRoleSelectionIntegrationTest {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeProfileRepository employeeProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User employee;

    @BeforeEach
    void createEmployee() {
        User user = new User();
        user.setEmail("target.role." + UUID.randomUUID() + "@orgskills.test");
        user.setPassword(passwordEncoder.encode("Passw0rd!23"));
        user.setFullName("Tara Rowe");
        user.setRole(Role.EMPLOYEE);
        user.setDepartment("Engineering");
        user.setJobTitle("Junior Developer");
        user.setActive(true);
        // The premise: signed up without answering the target-role question.
        user.setTargetJobTitle(null);
        user.setTargetDepartment(null);
        employee = userRepository.save(user);
    }

    @Test
    @DisplayName("Reading a profile that was never saved returns an empty one and writes nothing")
    void readingAnAbsentProfileDoesNotWriteOne() {
        assertThat(employeeProfileRepository.findByUserId(employee.getId())).isEmpty();

        // This used to insert a blank row on read, which PostgreSQL refuses outright inside the
        // read-only transaction the method declares: "cannot execute INSERT in a read-only
        // transaction". H2 is more forgiving, so the assertion that carries the fix here is the
        // one below - that nothing was written - rather than the call merely succeeding.
        EmployeeProfileResponse profile = employeeService.getProfile(employee.getId());

        assertThat(profile.getUserId()).isEqualTo(employee.getId());
        assertThat(profile.getUserEmail()).isEqualTo(employee.getEmail());
        // Seeded from the account, so the screen has something to show.
        assertThat(profile.getDepartment()).isEqualTo("Engineering");
        assertThat(profile.getJobRole()).isEqualTo("Junior Developer");
        assertThat(profile.getId()).isNull();

        assertThat(employeeProfileRepository.findByUserId(employee.getId())).isEmpty();
    }

    @Test
    @DisplayName("An employee can choose a target role they were never asked for")
    void targetRoleCanBeSetAfterSignUp() {
        TargetRoleRequest request = new TargetRoleRequest("Software Engineer", "Engineering");

        employeeService.updateTargetRole(employee.getId(), request);

        User reloaded = userRepository.findById(employee.getId()).orElseThrow();
        assertThat(reloaded.getTargetJobTitle()).isEqualTo("Software Engineer");
        assertThat(reloaded.getTargetDepartment()).isEqualTo("Engineering");
    }

    @Test
    @DisplayName("A target role with no competency profile behind it is refused, with the reason")
    void unmeasurableTargetRoleIsRefused() {
        TargetRoleRequest request = new TargetRoleRequest("Chief Vibes Officer", "Engineering");

        // Accepting this would produce an account whose assessment has no questions and whose
        // gap analysis has nothing to measure against - a failure discovered much later, on a
        // different screen, with nothing to connect it back to this choice.
        assertThatThrownBy(() -> employeeService.updateTargetRole(employee.getId(), request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("No competency profile is defined");

        assertThat(userRepository.findById(employee.getId()).orElseThrow().getTargetJobTitle()).isNull();
    }

    @Test
    @DisplayName("An account that runs the platform is not offered a target role")
    void administratorsHaveNoTargetRole() {
        User admin = new User();
        admin.setEmail("target.role.admin." + UUID.randomUUID() + "@orgskills.test");
        admin.setPassword(passwordEncoder.encode("Passw0rd!23"));
        admin.setFullName("Sysadmin Sam");
        admin.setRole(Role.SYSTEM_ADMIN);
        admin.setDepartment("Information Technology");
        admin.setJobTitle("System Administrator");
        admin.setActive(true);
        User saved = userRepository.save(admin);

        assertThatThrownBy(() -> employeeService.updateTargetRole(saved.getId(),
                new TargetRoleRequest("Software Engineer", "Engineering")))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("administers the platform");

        // Their profile still reads, though: an account screen is not a development screen.
        assertThatCode(() -> employeeService.getProfile(saved.getId())).doesNotThrowAnyException();
    }
}
