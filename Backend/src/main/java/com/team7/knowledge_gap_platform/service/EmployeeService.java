package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.entity.User;
import com.team7.knowledge_gap_platform.repository.EmployeeRepository;
import com.team7.knowledge_gap_platform.repository.UserRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private UserRepository userRepository;

    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Optional<Employee> getEmployeeById(Long id) {
        return employeeRepository.findById(id);
    }

    public Employee updateEmployee(Long id, Employee employee) {
        Employee existingEmployee = employeeRepository.findById(id).orElseThrow();

        existingEmployee.setFirstName(employee.getFirstName());
        existingEmployee.setLastName(employee.getLastName());
        existingEmployee.setEmail(employee.getEmail());
        existingEmployee.setPhoneNumber(employee.getPhoneNumber());
        existingEmployee.setDepartment(employee.getDepartment());
        existingEmployee.setRole(employee.getRole());
        existingEmployee.setJobRoleId(employee.getJobRoleId());
        existingEmployee.setExperience(employee.getExperience());
        existingEmployee.setEducation(employee.getEducation());
        existingEmployee.setBio(employee.getBio());

        return employeeRepository.save(existingEmployee);
    }

    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
    
    /**
     * Get all employees with a specific role.
     */
    public List<Employee> getEmployeesByRole(String role) {
        return employeeRepository.findByRole(role);
    }
    
    /**
     * Update an employee's role in both Employee and User tables for consistency.
     */
    public Employee updateEmployeeRole(Long employeeId, String newRole) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        
        // Update employee role
        employee.setRole(newRole);
        Employee updatedEmployee = employeeRepository.save(employee);
        
        // Also update user role if the user exists
        Optional<User> userOptional = userRepository.findByEmail(employee.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setRole(newRole);
            userRepository.save(user);
        }
        
        return updatedEmployee;
    }
}