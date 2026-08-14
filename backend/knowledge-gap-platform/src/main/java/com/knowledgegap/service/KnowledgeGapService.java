package com.knowledgegap.service;

import com.knowledgegap.dto.HRKnowledgeGapResponse;
import com.knowledgegap.entity.AssessmentAttempt;
import com.knowledgegap.entity.AssessmentGapResult;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Role;
import com.knowledgegap.entity.Skill;

import com.knowledgegap.repository.AssessmentAttemptRepository;
import com.knowledgegap.repository.AssessmentGapResultRepository;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.RoleRepository;
import com.knowledgegap.repository.SkillRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class KnowledgeGapService {

    private final KnowledgeGapRepository knowledgeGapRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final AssessmentGapResultRepository assessmentGapResultRepository;
    private final EmployeeRepository employeeRepository;
    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;

    public KnowledgeGapService(
            KnowledgeGapRepository knowledgeGapRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            AssessmentGapResultRepository assessmentGapResultRepository,
            EmployeeRepository employeeRepository,
            RoleRepository roleRepository,
            SkillRepository skillRepository) {

        this.knowledgeGapRepository =
                knowledgeGapRepository;

        this.assessmentAttemptRepository =
                assessmentAttemptRepository;

        this.assessmentGapResultRepository =
                assessmentGapResultRepository;

        this.employeeRepository =
                employeeRepository;

        this.roleRepository =
                roleRepository;

        this.skillRepository =
                skillRepository;
    }

    // =========================================================
    // SAVE KNOWLEDGE GAP
    // =========================================================

    public KnowledgeGap saveKnowledgeGap(
            KnowledgeGap knowledgeGap) {

        return knowledgeGapRepository.save(
                knowledgeGap
        );
    }

    // =========================================================
    // GET ALL KNOWLEDGE GAPS
    // =========================================================

    public List<KnowledgeGap> getAllKnowledgeGaps() {

        return knowledgeGapRepository.findAll();
    }

    // =========================================================
    // GET KNOWLEDGE GAP BY ID
    // =========================================================

    public Optional<KnowledgeGap> getKnowledgeGapById(
            Long id) {

        return knowledgeGapRepository.findById(id);
    }

    // =========================================================
    // GET KNOWLEDGE GAPS BY EMPLOYEE
    // =========================================================

    public List<KnowledgeGap> getKnowledgeGapsByEmployee(
            Employee employee) {

        return knowledgeGapRepository.findByEmployee(
                employee
        );
    }

    // =========================================================
    // GET LATEST ASSESSMENT ATTEMPT
    // =========================================================

    private Optional<AssessmentAttempt>
    getLatestAssessmentAttempt(
            Employee employee) {

        return assessmentAttemptRepository
                .findFirstByEmployeeOrderByIdDesc(
                        employee
                );
    }

    // =========================================================
    // GET TARGET ROLE FROM LATEST ASSESSMENT
    // =========================================================

    public String getLatestAssessmentTargetRole(
            Employee employee) {

        Optional<AssessmentAttempt> latestAttempt =
                getLatestAssessmentAttempt(employee);

        if (latestAttempt.isEmpty()) {
            return "Not Assigned";
        }

        AssessmentAttempt attempt =
                latestAttempt.get();

        if (attempt.getAssessment() == null) {
            return "Not Assigned";
        }

        Long roleId =
                attempt.getAssessment()
                        .getAssessmentRoleId();

        if (roleId == null) {
            return "Not Assigned";
        }

        return roleRepository
                .findById(roleId)
                .map(Role::getRoleName)
                .orElse("Not Assigned");
    }

    // =========================================================
    // DETECT AND SAVE KNOWLEDGE GAPS
    //
    // IMPORTANT:
    //
    // This method DOES NOT use EmployeeSkill.
    //
    // It uses the latest persisted AssessmentGapResult.
    // =========================================================

    @Transactional
    public List<KnowledgeGap> detectAndSaveGaps(
            Employee employee) {

        if (employee == null) {
            return List.of();
        }

        // -----------------------------------------------------
        // 1. GET LATEST ASSESSMENT ATTEMPT
        // -----------------------------------------------------

        Optional<AssessmentAttempt> latestAttempt =
                getLatestAssessmentAttempt(employee);

        if (latestAttempt.isEmpty()) {

            System.out.println(
                    "No assessment attempt found for employee: "
                            + employee.getEmployeeId()
            );

            return List.of();
        }

        AssessmentAttempt attempt =
                latestAttempt.get();

        // -----------------------------------------------------
        // 2. CHECK ASSESSMENT
        // -----------------------------------------------------

        if (attempt.getAssessment() == null) {

            System.out.println(
                    "Latest assessment attempt has no assessment."
            );

            return List.of();
        }

        // -----------------------------------------------------
        // 3. GET TARGET ROLE
        // -----------------------------------------------------

        Long roleId =
                attempt.getAssessment()
                        .getAssessmentRoleId();

        if (roleId == null) {

            System.out.println(
                    "Assessment does not have a target role."
            );

            return List.of();
        }

        Role role =
                roleRepository
                        .findById(roleId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Role not found with ID: "
                                                + roleId
                                )
                        );

        String targetRole =
                role.getRoleName();

        System.out.println(
                "=================================="
        );

        System.out.println(
                "Assessment-Based Knowledge Gap Detection"
        );

        System.out.println(
                "Employee: "
                        + employee.getEmployeeId()
        );

        System.out.println(
                "Target Role: "
                        + targetRole
        );

        // -----------------------------------------------------
        // 4. GET PERSISTED ASSESSMENT GAP RESULTS
        // -----------------------------------------------------

        List<AssessmentGapResult> assessmentResults =
                assessmentGapResultRepository
                        .findByAttempt(attempt);

        System.out.println(
                "Assessment Gap Results: "
                        + assessmentResults.size()
        );

        if (assessmentResults.isEmpty()) {

            System.out.println(
                    "No persisted assessment gap results found."
            );

            return List.of();
        }

        // -----------------------------------------------------
        // 5. DELETE PREVIOUS KNOWLEDGE GAPS
        // -----------------------------------------------------

        knowledgeGapRepository.deleteByEmployee(
                employee
        );

        List<KnowledgeGap> gapResults =
                new ArrayList<>();

        // -----------------------------------------------------
        // 6. CONVERT ASSESSMENT RESULTS
        //    INTO KNOWLEDGE GAPS
        // -----------------------------------------------------

        for (AssessmentGapResult result :
                assessmentResults) {

            if (result == null) {
                continue;
            }

            String skillName =
                    result.getSkillName();

            if (skillName == null ||
                    skillName.trim().isEmpty()) {

                continue;
            }

            Integer actualScore =
                    result.getActualScore() != null
                            ? result.getActualScore()
                            : 0;

            Integer requiredScore =
                    result.getRequiredScore() != null
                            ? result.getRequiredScore()
                            : 70;

            Integer assessmentGap =
                    result.getGap() != null
                            ? result.getGap()
                            : Math.max(
                                    0,
                                    requiredScore - actualScore
                            );

            System.out.println(
                    "Skill: "
                            + skillName
                            + " | Actual: "
                            + actualScore
                            + "%"
                            + " | Required: "
                            + requiredScore
                            + "%"
                            + " | Gap: "
                            + assessmentGap
            );

            // -------------------------------------------------
            // FIND SKILL ENTITY
            // -------------------------------------------------

            Optional<Skill> skillOptional =
                    skillRepository
                            .findBySkillName(
                                    skillName
                            );

            if (skillOptional.isEmpty()) {

                System.out.println(
                        "Skill not found in Skill table: "
                                + skillName
                );

                continue;
            }

            Skill skill =
                    skillOptional.get();

            // -------------------------------------------------
            // SAVE ONLY ACTUAL GAPS
            // -------------------------------------------------

            if (assessmentGap > 0) {

                KnowledgeGap knowledgeGap =
                        new KnowledgeGap();

                knowledgeGap.setEmployee(
                        employee
                );

                knowledgeGap.setSkill(
                        skill
                );

                /*
                 * Convert percentage score into
                 * the existing 1-5 level system.
                 *
                 * 0-20   -> 1
                 * 21-40  -> 2
                 * 41-60  -> 3
                 * 61-80  -> 4
                 * 81-100 -> 5
                 */

                int currentLevel =
                        Math.min(
                                5,
                                Math.max(
                                        1,
                                        (int) Math.ceil(
                                                actualScore / 20.0
                                        )
                                )
                        );

                int requiredLevel =
                        Math.min(
                                5,
                                Math.max(
                                        1,
                                        (int) Math.ceil(
                                                requiredScore / 20.0
                                        )
                                )
                        );

                /*
                 * Gap is stored using the existing
                 * 1-5 level scale.
                 */

                int levelGap =
                        Math.max(
                                0,
                                requiredLevel - currentLevel
                        );

                knowledgeGap.setCurrentLevel(
                        currentLevel
                );

                knowledgeGap.setRequiredLevel(
                        requiredLevel
                );

                knowledgeGap.setGap(
                        levelGap
                );

                knowledgeGap.setGeneratedDate(
                        LocalDateTime.now()
                );

                gapResults.add(
                        knowledgeGapRepository.save(
                                knowledgeGap
                        )
                );
            }
        }

        System.out.println(
                "Total Knowledge Gaps Saved: "
                        + gapResults.size()
        );

        System.out.println(
                "=================================="
        );

        return gapResults;
    }

    // =========================================================
    // GAP STATUS
    // =========================================================

    private String getGapStatus(
            double averageGap) {

        if (averageGap == 0) {
            return "No Gap";
        }

        if (averageGap <= 1) {
            return "Low";
        }

        if (averageGap <= 2) {
            return "Medium";
        }

        if (averageGap <= 3) {
            return "High";
        }

        return "Critical";
    }

    // =========================================================
    // DELETE KNOWLEDGE GAP
    // =========================================================

    public void deleteKnowledgeGap(Long id) {

        knowledgeGapRepository.deleteById(id);
    }

    // =========================================================
    // HR KNOWLEDGE GAP ANALYSIS
    // =========================================================

    public HRKnowledgeGapResponse
    getHRKnowledgeGapAnalysis() {

        List<Employee> employees =
                employeeRepository
                        .findByRoleRoleName(
                                "EMPLOYEE"
                        );

        List<KnowledgeGap> allGaps =
                knowledgeGapRepository
                        .findAll()
                        .stream()
                        .filter(gap ->
                                gap.getEmployee() != null &&
                                employees.contains(
                                        gap.getEmployee()
                                ))
                        .toList();

        long totalEmployees =
                employees.size();

        long employeesWithGaps =
                allGaps.stream()
                        .map(gap ->
                                gap.getEmployee().getId())
                        .distinct()
                        .count();

        long totalKnowledgeGaps =
                allGaps.size();

        double averageGap =
                allGaps.stream()
                        .filter(gap ->
                                gap.getGap() != null)
                        .mapToInt(
                                KnowledgeGap::getGap
                        )
                        .average()
                        .orElse(0.0);

        // -----------------------------------------------------
        // GAP DISTRIBUTION
        // -----------------------------------------------------

        HRKnowledgeGapResponse.GapDistribution
                distribution =
                new HRKnowledgeGapResponse
                        .GapDistribution();

        for (KnowledgeGap gap : allGaps) {

            int value =
                    gap.getGap() != null
                            ? gap.getGap()
                            : 0;

            if (value == 1) {

                distribution.setLow(
                        distribution.getLow() + 1
                );

            } else if (value == 2) {

                distribution.setMedium(
                        distribution.getMedium() + 1
                );

            } else if (value == 3) {

                distribution.setHigh(
                        distribution.getHigh() + 1
                );

            } else if (value >= 4) {

                distribution.setCritical(
                        distribution.getCritical() + 1
                );
            }
        }

        // -----------------------------------------------------
        // TOP SKILLS WITH GAPS
        // -----------------------------------------------------

        Map<String, List<KnowledgeGap>>
                skillGroups =
                allGaps.stream()
                        .filter(gap ->
                                gap.getSkill() != null)
                        .collect(
                                Collectors.groupingBy(
                                        gap ->
                                                gap.getSkill()
                                                        .getSkillName()
                                )
                        );

        List<HRKnowledgeGapResponse.TopSkillGap>
                topSkills =
                skillGroups.entrySet()
                        .stream()
                        .map(entry -> {

                            String skillName =
                                    entry.getKey();

                            List<KnowledgeGap> gaps =
                                    entry.getValue();

                            long affectedEmployees =
                                    gaps.stream()
                                            .map(gap ->
                                                    gap.getEmployee()
                                                            .getId())
                                            .distinct()
                                            .count();

                            double avgGap =
                                    gaps.stream()
                                            .filter(gap ->
                                                    gap.getGap() != null)
                                            .mapToInt(
                                                    KnowledgeGap::getGap
                                            )
                                            .average()
                                            .orElse(0.0);

                            return new HRKnowledgeGapResponse
                                    .TopSkillGap(
                                            skillName,
                                            affectedEmployees,
                                            Math.round(
                                                    avgGap * 100.0
                                            ) / 100.0
                                    );
                        })
                        .sorted(
                                Comparator.comparingLong(
                                        HRKnowledgeGapResponse
                                                .TopSkillGap
                                                ::getEmployeesAffected
                                ).reversed()
                        )
                        .limit(5)
                        .toList();

        // -----------------------------------------------------
        // EMPLOYEE PERFORMANCE
        // -----------------------------------------------------

        List<HRKnowledgeGapResponse
                .EmployeeGapAnalysis>
                employeePerformance =
                employees.stream()
                        .map(employee -> {

                            Optional<AssessmentAttempt>
                                    latestAttempt =
                                    getLatestAssessmentAttempt(
                                            employee
                                    );

                            double assessmentScore =
                                    latestAttempt
                                            .map(attempt ->
                                                    attempt.getOverallScore() != null
                                                            ? attempt
                                                                    .getOverallScore()
                                                            : 0.0
                                            )
                                            .orElse(0.0);

                            List<KnowledgeGap>
                                    employeeGaps =
                                    allGaps.stream()
                                            .filter(gap ->
                                                    gap.getEmployee()
                                                            .getId()
                                                            .equals(
                                                                    employee
                                                                            .getId()
                                                            ))
                                            .toList();

                            double employeeAverageGap =
                                    employeeGaps.stream()
                                            .filter(gap ->
                                                    gap.getGap() != null)
                                            .mapToInt(
                                                    KnowledgeGap::getGap
                                            )
                                            .average()
                                            .orElse(0.0);

                            String status =
                                    getGapStatus(
                                            employeeAverageGap
                                    );

                            String name =
                                    employee.getFirstName()
                                            + " "
                                            + employee.getLastName();

                            return new HRKnowledgeGapResponse
                                    .EmployeeGapAnalysis(
                                            employee.getEmployeeId(),
                                            name,
                                            employee.getDesignation(),
                                            Math.round(
                                                    assessmentScore
                                                            * 100.0
                                            ) / 100.0,
                                            Math.round(
                                                    employeeAverageGap
                                                            * 100.0
                                            ) / 100.0,
                                            status
                                    );
                        })
                        .toList();

        // -----------------------------------------------------
        // CRITICAL GAPS
        // -----------------------------------------------------

        long criticalGaps =
                allGaps.stream()
                        .filter(gap ->
                                gap.getGap() != null &&
                                gap.getGap() >= 4)
                        .count();

        // -----------------------------------------------------
        // RESPONSE
        // -----------------------------------------------------

        HRKnowledgeGapResponse response =
                new HRKnowledgeGapResponse();

        response.setTotalEmployees(
                totalEmployees
        );

        response.setEmployeesWithGaps(
                employeesWithGaps
        );

        response.setTotalKnowledgeGaps(
                totalKnowledgeGaps
        );

        response.setAverageGap(
                Math.round(
                        averageGap * 100.0
                ) / 100.0
        );

        response.setCriticalGaps(
                criticalGaps
        );

        response.setGapDistribution(
                distribution
        );

        response.setTopSkills(
                topSkills
        );

        response.setEmployeePerformance(
                employeePerformance
        );

        return response;
    }
}