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

    public Employee saveEmployee(Employee employee) {

        // Encrypt password before saving
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));

        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    public Optional<Employee> getEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId);
    }

    public Optional<Employee> getEmployeeByIdentifier(String employeeIdentifier) {
        if (employeeIdentifier == null) {
            return Optional.empty();
        }
        Optional<Employee> employee = Optional.empty();
        try {
            Long id = Long.parseLong(employeeIdentifier);
            employee = employeeRepository.findById(id);
        } catch (NumberFormatException ignored) {
            // ignore, fall through to business employeeId lookup
        }
        return employee.isPresent()
                ? employee
                : employeeRepository.findByEmployeeId(employeeIdentifier);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}