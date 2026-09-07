package com.okip.service.hr.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.okip.dto.hr.ApprovedEmployeeDTO;
import com.okip.dto.hr.EmployeeApprovalResponseDTO;
import com.okip.dto.hr.PendingEmployeeDTO;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.EmployeeJobRole;
import com.okip.enums.AccountStatus;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.service.hr.HRService;

@Service
public class HRServiceImpl implements HRService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;

    public HRServiceImpl(EmployeeRepository employeeRepository,
                         EmployeeJobRoleRepository employeeJobRoleRepository) {
        this.employeeRepository = employeeRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
    }

    @Override
    public EmployeeApprovalResponseDTO approveEmployee(Long employeeId) {

        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        employee.setStatus(AccountStatus.APPROVED);

        employee = employeeRepository.save(employee);

        EmployeeApprovalResponseDTO response =
                new EmployeeApprovalResponseDTO();

        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setEmployeeName(
                employee.getFirstName() + " " + employee.getLastName());
        response.setStatus(employee.getStatus().name());
        response.setMessage("Employee approved successfully.");

        return response;
    }
    @Override
    public EmployeeApprovalResponseDTO rejectEmployee(Long employeeId) {

        Employee employee = employeeRepository
                .findById(employeeId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Employee not found."));

        employee.setStatus(AccountStatus.REJECTED);

        employeeRepository.save(employee);

        EmployeeApprovalResponseDTO response =
                new EmployeeApprovalResponseDTO();

        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setMessage("Employee rejected successfully.");

        return response;
    }
    @Override
    public List<PendingEmployeeDTO> getPendingEmployees() {

        List<Employee> employees =
                employeeRepository.findByStatus(AccountStatus.PENDING);

        List<PendingEmployeeDTO> response = new ArrayList<>();

        for (Employee employee : employees) {

            PendingEmployeeDTO dto =
                    new PendingEmployeeDTO();

            dto.setEmployeeId(employee.getEmployeeId());
            dto.setEmployeeCode(employee.getEmployeeCode());
            dto.setFirstName(employee.getFirstName());
            dto.setLastName(employee.getLastName());
            dto.setOfficialEmail(employee.getOfficialEmail());

            response.add(dto);
        }

        return response;
    }

    @Override
    public List<ApprovedEmployeeDTO> getAllApprovedEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        List<ApprovedEmployeeDTO> response = new ArrayList<>();

        for (Employee employee : employees) {
            ApprovedEmployeeDTO dto = new ApprovedEmployeeDTO();
            dto.setEmployeeId(employee.getEmployeeId());
            dto.setEmployeeCode(employee.getEmployeeCode());
            dto.setFirstName(employee.getFirstName());
            dto.setLastName(employee.getLastName());
            dto.setOfficialEmail(employee.getOfficialEmail());
            dto.setStatus(employee.getStatus() != null ? employee.getStatus().name() : "APPROVED");
            dto.setDepartmentName(employee.getDepartment() != null ? employee.getDepartment().getDepartmentName() : "N/A");
            dto.setRoleName(employee.getRole() != null ? employee.getRole().getRoleName().name() : "ROLE_EMPLOYEE");

            List<EmployeeJobRole> assignedRoles = employeeJobRoleRepository.findByEmployeeAndActiveTrue(employee);
            if (!assignedRoles.isEmpty()) {
                dto.setJobRoleId(assignedRoles.get(0).getJobRole().getJobRoleId());
                dto.setJobRoleName(assignedRoles.get(0).getJobRole().getJobRoleName());
            } else {
                dto.setJobRoleName("No active job role assigned");
            }

            response.add(dto);
        }

        return response;
    }
}