package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.mentorship.MentorshipRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.mentorship.RecommendedMentorResponse;
import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ForbiddenException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.GapAnalysisRepository;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SkillRepository;
import com.orgskills.intelligence.repository.UserRepository;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MentorshipServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private GapAnalysisRepository gapAnalysisRepository;

    @Mock
    private MentorshipMatchRepository mentorshipMatchRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private MentorshipService mentorshipService;

    private User mentee;
    private User sameDeptMentor;
    private User otherDeptMentor;
    private Skill javaSkill;

    @BeforeEach
    void setUp() {
        mentee = user(1L, "Alice", "alice@corp.com", "Engineering");
        sameDeptMentor = user(2L, "Bob", "bob@corp.com", "Engineering");
        otherDeptMentor = user(3L, "Cara", "cara@corp.com", "Finance");

        javaSkill = new Skill();
        javaSkill.setId(10L);
        javaSkill.setName("Java");
        javaSkill.setCategory("Technical");
    }

    // ── findRecommendedMentors ──────────────────────────────────────────────────

    @Test
    @DisplayName("findRecommendedMentors only returns employees more proficient than the mentee")
    void filtersOutMentorsAtOrBelowMenteeLevel() {
        UserSkill menteeSkill = userSkill(mentee, ProficiencyLevel.INTERMEDIATE, 3.0);
        UserSkill peer = userSkill(otherDeptMentor, ProficiencyLevel.INTERMEDIATE, 3.5);
        UserSkill expert = userSkill(sameDeptMentor, ProficiencyLevel.EXPERT, 5.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mentee));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(javaSkill));
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L)).thenReturn(Optional.of(menteeSkill));
        when(userSkillRepository.findBySkillId(10L)).thenReturn(List.of(menteeSkill, peer, expert));
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of());

        List<RecommendedMentorResponse> result = mentorshipService.findRecommendedMentors(1L, 10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMentorId()).isEqualTo(2L);
        assertThat(result.get(0).getMenteeProficiency()).isEqualTo(ProficiencyLevel.INTERMEDIATE);
        assertThat(result.get(0).isSameDepartment()).isTrue();
        assertThat(result.get(0).isAvailable()).isTrue();
    }

    @Test
    @DisplayName("findRecommendedMentors ranks same-department and experienced mentors higher")
    void ranksBySkillDepartmentAndExperience() {
        UserSkill menteeSkill = userSkill(mentee, ProficiencyLevel.BEGINNER, 2.0);
        UserSkill sameDept = userSkill(sameDeptMentor, ProficiencyLevel.ADVANCED, 4.0);
        UserSkill otherDept = userSkill(otherDeptMentor, ProficiencyLevel.ADVANCED, 4.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mentee));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(javaSkill));
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L)).thenReturn(Optional.of(menteeSkill));
        when(userSkillRepository.findBySkillId(10L)).thenReturn(List.of(otherDept, sameDept));
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of(mentorship(99L, mentee, sameDeptMentor, javaSkill, MentorshipStatus.COMPLETED)));

        List<RecommendedMentorResponse> result = mentorshipService.findRecommendedMentors(1L, 10L);

        assertThat(result).extracting(RecommendedMentorResponse::getMentorId).containsExactly(2L, 3L);
        assertThat(result.get(0).getCompletedMentorships()).isEqualTo(1L);
        assertThat(result.get(0).getMatchScore()).isGreaterThan(result.get(1).getMatchScore());
        assertThat(result.get(0).getReasons()).isNotEmpty();
    }

    @Test
    @DisplayName("findRecommendedMentors treats a mentor at capacity as unavailable and ranks them last")
    void mentorAtCapacityIsUnavailable() {
        UserSkill menteeSkill = userSkill(mentee, ProficiencyLevel.BEGINNER, 2.0);
        UserSkill busy = userSkill(sameDeptMentor, ProficiencyLevel.EXPERT, 5.0);
        UserSkill free = userSkill(otherDeptMentor, ProficiencyLevel.INTERMEDIATE, 3.0);

        List<MentorshipMatch> active = new java.util.ArrayList<>();
        for (long i = 0; i < MentorshipService.MAX_ACTIVE_MENTORSHIPS_PER_MENTOR; i++) {
            active.add(mentorship(100L + i, mentee, sameDeptMentor, javaSkill, MentorshipStatus.ACTIVE));
        }

        when(userRepository.findById(1L)).thenReturn(Optional.of(mentee));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(javaSkill));
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L)).thenReturn(Optional.of(menteeSkill));
        when(userSkillRepository.findBySkillId(10L)).thenReturn(List.of(busy, free));
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(active);

        List<RecommendedMentorResponse> result = mentorshipService.findRecommendedMentors(1L, 10L);

        assertThat(result).extracting(RecommendedMentorResponse::getMentorId).containsExactly(3L, 2L);
        assertThat(result.get(1).isAvailable()).isFalse();
        assertThat(result.get(1).getActiveMentorships())
                .isEqualTo(MentorshipService.MAX_ACTIVE_MENTORSHIPS_PER_MENTOR);
    }

    @Test
    @DisplayName("findRecommendedMentors falls back to UNAWARE when the mentee has no rating for the skill")
    void menteeWithoutSkillIsTreatedAsUnaware() {
        UserSkill beginner = userSkill(sameDeptMentor, ProficiencyLevel.BEGINNER, 2.0);

        when(userRepository.findById(1L)).thenReturn(Optional.of(mentee));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(javaSkill));
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L)).thenReturn(Optional.empty());
        when(userSkillRepository.findBySkillId(10L)).thenReturn(List.of(beginner));
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of());

        List<RecommendedMentorResponse> result = mentorshipService.findRecommendedMentors(1L, 10L);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMenteeProficiency()).isEqualTo(ProficiencyLevel.UNAWARE);
    }

    // ── requestMentorship ───────────────────────────────────────────────────────

    @Test
    @DisplayName("requestMentorship persists a REQUESTED mentorship and notifies the mentor")
    void createsRequestedMentorship() {
        stubRequestLookups();
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L))
                .thenReturn(Optional.of(userSkill(mentee, ProficiencyLevel.BEGINNER, 2.0)));
        when(userSkillRepository.findByUserIdAndSkillId(2L, 10L))
                .thenReturn(Optional.of(userSkill(sameDeptMentor, ProficiencyLevel.EXPERT, 5.0)));
        when(mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(1L, 10L, MentorshipStatus.ACTIVE))
                .thenReturn(false);
        when(mentorshipMatchRepository.existsByMentorIdAndMenteeIdAndTargetSkillIdAndStatus(
                2L, 1L, 10L, MentorshipStatus.REQUESTED)).thenReturn(false);
        when(mentorshipMatchRepository.save(any(MentorshipMatch.class)))
                .thenAnswer(invocation -> {
                    MentorshipMatch m = invocation.getArgument(0);
                    m.setId(42L);
                    return m;
                });

        MentorshipResponse response = mentorshipService.requestMentorship(request("Reach ADVANCED in Java"));

        assertThat(response.getMentorshipId()).isEqualTo(42L);
        assertThat(response.getStatus()).isEqualTo(MentorshipStatus.REQUESTED);
        assertThat(response.getGoal()).isEqualTo("Reach ADVANCED in Java");
        assertThat(response.getMentorId()).isEqualTo(2L);
        assertThat(response.getMenteeId()).isEqualTo(1L);
        verify(notificationService).createNotification(eq(sameDeptMentor), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("requestMentorship rejects a second request while an ACTIVE mentorship exists for the skill")
    void activeMentorshipBlocksDuplicateRequest() {
        stubRequestLookups();
        when(mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(1L, 10L, MentorshipStatus.ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> mentorshipService.requestMentorship(request(null)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("ACTIVE mentorship already exists");

        verify(mentorshipMatchRepository, never()).save(any(MentorshipMatch.class));
    }

    @Test
    @DisplayName("requestMentorship rejects a duplicate REQUESTED entry for the same mentor, mentee and skill")
    void duplicateRequestIsRejected() {
        stubRequestLookups();
        when(mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(1L, 10L, MentorshipStatus.ACTIVE))
                .thenReturn(false);
        when(mentorshipMatchRepository.existsByMentorIdAndMenteeIdAndTargetSkillIdAndStatus(
                2L, 1L, 10L, MentorshipStatus.REQUESTED)).thenReturn(true);

        assertThatThrownBy(() -> mentorshipService.requestMentorship(request(null)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already pending");

        verify(mentorshipMatchRepository, never()).save(any(MentorshipMatch.class));
    }

    @Test
    @DisplayName("requestMentorship rejects a mentor who is not more proficient than the mentee")
    void mentorMustOutrankMentee() {
        stubRequestLookups();
        when(mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(1L, 10L, MentorshipStatus.ACTIVE))
                .thenReturn(false);
        when(mentorshipMatchRepository.existsByMentorIdAndMenteeIdAndTargetSkillIdAndStatus(
                2L, 1L, 10L, MentorshipStatus.REQUESTED)).thenReturn(false);
        when(userSkillRepository.findByUserIdAndSkillId(1L, 10L))
                .thenReturn(Optional.of(userSkill(mentee, ProficiencyLevel.ADVANCED, 4.0)));
        when(userSkillRepository.findByUserIdAndSkillId(2L, 10L))
                .thenReturn(Optional.of(userSkill(sameDeptMentor, ProficiencyLevel.ADVANCED, 4.5)));

        assertThatThrownBy(() -> mentorshipService.requestMentorship(request(null)))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("not above the mentee level");
    }

    @Test
    @DisplayName("requestMentorship rejects self-mentorship")
    void selfMentorshipIsRejected() {
        MentorshipRequest selfRequest = MentorshipRequest.builder()
                .menteeId(1L).mentorId(1L).skillId(10L).build();

        assertThatThrownBy(() -> mentorshipService.requestMentorship(selfRequest))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("yourself");
    }

    // ── accept / reject ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("acceptMentorship moves a REQUESTED mentorship to ACTIVE and stamps a start date")
    void acceptMovesToActive() {
        MentorshipMatch pending = mentorship(42L, mentee, sameDeptMentor, javaSkill, MentorshipStatus.REQUESTED);
        when(mentorshipMatchRepository.findById(42L)).thenReturn(Optional.of(pending));
        when(mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(1L, 10L, MentorshipStatus.ACTIVE))
                .thenReturn(false);
        when(mentorshipMatchRepository.save(any(MentorshipMatch.class))).thenAnswer(i -> i.getArgument(0));

        MentorshipResponse response = mentorshipService.acceptMentorship(42L, 2L);

        assertThat(response.getStatus()).isEqualTo(MentorshipStatus.ACTIVE);
        assertThat(response.getStartDate()).isEqualTo(LocalDate.now());
        verify(notificationService).createNotification(eq(mentee), anyString(), anyString(), any());
    }

    @Test
    @DisplayName("acceptMentorship refuses anyone other than the assigned mentor")
    void onlyMentorCanAccept() {
        MentorshipMatch pending = mentorship(42L, mentee, sameDeptMentor, javaSkill, MentorshipStatus.REQUESTED);
        when(mentorshipMatchRepository.findById(42L)).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> mentorshipService.acceptMentorship(42L, 3L))
                .isInstanceOf(ForbiddenException.class);
    }

    @Test
    @DisplayName("acceptMentorship refuses a mentorship that is no longer REQUESTED")
    void cannotAcceptTwice() {
        MentorshipMatch active = mentorship(42L, mentee, sameDeptMentor, javaSkill, MentorshipStatus.ACTIVE);
        when(mentorshipMatchRepository.findById(42L)).thenReturn(Optional.of(active));

        assertThatThrownBy(() -> mentorshipService.acceptMentorship(42L, 2L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Only a REQUESTED mentorship");
    }

    @Test
    @DisplayName("acceptMentorship refuses when the mentee already has an ACTIVE mentorship for the skill")
    void acceptBlockedByExistingActiveMentorship() {
        MentorshipMatch pending = mentorship(42L, mentee, sameDeptMentor, javaSkill, MentorshipStatus.REQUESTED);
        when(mentorshipMatchRepository.findById(42L)).thenReturn(Optional.of(pending));
        when(mentorshipMatchRepository.existsByMenteeIdAndTargetSkillIdAndStatus(1L, 10L, MentorshipStatus.ACTIVE))
                .thenReturn(true);

        assertThatThrownBy(() -> mentorshipService.acceptMentorship(42L, 2L))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("already has an ACTIVE mentorship");
    }

    @Test
    @DisplayName("rejectMentorship moves a REQUESTED mentorship to REJECTED and notifies the mentee")
    void rejectMovesToRejected() {
        MentorshipMatch pending = mentorship(42L, mentee, sameDeptMentor, javaSkill, MentorshipStatus.REQUESTED);
        when(mentorshipMatchRepository.findById(42L)).thenReturn(Optional.of(pending));
        when(mentorshipMatchRepository.save(any(MentorshipMatch.class))).thenAnswer(i -> i.getArgument(0));

        MentorshipResponse response = mentorshipService.rejectMentorship(42L, 2L);

        assertThat(response.getStatus()).isEqualTo(MentorshipStatus.REJECTED);
        assertThat(response.getEndDate()).isEqualTo(LocalDate.now());
        verify(notificationService).createNotification(eq(mentee), anyString(), anyString(), any());
    }

    // ── listing ─────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getMentorshipsForUser returns mentorships held as mentor and as mentee")
    void listsMentorshipsForBothSides() {
        when(userRepository.existsById(1L)).thenReturn(true);
        when(mentorshipMatchRepository.findByMenteeIdOrMentorIdOrderByCreatedAtDesc(1L, 1L))
                .thenReturn(List.of(
                        mentorship(42L, mentee, sameDeptMentor, javaSkill, MentorshipStatus.ACTIVE),
                        mentorship(43L, otherDeptMentor, mentee, javaSkill, MentorshipStatus.REQUESTED)));

        List<MentorshipResponse> result = mentorshipService.getMentorshipsForUser(1L);

        assertThat(result).extracting(MentorshipResponse::getMentorshipId).containsExactly(42L, 43L);
        assertThat(result.get(1).getMentorId()).isEqualTo(1L);
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private void stubRequestLookups() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(mentee));
        when(userRepository.findById(2L)).thenReturn(Optional.of(sameDeptMentor));
        when(skillRepository.findById(10L)).thenReturn(Optional.of(javaSkill));
    }

    private MentorshipRequest request(String goal) {
        return MentorshipRequest.builder()
                .menteeId(1L)
                .mentorId(2L)
                .skillId(10L)
                .goal(goal)
                .build();
    }

    private User user(Long id, String name, String email, String department) {
        User user = new User();
        user.setId(id);
        user.setFullName(name);
        user.setEmail(email);
        user.setDepartment(department);
        user.setJobTitle("Software Engineer");
        user.setRole(Role.EMPLOYEE);
        user.setActive(true);
        return user;
    }

    private UserSkill userSkill(User owner, ProficiencyLevel level, double rating) {
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(owner);
        userSkill.setSkill(javaSkill);
        userSkill.setProficiencyLevel(level);
        userSkill.setRatingScore(rating);
        return userSkill;
    }

    private MentorshipMatch mentorship(Long id, User menteeUser, User mentorUser, Skill skill, MentorshipStatus status) {
        MentorshipMatch match = new MentorshipMatch();
        match.setId(id);
        match.setMentee(menteeUser);
        match.setMentor(mentorUser);
        match.setTargetSkill(skill);
        match.setStatus(status);
        return match;
    }
}
