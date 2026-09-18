package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultRequest;
import com.orgskills.intelligence.dto.assessment.QuizAnswerRequest;
import com.orgskills.intelligence.dto.assessment.QuizGradedAnswer;
import com.orgskills.intelligence.dto.assessment.QuizQuestionResponse;
import com.orgskills.intelligence.dto.assessment.QuizResponse;
import com.orgskills.intelligence.dto.assessment.QuizResultResponse;
import com.orgskills.intelligence.dto.assessment.QuizSkillScore;
import com.orgskills.intelligence.dto.assessment.QuizSubmissionRequest;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.entity.AssessmentQuestion;
import com.orgskills.intelligence.entity.RoleCompetency;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.AssessmentScope;
import com.orgskills.intelligence.entity.enums.AssessmentType;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.AssessmentQuestionRepository;
import com.orgskills.intelligence.repository.RoleCompetencyRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Builds and marks the multiple-choice assessment an employee takes against their target role.
 *
 * <p>The quiz is not a parallel system. Marking produces exactly the input a self-assessment
 * submission takes, and it is handed to {@link AssessmentService#createAndSubmit} - so a quiz
 * writes the same {@code Assessment} and {@code AssessmentResult} rows as any other assessment,
 * and the gap recalculation, heatmap refresh, recommendation regeneration and notifications all
 * follow from that without knowing a quiz was involved. Scoring the quiz separately and writing
 * skill levels directly would have bypassed every one of those.
 *
 * <p>The assessment may be taken once. Every attempt after the first has to be unlocked by an
 * approval from a manager or an HR administrator, which {@link AssessmentAttemptService} owns and
 * this class defers to at both ends of the flow.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class QuizService {

    /**
     * How many questions a single skill contributes, at most.
     *
     * <p>A cap is needed because skills do not have equally deep question banks. Without it, a
     * role covering one skill with thirty questions and four with three would be four-fifths a
     * test of the first skill, and the overall percentage would say almost nothing about the
     * other four.
     */
    private static final int MAX_QUESTIONS_PER_SKILL = 5;

    /**
     * Weight per difficulty when marking, so that a level is earned by answering questions at
     * that level rather than by volume.
     *
     * <p>A candidate who answers five BEGINNER questions correctly and misses every harder one
     * has shown beginner knowledge, and a flat one-mark-per-question scheme would score them the
     * same as somebody who got the same count spread across the hardest questions. Weighting by
     * the level under test is what separates those two.
     */
    private static final Map<ProficiencyLevel, Double> DIFFICULTY_WEIGHT = Map.of(
            ProficiencyLevel.UNAWARE, 1.0,
            ProficiencyLevel.BEGINNER, 1.0,
            ProficiencyLevel.INTERMEDIATE, 2.0,
            ProficiencyLevel.ADVANCED, 3.0,
            ProficiencyLevel.EXPERT, 4.0);

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final RoleCompetencyRepository roleCompetencyRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentService assessmentService;
    private final AssessmentAttemptService assessmentAttemptService;
    private final UserSkillService userSkillService;

    /**
     * Builds the quiz for a person's target role.
     *
     * <p>The skills come from the competency profile of the target role, not the role they hold
     * today: the point of the assessment is to measure the distance to where they are going.
     */
    @Transactional(readOnly = true)
    public QuizResponse generateQuizForTargetRole(Long userId) {
        // The rule is checked before anything is built, and it is the same call that decides
        // which paper this is. Issuing a paper the employee is not entitled to sit would let
        // them see the questions even though the submission would later be refused.
        AssessmentScope scope = assessmentAttemptService.requireAttemptAllowed(userId);
        User user = getUser(userId);

        return scope == AssessmentScope.NEW_SKILLS
                ? buildNewSkillsPaper(user)
                : buildTargetRolePaper(user);
    }

    /** The full paper: every skill the employee's target role is measured on. */
    private QuizResponse buildTargetRolePaper(User user) {
        String targetJobTitle = user.getTargetJobTitle();
        String targetDepartment = user.getTargetDepartment();
        if (targetJobTitle == null || targetJobTitle.isBlank()
                || targetDepartment == null || targetDepartment.isBlank()) {
            throw new ValidationException(
                    "No target role is set for this account. Choose a target role before taking an assessment.");
        }

        List<RoleCompetency> competencies = roleCompetencyRepository
                .findByJobTitleIgnoreCaseAndDepartmentIgnoreCase(targetJobTitle, targetDepartment);
        if (competencies.isEmpty()) {
            throw new ValidationException("No competency profile is defined for target role '"
                    + targetJobTitle + "' in " + targetDepartment + ", so there is nothing to assess.");
        }

        List<Long> skillIds = competencies.stream()
                .map(rc -> rc.getSkill().getId())
                .distinct()
                .toList();

        List<AssessmentQuestion> questions = assessmentQuestionRepository.findBySkillIdInWithSkill(skillIds);
        if (questions.isEmpty()) {
            throw new ValidationException("No assessment questions have been authored for the skills "
                    + "in target role '" + targetJobTitle + "'. Ask an administrator to add some.");
        }

        return paper(targetJobTitle, targetDepartment, skillIds.size(), questions);
    }

    /**
     * A paper covering only the skills the employee has added and never been assessed on.
     *
     * <p>This is what makes adding a skill mean something. A skill goes onto a profile
     * unassessed - the platform will not take somebody's word for their own level - and this is
     * how it acquires one, after which the gap and the heatmap cell for it follow from the same
     * chain as every other assessed skill.
     *
     * <p>It is deliberately not the role paper in disguise. The skills come from the employee's
     * own profile filtered to those with no result against them, so a skill that has already
     * been marked can never appear, and sitting this cannot revise a level somebody is unhappy
     * with - that still needs an approved retake.
     *
     * <p>A skill with no authored questions is skipped rather than failing the request. The
     * employee did nothing wrong by adding a skill nobody has written questions for, and
     * refusing the whole paper would block the skills that <em>can</em> be assessed alongside it.
     */
    private QuizResponse buildNewSkillsPaper(User user) {
        List<Long> pendingSkillIds = userSkillService.getUnassessedSkillIds(user.getId());
        List<AssessmentQuestion> questions = pendingSkillIds.isEmpty()
                ? List.of()
                : assessmentQuestionRepository.findBySkillIdInWithSkill(pendingSkillIds);

        if (questions.isEmpty()) {
            throw new ValidationException("No assessment questions have been authored for the "
                    + "skills you added, so they cannot be assessed yet. Ask an administrator to "
                    + "add some, or remove the skills from your profile.");
        }

        long coveredSkills = questions.stream().map(q -> q.getSkill().getId()).distinct().count();
        return paper("New skills on your profile", user.getDepartment(), (int) coveredSkills, questions);
    }

    private QuizResponse paper(String title, String department, int skillCount,
                               List<AssessmentQuestion> available) {
        List<QuizQuestionResponse> selected = selectQuestions(available).stream()
                .map(this::toQuizQuestion)
                .toList();

        return QuizResponse.builder()
                .targetJobTitle(title)
                .targetDepartment(department)
                .skillCount(skillCount)
                .questionCount(selected.size())
                .questions(selected)
                .build();
    }

    /**
     * Marks a submission, records it as a self-assessment and returns the breakdown.
     *
     * <p>Answers are looked up by question id rather than trusted from the payload, so a client
     * cannot submit a skill it was never asked about or claim a difficulty it was not set.
     */
    @Transactional
    public QuizResultResponse submitQuiz(Long userId, QuizSubmissionRequest request) {
        // Checked again here, not only when the paper was issued. The two are separate requests
        // and an old paper can be submitted long after it was fetched, so the gate at generation
        // time is a courtesy and this one is the control.
        AssessmentScope scope = assessmentAttemptService.requireAttemptAllowed(userId);

        User user = getUser(userId);

        List<Long> questionIds = request.getAnswers().stream()
                .map(QuizAnswerRequest::getQuestionId)
                .distinct()
                .toList();
        if (questionIds.size() != request.getAnswers().size()) {
            throw new ValidationException("The same question was answered more than once");
        }

        Map<Long, AssessmentQuestion> questionsById = assessmentQuestionRepository.findAllById(questionIds)
                .stream()
                .collect(Collectors.toMap(AssessmentQuestion::getId, q -> q));

        List<Long> unknown = questionIds.stream().filter(id -> !questionsById.containsKey(id)).toList();
        if (!unknown.isEmpty()) {
            throw new ValidationException("Unknown question id(s): " + unknown);
        }

        // Mark each answer, and gather the marks per skill as we go.
        List<QuizGradedAnswer> graded = new ArrayList<>();
        Map<Long, SkillTally> tallies = new LinkedHashMap<>();

        for (QuizAnswerRequest answer : request.getAnswers()) {
            AssessmentQuestion question = questionsById.get(answer.getQuestionId());
            boolean correct = question.isCorrect(answer.getSelectedOption());
            double weight = DIFFICULTY_WEIGHT.getOrDefault(question.getDifficulty(), 1.0);

            SkillTally tally = tallies.computeIfAbsent(question.getSkill().getId(),
                    id -> new SkillTally(question.getSkill().getId(), question.getSkill().getName()));
            tally.asked++;
            tally.weightAvailable += weight;
            if (correct) {
                tally.correct++;
                tally.weightEarned += weight;
            }

            graded.add(QuizGradedAnswer.builder()
                    .questionId(question.getId())
                    .skillId(question.getSkill().getId())
                    .skillName(question.getSkill().getName())
                    .questionText(question.getQuestionText())
                    .selectedOption(answer.getSelectedOption().toUpperCase())
                    .correctOption(question.getCorrectOption())
                    .correct(correct)
                    .difficulty(question.getDifficulty().name())
                    .explanation(question.getExplanation())
                    .build());
        }

        // Turn each skill's weighted percentage into a level, and remember what they had before
        // so the response can report the movement.
        Map<Long, ProficiencyLevel> previousBySkill = userSkillRepository.findByUserId(userId).stream()
                .filter(us -> us.getSkill() != null && us.getProficiencyLevel() != null)
                .collect(Collectors.toMap(us -> us.getSkill().getId(), UserSkill::getProficiencyLevel,
                        (a, b) -> a));

        List<AssessmentResultRequest> resultLines = new ArrayList<>();
        List<QuizSkillScore> skillScores = new ArrayList<>();

        for (SkillTally tally : tallies.values()) {
            double percentage = tally.percentage();
            ProficiencyLevel awarded = toProficiency(percentage);
            ProficiencyLevel previous = previousBySkill.get(tally.skillId);

            AssessmentResultRequest line = new AssessmentResultRequest();
            line.setSkillId(tally.skillId);
            line.setProficiency(awarded);
            line.setScore(round(percentage));
            resultLines.add(line);

            skillScores.add(QuizSkillScore.builder()
                    .skillId(tally.skillId)
                    .skillName(tally.skillName)
                    .questionsAsked(tally.asked)
                    .questionsCorrect(tally.correct)
                    .scorePercentage(round(percentage))
                    .awardedProficiency(awarded.name())
                    .previousProficiency(previous == null ? null : previous.name())
                    .improvement(awarded.getScore() - (previous == null ? 0 : previous.getScore()))
                    .build());
        }

        // Recorded as a real self-assessment. Everything downstream - skill levels, gaps, the
        // heatmap, recommendations, learning paths, notifications - follows from this one call.
        SubmitAssessmentRequest submission = new SubmitAssessmentRequest();
        submission.setResults(resultLines);
        submission.setComments(scope == AssessmentScope.NEW_SKILLS
                ? "Submitted from the assessment covering newly added skills"
                : "Submitted from the target-role assessment for "
                        + user.getTargetJobTitle() + " (" + user.getTargetDepartment() + ")");

        AssessmentResponse assessment =
                assessmentService.createAndSubmit(userId, userId, AssessmentType.SELF, submission);

        // The attempt is on record, so the approval that paid for it is spent. Doing this after
        // the assessment is written, in the same transaction, means a failed marking run cannot
        // cost the employee an approval they never got to use. A new-skills paper spends
        // nothing, which the service decides from the scope.
        assessmentAttemptService.consumeApprovalIfPresent(userId, scope);

        int totalCorrect = (int) graded.stream().filter(QuizGradedAnswer::getCorrect).count();
        double overall = graded.isEmpty() ? 0.0 : (totalCorrect * 100.0) / graded.size();

        return QuizResultResponse.builder()
                .assessmentId(assessment.getAssessmentId())
                .targetJobTitle(user.getTargetJobTitle())
                .targetDepartment(user.getTargetDepartment())
                .totalQuestions(graded.size())
                .totalCorrect(totalCorrect)
                .overallScorePercentage(round(overall))
                .skillScores(skillScores)
                .gradedAnswers(graded)
                .build();
    }

    /**
     * Picks the questions for a quiz: up to {@link #MAX_QUESTIONS_PER_SKILL} per skill, spread
     * across difficulties rather than taken from whichever end of the bank comes first.
     *
     * <p>The spread matters for marking. If a skill contributed only its easy questions, the
     * weighted score could never reach the range that awards ADVANCED or EXPERT, and the
     * candidate would be capped at a level by the selection rather than by their answers.
     */
    private List<AssessmentQuestion> selectQuestions(List<AssessmentQuestion> available) {
        Map<Long, List<AssessmentQuestion>> bySkill = available.stream()
                .collect(Collectors.groupingBy(q -> q.getSkill().getId(), LinkedHashMap::new, Collectors.toList()));

        List<AssessmentQuestion> selected = new ArrayList<>();
        for (List<AssessmentQuestion> forSkill : bySkill.values()) {
            List<AssessmentQuestion> ordered = forSkill.stream()
                    .sorted(Comparator.comparingInt((AssessmentQuestion q) -> q.getDifficulty().getScore())
                            .thenComparing(AssessmentQuestion::getId))
                    .toList();
            selected.addAll(spreadAcrossDifficulty(ordered));
        }
        return selected;
    }

    /**
     * Takes at most {@link #MAX_QUESTIONS_PER_SKILL} from a difficulty-ordered list, sampling at
     * even intervals so easy, middling and hard questions are all represented.
     */
    private List<AssessmentQuestion> spreadAcrossDifficulty(List<AssessmentQuestion> ordered) {
        if (ordered.size() <= MAX_QUESTIONS_PER_SKILL) {
            return ordered;
        }
        List<AssessmentQuestion> picked = new ArrayList<>(MAX_QUESTIONS_PER_SKILL);
        double step = (double) ordered.size() / MAX_QUESTIONS_PER_SKILL;
        for (int i = 0; i < MAX_QUESTIONS_PER_SKILL; i++) {
            picked.add(ordered.get((int) Math.floor(i * step)));
        }
        return picked;
    }

    /**
     * Maps a weighted percentage onto the platform's proficiency ladder.
     *
     * <p>The thresholds are deliberately not evenly spaced across 0-100. Because harder
     * questions carry more weight, reaching 85% of the available weight means getting the
     * hardest questions right, which is what EXPERT is meant to denote.
     */
    private ProficiencyLevel toProficiency(double percentage) {
        if (percentage >= 85.0) {
            return ProficiencyLevel.EXPERT;
        }
        if (percentage >= 70.0) {
            return ProficiencyLevel.ADVANCED;
        }
        if (percentage >= 50.0) {
            return ProficiencyLevel.INTERMEDIATE;
        }
        if (percentage >= 25.0) {
            return ProficiencyLevel.BEGINNER;
        }
        return ProficiencyLevel.UNAWARE;
    }

    private QuizQuestionResponse toQuizQuestion(AssessmentQuestion question) {
        return QuizQuestionResponse.builder()
                .questionId(question.getId())
                .skillId(question.getSkill().getId())
                .skillName(question.getSkill().getName())
                .questionText(question.getQuestionText())
                .options(question.optionsInOrder())
                .difficulty(question.getDifficulty().name())
                .build();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    /** Running marks for one skill while a submission is being graded. */
    private static final class SkillTally {
        private final Long skillId;
        private final String skillName;
        private int asked;
        private int correct;
        private double weightAvailable;
        private double weightEarned;

        private SkillTally(Long skillId, String skillName) {
            this.skillId = skillId;
            this.skillName = skillName;
        }

        private double percentage() {
            return weightAvailable == 0 ? 0.0 : (weightEarned * 100.0) / weightAvailable;
        }
    }
}
