package com.okip.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.okip.dto.assessment.AssessmentReviewRequestDTO;
import com.okip.dto.assessment.SkillAssessmentResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Role;
import com.okip.entity.transaction.SkillAssessment;
import com.okip.enums.AssessmentStatus;
import com.okip.enums.RoleType;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.SkillAssessmentRepository;
import com.okip.repository.SkillRepository;
import com.okip.service.assessment.impl.SkillAssessmentServiceImpl;
import com.okip.service.gap.GapAnalysisService;
import com.okip.service.notification.NotificationService;
import com.okip.service.quiz.QuizBankService;

public class SkillAssessmentServiceImplTest {

    @Mock private SkillAssessmentRepository assessmentRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private SkillRepository skillRepository;
    @Mock private EmployeeSkillRepository employeeSkillRepository;
    @Mock private GapAnalysisService gapAnalysisService;
    @Mock private NotificationService notificationService;
    @Mock private QuizBankService quizBankService;

    @InjectMocks
    private SkillAssessmentServiceImpl assessmentService;

    private Employee employee1;
    private Employee employee2;
    private Role employeeRole;
    private Role managerRole;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        employeeRole = new Role();
        employeeRole.setRoleName(RoleType.ROLE_EMPLOYEE);

        managerRole = new Role();
        managerRole.setRoleName(RoleType.ROLE_MANAGER);

        employee1 = new Employee();
        employee1.setEmployeeId(1L);
        employee1.setOfficialEmail("emp1@example.com");
        employee1.setFirstName("Emp");
        employee1.setLastName("One");
        employee1.setRole(employeeRole);

        employee2 = new Employee();
        employee2.setEmployeeId(2L);
        employee2.setOfficialEmail("emp2@example.com");
        employee2.setFirstName("Emp");
        employee2.setLastName("Two");
        employee2.setRole(employeeRole);

        when(employeeRepository.findByOfficialEmail("emp1@example.com")).thenReturn(Optional.of(employee1));
        when(employeeRepository.findByOfficialEmail("emp2@example.com")).thenReturn(Optional.of(employee2));
    }

    private void mockAuthentication(Employee emp) {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(emp.getOfficialEmail());
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);
    }

    @Test
    public void testGetAssessmentById_UnauthorizedEmployeeThrowsAccessDenied() {
        mockAuthentication(employee1);

        SkillAssessment assessment = new SkillAssessment();
        assessment.setAssessmentId(100L);
        assessment.setEmployee(employee2); // Belongs to employee2
        assessment.setEvaluator(employee2);

        when(assessmentRepository.findById(100L)).thenReturn(Optional.of(assessment));

        assertThrows(AccessDeniedException.class, () -> {
            assessmentService.getAssessmentById(100L);
        });
    }

    @Test
    public void testGetEmployeeAssessments_UnauthorizedEmployeeThrowsAccessDenied() {
        mockAuthentication(employee1);

        assertThrows(AccessDeniedException.class, () -> {
            assessmentService.getEmployeeAssessments(2L); // Trying to view emp2's assessments
        });
    }

    @Test
    public void testSubmitAssessment_ManagerAssessmentForArbitraryEmployeeOutsideTeam_ThrowsAccessDenied() {
        mockAuthentication(employee1);
        employee1.setRole(managerRole);

        com.okip.entity.master.Department dept1 = new com.okip.entity.master.Department();
        dept1.setDepartmentId(10L);
        employee1.setDepartment(dept1);

        com.okip.entity.master.Department dept2 = new com.okip.entity.master.Department();
        dept2.setDepartmentId(20L);
        employee2.setDepartment(dept2); // Employee 2 in a different department

        com.okip.entity.master.Skill skill = new com.okip.entity.master.Skill();
        skill.setSkillId(5L);
        skill.setSkillName("Java");
        when(skillRepository.findById(5L)).thenReturn(Optional.of(skill));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee2));

        com.okip.dto.assessment.SkillAssessmentRequestDTO req = new com.okip.dto.assessment.SkillAssessmentRequestDTO();
        req.setAssessmentType("MANAGER");
        req.setEmployeeId(2L);
        req.setSkillId(5L);
        req.setScore(85);
        req.setAssessedProficiency("ADVANCED");

        assertThrows(AccessDeniedException.class, () -> {
            assessmentService.submitAssessment(req);
        });
    }

    @Test
    public void testSubmitAssessment_AuthorizedManagerForTeamEmployee_Succeeds() {
        mockAuthentication(employee1);
        employee1.setRole(managerRole);

        com.okip.entity.master.Department dept1 = new com.okip.entity.master.Department();
        dept1.setDepartmentId(10L);
        employee1.setDepartment(dept1);
        employee2.setDepartment(dept1); // Employee 2 in same department

        com.okip.entity.master.Skill skill = new com.okip.entity.master.Skill();
        skill.setSkillId(5L);
        skill.setSkillName("Java");
        when(skillRepository.findById(5L)).thenReturn(Optional.of(skill));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(employee2));

        when(assessmentRepository.save(any())).thenAnswer(inv -> {
            SkillAssessment sa = inv.getArgument(0);
            sa.setAssessmentId(999L);
            return sa;
        });

        com.okip.dto.assessment.SkillAssessmentRequestDTO req = new com.okip.dto.assessment.SkillAssessmentRequestDTO();
        req.setAssessmentType("MANAGER");
        req.setEmployeeId(2L);
        req.setSkillId(5L);
        req.setScore(85);
        req.setAssessedProficiency("ADVANCED");

        SkillAssessmentResponseDTO resp = assessmentService.submitAssessment(req);
        assertNotNull(resp);
        assertEquals(2L, resp.getEmployeeId());
        assertEquals("APPROVED", resp.getStatus());
    }
}
