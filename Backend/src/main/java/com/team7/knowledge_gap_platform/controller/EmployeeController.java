package com.team7.knowledge_gap_platform.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.entity.Employee;
import com.team7.knowledge_gap_platform.service.EmployeeService;
import com.team7.knowledge_gap_platform.service.RolePermissionService;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;
    
    @Autowired
    private RolePermissionService rolePermissionService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public Employee saveEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_DEPARTMENT_HEAD')")
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_DEPARTMENT_HEAD')")
    public Optional<Employee> getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public Employee updateEmployee(@PathVariable Long id,
                                   @RequestBody Employee employee) {
        return employeeService.updateEmployee(id, employee);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN')")
    public String deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return "Employee deleted successfully!";
    }
    
    /**
     * Get all employees with a specific role.
     */
    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_DEPARTMENT_HEAD')")
    public ResponseEntity<List<Employee>> getEmployeesByRole(@PathVariable String role) {
        List<Employee> employees = employeeService.getEmployeesByRole(role);
        return ResponseEntity.ok(employees);
    }
    
    /**
     * Update an employee's role. Only ADMIN and HR can do this.
     */
    @PutMapping("/{id}/role/{newRole}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_HR')")
    public ResponseEntity<?> updateEmployeeRole(@PathVariable Long id, @PathVariable String newRole) {
        // Validate role exists
        if (!rolePermissionService.getAllRoles().contains(newRole)) {
            return ResponseEntity.badRequest().body("Invalid role: " + newRole);
        }
        
        Employee updatedEmployee = employeeService.updateEmployeeRole(id, newRole);
        return ResponseEntity.ok(updatedEmployee);
    }
}