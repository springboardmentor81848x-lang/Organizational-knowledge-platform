package com.knowledgegap.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.MentorExpertise;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.MentorExpertiseRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
@Transactional
public class MentorExpertiseService {

    private final MentorExpertiseRepository expertiseRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;

    public MentorExpertiseService(
            MentorExpertiseRepository expertiseRepository,
            EmployeeRepository employeeRepository,
            SkillRepository skillRepository) {

        this.expertiseRepository = expertiseRepository;
        this.employeeRepository = employeeRepository;
        this.skillRepository = skillRepository;
    }

    // =========================================================
    // ADD MENTOR EXPERTISE
    // =========================================================

    public MentorExpertise addExpertise(
            Long mentorId,
            Long skillId,
            Integer proficiencyLevel) {

        // -----------------------------------------------------
        // VALIDATE PROFICIENCY
        // -----------------------------------------------------

        validateProficiency(proficiencyLevel);

        // -----------------------------------------------------
        // FIND MENTOR
        // -----------------------------------------------------

        Employee mentor = employeeRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException(
                        "Mentor not found with ID: " + mentorId));

        // -----------------------------------------------------
        // FIND SKILL
        // -----------------------------------------------------

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new RuntimeException(
                        "Skill not found with ID: " + skillId));

        // -----------------------------------------------------
        // CHECK DUPLICATE
        // -----------------------------------------------------

        if (expertiseRepository
                .existsByMentorIdAndSkillId(
                        mentorId,
                        skillId)) {

            throw new IllegalStateException(
                    "This skill is already added to the mentor's expertise");
        }

        // -----------------------------------------------------
        // CREATE
        // -----------------------------------------------------

        MentorExpertise expertise = new MentorExpertise();

        expertise.setMentor(mentor);
        expertise.setSkill(skill);
        expertise.setProficiencyLevel(proficiencyLevel);

        return expertiseRepository.save(expertise);
    }

    // =========================================================
    // GET ALL EXPERTISE OF A MENTOR
    // =========================================================

    @Transactional(readOnly = true)
    public List<MentorExpertise> getMentorExpertise(
            Long mentorId) {

        // Make sure mentor exists
        employeeRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException(
                        "Mentor not found with ID: " + mentorId));

        return expertiseRepository.findByMentorId(mentorId);
    }

    // =========================================================
    // GET ONE EXPERTISE
    // =========================================================

    @Transactional(readOnly = true)
    public MentorExpertise getExpertiseById(
            Long expertiseId) {

        return expertiseRepository.findById(expertiseId)
                .orElseThrow(() -> new RuntimeException(
                        "Mentor expertise not found"));
    }

    // =========================================================
    // UPDATE EXPERTISE
    // =========================================================

    public MentorExpertise updateExpertise(
            Long expertiseId,
            Integer proficiencyLevel) {

        validateProficiency(proficiencyLevel);

        MentorExpertise expertise =
                expertiseRepository.findById(expertiseId)
                        .orElseThrow(() -> new RuntimeException(
                                "Mentor expertise not found"));

        expertise.setProficiencyLevel(
                proficiencyLevel);

        return expertiseRepository.save(expertise);
    }

    // =========================================================
    // DELETE EXPERTISE
    // =========================================================

    public void deleteExpertise(Long expertiseId) {

        MentorExpertise expertise =
                expertiseRepository.findById(expertiseId)
                        .orElseThrow(() -> new RuntimeException(
                                "Mentor expertise not found"));

        expertiseRepository.delete(expertise);
    }

    // =========================================================
    // GET NUMBER OF EXPERTISE SKILLS
    // =========================================================

    @Transactional(readOnly = true)
    public long countMentorExpertise(Long mentorId) {

        return expertiseRepository.countByMentorId(
                mentorId);
    }

    // =========================================================
    // VALIDATE PROFICIENCY
    // =========================================================

    private void validateProficiency(
            Integer proficiencyLevel) {

        if (proficiencyLevel == null) {

            throw new IllegalArgumentException(
                    "Proficiency level is required");
        }

        if (proficiencyLevel < 1 ||
                proficiencyLevel > 5) {

            throw new IllegalArgumentException(
                    "Proficiency level must be between 1 and 5");
        }
    }
}