package com.knowledgegap.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.repository.EmployeeRepository;

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

    @Transactional
    public Employee saveEmployee(Employee employee) {

        boolean isNewEmployee =
                employee.getId() == null;

        /*
         * Encode password only when a new/plain password is supplied.
         */
        if (employee.getPassword() != null &&
            !employee.getPassword().isEmpty()) {

            employee.setPassword(
                    passwordEncoder.encode(
                            employee.getPassword()
                    )
            );
        }

        Employee savedEmployee =
                employeeRepository.save(employee);

        /*
         * Create notifications only for newly created employees.
         */
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

            /*
             * Notify HR.
             */
            notificationService.notifyHR(
                    "NEW_EMPLOYEE",
                    message
            );

            /*
             * Notify Department Heads.
             */
            notificationService.notifyDepartmentHeads(
                    "NEW_EMPLOYEE",
                    message
            );
        }

        return savedEmployee;
    }

    public List<Employee> getAllEmployees() {

        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {

        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByEmployeeId(
            String employeeId) {

        return employeeRepository.findByEmployeeId(
                employeeId
        );
    }

    /*
     * Finds an employee using either:
     * 1. Database numeric ID
     * 2. Employee ID such as E005
     */
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

    /*
     * Finds employee using the email stored in the JWT.
     *
     * This is used by the Department Head notification
     * endpoint so the frontend does not need to send an
     * employee ID.
     */
    public Optional<Employee> getEmployeeByEmail(
            String email) {

        if (email == null ||
            email.trim().isEmpty()) {

            return Optional.empty();
        }

        return employeeRepository.findByEmail(
                email.trim()
        );
    }

    public Employee updateEmployee(
            Employee employee) {

        return employeeRepository.save(employee);
    }

    public void deleteEmployee(Long id) {

        employeeRepository.deleteById(id);
    }
}