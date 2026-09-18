package com.okip.service;

import static org.junit.jupiter.api.Assertions.*;
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

import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Role;
import com.okip.enums.RoleType;
import com.okip.repository.*;
import com.okip.service.report.impl.ReportServiceImpl;

public class ReportServiceImplTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private EmployeeJobRoleRepository employeeJobRoleRepository;
    @Mock private KnowledgeGapRepository knowledgeGapRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private TrainingEnrollmentRepository trainingEnrollmentRepository;
    @Mock private SkillAssessmentRepository skillAssessmentRepository;

    @InjectMocks
    private ReportServiceImpl reportService;

    private Employee employee;
    private Employee otherEmp;
    private Employee manager;
    private Department dept1;
    private Department dept2;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);

        Role empRole = new Role();
        empRole.setRoleName(RoleType.ROLE_EMPLOYEE);

        Role mgrRole = new Role();
        mgrRole.setRoleName(RoleType.ROLE_MANAGER);

        dept1 = new Department();
        dept1.setDepartmentId(10L);
        dept1.setDepartmentName("Engineering");

        dept2 = new Department();
        dept2.setDepartmentId(20L);
        dept2.setDepartmentName("Finance");

        employee = new Employee();
        employee.setEmployeeId(1L);
        employee.setOfficialEmail("emp1@example.com");
        employee.setRole(empRole);
        employee.setDepartment(dept1);

        otherEmp = new Employee();
        otherEmp.setEmployeeId(2L);
        otherEmp.setOfficialEmail("emp2@example.com");
        otherEmp.setRole(empRole);
        otherEmp.setDepartment(dept2);

        manager = new Employee();
        manager.setEmployeeId(3L);
        manager.setOfficialEmail("mgr@example.com");
        manager.setRole(mgrRole);
        manager.setDepartment(dept1);

        when(employeeRepository.findByOfficialEmail("emp1@example.com")).thenReturn(Optional.of(employee));
        when(employeeRepository.findByOfficialEmail("mgr@example.com")).thenReturn(Optional.of(manager));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(employeeRepository.findById(2L)).thenReturn(Optional.of(otherEmp));
    }

    private void mockAuthentication(Employee emp) {
        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn(emp.getOfficialEmail());
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(context);
    }

    @Test
    public void testGenerateEmployeeSkillGapsCsv_EmployeeCannotExportOtherEmployeeGaps() {
        mockAuthentication(employee);

        assertThrows(AccessDeniedException.class, () -> {
            reportService.generateEmployeeSkillGapsCsv(2L); // Employee 1 trying to export Employee 2 gaps
        });
    }

    @Test
    public void testGenerateEmployeeSkillGapsCsv_ManagerCannotExportUnrelatedEmployeeGaps() {
        mockAuthentication(manager); // Manager in dept 10

        assertThrows(AccessDeniedException.class, () -> {
            reportService.generateEmployeeSkillGapsCsv(2L); // Employee 2 is in dept 20
        });
    }
}
