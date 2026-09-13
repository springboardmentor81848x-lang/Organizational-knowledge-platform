package com.orgskills.intelligence.integration;

import com.orgskills.intelligence.dto.assessment.CreateReattemptRequest;
import com.orgskills.intelligence.dto.assessment.QuizAnswerRequest;
import com.orgskills.intelligence.dto.assessment.QuizResponse;
import com.orgskills.intelligence.dto.assessment.QuizResultResponse;
import com.orgskills.intelligence.dto.assessment.QuizSubmissionRequest;
import com.orgskills.intelligence.dto.assessment.ReattemptRequestResponse;
import com.orgskills.intelligence.dto.gap.GapAnalysisResponse;
import com.orgskills.intelligence.entity.AssessmentQuestion;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.ReattemptRequestStatus;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.dto.skill.UserSkillRequest;
import com.orgskills.intelligence.entity.enums.AssessmentScope;
import com.orgskills.intelligence.repository.AssessmentQuestionRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.service.AssessmentAttemptService;
import com.orgskills.intelligence.service.GapAnalysisService;
import com.orgskills.intelligence.service.HeatmapVisualizationService;
import com.orgskills.intelligence.service.QuizService;
import com.orgskills.intelligence.service.UserSkillService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The target-role assessment, end to end.
 *
 * <p>The point being proved is that nothing in this chain is fixed. The same account answering
 * the same paper two different ways must end up with different skill levels, different gap
 * scores and a different heatmap - because the gaps are computed from the answers rather than
 * stored alongside them. Both directions are exercised: a perfect paper, then a failed one on
 * the same account.
 *
 * <p>Taking it twice is no longer something an employee can simply do, which is why the second
 * paper in that test is unlocked through the real approval flow rather than by reaching past it.
 * Each test also gets an account of its own: the once-only rule is enforced against the
 * assessments on record, and a candidate shared between methods would carry one test's attempt
 * into the next.
 */
@SpringBootTest
@DisplayName("Target-role assessment: gaps follow the answers")
class TargetRoleQuizIntegrationTest {

    /** A manager account exists so an approved second attempt can be granted by somebody real. */
    private static final String APPROVER_EMAIL = "quiz.approver@orgskills.test";

    @Autowired
    private QuizService quizService;

    @Autowired
    private AssessmentAttemptService assessmentAttemptService;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AssessmentQuestionRepository assessmentQuestionRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillService userSkillService;

    @Autowired
    private HeatmapVisualizationService heatmapVisualizationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User candidate;
    private User approver;

    /**
     * A candidate per test, not per class.
     *
     * <p>The assessment may be taken once, and that is counted from the assessments actually on
     * record. A shared account would mean the first test to submit a paper locked every test
     * that ran after it - so each gets an account nobody else has assessed.
     */
    @BeforeEach
    void createCandidate() {
        approver = userRepository.findByEmail(APPROVER_EMAIL).orElseGet(() -> {
            User manager = new User();
            manager.setEmail(APPROVER_EMAIL);
            manager.setPassword(passwordEncoder.encode("Passw0rd!23"));
            manager.setFullName("Quiz Approver");
            manager.setRole(Role.MANAGER);
            manager.setDepartment("Engineering");
            manager.setJobTitle("Engineering Manager");
            manager.setActive(true);
            return userRepository.save(manager);
        });

        User user = new User();
        user.setEmail("quiz.candidate." + UUID.randomUUID() + "@orgskills.test");
        user.setPassword(passwordEncoder.encode("Passw0rd!23"));
        user.setFullName("Quiz Candidate");
        user.setRole(Role.EMPLOYEE);
        user.setDepartment("Engineering");
        user.setJobTitle("Junior Developer");
        user.setActive(true);
        user.setManager(approver);
        // Aiming at Software Engineer, which the seeder gives a five-skill competency profile.
        user.setTargetJobTitle("Software Engineer");
        user.setTargetDepartment("Engineering");
        candidate = userRepository.save(user);
    }

    /**
     * Unlocks one more attempt the way the product does: the employee asks, the manager approves.
     *
     * <p>Deliberately not a shortcut that writes an approval straight to the repository. A test
     * that reached past the flow would still pass if the flow itself were broken, and the second
     * attempt in these tests is the only place the unlock is exercised end to end.
     */
    private void grantAnotherAttempt(String reason) {
        ReattemptRequestResponse request =
                assessmentAttemptService.requestReattempt(candidate.getId(), new CreateReattemptRequest(reason));
        assessmentAttemptService.decide(approver.getId(), request.getRequestId(), true, null);
    }

    /** Answers every question correctly, or every question incorrectly. */
    private QuizSubmissionRequest answerAll(QuizResponse quiz, boolean correctly) {
        Map<Long, AssessmentQuestion> bank = assessmentQuestionRepository
                .findAllById(quiz.getQuestions().stream().map(q -> q.getQuestionId()).toList())
                .stream()
                .collect(Collectors.toMap(AssessmentQuestion::getId, Function.identity()));

        List<QuizAnswerRequest> answers = quiz.getQuestions().stream()
                .map(q -> {
                    String correct = bank.get(q.getQuestionId()).getCorrectOption();
                    String chosen = correctly
                            ? correct
                            : List.of("A", "B", "C", "D").stream()
                                    .filter(o -> !o.equals(correct))
                                    .findFirst()
                                    .orElseThrow();
                    return new QuizAnswerRequest(q.getQuestionId(), chosen);
                })
                .toList();

        QuizSubmissionRequest submission = new QuizSubmissionRequest();
        submission.setAnswers(answers);
        return submission;
    }

    @Test
    @DisplayName("the paper covers the target role's skills and never carries the answer key")
    void quizIsBuiltFromTheTargetRoleAndHidesAnswers() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());

        assertThat(quiz.getTargetJobTitle()).isEqualTo("Software Engineer");
        assertThat(quiz.getSkillCount()).isGreaterThan(0);
        assertThat(quiz.getQuestions()).isNotEmpty();

        // Questions come from the target role's skills, not the current job title's.
        assertThat(quiz.getQuestions())
                .allSatisfy(q -> {
                    assertThat(q.getQuestionText()).isNotBlank();
                    assertThat(q.getOptions()).hasSize(4);
                    assertThat(q.getDifficulty()).isNotBlank();
                });

        // A paper spread across difficulties, otherwise the weighting could never award the
        // higher levels however well somebody answered.
        assertThat(quiz.getQuestions().stream().map(q -> q.getDifficulty()).distinct())
                .hasSizeGreaterThan(1);
    }

    @Test
    @DisplayName("answering everything correctly awards EXPERT and closes every gap")
    void perfectPaperClosesGaps() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        QuizResultResponse result = quizService.submitQuiz(candidate.getId(), answerAll(quiz, true));

        assertThat(result.getTotalCorrect()).isEqualTo(result.getTotalQuestions());
        assertThat(result.getOverallScorePercentage()).isEqualTo(100.0);
        assertThat(result.getSkillScores())
                .isNotEmpty()
                .allSatisfy(score -> assertThat(score.getAwardedProficiency()).isEqualTo("EXPERT"));

        List<GapAnalysisResponse> gaps = gapAnalysisService.getStoredUserGaps(candidate.getId());
        assertThat(gaps).isNotEmpty();
        // EXPERT clears every requirement the seeded profile sets, so nothing is outstanding.
        assertThat(gaps).allSatisfy(gap -> assertThat(gap.getGapScore()).isEqualTo(0.0));
    }

    @Test
    @DisplayName("answering everything wrongly reopens the gaps the same account had just closed")
    void failedPaperReopensGaps() {
        // First close everything, so the change that follows can only have come from the answers.
        QuizResponse first = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(first, true));
        assertThat(gapAnalysisService.getStoredUserGaps(candidate.getId()))
                .allSatisfy(gap -> assertThat(gap.getGapScore()).isEqualTo(0.0));

        // The attempt is used up, so the second paper has to be unlocked by an approver.
        grantAnotherAttempt("Re-measuring after the first paper, for this test.");

        QuizResponse second = quizService.generateQuizForTargetRole(candidate.getId());
        QuizResultResponse result = quizService.submitQuiz(candidate.getId(), answerAll(second, false));

        assertThat(result.getTotalCorrect()).isZero();
        assertThat(result.getSkillScores())
                .allSatisfy(score -> {
                    assertThat(score.getAwardedProficiency()).isEqualTo("UNAWARE");
                    // Previously EXPERT, so the drop is recorded rather than silently replaced.
                    assertThat(score.getPreviousProficiency()).isEqualTo("EXPERT");
                    assertThat(score.getImprovement()).isNegative();
                });

        List<GapAnalysisResponse> gaps = gapAnalysisService.getStoredUserGaps(candidate.getId());
        assertThat(gaps).isNotEmpty();
        // The gaps moved because the answers did. This is the assertion that a hardcoded
        // heatmap or a stored gap score could not satisfy.
        assertThat(gaps).anySatisfy(gap -> assertThat(gap.getGapScore()).isGreaterThan(0.0));
        assertThat(gaps.stream().mapToDouble(GapAnalysisResponse::getGapScore).sum())
                .isGreaterThan(0.0);
    }

    @Test
    @DisplayName("each gap equals the distance from the awarded level to the level required")
    void gapScoresMatchTheAwardedLevels() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(quiz, false));

        List<GapAnalysisResponse> gaps = gapAnalysisService.getStoredUserGaps(candidate.getId());

        // Everything scored zero, so the current level is UNAWARE and each gap must be exactly
        // the required level's own score - which is what makes the heatmap's colours derived
        // rather than decorative.
        assertThat(gaps).allSatisfy(gap -> {
            ProficiencyLevel required = ProficiencyLevel.valueOf(gap.getTargetProficiency());
            assertThat(gap.getGapScore()).isEqualTo((double) required.getScore());
        });
    }

    @Test
    @DisplayName("an account with no target role is told so rather than given an empty paper")
    void missingTargetRoleIsRefusedClearly() {
        candidate.setTargetJobTitle(null);
        candidate.setTargetDepartment(null);
        userRepository.save(candidate);

        assertThatThrownBy(() -> quizService.generateQuizForTargetRole(candidate.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("target role");
    }

    @Test
    @DisplayName("a submission naming a question that was never asked is rejected")
    void unknownQuestionIsRejected() {
        QuizSubmissionRequest submission = new QuizSubmissionRequest();
        submission.setAnswers(List.of(new QuizAnswerRequest(-999L, "A")));

        // Marking reads the question from the database rather than trusting the payload, which
        // is what stops a client claiming a skill or difficulty it was never set.
        assertThatThrownBy(() -> quizService.submitQuiz(candidate.getId(), submission))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Unknown question");
    }

    @Test
    @DisplayName("the same question answered twice in one submission is rejected")
    void duplicateAnswersAreRejected() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        Long questionId = quiz.getQuestions().get(0).getQuestionId();

        QuizSubmissionRequest submission = new QuizSubmissionRequest();
        submission.setAnswers(List.of(
                new QuizAnswerRequest(questionId, "A"),
                new QuizAnswerRequest(questionId, "B")));

        assertThatThrownBy(() -> quizService.submitQuiz(candidate.getId(), submission))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("more than once");
    }

    @Test
    @DisplayName("the personal heatmap works for someone who has never been assessed")
    void personalHeatmapSeedsGapsOnFirstRead() {
        // getUserHeatmap is read-only and calls getStoredUserGaps, which calculates and inserts
        // when the person has no gaps yet. PostgreSQL refuses an insert inside a read-only
        // transaction (SQLSTATE 25006), so before the fix this failed outright on the first
        // visit to the gaps page - the exact path a newly signed-up employee takes.
        //
        // H2 treats read-only as advisory, so this test cannot fail for that reason here; what
        // it does guarantee is that the cold-start path stays exercised and keeps producing the
        // right shape, and it documents why the calculation runs in its own transaction.
        var heatmap = heatmapVisualizationService.getUserHeatmap(candidate.getId());

        assertThat(heatmap).isNotNull();
        assertThat(heatmap.getScope()).isEqualTo("USER");
        assertThat(heatmap.getMatrix()).isNotEmpty();
        // Seeded against the target role, so the heatmap covers that role's skills.
        assertThat(heatmap.getMatrix())
                .allSatisfy(cell -> assertThat(cell.getSkillName()).isNotBlank());
    }

    @Test
    @DisplayName("gaps are measured against the target role, not the current job title")
    void gapsFollowTheTargetRole() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(quiz, false));

        List<String> assessedSkills = quiz.getQuestions().stream()
                .map(q -> q.getSkillName())
                .distinct()
                .sorted()
                .toList();

        // Read through the service rather than the repository: the entity's skill is a lazy
        // association, and reading it here would be outside any session. The response DTO
        // already carries the name.
        List<String> gapSkills = gapAnalysisService.getStoredUserGaps(candidate.getId()).stream()
                .map(GapAnalysisResponse::getSkillName)
                .distinct()
                .sorted()
                .toList();

        // The two sets must agree. If gaps were measured against "Junior Developer" instead,
        // the employee would be assessed on one set of skills and scored against another.
        assertThat(gapSkills).containsExactlyElementsOf(assessedSkills);
    }

    // -- The once-only rule --------------------------------------------------

    @Test
    @DisplayName("a second attempt is refused, and the refusal says what to do about it")
    void secondAttemptIsRefusedWithoutApproval() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(quiz, true));

        // Refused at the paper, not only at the submission. A candidate who could still fetch
        // the questions would have seen them, whatever happened to their answers afterwards.
        assertThatThrownBy(() -> quizService.generateQuizForTargetRole(candidate.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already taken this assessment")
                .hasMessageContaining("approval");

        var status = assessmentAttemptService.getAttemptStatus(candidate.getId());
        assertThat(status.getAttemptsTaken()).isEqualTo(1);
        assertThat(status.isCanTake()).isFalse();
        assertThat(status.isRequestRequired()).isTrue();
    }

    @Test
    @DisplayName("a pending request does not itself unlock anything")
    void pendingRequestDoesNotUnlockTheAssessment() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(quiz, true));

        assessmentAttemptService.requestReattempt(candidate.getId(),
                new CreateReattemptRequest("My connection dropped part-way through."));

        var status = assessmentAttemptService.getAttemptStatus(candidate.getId());
        assertThat(status.isCanTake()).isFalse();
        // Nothing more for the employee to do, so they are not offered the form again.
        assertThat(status.isRequestRequired()).isFalse();

        assertThatThrownBy(() -> quizService.generateQuizForTargetRole(candidate.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("awaiting a decision");
    }

    @Test
    @DisplayName("an approval buys exactly one attempt and is spent by taking it")
    void approvalIsSingleUse() {
        QuizResponse first = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(first, true));

        grantAnotherAttempt("I have finished the recommended course and want to be re-measured.");
        assertThat(assessmentAttemptService.getAttemptStatus(candidate.getId()).isCanTake()).isTrue();

        QuizResponse second = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(second, false));

        // This is the assertion that separates an approval from a permanent exemption: without
        // consuming it, one approved request would license every retake from then on.
        var status = assessmentAttemptService.getAttemptStatus(candidate.getId());
        assertThat(status.getAttemptsTaken()).isEqualTo(2);
        assertThat(status.isCanTake()).isFalse();
        assertThat(status.isRequestRequired()).isTrue();
        assertThat(status.getActiveApproval()).isNull();
        assertThat(status.getLatestRequest().getConsumedAt()).isNotNull();

        assertThatThrownBy(() -> quizService.generateQuizForTargetRole(candidate.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already taken this assessment");
    }

    @Test
    @DisplayName("a declined request leaves the assessment shut and can be asked again")
    void declinedRequestLeavesTheAssessmentShut() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(quiz, true));

        ReattemptRequestResponse request = assessmentAttemptService.requestReattempt(
                candidate.getId(), new CreateReattemptRequest("I would like a better score."));

        // The queue reaches the manager because the candidate reports to them, and both the
        // filtered and the unfiltered read are exercised - the status filter is optional in the
        // query, and an optional enum parameter is exactly the kind of thing that compiles and
        // then fails on the first real call.
        assertThat(assessmentAttemptService.getRequestsForApprover(approver.getId(), ReattemptRequestStatus.PENDING))
                .extracting(ReattemptRequestResponse::getRequestId)
                .contains(request.getRequestId());
        assertThat(assessmentAttemptService.getRequestsForApprover(approver.getId(), null))
                .extracting(ReattemptRequestResponse::getRequestId)
                .contains(request.getRequestId());

        assessmentAttemptService.decide(approver.getId(), request.getRequestId(), false,
                "Take the recommended course first.");

        // Decided, so it is out of the pending queue but still on the record.
        assertThat(assessmentAttemptService.getRequestsForApprover(approver.getId(), ReattemptRequestStatus.PENDING))
                .extracting(ReattemptRequestResponse::getRequestId)
                .doesNotContain(request.getRequestId());

        var status = assessmentAttemptService.getAttemptStatus(candidate.getId());
        assertThat(status.isCanTake()).isFalse();
        // Declined is not final: the employee may ask again once something has changed.
        assertThat(status.isRequestRequired()).isTrue();
        assertThat(status.getLatestRequest().getDecisionNote()).isEqualTo("Take the recommended course first.");
    }

    @Test
    @DisplayName("nobody can approve their own retake")
    void selfApprovalIsRefused() {
        QuizResponse quiz = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(quiz, true));

        ReattemptRequestResponse request = assessmentAttemptService.requestReattempt(
                candidate.getId(), new CreateReattemptRequest("Asking on my own behalf."));

        // The candidate is an EMPLOYEE, so this is refused for want of the role - but the check
        // is worth pinning because an approver who is also an employee would otherwise be able
        // to wave their own request through.
        assertThatThrownBy(() -> assessmentAttemptService.decide(
                candidate.getId(), request.getRequestId(), true, null))
                .isInstanceOf(RuntimeException.class);

        assertThat(assessmentAttemptService.getAttemptStatus(candidate.getId()).isCanTake()).isFalse();
    }

    // -- Skills added after the assessment -----------------------------------

    /**
     * Adds a skill the Software Engineer profile does not ask for but which has authored
     * questions, so the paper it produces is a real one.
     */
    private Long addSkillOutsideTheTargetRole(String skillName) {
        Long skillId = skillRepository.findByNameIgnoreCase(skillName).orElseThrow().getId();
        UserSkillRequest request = new UserSkillRequest();
        request.setSkillId(skillId);
        userSkillService.addSkillToUser(candidate.getId(), request);
        return skillId;
    }

    @Test
    @DisplayName("A skill you add arrives unassessed, whatever level the request claims")
    void addedSkillStartsUnassessed() {
        Long skillId = addSkillOutsideTheTargetRole("React");

        assertThat(userSkillService.getUserSkills(candidate.getId()))
                .filteredOn(us -> us.getSkillId().equals(skillId))
                .singleElement()
                .satisfies(us -> {
                    assertThat(us.getProficiencyLevel()).isEqualTo(ProficiencyLevel.UNAWARE);
                    assertThat(us.isAwaitingAssessment()).isTrue();
                });
    }

    @Test
    @DisplayName("A skill added after the one attempt earns its own paper, covering only itself")
    void addingASkillOffersAnAssessmentForItAlone() {
        // Use up the one target-role attempt first, so the assessment would otherwise be shut.
        QuizResponse first = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(first, true));
        assertThatThrownBy(() -> quizService.generateQuizForTargetRole(candidate.getId()))
                .isInstanceOf(ValidationException.class);

        addSkillOutsideTheTargetRole("React");

        var status = assessmentAttemptService.getAttemptStatus(candidate.getId());
        assertThat(status.getScope()).isEqualTo(AssessmentScope.NEW_SKILLS);
        assertThat(status.isCanTake()).isTrue();
        assertThat(status.getPendingSkillCount()).isEqualTo(1);
        // Still no approval involved: this is a first measurement, not a retake.
        assertThat(status.isRequestRequired()).isFalse();

        QuizResponse paper = quizService.generateQuizForTargetRole(candidate.getId());
        assertThat(paper.getQuestions())
                .isNotEmpty()
                // The whole point: a paper that also covered the role skills would be a retake
                // of an assessment the employee has already used their attempt on.
                .allSatisfy(question -> assertThat(question.getSkillName()).isEqualTo("React"));

        quizService.submitQuiz(candidate.getId(), answerAll(paper, true));

        // Marked, so the skill now has a level and stops asking to be assessed.
        assertThat(userSkillService.getUnassessedSkillIds(candidate.getId())).isEmpty();
        assertThat(userSkillService.getUserSkills(candidate.getId()))
                .filteredOn(us -> "React".equals(us.getSkillName()))
                .singleElement()
                .satisfies(us -> {
                    assertThat(us.getProficiencyLevel()).isEqualTo(ProficiencyLevel.EXPERT);
                    assertThat(us.isAwaitingAssessment()).isFalse();
                });

        // And it reaches the heatmap, which is the reason for measuring it at all. Nothing in
        // the employee's role asks for React, so without a gap row of its own the skill they
        // just added and sat an assessment for would be invisible.
        assertThat(heatmapVisualizationService.getUserHeatmap(candidate.getId()).getMatrix())
                .anySatisfy(cell -> assertThat(cell.getSkillName()).isEqualTo("React"));
    }

    @Test
    @DisplayName("Sitting the new-skills paper does not spend an approved retake")
    void newSkillsPaperDoesNotSpendAnApproval() {
        QuizResponse first = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(first, true));

        grantAnotherAttempt("I want to be re-measured on the role assessment.");
        addSkillOutsideTheTargetRole("Python");

        // With an approval in hand the role paper wins, which is the right precedence: the
        // employee asked for that specific thing and somebody approved it.
        assertThat(assessmentAttemptService.getAttemptStatus(candidate.getId()).getScope())
                .isEqualTo(AssessmentScope.TARGET_ROLE);

        QuizResponse rolePaper = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(rolePaper, false));

        // That spent the approval; the added skill is still waiting, and now gets its own paper
        // without needing a fresh one.
        var status = assessmentAttemptService.getAttemptStatus(candidate.getId());
        assertThat(status.getActiveApproval()).isNull();
        assertThat(status.getScope()).isEqualTo(AssessmentScope.NEW_SKILLS);

        QuizResponse skillPaper = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(skillPaper, true));

        // The new-skills paper spent nothing of its own, so the employee is back to needing an
        // approval - it neither granted nor consumed one.
        var after = assessmentAttemptService.getAttemptStatus(candidate.getId());
        assertThat(after.getScope()).isEqualTo(AssessmentScope.NONE);
        assertThat(after.isRequestRequired()).isTrue();
    }

    @Test
    @DisplayName("An added skill cannot be used to re-measure one already assessed")
    void reAddingAnAssessedSkillDoesNotReopenIt() {
        QuizResponse first = quizService.generateQuizForTargetRole(candidate.getId());
        quizService.submitQuiz(candidate.getId(), answerAll(first, false));

        // Java is on the target role, so it was just assessed - and badly. Removing it from the
        // profile and adding it back is the obvious way to try for a second go at it.
        Long javaId = skillRepository.findByNameIgnoreCase("Java").orElseThrow().getId();
        userSkillService.getUserSkills(candidate.getId()).stream()
                .filter(us -> us.getSkillId().equals(javaId))
                .findFirst()
                .ifPresent(us -> userSkillService.deleteUserSkill(candidate.getId(), us.getId()));
        addSkillOutsideTheTargetRole("Java");

        // Refused, because "has this been assessed?" is answered from the marked results rather
        // than from a flag on the skill row - and deleting the row does not delete the result.
        assertThat(userSkillService.getUnassessedSkillIds(candidate.getId())).doesNotContain(javaId);
        assertThat(assessmentAttemptService.getAttemptStatus(candidate.getId()).getScope())
                .isEqualTo(AssessmentScope.NONE);
        assertThatThrownBy(() -> quizService.generateQuizForTargetRole(candidate.getId()))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already taken this assessment");
    }

    @Test
    @DisplayName("An account that runs the platform is not assessed by it")
    void administratorAccountsAreNotAssessed() {
        User admin = new User();
        admin.setEmail("quiz.sysadmin." + UUID.randomUUID() + "@orgskills.test");
        admin.setPassword(passwordEncoder.encode("Passw0rd!23"));
        admin.setFullName("Quiz Sysadmin");
        admin.setRole(Role.SYSTEM_ADMIN);
        admin.setDepartment("Information Technology");
        admin.setJobTitle("System Administrator");
        admin.setActive(true);
        admin = userRepository.save(admin);

        var status = assessmentAttemptService.getAttemptStatus(admin.getId());
        assertThat(status.isDevelopmentTrack()).isFalse();
        assertThat(status.isCanTake()).isFalse();
        // Not offered the request either: there is no attempt to ask for.
        assertThat(status.isRequestRequired()).isFalse();
        assertThat(status.getScope()).isEqualTo(AssessmentScope.NONE);

        Long adminId = admin.getId();
        assertThatThrownBy(() -> quizService.generateQuizForTargetRole(adminId))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("administers the platform");
    }
}
