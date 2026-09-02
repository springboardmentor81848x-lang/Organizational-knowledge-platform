package com.okgip.controller;

import com.okgip.entity.Department;
import com.okgip.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/departments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @GetMapping
    public ResponseEntity<?> getAllDepartments() {
        List<Department> list = departmentRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }
}
