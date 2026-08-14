package com.knowledgeiq.service;

import com.knowledgeiq.dto.AssessmentDto;
import com.knowledgeiq.dto.AssessmentQuestionnaireDto;
import com.knowledgeiq.dto.AssessmentSubmissionDto;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssessmentServiceTest {

    @Mock
    private AssessmentRepository assessmentRepository;

    @Mock
    private AssessmentResponseRepository assessmentResponseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SkillRepository skillRepository;

    @Mock
    private EmployeeSkillRepository employeeSkillRepository;

    @Mock
    private RoleSkillBenchmarkRepository benchmarkRepository;

    @Mock
    private CustomQuestionnaireRepository customQuestionnaireRepository;

    @InjectMocks
    private AssessmentService assessmentService;

    private User testUser;
    private Skill testSkill;
    private UUID userId;
    private UUID skillId;

    @BeforeEach
    public void setUp() {
        userId = UUID.randomUUID();
        skillId = UUID.randomUUID();

        testUser = new User();
        testUser.setId(userId);
        testUser.setFullName("Test Employee");
        testUser.setEmail("employee@test.com");

        testSkill = new Skill();
        testSkill.setId(skillId);
        testSkill.setName("Spring Boot");
    }

    @Test
    public void testGetQuestionnaireForUser() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(skillRepository.findAll()).thenReturn(List.of(testSkill));
        when(employeeSkillRepository.findByUserId(userId)).thenReturn(List.of());

        AssessmentQuestionnaireDto questionnaire = assessmentService.getQuestionnaireForUser(userId.toString());

        assertNotNull(questionnaire);
        assertEquals(1, questionnaire.getSkills().size());
        assertEquals("Spring Boot", questionnaire.getSkills().get(0).getSkillName());
    }

    @Test
    public void testSubmitAssessmentRecalculatesGap() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(skillRepository.findById(skillId)).thenReturn(Optional.of(testSkill));

        Assessment mockAssessment = new Assessment();
        mockAssessment.setId(UUID.randomUUID());
        mockAssessment.setUser(testUser);
        mockAssessment.setTitle("Skill Self-Assessment");
        mockAssessment.setType(AssessmentType.SELF_ASSESSMENT);
        mockAssessment.setStatus(AssessmentStatus.COMPLETED);

        when(assessmentRepository.save(any(Assessment.class))).thenReturn(mockAssessment);
        when(employeeSkillRepository.findByUserIdAndSkillId(userId, skillId)).thenReturn(Optional.empty());

        AssessmentSubmissionDto submissionDto = new AssessmentSubmissionDto();
        submissionDto.setTitle("Skill Self-Assessment");
        submissionDto.setType("SELF_ASSESSMENT");

        AssessmentSubmissionDto.SubmissionItem item = new AssessmentSubmissionDto.SubmissionItem();
        item.setSkillId(skillId);
        item.setSkillName("Spring Boot");
        item.setProficiencyLevel(4);
        item.setNotes("Advanced spring boot development");
        submissionDto.setResponses(List.of(item));

        AssessmentDto result = assessmentService.submitAssessment(userId.toString(), submissionDto);

        assertNotNull(result);
        verify(employeeSkillRepository, times(1)).save(any(EmployeeSkill.class));
        verify(assessmentResponseRepository, times(1)).save(any(AssessmentResponse.class));
    }

    @Test
    public void testCreateCustomQuestionnaire() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(customQuestionnaireRepository.save(any(CustomQuestionnaire.class))).thenAnswer(inv -> {
            CustomQuestionnaire cq = inv.getArgument(0);
            cq.setId(UUID.randomUUID());
            return cq;
        });

        com.knowledgeiq.dto.CustomQuestionnaireDto dto = new com.knowledgeiq.dto.CustomQuestionnaireDto();
        dto.setTitle("Frontend Engineer Questionnaire");
        dto.setDescription("Custom frontend assessment");
        dto.setTargetRole("Frontend Engineer");

        com.knowledgeiq.dto.CustomQuestionnaireDto result = assessmentService.createCustomQuestionnaire(userId.toString(), dto);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertEquals("Test Employee", result.getCreatedBy());
    }

    @Test
    public void testCompareHistoricalAssessments() {
        UUID a1Id = UUID.randomUUID();
        UUID a2Id = UUID.randomUUID();

        Assessment a1 = new Assessment();
        a1.setId(a1Id);
        a1.setUser(testUser);
        a1.setTitle("Q1 Assessment");
        a1.setType(AssessmentType.SELF_ASSESSMENT);
        a1.setStatus(AssessmentStatus.COMPLETED);
        a1.setOverallScore(60.0);

        Assessment a2 = new Assessment();
        a2.setId(a2Id);
        a2.setUser(testUser);
        a2.setTitle("Q3 Assessment");
        a2.setType(AssessmentType.SELF_ASSESSMENT);
        a2.setStatus(AssessmentStatus.COMPLETED);
        a2.setOverallScore(85.0);

        when(assessmentRepository.findById(a1Id)).thenReturn(Optional.of(a1));
        when(assessmentRepository.findById(a2Id)).thenReturn(Optional.of(a2));

        com.knowledgeiq.dto.AssessmentComparisonDto comparison = assessmentService.compareHistoricalAssessments(a1Id.toString(), a2Id.toString());

        assertNotNull(comparison);
        assertEquals(25.0, comparison.getScoreDelta());
    }
}
