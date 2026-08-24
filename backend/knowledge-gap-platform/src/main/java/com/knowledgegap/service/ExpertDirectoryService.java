package com.knowledgegap.service;

import com.knowledgegap.dto.ExpertDirectoryDTO;
import com.knowledgegap.entity.Department;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.DepartmentRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class ExpertDirectoryService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final DepartmentRepository departmentRepository;

    public ExpertDirectoryService(
            EmployeeSkillRepository employeeSkillRepository,
            SkillRepository skillRepository,
            DepartmentRepository departmentRepository) {
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<ExpertDirectoryDTO> searchExperts(
            String query,
            String department,
            Integer minProficiency,
            String skillCategory,
            Long skillId,
            String currentEmployeeIdentifier) {

        List<EmployeeSkill> allEmployeeSkills = employeeSkillRepository.findAll();

        if (allEmployeeSkills == null || allEmployeeSkills.isEmpty()) {
            return Collections.emptyList();
        }

        String normalizedQuery = (query != null) ? query.trim().toLowerCase() : "";
        String normalizedDept = (department != null) ? department.trim().toLowerCase() : "";
        String normalizedCategory = (skillCategory != null) ? skillCategory.trim().toLowerCase() : "";
        int requiredMinProficiency = (minProficiency != null && minProficiency > 0) ? minProficiency : 1;

        return allEmployeeSkills.stream()
                .filter(es -> es != null && es.getEmployee() != null && es.getSkill() != null)
                .filter(es -> {
                    Integer level = es.getCurrentLevel();
                    return level != null && level >= requiredMinProficiency;
                })
                .filter(es -> {
                    if (skillId != null && skillId > 0) {
                        return es.getSkill().getId() != null && es.getSkill().getId().equals(skillId);
                    }
                    return true;
                })
                .filter(es -> {
                    if (!normalizedCategory.isEmpty() && !"all".equalsIgnoreCase(normalizedCategory)) {
                        String category = es.getSkill().getCategory();
                        if (category == null || !category.toLowerCase().contains(normalizedCategory)) {
                            return false;
                        }
                    }
                    return true;
                })
                .filter(es -> {
                    if (!normalizedDept.isEmpty() && !"all".equalsIgnoreCase(normalizedDept)) {
                        String deptName = resolveDepartmentName(es.getEmployee());
                        if (deptName == null || !deptName.toLowerCase().contains(normalizedDept)) {
                            return false;
                        }
                    }
                    return true;
                })
                .filter(es -> {
                    if (normalizedQuery.isEmpty()) {
                        return true;
                    }

                    Employee emp = es.getEmployee();
                    Skill skill = es.getSkill();
                    String dept = resolveDepartmentName(emp);

                    String skillName = (skill.getSkillName() != null) ? skill.getSkillName().toLowerCase() : "";
                    String skillCat = (skill.getCategory() != null) ? skill.getCategory().toLowerCase() : "";
                    String firstName = (emp.getFirstName() != null) ? emp.getFirstName().toLowerCase() : "";
                    String lastName = (emp.getLastName() != null) ? emp.getLastName().toLowerCase() : "";
                    String fullName = (firstName + " " + lastName).trim();
                    String designation = (emp.getDesignation() != null) ? emp.getDesignation().toLowerCase() : "";
                    String email = (emp.getEmail() != null) ? emp.getEmail().toLowerCase() : "";
                    String employeeCode = (emp.getEmployeeId() != null) ? emp.getEmployeeId().toLowerCase() : "";
                    String departmentLower = (dept != null) ? dept.toLowerCase() : "";
                    String profLabel = getProficiencyLabel(es.getCurrentLevel()).toLowerCase();

                    return skillName.contains(normalizedQuery) ||
                            skillCat.contains(normalizedQuery) ||
                            firstName.contains(normalizedQuery) ||
                            lastName.contains(normalizedQuery) ||
                            fullName.contains(normalizedQuery) ||
                            designation.contains(normalizedQuery) ||
                            email.contains(normalizedQuery) ||
                            employeeCode.contains(normalizedQuery) ||
                            departmentLower.contains(normalizedQuery) ||
                            profLabel.contains(normalizedQuery);
                })
                .map(this::mapToDTO)
                .sorted((a, b) -> {
                    int profCompare = Integer.compare(b.getProficiencyLevel(), a.getProficiencyLevel());
                    if (profCompare != 0) return profCompare;

                    int skillCompare = a.getSkillName().compareToIgnoreCase(b.getSkillName());
                    if (skillCompare != 0) return skillCompare;

                    return a.getFullName().compareToIgnoreCase(b.getFullName());
                })
                .collect(Collectors.toList());
    }

    public List<String> getAllDepartments() {
        Set<String> departments = new LinkedHashSet<>();
        try {
            List<Department> list = departmentRepository.findAll();
            for (Department d : list) {
                if (d.getDepartmentName() != null && !d.getDepartmentName().trim().isEmpty()) {
                    departments.add(d.getDepartmentName().trim());
                }
            }
        } catch (Exception ignored) {
        }

        return new ArrayList<>(departments);
    }

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    private ExpertDirectoryDTO mapToDTO(EmployeeSkill es) {
        Employee emp = es.getEmployee();
        Skill skill = es.getSkill();

        Integer level = (es.getCurrentLevel() != null) ? es.getCurrentLevel() : 1;
        String profLabel = getProficiencyLabel(level);
        String deptName = resolveDepartmentName(emp);

        String roleName = "EMPLOYEE";
        if (emp.getRole() != null && emp.getRole().getRoleName() != null) {
            roleName = emp.getRole().getRoleName();
        }

        boolean isAvailable = level >= 2;

        return new ExpertDirectoryDTO(
                es.getId(),
                emp.getId(),
                emp.getEmployeeId(),
                emp.getFirstName(),
                emp.getLastName(),
                emp.getEmail(),
                emp.getDesignation(),
                deptName,
                skill.getId(),
                skill.getSkillName(),
                skill.getCategory(),
                level,
                profLabel,
                roleName,
                isAvailable
        );
    }

    private String resolveDepartmentName(Employee emp) {
        if (emp == null) return "N/A";

        if (emp.getDepartment() != null &&
            emp.getDepartment().getDepartmentName() != null &&
            !emp.getDepartment().getDepartmentName().trim().isEmpty()) {
            return emp.getDepartment().getDepartmentName().trim();
        }

        return "N/A";
    }

    private String getProficiencyLabel(Integer level) {
        if (level == null || level <= 1) return "Beginner";
        switch (level) {
            case 2: return "Intermediate";
            case 3: return "Competent";
            case 4: return "Advanced";
            case 5: return "Expert";
            default: return level > 5 ? "Expert" : "Beginner";
        }
    }
}