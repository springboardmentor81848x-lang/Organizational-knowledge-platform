package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.assistant.SuggestedCourse;
import com.orgskills.intelligence.dto.recommendation.CourseRecommendationScore;
import com.orgskills.intelligence.entity.Course;
import com.orgskills.intelligence.entity.Enrollment;
import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.TrainingRecommendation;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.EnrollmentStatus;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.repository.EnrollmentRepository;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.TrainingRecommendationRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Everything the assistant knows about the person asking, read once and rendered into plain
 * values.
 *
 * <h2>Why this is a bean of its own</h2>
 * The read has to happen in a transaction — the snapshot walks lazy associations — but the model
 * call must happen outside one. A language model takes seconds to answer, and holding a pooled
 * connection across it would let a handful of concurrent questions exhaust a pool of ten and
 * stall the rest of the application. Splitting the two means the transaction closes before the
 * network call begins. It is a separate class rather than a private method because Spring's
 * proxying ignores {@code @Transactional} on a call a bean makes to itself.
 *
 * <p>So {@link #prepare} returns strings and DTOs, never entities: nothing it hands back needs a
 * session to read.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AssistantContextService {

    private final UserRepository userRepository;
    private final GapAnalysisRepository gapAnalysisRepository;
    private final TrainingRecommendationRepository recommendationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserSkillRepository userSkillRepository;
    private final RecommendationScoringService recommendationScoringService;

    /** Courses shown beside an answer. More than a handful stops being a recommendation. */
    private static final int MAX_SUGGESTED_COURSES = 4;

    private static final String SCREENS = """
            My development (/me) - your dashboard: gaps, progress and what to do next.
            My skills (/skills) - the proficiencies on your record.
            Assessments (/assessments) - take an assessment; results recalculate your gaps.
            My gaps (/gaps) - every gap between your current and required level.
            Recommendations (/recommendations) - ranked training generated from your gaps.
            Learning (/learning) - courses you are enrolled in and your progress.
            Mentorship (/mentorship) - find a mentor for a skill.
            Achievements (/achievements) - badges and certifications you have earned.
            """;

    /**
     * The prepared answer material for one question.
     *
     * @param promptContext   the caller's data, rendered for the model
     * @param suggestedCourses real catalogue rows, chosen by the platform's ranking
     * @param followUps       opening prompts phrased against this person's own record
     * @param offlineAnswer   the reply to use when no model is configured, or one fails
     */
    public record AssistantContext(
            String promptContext,
            List<SuggestedCourse> suggestedCourses,
            List<String> followUps,
            String offlineAnswer
    ) {
    }

    /** Reads the caller's record and renders everything an answer could need. */
    @Transactional(readOnly = true)
    public AssistantContext prepare(Long userId, String question) {
        Snapshot snapshot = loadSnapshot(userId);
        List<SuggestedCourse> suggestions = suggestCourses(snapshot, question);

        return new AssistantContext(
                describe(snapshot, suggestions) + "\nSCREENS\n" + SCREENS,
                suggestions,
                followUps(snapshot),
                offlineAnswer(snapshot, question, suggestions));
    }

    /** Opening prompts alone, for the screen's first paint. */
    @Transactional(readOnly = true)
    public List<String> starterQuestions(Long userId) {
        return followUps(loadSnapshot(userId));
    }

    // ── Snapshot ────────────────────────────────────────────────────────────────

    private Snapshot loadSnapshot(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + userId));

        List<GapAnalysis> gaps = gapAnalysisRepository.findByUserIdOrderByGapScoreDesc(userId);
        List<TrainingRecommendation> recommendations =
                recommendationRepository.findByEmployeeIdOrderByPriorityRankAsc(userId);
        List<Enrollment> enrollments = enrollmentRepository.findByEmployeeIdOrderByStartDateDesc(userId);
        List<UserSkill> skills = userSkillRepository.findByUserId(userId);

        List<CourseRecommendationScore> ranked;
        try {
            ranked = recommendationScoringService.scoreCoursesForEmployee(userId);
        } catch (Exception ex) {
            // An operational account has no competency profile to rank against. That is a thinner
            // answer, not a failed one.
            log.debug("No ranked courses available for userId {}: {}", userId, ex.getMessage());
            ranked = List.of();
        }

        return new Snapshot(user, gaps, recommendations, enrollments, skills, ranked);
    }

    // ── Course suggestions ──────────────────────────────────────────────────────

    /**
     * Picks the courses shown beside the answer. A question that names a skill the employee has
     * a gap in narrows the list to that skill; otherwise the top of the ranking stands. Courses
     * already completed are dropped — recommending something finished reads as the platform not
     * knowing what the person has done.
     */
    private List<SuggestedCourse> suggestCourses(Snapshot snapshot, String question) {
        if (snapshot.ranked().isEmpty()) {
            return List.of();
        }

        Set<Long> completedCourseIds = snapshot.enrollments().stream()
                .filter(e -> isFinished(e.getStatus()))
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toSet());

        String haystack = question.toLowerCase(Locale.ROOT);
        Set<String> mentionedSkills = snapshot.ranked().stream()
                .map(score -> score.getSkill().getName())
                .filter(name -> haystack.contains(name.toLowerCase(Locale.ROOT)))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return snapshot.ranked().stream()
                .filter(score -> score.getCourse() != null)
                .filter(score -> !completedCourseIds.contains(score.getCourse().getId()))
                .filter(score -> mentionedSkills.isEmpty()
                        || mentionedSkills.contains(score.getSkill().getName()))
                .sorted(Comparator.comparingDouble(CourseRecommendationScore::getScore).reversed())
                .limit(MAX_SUGGESTED_COURSES)
                .map(this::toSuggestedCourse)
                .toList();
    }

    private SuggestedCourse toSuggestedCourse(CourseRecommendationScore score) {
        Course course = score.getCourse();
        return SuggestedCourse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .provider(course.getProvider())
                .skillName(score.getSkill().getName())
                .difficulty(course.getDifficulty())
                .durationLabel(durationLabel(course))
                .internal(course.getIsInternal())
                .externalUrl(course.getExternalUrl())
                .relevanceScore(Math.round(score.getScore() * 10.0) / 10.0)
                .build();
    }

    private String durationLabel(Course course) {
        if (course.getDurationLabel() != null && !course.getDurationLabel().isBlank()) {
            return course.getDurationLabel();
        }
        if (course.getDurationHours() != null) {
            long hours = Math.round(course.getDurationHours());
            return hours == 1 ? "1 hour" : hours + " hours";
        }
        return null;
    }

    // ── Rendering the snapshot for the model ────────────────────────────────────

    private String describe(Snapshot snapshot, List<SuggestedCourse> suggestions) {
        User user = snapshot.user();
        StringBuilder sb = new StringBuilder();

        sb.append("Name: ").append(user.getFullName()).append('\n');
        sb.append("Current role: ").append(user.getJobTitle())
                .append(" in ").append(user.getDepartment()).append('\n');
        if (user.getTargetJobTitle() != null && !user.getTargetJobTitle().isBlank()) {
            sb.append("Target role: ").append(user.getTargetJobTitle()).append('\n');
        }

        sb.append("\nSkill gaps (current / required, severity):\n");
        if (snapshot.gaps().isEmpty()) {
            sb.append("  none recorded — they have not completed an assessment yet\n");
        } else {
            snapshot.gaps().stream().limit(12).forEach(gap -> sb.append("  ")
                    .append(gap.getSkill().getName())
                    .append(": ").append(String.format("%.1f", gap.getCurrentScore()))
                    .append(" / ").append(String.format("%.1f", gap.getTargetScore()))
                    .append(", ").append(gap.getRiskSeverity().name())
                    .append(Boolean.TRUE.equals(gap.getMissingSkill()) ? ", not on record" : "")
                    .append('\n'));
        }

        sb.append("\nProficiencies on record:\n");
        if (snapshot.skills().isEmpty()) {
            sb.append("  none\n");
        } else {
            snapshot.skills().stream().limit(15).forEach(us -> sb.append("  ")
                    .append(us.getSkill().getName())
                    .append(": ").append(us.getProficiencyLevel().name())
                    .append('\n'));
        }

        sb.append("\nCurrent training recommendations:\n");
        if (snapshot.recommendations().isEmpty()) {
            sb.append("  none generated yet\n");
        } else {
            snapshot.recommendations().stream().limit(6).forEach(rec -> sb.append("  ")
                    .append(rec.getSkill().getName()).append(" — ")
                    .append(rec.getRecommendationText()).append('\n'));
        }

        sb.append("\nEnrolments:\n");
        if (snapshot.enrollments().isEmpty()) {
            sb.append("  not enrolled in anything\n");
        } else {
            snapshot.enrollments().stream().limit(10).forEach(en -> sb.append("  ")
                    .append(en.getCourse().getTitle())
                    .append(": ").append(en.getStatus().name())
                    .append(", ").append(String.format("%.0f%%", en.getProgress() == null ? 0.0 : en.getProgress()))
                    .append(" complete\n"));
        }

        sb.append("\nCourses the platform is showing beside this answer:\n");
        if (suggestions.isEmpty()) {
            sb.append("  none\n");
        } else {
            suggestions.forEach(course -> sb.append("  ")
                    .append(course.getTitle())
                    .append(" (").append(course.getProvider())
                    .append(", for ").append(course.getSkillName()).append(")\n"));
        }

        return sb.toString();
    }

    // ── Offline answers ─────────────────────────────────────────────────────────

    /**
     * The reply when no model is configured. Deliberately built from the same snapshot the model
     * would have seen, so the two paths agree on the facts and differ only in phrasing.
     */
    private String offlineAnswer(Snapshot snapshot, String question, List<SuggestedCourse> suggestions) {
        String q = question.toLowerCase(Locale.ROOT);

        if (mentionsAny(q, "progress", "enrolled", "enrolment", "enrollment", "how am i doing", "finished", "completed")) {
            return progressAnswer(snapshot);
        }
        if (mentionsAny(q, "gap", "weak", "behind", "struggling", "improve", "worst")) {
            return gapAnswer(snapshot);
        }
        if (mentionsAny(q, "course", "learn", "train", "study", "recommend", "next", "what should i")) {
            return courseAnswer(snapshot, suggestions);
        }
        if (mentionsAny(q, "assessment", "test", "quiz", "score", "retake")) {
            return assessmentAnswer(snapshot);
        }
        if (mentionsAny(q, "skill", "proficiency", "level", "strength", "good at")) {
            return skillAnswer(snapshot);
        }
        if (mentionsAny(q, "mentor", "coach", "expert", "help me find")) {
            return "Mentorship pairs you with someone stronger in a skill you are closing. "
                    + "Open Mentorship to request a match, or the expert directory to look up who "
                    + "in the organisation is rated highest in a given skill.";
        }
        return overviewAnswer(snapshot);
    }

    private String gapAnswer(Snapshot snapshot) {
        if (snapshot.gaps().isEmpty()) {
            return "There are no gaps on your record yet, which usually means you have not "
                    + "completed an assessment. Take one from the Assessments screen and your gaps, "
                    + "and the recommendations built from them, appear straight afterwards.";
        }
        GapAnalysis worst = snapshot.gaps().get(0);
        String others = snapshot.gaps().stream().skip(1).limit(3)
                .map(gap -> gap.getSkill().getName())
                .collect(Collectors.joining(", "));

        StringBuilder sb = new StringBuilder();
        sb.append(String.format(
                "Your largest gap is %s: you are at %.1f against a required %.1f, which the platform "
                        + "rates %s. That is the one worth starting on.",
                worst.getSkill().getName(), worst.getCurrentScore(), worst.getTargetScore(),
                worst.getRiskSeverity().name().toLowerCase(Locale.ROOT)));
        if (!others.isBlank()) {
            sb.append(" Behind it sit ").append(others).append(".");
        }
        sb.append(" My gaps shows the full list with the severity behind each one.");
        return sb.toString();
    }

    private String courseAnswer(Snapshot snapshot, List<SuggestedCourse> suggestions) {
        if (suggestions.isEmpty()) {
            if (snapshot.gaps().isEmpty()) {
                return "I cannot suggest training yet because nothing has been measured. Complete "
                        + "an assessment and the catalogue is ranked against the gaps it finds.";
            }
            return "Your gaps are recorded, but the catalogue has nothing matching them at the "
                    + "moment. Recommendations still lists the written guidance generated for each gap.";
        }
        SuggestedCourse top = suggestions.get(0);
        return String.format(
                "Start with %s from %s — it targets %s, the skill your ranking puts first at a "
                        + "relevance of %s out of 100. The rest are listed below in the order the "
                        + "platform ranks them; opening one takes you to the catalogue entry.",
                top.getTitle(), top.getProvider(), top.getSkillName(), top.getRelevanceScore());
    }

    private String progressAnswer(Snapshot snapshot) {
        List<Enrollment> enrollments = snapshot.enrollments();
        if (enrollments.isEmpty()) {
            return "You are not enrolled in anything at the moment. Recommendations lists what is "
                    + "ranked for your gaps, and enrolling from there puts the course on your "
                    + "Learning screen where progress is tracked.";
        }
        long completed = enrollments.stream().filter(e -> isFinished(e.getStatus())).count();
        List<Enrollment> active = enrollments.stream()
                .filter(e -> e.getStatus() == EnrollmentStatus.IN_PROGRESS).toList();

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("You have %d enrolment%s, %d of them finished.",
                enrollments.size(), enrollments.size() == 1 ? "" : "s", completed));
        if (!active.isEmpty()) {
            Enrollment furthest = active.stream()
                    .max(Comparator.comparingDouble(e -> e.getProgress() == null ? 0.0 : e.getProgress()))
                    .orElse(active.get(0));
            sb.append(String.format(" %d in progress, the furthest being %s at %.0f%%.",
                    active.size(), furthest.getCourse().getTitle(),
                    furthest.getProgress() == null ? 0.0 : furthest.getProgress()));
        }
        sb.append(" Learning has the full picture, and finishing a course recalculates the gap it covers.");
        return sb.toString();
    }

    private String assessmentAnswer(Snapshot snapshot) {
        if (snapshot.gaps().isEmpty()) {
            return "You have no assessment results on file. Assessments builds one from the "
                    + "competencies your target role requires; submitting it writes your "
                    + "proficiencies and produces your gap list.";
        }
        return String.format(
                "Your last assessment produced %d measured skill%s, and every gap and recommendation "
                        + "you see is derived from it. Reassessing from the Assessments screen "
                        + "refreshes all of it — the gap list, the ranking and your dashboard.",
                snapshot.gaps().size(), snapshot.gaps().size() == 1 ? "" : "s");
    }

    private String skillAnswer(Snapshot snapshot) {
        if (snapshot.skills().isEmpty()) {
            return "There are no proficiencies on your record yet. They are written by your first "
                    + "assessment, after which My skills shows each one and the level you were rated at.";
        }
        String strongest = snapshot.skills().stream()
                .max(Comparator.comparingDouble(us -> us.getRatingScore() == null ? 0.0 : us.getRatingScore()))
                .map(us -> us.getSkill().getName() + " (" + us.getProficiencyLevel().name() + ")")
                .orElse("none");
        return String.format(
                "You have %d skill%s on record, and the strongest is %s. My skills lists them all "
                        + "with the level behind each, and My gaps shows where those levels fall short "
                        + "of what your role asks for.",
                snapshot.skills().size(), snapshot.skills().size() == 1 ? "" : "s", strongest);
    }

    private String overviewAnswer(Snapshot snapshot) {
        return String.format(
                "I can help with your skills, your gaps and what to learn next. Right now you have "
                        + "%d skill%s on record, %d open gap%s and %d enrolment%s. Ask me which gap to "
                        + "close first, what to study for a particular skill, or how you are progressing.",
                snapshot.skills().size(), snapshot.skills().size() == 1 ? "" : "s",
                snapshot.gaps().size(), snapshot.gaps().size() == 1 ? "" : "s",
                snapshot.enrollments().size(), snapshot.enrollments().size() == 1 ? "" : "s");
    }

    /** Certified counts as finished: the course is done and the credential is on file. */
    private boolean isFinished(EnrollmentStatus status) {
        return status == EnrollmentStatus.COMPLETED || status == EnrollmentStatus.CERTIFIED;
    }

    private boolean mentionsAny(String haystack, String... needles) {
        for (String needle : needles) {
            if (haystack.contains(needle)) {
                return true;
            }
        }
        return false;
    }

    // ── Follow-ups ──────────────────────────────────────────────────────────────

    private List<String> followUps(Snapshot snapshot) {
        List<String> prompts = new ArrayList<>();

        if (snapshot.gaps().isEmpty()) {
            prompts.add("Why do I have no skill gaps yet?");
            prompts.add("How does an assessment work?");
        } else {
            prompts.add("Which gap should I close first?");
            prompts.add("What should I study for " + snapshot.gaps().get(0).getSkill().getName() + "?");
        }

        if (!snapshot.enrollments().isEmpty()) {
            prompts.add("How am I progressing on my courses?");
        } else {
            prompts.add("What training is recommended for me?");
        }

        prompts.add("How do I find a mentor?");
        return prompts.stream().distinct().limit(4).toList();
    }

    private record Snapshot(
            User user,
            List<GapAnalysis> gaps,
            List<TrainingRecommendation> recommendations,
            List<Enrollment> enrollments,
            List<UserSkill> skills,
            List<CourseRecommendationScore> ranked
    ) {
    }
}
