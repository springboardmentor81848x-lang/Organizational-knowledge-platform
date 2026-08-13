package com.knowledgegap.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.knowledgegap.dto.EmployeeSkillRequest;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;

    public EmployeeSkillService(
            EmployeeSkillRepository employeeSkillRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository) {

        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
    }

    // =========================================================
    // SAVE EMPLOYEE SKILL
    // =========================================================

    public EmployeeSkill saveEmployeeSkill(EmployeeSkill employeeSkill) {

        return employeeSkillRepository.save(employeeSkill);
    }

    // =========================================================
    // GET ALL EMPLOYEE SKILLS
    // =========================================================

    public List<EmployeeSkill> getAllEmployeeSkills() {

        return employeeSkillRepository.findAll();
    }

    // =========================================================
    // GET EMPLOYEE SKILL BY ID
    // =========================================================

    public Optional<EmployeeSkill> getEmployeeSkillById(Long id) {

        return employeeSkillRepository.findById(id);
    }

    // =========================================================
    // GET SKILLS BY EMPLOYEE OBJECT
    // =========================================================

    public List<EmployeeSkill> getSkillsByEmployee(
            Employee employee) {

        return employeeSkillRepository.findByEmployee(employee);
    }

    // =========================================================
    // GET SKILLS BY EMPLOYEE ID
    // Example: EMP001
    // =========================================================

    public List<EmployeeSkill> getEmployeeSkillsByEmployee(
            String employeeId) {

        Employee employee =
                employeeRepository
                        .findByEmployeeId(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + employeeId
                                ));

        return employeeSkillRepository.findByEmployee(employee);
    }

    // =========================================================
    // DELETE EMPLOYEE SKILL
    // =========================================================

    public void deleteEmployeeSkill(Long id) {

        employeeSkillRepository.deleteById(id);
    }

    // =========================================================
    // UPDATE EMPLOYEE SKILL MANUALLY
    // =========================================================

    public EmployeeSkill updateEmployeeSkill(
            Long id,
            EmployeeSkill updatedSkill) {

        EmployeeSkill employeeSkill =
                employeeSkillRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee Skill not found"
                                ));

        if (updatedSkill.getCurrentLevel() != null) {

            employeeSkill.setCurrentLevel(
                    updatedSkill.getCurrentLevel()
            );
        }

        if (updatedSkill.getSkill() != null) {

            employeeSkill.setSkill(
                    updatedSkill.getSkill()
            );
        }

        return employeeSkillRepository.save(
                employeeSkill
        );
    }

    // =========================================================
    // ADD EMPLOYEE SKILL
    // =========================================================

    public EmployeeSkill addEmployeeSkill(
            EmployeeSkillRequest request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Employee skill request cannot be null"
            );
        }

        Employee employee =
                employeeRepository
                        .findByEmployeeId(
                                request.getEmployeeId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found: "
                                                + request.getEmployeeId()
                                ));

        Skill skill =
                skillRepository
                        .findById(
                                request.getSkillId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found: "
                                                + request.getSkillId()
                                ));

        EmployeeSkill employeeSkill =
                new EmployeeSkill();

        employeeSkill.setEmployee(employee);

        employeeSkill.setSkill(skill);

        employeeSkill.setCurrentLevel(
                request.getCurrentLevel()
        );

        return employeeSkillRepository.save(
                employeeSkill
        );
    }

    // =========================================================
    // UPDATE SKILL FROM ASSESSMENT
    // =========================================================
    //
    // This method is used after the employee completes
    // an assessment.
    //
    // Example:
    //
    // Java = 100%  -> Level 5
    // SQL  = 80%   -> Level 4
    // DSA  = 60%   -> Level 3
    //
    // =========================================================

    public EmployeeSkill updateSkillFromAssessment(
            Employee employee,
            String skillName,
            int assessmentScore) {

        // -----------------------------------------------------
        // VALIDATE EMPLOYEE
        // -----------------------------------------------------

        if (employee == null) {

            throw new IllegalArgumentException(
                    "Employee cannot be null"
            );
        }

        // -----------------------------------------------------
        // VALIDATE SKILL NAME
        // -----------------------------------------------------

        if (skillName == null ||
                skillName.isBlank()) {

            throw new IllegalArgumentException(
                    "Skill name cannot be empty"
            );
        }

        // -----------------------------------------------------
        // CLEAN SKILL NAME
        // -----------------------------------------------------

        skillName = skillName.trim();

        // -----------------------------------------------------
        // CONVERT SCORE TO LEVEL
        // -----------------------------------------------------

        int level =
                convertScoreToLevel(
                        assessmentScore
                );

        // -----------------------------------------------------
        // IMPORTANT:
        // Create a final variable because we use the
        // skill name inside the lambda below.
        // -----------------------------------------------------

        final String finalSkillName = skillName;

        // -----------------------------------------------------
        // FIND SKILL IN DATABASE
        // -----------------------------------------------------

        Skill skill =
                skillRepository
                        .findBySkillName(
                                finalSkillName
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found in Skill table: "
                                                + finalSkillName
                                ));

        // -----------------------------------------------------
        // CHECK IF EMPLOYEE ALREADY HAS THIS SKILL
        // -----------------------------------------------------

        Optional<EmployeeSkill> existingSkill =
                employeeSkillRepository
                        .findByEmployeeAndSkill(
                                employee,
                                skill
                        );

        EmployeeSkill employeeSkill;

        // -----------------------------------------------------
        // EXISTING SKILL
        // -----------------------------------------------------

        if (existingSkill.isPresent()) {

            employeeSkill =
                    existingSkill.get();

        }

        // -----------------------------------------------------
        // NEW SKILL
        // -----------------------------------------------------

        else {

            employeeSkill =
                    new EmployeeSkill();

            employeeSkill.setEmployee(
                    employee
            );

            employeeSkill.setSkill(
                    skill
            );
        }

        // -----------------------------------------------------
        // UPDATE LEVEL BASED ON ASSESSMENT
        // -----------------------------------------------------

        employeeSkill.setCurrentLevel(
                level
        );

        // -----------------------------------------------------
        // SAVE TO DATABASE
        // -----------------------------------------------------

        return employeeSkillRepository.save(
                employeeSkill
        );
    }

    // =========================================================
    // CONVERT ASSESSMENT SCORE TO SKILL LEVEL
    // =========================================================

    private int convertScoreToLevel(
            int score) {

        if (score >= 90) {

            return 5;
        }

        if (score >= 75) {

            return 4;
        }

        if (score >= 60) {

            return 3;
        }

        if (score >= 40) {

            return 2;
        }

        return 1;
    }
}