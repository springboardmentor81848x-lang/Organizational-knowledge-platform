package com.knowledgegap.service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.repository.EmployeeRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            NotificationService notificationService) {

        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================

    @Transactional
    public Employee saveEmployee(Employee employee) {

        // =====================================================
        // CHECK WHETHER THIS IS A NEW EMPLOYEE
        // =====================================================

        boolean isNewEmployee =
                employee.getId() == null;

        // =====================================================
        // ENCRYPT PASSWORD BEFORE SAVING
        // =====================================================

        if (employee.getPassword() != null &&
            !employee.getPassword().isEmpty()) {

            employee.setPassword(
                    passwordEncoder.encode(
                            employee.getPassword()
                    )
            );
        }

        // =====================================================
        // SAVE EMPLOYEE
        // =====================================================

        Employee savedEmployee =
                employeeRepository.save(employee);

        // =====================================================
        // NOTIFY HR ONLY FOR NEW EMPLOYEES
        // =====================================================

        if (isNewEmployee) {

            String employeeName =
                    (savedEmployee.getFirstName() != null
                            ? savedEmployee.getFirstName()
                            : "")
                    + " "
                    + (savedEmployee.getLastName() != null
                            ? savedEmployee.getLastName()
                            : "");

            employeeName = employeeName.trim();

            if (employeeName.isEmpty()) {
                employeeName = "A new employee";
            }

            String employeeIdentifier =
                    savedEmployee.getEmployeeId();

            String message;

            if (employeeIdentifier != null &&
                !employeeIdentifier.trim().isEmpty()) {

                message =
                        employeeName
                        + " ("
                        + employeeIdentifier
                        + ") has joined the organization.";

            } else {

                message =
                        employeeName
                        + " has joined the organization.";
            }

            notificationService.notifyHR(
                    "NEW_EMPLOYEE",
                    message
            );
        }

        return savedEmployee;
    }

    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================

    public List<Employee> getAllEmployees() {

        return employeeRepository.findAll();
    }

    // =========================================================
    // GET EMPLOYEE BY DATABASE ID
    // =========================================================

    public Optional<Employee> getEmployeeById(Long id) {

        return employeeRepository.findById(id);
    }

    // =========================================================
    // GET EMPLOYEE BY EMPLOYEE ID
    // Example: EMP001
    // =========================================================

    public Optional<Employee> getEmployeeByEmployeeId(
            String employeeId) {

        return employeeRepository.findByEmployeeId(
                employeeId
        );
    }

    // =========================================================
    // GET EMPLOYEE BY ID OR EMPLOYEE ID
    // =========================================================

    public Optional<Employee> getEmployeeByIdentifier(
            String employeeIdentifier) {

        if (employeeIdentifier == null ||
            employeeIdentifier.trim().isEmpty()) {

            return Optional.empty();
        }

        Optional<Employee> employee =
                Optional.empty();

        try {

            Long id =
                    Long.parseLong(
                            employeeIdentifier
                    );

            employee =
                    employeeRepository.findById(id);

        } catch (NumberFormatException ignored) {

            // Not a database ID.
            // Try business Employee ID instead.
        }

        if (employee.isPresent()) {
            return employee;
        }

        return employeeRepository.findByEmployeeId(
                employeeIdentifier
        );
    }

    // =========================================================
    // UPDATE EMPLOYEE PROFILE
    // =========================================================

    public Employee updateEmployee(Employee employee) {

        return employeeRepository.save(employee);
    }

    // =========================================================
    // DELETE EMPLOYEE
    // =========================================================

    public void deleteEmployee(Long id) {

        employeeRepository.deleteById(id);
    }
}