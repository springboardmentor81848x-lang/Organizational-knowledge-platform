package com.knowledgegap.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.AssessmentSkillResultResponse;
import com.knowledgegap.dto.EmployeeSkillRequest;
import com.knowledgegap.dto.ManagerAssessmentSkillResultResponse;
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

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

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

    public EmployeeSkill saveEmployeeSkill(
            EmployeeSkill employeeSkill) {

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

    public Optional<EmployeeSkill> getEmployeeSkillById(
            Long id) {

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
    // GET SKILLS BY EMPLOYEE BUSINESS ID
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
                                )
                        );

        if (updatedSkill.getCurrentLevel() != null) {

            employeeSkill.setCurrentLevel(
                    normalizeLevel(
                            updatedSkill.getCurrentLevel()
                    )
            );
        }

        if (updatedSkill.getSkill() != null) {

            employeeSkill.setSkill(
                    updatedSkill.getSkill()
            );
        }

        return employeeSkillRepository.save(employeeSkill);
    }

    // =========================================================
    // ADD EMPLOYEE SKILL MANUALLY
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
                        .findById(request.getSkillId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found: "
                                                + request.getSkillId()
                                )
                        );

        int level =
                normalizeLevel(
                        request.getCurrentLevel()
                );

        // -----------------------------------------------------
        // CHECK EXISTING SKILL
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

            employeeSkill.setCurrentLevel(level);

            return employeeSkillRepository.save(
                    employeeSkill
            );
        }

        // -----------------------------------------------------
        // CREATE NEW SKILL
        // -----------------------------------------------------

        EmployeeSkill employeeSkill =
                new EmployeeSkill();

        employeeSkill.setEmployee(employee);
        employeeSkill.setSkill(skill);
        employeeSkill.setCurrentLevel(level);

        return employeeSkillRepository.save(
                employeeSkill
        );
    }

    // =========================================================
    // UPDATE EMPLOYEE SKILLS FROM SELF / PEER ASSESSMENT
    // =========================================================
    //
    // Existing skills -> UPDATE
    // New skills      -> INSERT
    // Other skills    -> KEEP
    //
    // =========================================================

    @Transactional
    public void replaceSkillsFromAssessment(
            Employee employee,
            List<AssessmentSkillResultResponse> skillResults) {

        if (employee == null) {

            throw new IllegalArgumentException(
                    "Employee cannot be null"
            );
        }

        if (skillResults == null ||
                skillResults.isEmpty()) {

            System.out.println(
                    "No skill results received from assessment."
            );

            return;
        }

        System.out.println(
                "========================================"
        );

        System.out.println(
                "UPDATING EMPLOYEE SKILLS FROM ASSESSMENT"
        );

        System.out.println(
                "Employee: "
                        + employee.getEmployeeId()
        );

        System.out.println(
                "Number of skill results: "
                        + skillResults.size()
        );

        System.out.println(
                "========================================"
        );

        // -----------------------------------------------------
        // PROCESS EACH SKILL
        // -----------------------------------------------------

        for (AssessmentSkillResultResponse result :
                skillResults) {

            if (result == null) {
                continue;
            }

            String skillName =
                    result.getSkillName();

            if (skillName == null ||
                    skillName.isBlank()) {

                System.out.println(
                        "WARNING: Assessment result has no skill name."
                );

                continue;
            }

            String finalSkillName =
                    skillName.trim();

            int actualScore =
                    result.getActualScore();

            // -------------------------------------------------
            // FIND SKILL
            // -------------------------------------------------

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    finalSkillName
                            );

            if (skillOptional.isEmpty()) {

                System.out.println(
                        "WARNING: Skill not found: "
                                + finalSkillName
                );

                continue;
            }

            Skill skill =
                    skillOptional.get();

            // -------------------------------------------------
            // CONVERT SCORE TO LEVEL
            // -------------------------------------------------

            int level =
                    convertScoreToLevel(
                            actualScore
                    );

            // -------------------------------------------------
            // FIND EXISTING EMPLOYEE SKILL
            // -------------------------------------------------

            Optional<EmployeeSkill> existingSkill =
                    employeeSkillRepository
                            .findByEmployeeAndSkill(
                                    employee,
                                    skill
                            );

            EmployeeSkill employeeSkill;

            // -------------------------------------------------
            // UPDATE EXISTING
            // -------------------------------------------------

            if (existingSkill.isPresent()) {

                employeeSkill =
                        existingSkill.get();

                System.out.println(
                        "Updating skill: "
                                + finalSkillName
                );
            }

            // -------------------------------------------------
            // CREATE NEW
            // -------------------------------------------------

            else {

                employeeSkill =
                        new EmployeeSkill();

                employeeSkill.setEmployee(employee);
                employeeSkill.setSkill(skill);

                System.out.println(
                        "Adding new skill: "
                                + finalSkillName
                );
            }

            // -------------------------------------------------
            // SET LEVEL
            // -------------------------------------------------

            employeeSkill.setCurrentLevel(level);

            employeeSkillRepository.save(
                    employeeSkill
            );

            System.out.println(
                    "SAVED -> "
                            + finalSkillName
                            + " | Score: "
                            + actualScore
                            + "% | Level: "
                            + level
                            + " ("
                            + getLevelName(level)
                            + ")"
            );
        }

        employeeSkillRepository.flush();

        System.out.println(
                "========================================"
        );

        System.out.println(
                "Employee skills updated successfully."
        );

        System.out.println(
                "========================================"
        );
    }

    // =========================================================
    // UPDATE EMPLOYEE SKILLS FROM MANAGER ASSESSMENT
    // =========================================================
    //
    // Manager rating:
    //
    // 1 -> Beginner
    // 2 -> Intermediate
    // 3 -> Competent
    // 4 -> Advanced
    // 5 -> Expert
    //
    // Existing skill -> UPDATE
    // New skill      -> INSERT
    // Other skills   -> KEEP
    //
    // =========================================================

    @Transactional
    public void updateSkillsFromManagerAssessment(
            Employee employee,
            List<ManagerAssessmentSkillResultResponse> skillResults) {

        if (employee == null) {

            throw new IllegalArgumentException(
                    "Employee cannot be null"
            );
        }

        if (skillResults == null ||
                skillResults.isEmpty()) {

            System.out.println(
                    "No manager assessment skill results received."
            );

            return;
        }

        System.out.println(
                "========================================"
        );

        System.out.println(
                "UPDATING EMPLOYEE SKILLS FROM MANAGER ASSESSMENT"
        );

        System.out.println(
                "Employee: "
                        + employee.getEmployeeId()
        );

        System.out.println(
                "Number of skill results: "
                        + skillResults.size()
        );

        System.out.println(
                "========================================"
        );

        // -----------------------------------------------------
        // PROCESS EACH MANAGER RESULT
        // -----------------------------------------------------

        for (ManagerAssessmentSkillResultResponse result :
                skillResults) {

            if (result == null) {
                continue;
            }

            // -------------------------------------------------
            // GET SKILL NAME
            // -------------------------------------------------

            String skillName =
                    result.getSkillName();

            if (skillName == null ||
                    skillName.isBlank()) {

                System.out.println(
                        "WARNING: Manager result has no skill name."
                );

                continue;
            }

            String finalSkillName =
                    skillName.trim();

            // -------------------------------------------------
            // GET MANAGER RATING
            // -------------------------------------------------
            //
            // ManagerAssessmentSkillResultResponse contains:
            //
            // private Integer rating;
            //
            // Therefore we use:
            //
            // result.getRating()
            //
            // -------------------------------------------------

            Integer managerRating =
                    result.getRating();

            if (managerRating == null) {

                System.out.println(
                        "WARNING: No manager rating for skill: "
                                + finalSkillName
                );

                continue;
            }

            // -------------------------------------------------
            // VALIDATE AND CONVERT RATING TO LEVEL
            // -------------------------------------------------

            int level =
                    normalizeLevel(
                            managerRating
                    );

            // -------------------------------------------------
            // FIND SKILL
            // -------------------------------------------------

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillNameIgnoreCase(
                                    finalSkillName
                            );

            if (skillOptional.isEmpty()) {

                System.out.println(
                        "WARNING: Skill not found: "
                                + finalSkillName
                );

                continue;
            }

            Skill skill =
                    skillOptional.get();

            // -------------------------------------------------
            // FIND EXISTING EMPLOYEE SKILL
            // -------------------------------------------------

            Optional<EmployeeSkill> existingSkill =
                    employeeSkillRepository
                            .findByEmployeeAndSkill(
                                    employee,
                                    skill
                            );

            EmployeeSkill employeeSkill;

            // -------------------------------------------------
            // UPDATE EXISTING SKILL
            // -------------------------------------------------

            if (existingSkill.isPresent()) {

                employeeSkill =
                        existingSkill.get();

                System.out.println(
                        "Updating existing manager-assessed skill: "
                                + finalSkillName
                );
            }

            // -------------------------------------------------
            // CREATE NEW SKILL
            // -------------------------------------------------

            else {

                employeeSkill =
                        new EmployeeSkill();

                employeeSkill.setEmployee(
                        employee
                );

                employeeSkill.setSkill(
                        skill
                );

                System.out.println(
                        "Adding new manager-assessed skill: "
                                + finalSkillName
                );
            }

            // -------------------------------------------------
            // SET MANAGER ASSESSED LEVEL
            // -------------------------------------------------

            employeeSkill.setCurrentLevel(
                    level
            );

            employeeSkillRepository.save(
                    employeeSkill
            );

            // -------------------------------------------------
            // LOG RESULT
            // -------------------------------------------------

            System.out.println(
                    "MANAGER ASSESSMENT SAVED -> "
                            + finalSkillName
                            + " | Rating: "
                            + managerRating
                            + " | Level: "
                            + level
                            + " ("
                            + getLevelName(level)
                            + ")"
            );
        }

        // -----------------------------------------------------
        // FORCE DATABASE SAVE
        // -----------------------------------------------------

        employeeSkillRepository.flush();

        System.out.println(
                "========================================"
        );

        System.out.println(
                "Manager assessment skill update completed."
        );

        System.out.println(
                "========================================"
        );
    }

    // =========================================================
    // UPDATE SINGLE SKILL FROM ASSESSMENT
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

        String finalSkillName =
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

            employeeSkill.setEmployee(employee);
            employeeSkill.setSkill(skill);
        }

        employeeSkill.setCurrentLevel(level);

        return employeeSkillRepository.save(
                employeeSkill
        );
    }

    // =========================================================
    // CONVERT ASSESSMENT SCORE TO 1-5 LEVEL
    // =========================================================
    //
    // 90-100 -> Expert       (5)
    // 75-89  -> Advanced     (4)
    // 60-74  -> Competent    (3)
    // 40-59  -> Intermediate (2)
    // 0-39   -> Beginner     (1)
    //
    // =========================================================

    private int convertScoreToLevel(int score) {

        score =
                Math.max(
                        0,
                        Math.min(
                                100,
                                score
                        )
                );

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

    // =========================================================
    // NORMALIZE LEVEL
    // =========================================================
    //
    // 1 = Beginner
    // 2 = Intermediate
    // 3 = Competent
    // 4 = Advanced
    // 5 = Expert
    //
    // =========================================================

    private int normalizeLevel(Integer level) {

        if (level == null) {
            return 1;
        }

        return Math.max(
                1,
                Math.min(
                        5,
                        level
                )
        );
    }

    // =========================================================
    // GET LEVEL NAME
    // =========================================================

    public String getLevelName(int level) {

        switch (level) {

            case 1:
                return "Beginner";

            case 2:
                return "Intermediate";

            case 3:
                return "Competent";

            case 4:
                return "Advanced";

            case 5:
                return "Expert";

            default:
                return "Unknown";
        }
    }
}