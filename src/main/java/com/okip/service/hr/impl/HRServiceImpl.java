package com.okip.service.hr.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.okip.dto.hr.EmployeeApprovalResponseDTO;
import com.okip.dto.hr.PendingEmployeeDTO;
import com.okip.entity.master.Employee;
import com.okip.enums.AccountStatus;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.EmployeeRepository;
import com.okip.service.hr.HRService;

@Service
public class HRServiceImpl implements HRService {

    private final EmployeeRepository employeeRepository;

    public HRServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
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
}