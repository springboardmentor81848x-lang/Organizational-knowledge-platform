package com.knowledgegap.service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.repository.EmployeeRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(EmployeeRepository employeeRepository,
                           PasswordEncoder passwordEncoder) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================================================
    // CREATE EMPLOYEE
    // =========================================================

    public Employee saveEmployee(Employee employee) {

        // Encrypt password before saving
        if (employee.getPassword() != null &&
            !employee.getPassword().isEmpty()) {

            employee.setPassword(
                    passwordEncoder.encode(employee.getPassword())
            );
        }

        return employeeRepository.save(employee);
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

    public Optional<Employee> getEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId);
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

        Optional<Employee> employee = Optional.empty();

        try {

            Long id = Long.parseLong(employeeIdentifier);

            employee = employeeRepository.findById(id);

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