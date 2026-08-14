package com.knowledgegap.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.AssessmentSkillResultResponse;
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

        this.employeeSkillRepository =
                employeeSkillRepository;

        this.employeeRepository =
                employeeRepository;

        this.skillRepository =
                skillRepository;
    }

    // =========================================================
    // SAVE EMPLOYEE SKILL
    // =========================================================

    public EmployeeSkill saveEmployeeSkill(
            EmployeeSkill employeeSkill) {

        return employeeSkillRepository.save(
                employeeSkill
        );
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

    public Optional<EmployeeSkill> getEmployeeSkillById(
            Long id) {

        return employeeSkillRepository.findById(id);
    }

    // =========================================================
    // GET SKILLS BY EMPLOYEE OBJECT
    // =========================================================

    public List<EmployeeSkill> getSkillsByEmployee(
            Employee employee) {

        return employeeSkillRepository.findByEmployee(
                employee
        );
    }

    // =========================================================
    // GET SKILLS BY EMPLOYEE ID
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
                                )
                        );

        return employeeSkillRepository.findByEmployee(
                employee
        );
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
                                )
                        );

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
                                )
                        );

        Skill skill =
                skillRepository
                        .findById(
                                request.getSkillId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found: "
                                                + request.getSkillId()
                                )
                        );

        // -----------------------------------------------------
        // CHECK IF SKILL ALREADY EXISTS
        // -----------------------------------------------------

        Optional<EmployeeSkill> existingSkill =
                employeeSkillRepository
                        .findByEmployeeAndSkill(
                                employee,
                                skill
                        );

        // -----------------------------------------------------
        // UPDATE EXISTING SKILL
        // -----------------------------------------------------

        if (existingSkill.isPresent()) {

            EmployeeSkill employeeSkill =
                    existingSkill.get();

            employeeSkill.setCurrentLevel(
                    request.getCurrentLevel()
            );

            return employeeSkillRepository.save(
                    employeeSkill
            );
        }

        // -----------------------------------------------------
        // CREATE NEW SKILL
        // -----------------------------------------------------

        EmployeeSkill employeeSkill =
                new EmployeeSkill();

        employeeSkill.setEmployee(
                employee
        );

        employeeSkill.setSkill(
                skill
        );

        employeeSkill.setCurrentLevel(
                request.getCurrentLevel()
        );

        return employeeSkillRepository.save(
                employeeSkill
        );
    }

    // =========================================================
    // REPLACE EMPLOYEE SKILLS FROM LATEST ASSESSMENT
    // =========================================================
    //
    // IMPORTANT:
    //
    // Whenever an assessment is submitted:
    //
    // 1. Delete the employee's previous EmployeeSkill records
    // 2. Read the skills from the latest assessment
    // 3. Create EmployeeSkill records for those skills only
    //
    // Example:
    //
    // OLD:
    // Java
    // SQL
    // Python
    // React
    // Git
    // HTML
    // CSS
    // Spring Boot
    // JavaScript
    // Excel
    // Power BI
    // Docker
    // Linux
    // Testing
    //
    // NEW ASSESSMENT:
    // Java
    // SQL
    // Spring Boot
    // React
    // Git
    //
    // AFTER SUBMISSION:
    // Java
    // SQL
    // Spring Boot
    // React
    // Git
    //
    // =========================================================

    @Transactional
    public void replaceSkillsFromAssessment(
            Employee employee,
            List<AssessmentSkillResultResponse> skillResults) {

        // -----------------------------------------------------
        // VALIDATE EMPLOYEE
        // -----------------------------------------------------

        if (employee == null) {

            throw new IllegalArgumentException(
                    "Employee cannot be null"
            );
        }

        // -----------------------------------------------------
        // DELETE PREVIOUS EMPLOYEE SKILLS
        // -----------------------------------------------------

        employeeSkillRepository.deleteByEmployee(
                employee
        );

        // -----------------------------------------------------
        // IF NO SKILLS WERE FOUND
        // -----------------------------------------------------

        if (skillResults == null ||
                skillResults.isEmpty()) {

            return;
        }

        // -----------------------------------------------------
        // ADD ONLY LATEST ASSESSMENT SKILLS
        // -----------------------------------------------------

        for (
                AssessmentSkillResultResponse result :
                skillResults
        ) {

            if (result == null) {
                continue;
            }

            String skillName =
                    result.getSkillName();

            if (skillName == null ||
                    skillName.isBlank()) {

                continue;
            }

            final String finalSkillName =
                    skillName.trim();

            // -------------------------------------------------
            // FIND SKILL IN SKILL TABLE
            // -------------------------------------------------

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    finalSkillName
                            );

            // -------------------------------------------------
            // SKIP IF SKILL DOES NOT EXIST
            // -------------------------------------------------

            if (skillOptional.isEmpty()) {

                System.out.println(
                        "Skill not found in Skill table: "
                                + finalSkillName
                );

                continue;
            }

            Skill skill =
                    skillOptional.get();

            // -------------------------------------------------
            // CONVERT ASSESSMENT SCORE TO LEVEL
            // -------------------------------------------------

            int level =
                    convertScoreToLevel(
                            result.getActualScore()
                    );

            // -------------------------------------------------
            // CREATE EMPLOYEE SKILL
            // -------------------------------------------------

            EmployeeSkill employeeSkill =
                    new EmployeeSkill();

            employeeSkill.setEmployee(
                    employee
            );

            employeeSkill.setSkill(
                    skill
            );

            employeeSkill.setCurrentLevel(
                    level
            );

            // -------------------------------------------------
            // SAVE
            // -------------------------------------------------

            employeeSkillRepository.save(
                    employeeSkill
            );
        }
    }

    // =========================================================
    // UPDATE SKILL FROM SINGLE ASSESSMENT RESULT
    // =========================================================
    //
    // This method can still be used elsewhere if required.
    //
    // =========================================================

    public EmployeeSkill updateSkillFromAssessment(
            Employee employee,
            String skillName,
            int assessmentScore) {

        if (employee == null) {

            throw new IllegalArgumentException(
                    "Employee cannot be null"
            );
        }

        if (skillName == null ||
                skillName.isBlank()) {

            throw new IllegalArgumentException(
                    "Skill name cannot be empty"
            );
        }

        final String finalSkillName =
                skillName.trim();

        int level =
                convertScoreToLevel(
                        assessmentScore
                );

        Skill skill =
                skillRepository
                        .findBySkillNameIgnoreCase(
                                finalSkillName
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found in Skill table: "
                                                + finalSkillName
                                )
                        );

        Optional<EmployeeSkill> existingSkill =
                employeeSkillRepository
                        .findByEmployeeAndSkill(
                                employee,
                                skill
                        );

        EmployeeSkill employeeSkill;

        if (existingSkill.isPresent()) {

            employeeSkill =
                    existingSkill.get();

        } else {

            employeeSkill =
                    new EmployeeSkill();

            employeeSkill.setEmployee(
                    employee
            );

            employeeSkill.setSkill(
                    skill
            );
        }

        employeeSkill.setCurrentLevel(
                level
        );

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