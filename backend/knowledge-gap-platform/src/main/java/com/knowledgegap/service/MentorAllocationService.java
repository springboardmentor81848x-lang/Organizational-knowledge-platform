package com.knowledgegap.service;

import com.knowledgegap.dto.MentorRecommendationDTO;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.MentorAllocation;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.MentorAllocationRepository;
import com.knowledgegap.repository.SkillRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@Transactional
public class MentorAllocationService {

    private final MentorAllocationRepository allocationRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final NotificationService notificationService;

    public MentorAllocationService(
            MentorAllocationRepository allocationRepository,
            SkillRepository skillRepository,
            EmployeeSkillRepository employeeSkillRepository,
            NotificationService notificationService) {

        this.allocationRepository = allocationRepository;
        this.skillRepository = skillRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // ADMIN / HR ALLOCATE MENTOR
    // =========================================================

    public MentorAllocation allocateMentor(
            Employee employee,
            Employee mentor,
            Long skillId,
            Employee recommendedBy,
            String reason) {

        if (employee == null) {
            throw new RuntimeException(
                    "Employee is required."
            );
        }

        if (mentor == null) {
            throw new RuntimeException(
                    "Mentor is required."
            );
        }

        // -----------------------------------------------------
        // Prevent self allocation
        // -----------------------------------------------------

        if (employee.getId().equals(mentor.getId())) {

            throw new RuntimeException(
                    "Employee cannot be assigned as their own mentor."
            );
        }

        // -----------------------------------------------------
        // Validate mentor role
        // -----------------------------------------------------

        if (mentor.getRole() == null ||
                !"MENTOR".equalsIgnoreCase(
                        mentor.getRole().getRoleName())) {

            throw new RuntimeException(
                    "Selected employee is not a mentor."
            );
        }

        // -----------------------------------------------------
        // Validate skill
        // -----------------------------------------------------

        if (skillId == null) {

            throw new RuntimeException(
                    "Skill is required."
            );
        }

        Skill skill =
                skillRepository
                        .findById(skillId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found with ID: "
                                                + skillId
                                )
                        );

        // -----------------------------------------------------
        // Check mentor has this skill
        // -----------------------------------------------------

        EmployeeSkill mentorSkill =
                employeeSkillRepository
                        .findByEmployeeAndSkill(
                                mentor,
                                skill
                        )
                        .orElse(null);

        if (mentorSkill == null) {

            throw new RuntimeException(
                    "Selected mentor does not have the selected skill."
            );
        }

        // -----------------------------------------------------
        // Check mentor proficiency
        // -----------------------------------------------------

        Integer mentorLevel =
                mentorSkill.getCurrentLevel();

        if (mentorLevel == null ||
                mentorLevel <= 0) {

            throw new RuntimeException(
                    "Selected mentor does not have a valid proficiency level for this skill."
            );
        }

        // -----------------------------------------------------
        // Prevent duplicate active recommendation
        // -----------------------------------------------------

        boolean alreadyExists =
                allocationRepository
                        .findByEmployeeAndMentorAndSkillAndStatus(
                                employee,
                                mentor,
                                skill,
                                "RECOMMENDED"
                        )
                        .isPresent();

        if (alreadyExists) {

            throw new RuntimeException(
                    "This mentor is already recommended for this employee and skill."
            );
        }

        // -----------------------------------------------------
        // Create allocation
        // -----------------------------------------------------

        MentorAllocation allocation =
                new MentorAllocation();

        allocation.setEmployee(employee);
        allocation.setMentor(mentor);
        allocation.setSkill(skill);
        allocation.setRecommendedBy(recommendedBy);
        allocation.setReason(reason);
        allocation.setStatus("RECOMMENDED");
        allocation.setCreatedAt(
                LocalDateTime.now()
        );

        MentorAllocation saved =
                allocationRepository.save(
                        allocation
                );

        // -----------------------------------------------------
        // Notify employee
        // -----------------------------------------------------

        String mentorName =
                ((mentor.getFirstName() != null)
                        ? mentor.getFirstName()
                        : "")
                +
                ((mentor.getLastName() != null)
                        ? " " + mentor.getLastName()
                        : "");

        mentorName = mentorName.trim();

        if (mentorName.isEmpty()) {
            mentorName = "A mentor";
        }

        String notificationMessage =
                mentorName
                        + " has been recommended as your mentor for "
                        + skill.getSkillName()
                        + ".";

        notificationService.createNotification(
                employee,
                "MENTOR_RECOMMENDATION",
                notificationMessage
        );

        return saved;
    }

    // =========================================================
    // GET MENTORS FOR SKILL
    //
    // Only employees with MENTOR role are returned.
    // Only mentors who actually have the skill are returned.
    // Highest proficiency is shown first.
    // =========================================================

    public List<MentorRecommendationDTO>
    getMentorsForSkill(Long skillId) {

        if (skillId == null) {

            throw new RuntimeException(
                    "Skill ID is required."
            );
        }

        Skill skill =
                skillRepository
                        .findById(skillId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Skill not found with ID: "
                                                + skillId
                                )
                        );

        /*
         * We use findAll() here so this does not require
         * adding a new method to EmployeeSkillRepository.
         */
        List<EmployeeSkill> allEmployeeSkills =
                employeeSkillRepository.findAll();

        List<EmployeeSkill> matchingMentorSkills =
                new ArrayList<>();

        for (EmployeeSkill employeeSkill :
                allEmployeeSkills) {

            if (employeeSkill == null) {
                continue;
            }

            Employee mentor =
                    employeeSkill.getEmployee();

            if (mentor == null) {
                continue;
            }

            // -------------------------------------------------
            // Only MENTOR role
            // -------------------------------------------------

            if (mentor.getRole() == null ||
                    mentor.getRole().getRoleName() == null ||
                    !"MENTOR".equalsIgnoreCase(
                            mentor.getRole().getRoleName())) {

                continue;
            }

            // -------------------------------------------------
            // Only selected skill
            // -------------------------------------------------

            if (employeeSkill.getSkill() == null ||
                    employeeSkill.getSkill().getId() == null) {

                continue;
            }

            if (!employeeSkill.getSkill()
                    .getId()
                    .equals(skill.getId())) {

                continue;
            }

            // -------------------------------------------------
            // Valid proficiency only
            // -------------------------------------------------

            Integer level =
                    employeeSkill.getCurrentLevel();

            if (level == null || level <= 0) {
                continue;
            }

            matchingMentorSkills.add(
                    employeeSkill
            );
        }

        // -----------------------------------------------------
        // Highest proficiency first
        // -----------------------------------------------------

        matchingMentorSkills.sort(
                Comparator.comparing(
                        EmployeeSkill::getCurrentLevel,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        // -----------------------------------------------------
        // Convert to DTO
        // -----------------------------------------------------

        List<MentorRecommendationDTO> result =
                new ArrayList<>();

        for (EmployeeSkill employeeSkill :
                matchingMentorSkills) {

            Employee mentor =
                    employeeSkill.getEmployee();

            Integer mentorLevel =
                    employeeSkill.getCurrentLevel();

            MentorRecommendationDTO dto =
                    new MentorRecommendationDTO(
                            mentor.getId(),
                            mentor.getEmployeeId(),
                            mentor.getFirstName(),
                            mentor.getLastName(),
                            mentor.getEmail(),
                            mentor.getDesignation(),
                            skill.getId(),
                            skill.getSkillName(),
                            mentorLevel
                    );

            result.add(dto);
        }

        return result;
    }

    // =========================================================
    // EMPLOYEE VIEW RECOMMENDED MENTORS
    // =========================================================

    public List<MentorRecommendationDTO>
    getEmployeeRecommendations(Employee employee) {

        List<MentorAllocation> allocations =
                allocationRepository
                        .findByEmployeeAndStatus(
                                employee,
                                "RECOMMENDED"
                        );

        List<MentorRecommendationDTO> result =
                new ArrayList<>();

        for (MentorAllocation allocation :
                allocations) {

            if (allocation == null) {
                continue;
            }

            Employee mentor =
                    allocation.getMentor();

            Skill skill =
                    allocation.getSkill();

            if (mentor == null ||
                    skill == null) {

                continue;
            }

            // -------------------------------------------------
            // Get mentor's actual skill level
            // -------------------------------------------------

            EmployeeSkill mentorSkill =
                    employeeSkillRepository
                            .findByEmployeeAndSkill(
                                    mentor,
                                    skill
                            )
                            .orElse(null);

            if (mentorSkill == null ||
                    mentorSkill.getCurrentLevel() == null) {

                continue;
            }

            Integer mentorLevel =
                    mentorSkill.getCurrentLevel();

            // -------------------------------------------------
            // Create DTO
            // -------------------------------------------------

            MentorRecommendationDTO dto =
                    new MentorRecommendationDTO(
                            mentor.getId(),
                            mentor.getEmployeeId(),
                            mentor.getFirstName(),
                            mentor.getLastName(),
                            mentor.getEmail(),
                            mentor.getDesignation(),
                            skill.getId(),
                            skill.getSkillName(),
                            mentorLevel
                    );

            result.add(dto);
        }

        return result;
    }

    // =========================================================
    // ADMIN / HR VIEW ALL ALLOCATIONS
    // =========================================================

    public List<MentorAllocation>
    getAllAllocations() {

        return allocationRepository.findAll();
    }

    // =========================================================
    // EMPLOYEE VIEW OWN ALLOCATIONS
    // =========================================================

    public List<MentorAllocation>
    getAllocationsForEmployee(
            Employee employee) {

        return allocationRepository
                .findByEmployee(employee);
    }

    // =========================================================
    // MENTOR VIEW ALLOCATIONS
    // =========================================================

    public List<MentorAllocation>
    getAllocationsForMentor(
            Employee mentor) {

        return allocationRepository
                .findByMentor(mentor);
    }
}