package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.expert.ExpertResponse;
import com.orgskills.intelligence.entity.MentorshipMatch;
import com.orgskills.intelligence.entity.Skill;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.UserSkill;
import com.orgskills.intelligence.entity.enums.MentorshipStatus;
import com.orgskills.intelligence.entity.enums.ProficiencyLevel;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.MentorshipMatchRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository;
import com.orgskills.intelligence.repository.SessionRegistrationRepository.HostRatingAggregate;
import com.orgskills.intelligence.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collection;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpertDirectoryServiceTest {

    @Mock
    private UserSkillRepository userSkillRepository;

    @Mock
    private SessionRegistrationRepository sessionRegistrationRepository;

    @Mock
    private MentorshipMatchRepository mentorshipMatchRepository;

    @InjectMocks
    private ExpertDirectoryService expertDirectoryService;

    private Skill javaSkill;
    private User bob;
    private User cara;
    private User dan;

    @BeforeEach
    void setUp() {
        javaSkill = new Skill();
        javaSkill.setId(1L);
        javaSkill.setName("Java");
        javaSkill.setCategory("Technical");

        bob = user(1L, "Bob Smith", "Engineering");
        cara = user(3L, "Cara Diaz", "Finance");
        dan = user(4L, "Dan Reed", "Engineering");
    }

    @Test
    @DisplayName("findExperts sorts by proficiency descending")
    void sortsByProficiencyDescending() {
        when(userSkillRepository.searchExperts(eq("Java"), anyCollection()))
                .thenReturn(List.of(
                        userSkill(dan, ProficiencyLevel.ADVANCED, 4.0),
                        userSkill(bob, ProficiencyLevel.EXPERT, 4.5)));
        when(sessionRegistrationRepository.findHostRatingsByMentorIds(anyCollection())).thenReturn(List.of());
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of());

        List<ExpertResponse> result = expertDirectoryService.findExperts("Java", null);

        assertThat(result).extracting(ExpertResponse::getFullName).containsExactly("Bob Smith", "Dan Reed");
        assertThat(result.get(0).getProficiencyLevel()).isEqualTo(ProficiencyLevel.EXPERT);
        assertThat(result.get(0).getDepartment()).isEqualTo("Engineering");
        assertThat(result.get(0).getSkillName()).isEqualTo("Java");
    }

    @Test
    @DisplayName("findExperts breaks a proficiency tie with the prior mentorship rating")
    void mentorRatingBreaksTie() {
        when(userSkillRepository.searchExperts(eq("Java"), anyCollection()))
                .thenReturn(List.of(
                        userSkill(bob, ProficiencyLevel.EXPERT, 5.0),
                        userSkill(cara, ProficiencyLevel.EXPERT, 5.0)));
        when(sessionRegistrationRepository.findHostRatingsByMentorIds(anyCollection()))
                .thenReturn(List.of(hostRating(1L, 3.5, 2L), hostRating(3L, 4.8, 5L)));
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of());

        List<ExpertResponse> result = expertDirectoryService.findExperts("Java", null);

        assertThat(result).extracting(ExpertResponse::getFullName).containsExactly("Cara Diaz", "Bob Smith");
        assertThat(result.get(0).getMentorRating()).isEqualTo(4.8);
        assertThat(result.get(0).getMentorRatingCount()).isEqualTo(5L);
    }

    @Test
    @DisplayName("findExperts ranks an unrated expert below a rated one at the same proficiency")
    void unratedExpertsSortLast() {
        when(userSkillRepository.searchExperts(eq("Java"), anyCollection()))
                .thenReturn(List.of(
                        userSkill(cara, ProficiencyLevel.EXPERT, 5.0),
                        userSkill(bob, ProficiencyLevel.EXPERT, 5.0)));
        when(sessionRegistrationRepository.findHostRatingsByMentorIds(anyCollection()))
                .thenReturn(List.of(hostRating(1L, 4.0, 3L)));
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of());

        List<ExpertResponse> result = expertDirectoryService.findExperts("Java", null);

        assertThat(result).extracting(ExpertResponse::getFullName).containsExactly("Bob Smith", "Cara Diaz");
        assertThat(result.get(1).getMentorRating()).isNull();
        assertThat(result.get(1).getMentorRatingCount()).isZero();
    }

    @Test
    @DisplayName("findExperts falls back to completed mentorships when neither rating separates two experts")
    void completedMentorshipsBreakRemainingTie() {
        when(userSkillRepository.searchExperts(eq("Java"), anyCollection()))
                .thenReturn(List.of(
                        userSkill(bob, ProficiencyLevel.EXPERT, 5.0),
                        userSkill(cara, ProficiencyLevel.EXPERT, 5.0)));
        when(sessionRegistrationRepository.findHostRatingsByMentorIds(anyCollection())).thenReturn(List.of());
        when(mentorshipMatchRepository.findByMentorIdInAndStatusIn(anyCollection(), anyCollection()))
                .thenReturn(List.of(mentorship(cara), mentorship(cara)));

        List<ExpertResponse> result = expertDirectoryService.findExperts("Java", null);

        assertThat(result).extracting(ExpertResponse::getFullName).containsExactly("Cara Diaz", "Bob Smith");
        assertThat(result.get(0).getCompletedMentorships()).isEqualTo(2L);
        assertThat(result.get(1).getCompletedMentorships()).isZero();
    }

    @Test
    @DisplayName("findExperts defaults to ADVANCED and above")
    void defaultThresholdIsAdvanced() {
        when(userSkillRepository.searchExperts(eq("Java"), anyCollection())).thenReturn(List.of());

        expertDirectoryService.findExperts("Java", null);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Collection<ProficiencyLevel>> captor = ArgumentCaptor.forClass(Collection.class);
        verify(userSkillRepository).searchExperts(eq("Java"), captor.capture());
        assertThat(captor.getValue())
                .containsExactlyInAnyOrder(ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT);
    }

    @Test
    @DisplayName("findExperts widens the search when a lower minimum proficiency is requested")
    void honoursExplicitThreshold() {
        when(userSkillRepository.searchExperts(eq("Java"), anyCollection())).thenReturn(List.of());

        expertDirectoryService.findExperts("Java", ProficiencyLevel.INTERMEDIATE);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Collection<ProficiencyLevel>> captor = ArgumentCaptor.forClass(Collection.class);
        verify(userSkillRepository).searchExperts(eq("Java"), captor.capture());
        assertThat(captor.getValue()).containsExactlyInAnyOrder(
                ProficiencyLevel.INTERMEDIATE, ProficiencyLevel.ADVANCED, ProficiencyLevel.EXPERT);
    }

    @Test
    @DisplayName("findExperts returns an empty list without extra queries when nothing matches")
    void emptyResultSkipsRankingQueries() {
        when(userSkillRepository.searchExperts(eq("Kotlin"), anyCollection())).thenReturn(List.of());

        assertThat(expertDirectoryService.findExperts("Kotlin", null)).isEmpty();

        verifyNoInteractions(sessionRegistrationRepository);
        verifyNoInteractions(mentorshipMatchRepository);
    }

    @Test
    @DisplayName("findExperts trims the skill term before searching")
    void trimsSkillTerm() {
        when(userSkillRepository.searchExperts(eq("Java"), anyCollection())).thenReturn(List.of());

        expertDirectoryService.findExperts("  Java  ", null);

        verify(userSkillRepository).searchExperts(eq("Java"), anyCollection());
    }

    @Test
    @DisplayName("findExperts rejects a blank skill term")
    void blankSkillIsRejected() {
        assertThatThrownBy(() -> expertDirectoryService.findExperts("   ", null))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("skill name is required");

        verify(userSkillRepository, never()).searchExperts(any(), anyCollection());
    }

    // ── Helper methods ──────────────────────────────────────────────────────────

    private User user(Long id, String name, String department) {
        User created = new User();
        created.setId(id);
        created.setFullName(name);
        created.setEmail(name.split(" ")[0].toLowerCase() + "@corp.com");
        created.setDepartment(department);
        created.setJobTitle("Software Engineer");
        created.setRole(Role.EMPLOYEE);
        created.setActive(true);
        return created;
    }

    private UserSkill userSkill(User owner, ProficiencyLevel level, Double rating) {
        UserSkill created = new UserSkill();
        created.setUser(owner);
        created.setSkill(javaSkill);
        created.setProficiencyLevel(level);
        created.setRatingScore(rating);
        return created;
    }

    private MentorshipMatch mentorship(User mentor) {
        MentorshipMatch match = new MentorshipMatch();
        match.setMentor(mentor);
        match.setMentee(dan);
        match.setTargetSkill(javaSkill);
        match.setStatus(MentorshipStatus.COMPLETED);
        return match;
    }

    private HostRatingAggregate hostRating(Long mentorId, Double average, Long count) {
        return new HostRatingAggregate() {
            @Override
            public Long getMentorId() {
                return mentorId;
            }

            @Override
            public Double getAverageRating() {
                return average;
            }

            @Override
            public Long getRatingCount() {
                return count;
            }
        };
    }
}
