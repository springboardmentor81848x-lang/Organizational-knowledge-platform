package com.knowledgegap.controller;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.service.EmployeeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // =========================================================
    // GET ALL EMPLOYEES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    // =========================================================
    // GET EMPLOYEE BY DATABASE ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(
            @PathVariable Long id) {

        return employeeService.getEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // GET MY PROFILE BY EMPLOYEE ID
    // Example:
    // GET /api/employees/profile/EMP001
    // =========================================================

    @GetMapping("/profile/{employeeId}")
    public ResponseEntity<Employee> getMyProfile(
            @PathVariable String employeeId) {

        return employeeService
                .getEmployeeByEmployeeId(employeeId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // UPDATE MY PROFILE
    // Employee ID CANNOT BE CHANGED
    // =========================================================

    @PutMapping("/profile/{employeeId}")
    public ResponseEntity<Employee> updateMyProfile(
            @PathVariable String employeeId,
            @RequestBody Employee updatedEmployee) {

        return employeeService
                .getEmployeeByEmployeeId(employeeId)
                .map(existingEmployee -> {

                    // Employee ID remains unchanged
                    existingEmployee.setEmployeeId(
                            existingEmployee.getEmployeeId()
                    );

                    // Editable personal/professional information
                    existingEmployee.setFirstName(
                            updatedEmployee.getFirstName()
                    );

                    existingEmployee.setLastName(
                            updatedEmployee.getLastName()
                    );

                    existingEmployee.setEmail(
                            updatedEmployee.getEmail()
                    );

                    existingEmployee.setDesignation(
                            updatedEmployee.getDesignation()
                    );

                    existingEmployee.setDepartment(
                            updatedEmployee.getDepartment()
                    );

                    // Do NOT update role from profile
                    // Role should be controlled by organization/admin.

                    // Password is handled separately.
                    // Don't overwrite it accidentally.

                    Employee savedEmployee =
                            employeeService.updateEmployee(existingEmployee);

                    return ResponseEntity.ok(savedEmployee);

                })
                .orElse(ResponseEntity.notFound().build());
    }

    // =========================================================
    // DELETE EMPLOYEE
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Long id) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.ok(
                "Employee deleted successfully."
        );
    }
}