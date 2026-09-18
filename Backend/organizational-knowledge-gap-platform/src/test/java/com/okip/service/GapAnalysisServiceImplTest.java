package com.okip.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.okip.dto.gap.GapAnalysisResponseDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.master.JobRole;
import com.okip.entity.master.Skill;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.entity.transaction.JobRoleCompetency;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.enums.ProficiencyLevel;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.JobRoleCompetencyRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.service.gap.impl.GapAnalysisServiceImpl;

@ExtendWith(MockitoExtension.class)
class GapAnalysisServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeJobRoleRepository employeeJobRoleRepository;

    @Mock
    private EmployeeSkillRepository employeeSkillRepository;

    @Mock
    private JobRoleCompetencyRepository competencyRepository;

    @Mock
    private KnowledgeGapRepository knowledgeGapRepository;

    @InjectMocks
    private GapAnalysisServiceImpl gapAnalysisService;

    private Employee employee;
    private EmployeeJobRole employeeJobRole;
    private JobRoleCompetency competency;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setEmployeeCode("EMP001");
        employee.setFirstName("John");
        employee.setLastName("Doe");

        JobRole jobRole = new JobRole();
        jobRole.setJobRoleId(10L);
        jobRole.setJobRoleName("Java Engineer");

        employeeJobRole = new EmployeeJobRole();
        employeeJobRole.setEmployeeJobRoleId(100L);
        employeeJobRole.setEmployee(employee);
        employeeJobRole.setJobRole(jobRole);
        employeeJobRole.setActive(true);

        Skill skill = new Skill();
        skill.setSkillId(5L);
        skill.setSkillName("Spring Boot");

        competency = new JobRoleCompetency();
        competency.setJobRoleCompetencyId(50L);
        competency.setJobRole(jobRole);
        competency.setSkill(skill);
        competency.setRequiredProficiency(ProficiencyLevel.ADVANCED);
        competency.setMinimumExperience(3.0);
    }

    @Test
    void runGapAnalysis_DeletesExistingGapsAndRecalculatesSuccessfully() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee)).thenReturn(List.of(employeeJobRole));
        when(competencyRepository.findByJobRole(employeeJobRole.getJobRole())).thenReturn(List.of(competency));
        when(employeeSkillRepository.findByEmployeeAndSkill(employee, competency.getSkill())).thenReturn(Optional.empty());

        GapAnalysisResponseDTO response = gapAnalysisService.runGapAnalysis(1L);

        assertNotNull(response);
        assertEquals("EMP001", response.getEmployeeCode());
        assertEquals("Java Engineer", response.getJobRoleName());
        assertEquals(1, response.getTotalSkills());
        assertEquals(1, response.getGapSkills());
        assertEquals(0, response.getCompletedSkills());

        verify(knowledgeGapRepository, times(1)).deleteByEmployeeJobRole(employeeJobRole);
        verify(knowledgeGapRepository, times(1)).save(any(KnowledgeGap.class));
    }

    @Test
    void runGapAnalysis_EmployeeCannotRunForAnother_ThrowsAccessDenied() {
        Employee requester = new Employee();
        requester.setEmployeeId(2L);
        requester.setOfficialEmail("emp2@example.com");
        com.okip.entity.master.Role empRole = new com.okip.entity.master.Role();
        empRole.setRoleName(com.okip.enums.RoleType.ROLE_EMPLOYEE);
        requester.setRole(empRole);

        org.springframework.security.core.Authentication auth = mock(org.springframework.security.core.Authentication.class);
        when(auth.getName()).thenReturn("emp2@example.com");
        when(auth.isAuthenticated()).thenReturn(true);
        org.springframework.security.core.context.SecurityContext context = mock(org.springframework.security.core.context.SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        org.springframework.security.core.context.SecurityContextHolder.setContext(context);

        when(employeeRepository.findByOfficialEmail("emp2@example.com")).thenReturn(Optional.of(requester));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> {
            gapAnalysisService.runGapAnalysis(1L);
        });
    }

    @Test
    void runGapAnalysis_UnauthorizedManagerCannotRunForUnrelatedEmployee_ThrowsAccessDenied() {
        Employee manager = new Employee();
        manager.setEmployeeId(3L);
        manager.setOfficialEmail("mgr3@example.com");
        com.okip.entity.master.Role mgrRole = new com.okip.entity.master.Role();
        mgrRole.setRoleName(com.okip.enums.RoleType.ROLE_MANAGER);
        manager.setRole(mgrRole);

        com.okip.entity.master.Department deptA = new com.okip.entity.master.Department();
        deptA.setDepartmentId(100L);
        manager.setDepartment(deptA);

        com.okip.entity.master.Department deptB = new com.okip.entity.master.Department();
        deptB.setDepartmentId(200L);
        employee.setDepartment(deptB); // Employee 1 in department 200

        org.springframework.security.core.Authentication auth = mock(org.springframework.security.core.Authentication.class);
        when(auth.getName()).thenReturn("mgr3@example.com");
        when(auth.isAuthenticated()).thenReturn(true);
        org.springframework.security.core.context.SecurityContext context = mock(org.springframework.security.core.context.SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        org.springframework.security.core.context.SecurityContextHolder.setContext(context);

        when(employeeRepository.findByOfficialEmail("mgr3@example.com")).thenReturn(Optional.of(manager));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> {
            gapAnalysisService.runGapAnalysis(1L);
        });
    }
}
