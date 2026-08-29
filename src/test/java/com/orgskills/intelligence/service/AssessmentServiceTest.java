package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.SkillProgressionResponse;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.entity.Assessment;
import com.orgskills.intelligence.entity.AssessmentResult;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AssessmentStatus;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AssessmentRepository;
import com.orgskills.intelligence.repository.AssessmentResultRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentResultRepository assessmentResultRepository;

    @Mock
    private GapAnalysisService gapAnalysisService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AssessmentService assessmentService;

    private User employee;
    private User manager;
    private Skill springBoot;
    private Assessment pending;

    @BeforeEach
    void setUp() {
        employee = user(1L, "Alice Johnson", Role.EMPLOYEE);
        manager = user(2L, "Bob Smith", Role.MANAGER);

        springBoot = new Skill();
        springBoot.setId(10L);
        springBoot.setName("Spring Boot");

        pending = new Assessment();
        pending.setId(500L);
        pending.setEmployee(employee);
        pending.setAssessor(manager);
        pending.setAssessmentType(AssessmentType.MANAGER);
        pending.setStatus(AssessmentStatus.PENDING);
        pending.setDate(Instant.parse("2026-03-01T00:00:00Z"));
    }

    // ── Scheduling ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Creating an assessment records its skill scope and leaves it PENDING")
    void createAssessmentSchedulesScope() {
        stubCreate();

        AssessmentResponse response = assessmentService.createAssessment(2L, createRequest());

        assertThat(response.getAssessmentId()).isEqualTo(500L);
        assertThat(response.getEmployeeId()).isEqualTo(1L);
        assertThat(response.getAssessorId()).isEqualTo(2L);
        assertThat(response.getStatus()).isEqualTo(AssessmentStatus.PENDING);
        assertThat(response.getResults()).singleElement()
                .satisfies(r -> {
                    assertThat(r.getSkillId()).isEqualTo(10L);
                    assertThat(r.getProficiency()).isNull();
                });
    }

    @Test
    @DisplayName("A second pending assessment of the same type and assessor for the same skill is rejected")
    void createAssessmentRejectsPendingDuplicate() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(springBoot));
        when(assessmentRepository.findPendingDuplicates(1L, 2L, AssessmentType.MANAGER, List.of(10L)))
                .thenReturn(List.of(pending));

        assertThatThrownBy(() -> assessmentService.createAssessment(2L, createRequest()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already covers");

        verify(assessmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("The same skill cannot be listed twice on one assessment")
    void createAssessmentRejectsRepeatedSkill() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));

        CreateAssessmentRequest request = createRequest();
        request.setSkillIds(List.of(10L, 10L));

        assertThatThrownBy(() -> assessmentService.createAssessment(2L, request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("cannot be listed twice");
    }

    @Test
    @DisplayName("A SELF assessment must be self-authored and a MANAGER assessment must not be")
    void createAssessmentEnforcesAssessorRules() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));

        CreateAssessmentRequest asSelfForSomeoneElse = createRequest();
        asSelfForSomeoneElse.setAssessmentType(AssessmentType.SELF);
        assertThatThrownBy(() -> assessmentService.createAssessment(2L, asSelfForSomeoneElse))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("must be submitted by the employee themselves");

        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        CreateAssessmentRequest managerOnSelf = createRequest();
        managerOnSelf.setEmployeeId(1L);
        assertThatThrownBy(() -> assessmentService.createAssessment(1L, managerOnSelf))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("cannot be submitted for yourself");
    }

    @Test
    @DisplayName("An ordinary employee cannot submit a MANAGER assessment")
    void createAssessmentRequiresManagerRoleForManagerType() {
        User colleague = user(3L, "Cara Diaz", Role.EMPLOYEE);
        when(userRepository.findById(3L)).thenReturn(Optional.of(colleague));
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> assessmentService.createAssessment(3L, createRequest()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Only a manager, HR or L&D role");
    }

    // ── Validation on submit ────────────────────────────────────────────────────

    @Test
    @DisplayName("A proficiency score outside 0-4 is rejected")
    void submitRejectsOutOfRangeProficiencyScore() {
        stubSubmitLookups();

        AssessmentResultRequest line = new AssessmentResultRequest();
        line.setSkillId(10L);
        line.setProficiencyScore(7);

        assertThatThrownBy(() -> assessmentService.submitAssessment(2L, 500L, submitRequest(line)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("must be between 0 and 4");

        verify(gapAnalysisService, never()).calculateAndFetchUserGaps(anyLong());
    }

    @Test
    @DisplayName("A result with neither a proficiency nor a score is rejected")
    void submitRejectsMissingProficiency() {
        stubSubmitLookups();

        AssessmentResultRequest line = new AssessmentResultRequest();
        line.setSkillId(10L);

        assertThatThrownBy(() -> assessmentService.submitAssessment(2L, 500L, submitRequest(line)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("is required");
    }

    @Test
    @DisplayName("A proficiency name that contradicts the supplied score is rejected")
    void submitRejectsContradictoryProficiency() {
        stubSubmitLookups();

        AssessmentResultRequest line = new AssessmentResultRequest();
        line.setSkillId(10L);
        line.setProficiency(ProficiencyLevel.EXPERT);
        line.setProficiencyScore(1);

        assertThatThrownBy(() -> assessmentService.submitAssessment(2L, 500L, submitRequest(line)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("does not match proficiencyScore");
    }

    @Test
    @DisplayName("The same skill cannot appear twice in one submission")
    void submitRejectsRepeatedSkill() {
        stubSubmitLookups();

        SubmitAssessmentRequest request = new SubmitAssessmentRequest();
        request.setResults(List.of(
                new AssessmentResultRequest(10L, ProficiencyLevel.ADVANCED),
                new AssessmentResultRequest(10L, ProficiencyLevel.EXPERT)));

        assertThatThrownBy(() -> assessmentService.submitAssessment(2L, 500L, request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("more than once");
    }

    @Test
    @DisplayName("An assessment that has already been submitted cannot accept results again")
    void submitRejectsAlreadyCompletedAssessment() {
        pending.setStatus(AssessmentStatus.COMPLETED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(assessmentRepository.findById(500L)).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> assessmentService.submitAssessment(
                2L, 500L, submitRequest(new AssessmentResultRequest(10L, ProficiencyLevel.ADVANCED))))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already COMPLETED");
    }

    // ── The chain ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Submitting raises the skill level, records the improvement, recalculates gaps and notifies")
    void submitRunsTheWholeChain() {
        stubSubmitLookups();
        stubSubmitPersistence();
        UserSkill existing = userSkill(ProficiencyLevel.BEGINNER);
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L)).thenReturn(Optional.of(existing));

        AssessmentResponse response = assessmentService.submitAssessment(
                2L, 500L, submitRequest(new AssessmentResultRequest(10L, ProficiencyLevel.ADVANCED)));

        // (a) results saved and the assessment closed
        assertThat(response.getStatus()).isEqualTo(AssessmentStatus.COMPLETED);
        assertThat(response.getSubmittedAt()).isNotNull();

        // (b) the employee's skill now holds the assessed level
        assertThat(existing.getProficiencyLevel()).isEqualTo(ProficiencyLevel.ADVANCED);
        assertThat(existing.getRatingScore()).isEqualTo(3.0);
        verify(userSkillRepository).save(existing);

        // (c) improvement is ADVANCED(3) - BEGINNER(1)
        assertThat(response.getResults()).singleElement().satisfies(r -> {
            assertThat(r.getProficiency()).isEqualTo(ProficiencyLevel.ADVANCED);
            assertThat(r.getProficiencyScore()).isEqualTo(3);
            assertThat(r.getPreviousProficiency()).isEqualTo(ProficiencyLevel.BEGINNER);
            assertThat(r.getImprovement()).isEqualTo(2);
        });

        // (d) and (e) gaps recalculate, which also refreshes recommendations and learning paths
        verify(gapAnalysisService).calculateAndFetchUserGaps(1L);

        // (f) the employee is told what changed
        ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
        verify(notificationService).createNotification(eq(employee), eq("Assessment results available"),
                message.capture(), eq(NotificationType.ASSESSMENT_RESULT));
        assertThat(message.getValue())
                .isEqualTo("Your Spring Boot proficiency has improved to Advanced.");
    }

    @Test
    @DisplayName("A first-ever assessment creates the skill record and counts the whole level as improvement")
    void submitCreatesSkillRecordWhenAbsent() {
        stubSubmitLookups();
        stubSubmitPersistence();
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L)).thenReturn(Optional.empty());

        AssessmentResponse response = assessmentService.submitAssessment(
                2L, 500L, submitRequest(new AssessmentResultRequest(10L, ProficiencyLevel.INTERMEDIATE)));

        ArgumentCaptor<UserSkill> saved = ArgumentCaptor.forClass(UserSkill.class);
        verify(userSkillRepository).save(saved.capture());
        assertThat(saved.getValue().getProficiencyLevel()).isEqualTo(ProficiencyLevel.INTERMEDIATE);
        assertThat(saved.getValue().getUser()).isEqualTo(employee);

        assertThat(response.getResults()).singleElement().satisfies(r -> {
            assertThat(r.getPreviousProficiency()).isNull();
            assertThat(r.getImprovement()).isEqualTo(2);
        });
    }

    @Test
    @DisplayName("An assessment confirming the existing level reports zero improvement")
    void submitWithNoChangeReportsZeroImprovement() {
        stubSubmitLookups();
        stubSubmitPersistence();
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L))
                .thenReturn(Optional.of(userSkill(ProficiencyLevel.ADVANCED)));

        AssessmentResponse response = assessmentService.submitAssessment(
                2L, 500L, submitRequest(new AssessmentResultRequest(10L, ProficiencyLevel.ADVANCED)));

        assertThat(response.getResults()).singleElement()
                .satisfies(r -> assertThat(r.getImprovement()).isZero());

        ArgumentCaptor<String> message = ArgumentCaptor.forClass(String.class);
        verify(notificationService).createNotification(eq(employee), any(), message.capture(), any());
        assertThat(message.getValue()).contains("confirmed at Advanced");
    }

    @Test
    @DisplayName("An assessment can lower a level, and the improvement comes back negative")
    void submitCanRecordARegression() {
        stubSubmitLookups();
        stubSubmitPersistence();
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L))
                .thenReturn(Optional.of(userSkill(ProficiencyLevel.EXPERT)));

        AssessmentResponse response = assessmentService.submitAssessment(
                2L, 500L, submitRequest(new AssessmentResultRequest(10L, ProficiencyLevel.INTERMEDIATE)));

        assertThat(response.getResults()).singleElement()
                .satisfies(r -> assertThat(r.getImprovement()).isEqualTo(-2));
        verify(gapAnalysisService).calculateAndFetchUserGaps(1L);
    }

    @Test
    @DisplayName("A proficiency given only as a score is accepted on the canonical scale")
    void submitAcceptsProficiencyScore() {
        stubSubmitLookups();
        stubSubmitPersistence();
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L)).thenReturn(Optional.empty());

        AssessmentResultRequest line = new AssessmentResultRequest();
        line.setSkillId(10L);
        line.setProficiencyScore(ProficiencyLevel.EXPERT.getScore());

        AssessmentResponse response = assessmentService.submitAssessment(2L, 500L, submitRequest(line));

        assertThat(response.getResults()).singleElement()
                .satisfies(r -> assertThat(r.getProficiency()).isEqualTo(ProficiencyLevel.EXPERT));
    }

    // ── History ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("History reports previous versus current proficiency with the delta")
    void historyComparesTheLastTwoAssessments() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(userRepository.existsById(1L)).thenReturn(true);

        AssessmentResult older = submittedResult(ProficiencyLevel.BEGINNER, "2026-01-01T00:00:00Z");
        AssessmentResult newer = submittedResult(ProficiencyLevel.ADVANCED, "2026-03-01T00:00:00Z");
        newer.setPreviousProficiency(ProficiencyLevel.BEGINNER);
        when(assessmentResultRepository.findSubmittedResultsForEmployee(1L))
                .thenReturn(List.of(newer, older));

        List<SkillProgressionResponse> history = assessmentService.getHistory(1L, 1L);

        assertThat(history).singleElement().satisfies(p -> {
            assertThat(p.getSkillName()).isEqualTo("Spring Boot");
            assertThat(p.getPreviousProficiency()).isEqualTo(ProficiencyLevel.BEGINNER);
            assertThat(p.getPreviousScore()).isEqualTo(1);
            assertThat(p.getCurrentProficiency()).isEqualTo(ProficiencyLevel.ADVANCED);
            assertThat(p.getCurrentScore()).isEqualTo(3);
            assertThat(p.getImprovement()).isEqualTo(2);
            assertThat(p.getAssessmentCount()).isEqualTo(2);
        });
    }

    @Test
    @DisplayName("With a single assessment on record, history falls back to the level held beforehand")
    void historyWithOneAssessmentUsesRecordedPreviousLevel() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(userRepository.existsById(1L)).thenReturn(true);

        AssessmentResult only = submittedResult(ProficiencyLevel.INTERMEDIATE, "2026-03-01T00:00:00Z");
        only.setPreviousProficiency(ProficiencyLevel.UNAWARE);
        when(assessmentResultRepository.findSubmittedResultsForEmployee(1L)).thenReturn(List.of(only));

        assertThat(assessmentService.getHistory(1L, 1L)).singleElement().satisfies(p -> {
            assertThat(p.getPreviousProficiency()).isEqualTo(ProficiencyLevel.UNAWARE);
            assertThat(p.getPreviousAssessedAt()).isNull();
            assertThat(p.getImprovement()).isEqualTo(2);
            assertThat(p.getAssessmentCount()).isEqualTo(1);
        });
    }

    @Test
    @DisplayName("An employee cannot read another employee's assessment history")
    void historyRejectsForeignEmployee() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThatThrownBy(() -> assessmentService.getHistory(1L, 3L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Access denied");
    }

    // ── Fixtures ────────────────────────────────────────────────────────────────

    private void stubCreate() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(userRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(springBoot));
        when(assessmentRepository.findPendingDuplicates(1L, 2L, AssessmentType.MANAGER, List.of(10L)))
                .thenReturn(List.of());
        when(assessmentRepository.save(any(Assessment.class))).thenAnswer(inv -> {
            Assessment a = inv.getArgument(0);
            a.setId(500L);
            return a;
        });
        when(assessmentResultRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    }

    private void stubSubmitLookups() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(manager));
        when(assessmentRepository.findById(500L)).thenReturn(Optional.of(pending));
        when(assessmentResultRepository.findByAssessmentId(500L)).thenReturn(new ArrayList<>(List.of(scopeRow())));
    }

    /** Kept separate: the validation tests throw before anything is persisted. */
    private void stubSubmitPersistence() {
        when(assessmentResultRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));
    }

    private AssessmentResult scopeRow() {
        AssessmentResult result = new AssessmentResult();
        result.setResultId(900L);
        result.setAssessment(pending);
        result.setSkill(springBoot);
        return result;
    }

    private AssessmentResult submittedResult(ProficiencyLevel level, String at) {
        Assessment assessment = new Assessment();
        assessment.setId(600L);
        assessment.setEmployee(employee);
        assessment.setAssessor(manager);
        assessment.setAssessmentType(AssessmentType.MANAGER);
        assessment.setStatus(AssessmentStatus.COMPLETED);
        assessment.setDate(Instant.parse(at));

        AssessmentResult result = new AssessmentResult();
        result.setResultId(700L);
        result.setAssessment(assessment);
        result.setSkill(springBoot);
        result.setProficiency(level);
        return result;
    }

    private UserSkill userSkill(ProficiencyLevel level) {
        UserSkill userSkill = new UserSkill();
        userSkill.setId(800L);
        userSkill.setUser(employee);
        userSkill.setSkill(springBoot);
        userSkill.setProficiencyLevel(level);
        userSkill.setRatingScore((double) level.getScore());
        return userSkill;
    }

    private CreateAssessmentRequest createRequest() {
        CreateAssessmentRequest request = new CreateAssessmentRequest();
        request.setEmployeeId(1L);
        request.setAssessmentType(AssessmentType.MANAGER);
        request.setSkillIds(List.of(10L));
        return request;
    }

    private SubmitAssessmentRequest submitRequest(AssessmentResultRequest line) {
        SubmitAssessmentRequest request = new SubmitAssessmentRequest();
        request.setResults(List.of(line));
        return request;
    }

    private User user(Long id, String name, Role role) {
        User u = new User();
        u.setId(id);
        u.setFullName(name);
        u.setEmail(name.toLowerCase().replace(' ', '.') + "@orgskills.com");
        u.setRole(role);
        return u;
    }
}
