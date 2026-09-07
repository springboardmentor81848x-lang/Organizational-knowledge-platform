package com.okip.service.admin.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.okip.dto.admin.CreateUserRequestDTO;
import com.okip.dto.admin.CreateUserResponseDTO;
import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.Role;
import com.okip.enums.AccountStatus;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.DepartmentRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.RoleRepository;
import com.okip.service.admin.AdminService;

@Service
public class AdminServiceImpl implements AdminService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminServiceImpl(EmployeeRepository employeeRepository,
                            DepartmentRepository departmentRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder) {

        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public CreateUserResponseDTO createUser(CreateUserRequestDTO request) {

        if (employeeRepository.existsByOfficialEmail(request.getOfficialEmail())) {

            throw new ResourceAlreadyExistsException(
                    "Official email already exists.");
        }

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found."));

        Role role = roleRepository
                .findByRoleName(request.getRole())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Role not found."));

        Employee employee = new Employee();

        employee.setEmployeeCode(generateEmployeeCode());

        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setOfficialEmail(request.getOfficialEmail());

        employee.setPassword(
                passwordEncoder.encode(request.getPassword()));

        employee.setDepartment(department);
        employee.setRole(role);

        // Admin-created users are immediately approved
        employee.setStatus(AccountStatus.APPROVED);

        employee = employeeRepository.save(employee);

        CreateUserResponseDTO response = new CreateUserResponseDTO();

        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setMessage("User created successfully.");

        return response;
    }

    private String generateEmployeeCode() {

        long count = employeeRepository.count() + 1;

        return String.format("EMP%04d", count);
    }
}