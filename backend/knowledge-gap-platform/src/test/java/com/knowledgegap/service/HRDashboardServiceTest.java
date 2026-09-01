package com.knowledgegap.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.Mentorship;
import com.knowledgegap.entity.TrainingEnrollment;
import com.knowledgegap.entity.TrainingStatus;
import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.MentorshipRepository;
import com.knowledgegap.repository.TrainingEnrollmentRepository;

@ExtendWith(MockitoExtension.class)
class HRDashboardServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeSkillRepository employeeSkillRepository;

    @Mock
    private KnowledgeGapRepository knowledgeGapRepository;

    @Mock
    private AssessmentAttemptRepository assessmentAttemptRepository;

    @Mock
    private TrainingEnrollmentRepository trainingEnrollmentRepository;

    @Mock
    private MentorshipRepository mentorshipRepository;

    @InjectMocks
    private HRDashboardService hrDashboardService;

    @Test
    void shouldCalculateRealTrainingAndMentorshipKpis() {
        Employee employee1 = mock(Employee.class);
        when(employee1.getId()).thenReturn(1L);
        when(employee1.getFirstName()).thenReturn("Alice");
        when(employee1.getLastName()).thenReturn("Ng");
        when(employee1.getDesignation()).thenReturn("Developer");

        Employee employee2 = mock(Employee.class);
        when(employee2.getId()).thenReturn(2L);
        when(employee2.getFirstName()).thenReturn("Bob");
        when(employee2.getLastName()).thenReturn("Lee");
        when(employee2.getDesignation()).thenReturn("Manager");

        when(employeeRepository.findByRoleRoleNameIn(anyList()))
                .thenReturn(List.of(employee1, employee2));
        when(employeeSkillRepository.findByEmployee(any()))
                .thenReturn(Collections.emptyList());
        when(knowledgeGapRepository.findByEmployee(any()))
                .thenReturn(Collections.emptyList());
        when(assessmentAttemptRepository.findByEmployeeOrderByCompletedAtAsc(any()))
                .thenReturn(Collections.emptyList());

        when(trainingEnrollmentRepository.findAll()).thenReturn(List.of(
                createEnrollment(employee1, TrainingStatus.IN_PROGRESS, 65),
                createEnrollment(employee1, TrainingStatus.COMPLETED, 100),
                createEnrollment(employee2, TrainingStatus.NOT_STARTED, 10)
        ));

        when(mentorshipRepository.findAll()).thenReturn(List.of(
                createMentorship(employee1, employee2, "ACTIVE"),
                createMentorship(employee2, employee1, "REQUESTED"),
                createMentorship(employee1, employee2, "ACCEPTED")
        ));

        Map<String, Object> summary = hrDashboardService.getDashboardSummary();

        assertEquals(2, summary.get("totalEmployees"));
        assertEquals(2, summary.get("employeesInTraining"));
        assertEquals(33.33, (Double) summary.get("trainingCompletionRate"), 0.01);
        assertEquals(58.33, (Double) summary.get("averageLearningProgress"), 0.01);
        assertEquals(2, summary.get("activeMentorships"));
    }

    private TrainingEnrollment createEnrollment(Employee employee, TrainingStatus status, int progress) {
        TrainingEnrollment enrollment = new TrainingEnrollment();
        enrollment.setEmployee(employee);
        enrollment.setStatus(status);
        enrollment.setProgressPercentage(progress);
        return enrollment;
    }

    private Mentorship createMentorship(Employee mentee, Employee mentor, String status) {
        Mentorship mentorship = new Mentorship();
        mentorship.setMentee(mentee);
        mentorship.setMentor(mentor);
        mentorship.setStatus(status);
        return mentorship;
    }
}
