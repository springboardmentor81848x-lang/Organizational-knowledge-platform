package com.knowledgegap.service;

import com.knowledgegap.dto.MentorRecommendationDTO;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.entity.Mentorship;
import com.knowledgegap.entity.Skill;

import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.KnowledgeGapRepository;
import com.knowledgegap.repository.MentorshipRepository;
import com.knowledgegap.repository.SkillRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
public class MentorshipService {

    private final MentorshipRepository mentorshipRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final SkillRepository skillRepository;

    // Notification service
    private final NotificationService notificationService;

    public MentorshipService(
            MentorshipRepository mentorshipRepository,
            EmployeeSkillRepository employeeSkillRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            SkillRepository skillRepository,
            NotificationService notificationService) {

        this.mentorshipRepository = mentorshipRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.skillRepository = skillRepository;

        this.notificationService = notificationService;
    }

    // =========================================================
    // GET ALL MENTORSHIPS
    // =========================================================

    public List<Mentorship> getAllMentorships() {

        return mentorshipRepository.findAll();
    }

    // =========================================================
    // GET MENTORSHIPS FOR MENTEE
    // =========================================================

    public List<Mentorship> getMentorshipsByMentee(
            Employee employee) {

        return mentorshipRepository.findByMentee(employee);
    }

    // =========================================================
    // GET MENTORSHIPS FOR MENTOR
    // =========================================================

    public List<Mentorship> getMentorshipsByMentor(
            Employee employee) {

        return mentorshipRepository.findByMentor(employee);
    }

    // =========================================================
    // FIND MENTOR RECOMMENDATIONS
    // =========================================================

    public List<MentorRecommendationDTO>
    getMentorRecommendations(Employee mentee) {

        List<MentorRecommendationDTO> recommendations =
                new ArrayList<>();

        // -----------------------------------------------------
        // Validate mentee
        // -----------------------------------------------------

        if (mentee == null) {
            return recommendations;
        }

        // -----------------------------------------------------
        // Get employee knowledge gaps
        // -----------------------------------------------------

        List<KnowledgeGap> gaps =
                knowledgeGapRepository.findByEmployee(mentee);

        if (gaps == null || gaps.isEmpty()) {
            return recommendations;
        }

        // -----------------------------------------------------
        // Check every skill gap
        // -----------------------------------------------------

        for (KnowledgeGap gap : gaps) {

            if (gap == null ||
                    gap.getSkill() == null) {

                continue;
            }

            Skill requiredSkill =
                    gap.getSkill();

            // -------------------------------------------------
            // Employee current skill level
            // -------------------------------------------------

            Integer employeeLevel =
                    gap.getCurrentLevel();

            if (employeeLevel == null) {
                employeeLevel = 0;
            }

            // -------------------------------------------------
            // Find employees who have this skill
            // -------------------------------------------------

            List<EmployeeSkill> employeeSkills =
                    employeeSkillRepository
                            .findBySkill(requiredSkill);

            if (employeeSkills == null ||
                    employeeSkills.isEmpty()) {

                continue;
            }

            // -------------------------------------------------
            // Check potential mentors
            // -------------------------------------------------

            for (EmployeeSkill employeeSkill :
                    employeeSkills) {

                if (employeeSkill == null ||
                        employeeSkill.getEmployee() == null) {

                    continue;
                }

                Employee potentialMentor =
                        employeeSkill.getEmployee();

                // -------------------------------------------------
                // Don't recommend employee themselves
                // -------------------------------------------------

                if (potentialMentor.getId()
                        .equals(mentee.getId())) {

                    continue;
                }

                // -------------------------------------------------
                // Mentor proficiency
                // -------------------------------------------------

                Integer mentorLevel =
                        employeeSkill.getCurrentLevel();

                if (mentorLevel == null) {
                    continue;
                }

                // -------------------------------------------------
                // Mentor must have higher proficiency
                // -------------------------------------------------

                if (mentorLevel > employeeLevel) {

                    MentorRecommendationDTO recommendation =
                            new MentorRecommendationDTO(

                                    potentialMentor.getId(),

                                    potentialMentor
                                            .getEmployeeId(),

                                    potentialMentor
                                            .getFirstName(),

                                    potentialMentor
                                            .getLastName(),

                                    potentialMentor
                                            .getEmail(),

                                    potentialMentor
                                            .getDesignation(),

                                    requiredSkill.getId(),

                                    requiredSkill
                                            .getSkillName(),

                                    mentorLevel
                            );

                    // -------------------------------------------------
                    // Avoid duplicate mentor + skill
                    // -------------------------------------------------

                    boolean alreadyExists =
                            recommendations.stream()
                                    .anyMatch(existing ->
                                            existing.getId()
                                                    .equals(
                                                            recommendation
                                                                    .getId()
                                                    )
                                            &&
                                            existing.getSkillId()
                                                    .equals(
                                                            recommendation
                                                                    .getSkillId()
                                                    )
                                    );

                    if (!alreadyExists) {

                        recommendations.add(
                                recommendation
                        );
                    }
                }
            }
        }

        return recommendations;
    }

    // =========================================================
    // CREATE MENTORSHIP REQUEST
    // =========================================================

    public Mentorship createMentorship(
            Employee mentee,
            Employee mentor,
            Long skillId,
            String goal) {

        // -----------------------------------------------------
        // Validate employees
        // -----------------------------------------------------

        if (mentee == null ||
                mentor == null) {

            throw new RuntimeException(
                    "Mentee and mentor are required."
            );
        }

        // -----------------------------------------------------
        // Prevent self mentorship
        // -----------------------------------------------------

        if (mentee.getId()
                .equals(mentor.getId())) {

            throw new RuntimeException(
                    "An employee cannot be their own mentor."
            );
        }

        // -----------------------------------------------------
        // Skill is required
        // -----------------------------------------------------

        if (skillId == null) {

            throw new RuntimeException(
                    "Skill is required for mentorship request."
            );
        }

        // -----------------------------------------------------
        // Find skill
        // -----------------------------------------------------

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
        // Create mentorship
        // -----------------------------------------------------

        Mentorship mentorship =
                new Mentorship();

        mentorship.setMentee(mentee);

        mentorship.setMentor(mentor);

        mentorship.setSkill(skill);

        mentorship.setGoal(goal);

        // Initial status
        mentorship.setStatus("REQUESTED");

        // Request date
        mentorship.setStartDate(
                LocalDate.now()
        );

        // -----------------------------------------------------
        // SAVE MENTORSHIP
        // -----------------------------------------------------

        Mentorship savedMentorship =
                mentorshipRepository.save(
                        mentorship
                );

        // =====================================================
        // CREATE NOTIFICATION FOR MENTOR
        // =====================================================

        String menteeName =
                (
                    mentee.getFirstName() != null
                        ? mentee.getFirstName()
                        : ""
                )
                +
                (
                    mentee.getLastName() != null
                        ? " " + mentee.getLastName()
                        : ""
                );

        String notificationMessage =
                "New mentorship request from "
                        + menteeName
                        + " for "
                        + skill.getSkillName()
                        + ".";

        notificationService.createNotification(
                mentor,
                "MENTORSHIP_REQUEST",
                notificationMessage
        );

        // -----------------------------------------------------
        // Return saved mentorship
        // -----------------------------------------------------

        return savedMentorship;
    }

    // =========================================================
    // ACCEPT MENTORSHIP
    // =========================================================

    public Mentorship acceptMentorship(
            Long mentorshipId) {

        // -----------------------------------------------------
        // Find mentorship
        // -----------------------------------------------------

        Mentorship mentorship =
                mentorshipRepository
                        .findById(mentorshipId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mentorship not found with ID: "
                                                + mentorshipId
                                )
                        );

        // -----------------------------------------------------
        // Only REQUESTED mentorship can be accepted
        // -----------------------------------------------------

        if (!"REQUESTED".equalsIgnoreCase(
                mentorship.getStatus())) {

            throw new RuntimeException(
                    "Only requested mentorships can be accepted."
            );
        }

        // -----------------------------------------------------
        // Change status to ACCEPTED
        // -----------------------------------------------------

        mentorship.setStatus("ACCEPTED");

        Mentorship savedMentorship =
                mentorshipRepository.save(
                        mentorship
                );

        // =====================================================
        // CREATE NOTIFICATION FOR EMPLOYEE
        // =====================================================

        Employee mentee =
                mentorship.getMentee();

        Employee mentor =
                mentorship.getMentor();

        String mentorName = "Your mentor";

        if (mentor != null) {

            mentorName =
                    (
                        mentor.getFirstName() != null
                            ? mentor.getFirstName()
                            : ""
                    )
                    +
                    (
                        mentor.getLastName() != null
                            ? " " + mentor.getLastName()
                            : ""
                    );

            mentorName = mentorName.trim();

            if (mentorName.isEmpty()) {
                mentorName = "Your mentor";
            }
        }

        String skillName =
                "the requested skill";

        if (mentorship.getSkill() != null &&
                mentorship.getSkill().getSkillName() != null) {

            skillName =
                    mentorship.getSkill().getSkillName();
        }

        String notificationMessage =
                mentorName
                        + " accepted your mentorship request for "
                        + skillName
                        + ".";

        if (mentee != null) {

            notificationService.createNotification(
                    mentee,
                    "MENTORSHIP_ACCEPTED",
                    notificationMessage
            );
        }

        // -----------------------------------------------------
        // Return updated mentorship
        // -----------------------------------------------------

        return savedMentorship;
    }

    // =========================================================
    // REJECT MENTORSHIP
    // =========================================================

    public Mentorship rejectMentorship(
            Long mentorshipId) {

        Mentorship mentorship =
                mentorshipRepository
                        .findById(mentorshipId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mentorship not found with ID: "
                                                + mentorshipId
                                )
                        );

        if (!"REQUESTED".equalsIgnoreCase(
                mentorship.getStatus())) {

            throw new RuntimeException(
                    "Only requested mentorships can be rejected."
            );
        }

        mentorship.setStatus("REJECTED");

        return mentorshipRepository.save(
                mentorship
        );
    }

    // =========================================================
    // ACTIVATE MENTORSHIP
    // =========================================================

    public Mentorship activateMentorship(
            Long mentorshipId) {

        Mentorship mentorship =
                mentorshipRepository
                        .findById(mentorshipId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mentorship not found."
                                )
                        );

        if (!"ACCEPTED".equalsIgnoreCase(
                mentorship.getStatus())) {

            throw new RuntimeException(
                    "Only accepted mentorships can become active."
            );
        }

        mentorship.setStatus("ACTIVE");

        return mentorshipRepository.save(
                mentorship
        );
    }

    // =========================================================
    // COMPLETE MENTORSHIP
    // =========================================================

    public Mentorship completeMentorship(
            Long mentorshipId) {

        Mentorship mentorship =
                mentorshipRepository
                        .findById(mentorshipId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Mentorship not found."
                                )
                        );

        if (!"ACTIVE".equalsIgnoreCase(
                mentorship.getStatus())) {

            throw new RuntimeException(
                    "Only active mentorships can be completed."
            );
        }

        mentorship.setStatus("COMPLETED");

        mentorship.setEndDate(
                LocalDate.now()
        );

        return mentorshipRepository.save(
                mentorship
        );
    }
}