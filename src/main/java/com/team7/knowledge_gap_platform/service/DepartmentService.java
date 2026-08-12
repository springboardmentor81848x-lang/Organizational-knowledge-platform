package com.team7.knowledge_gap_platform.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.Department;
import com.team7.knowledge_gap_platform.repository.DepartmentRepository;

@Service
public class DepartmentService {

    @Autowired
    private DepartmentRepository departmentRepository;

    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Department updateDepartment(Long id, Department department) {

        Department existingDepartment = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        existingDepartment.setDepartmentName(department.getDepartmentName());
        existingDepartment.setDescription(department.getDescription());

        return departmentRepository.save(existingDepartment);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}
