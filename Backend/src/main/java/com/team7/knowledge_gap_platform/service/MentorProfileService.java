package com.team7.knowledge_gap_platform.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.entity.Skill;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;
import com.team7.knowledge_gap_platform.repository.SkillRepository;
import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.entity.MentorProfile;
import com.team7.knowledge_gap_platform.repository.MentorProfileRepository;

@Service
public class MentorProfileService {

    private final MentorProfileRepository repository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final com.team7.knowledge_gap_platform.repository.EmployeeRepository employeeRepository;

    public MentorProfileService(MentorProfileRepository repository,
                                EmployeeSkillRepository employeeSkillRepository,
                                SkillRepository skillRepository,
                                com.team7.knowledge_gap_platform.repository.EmployeeRepository employeeRepository) {
        this.repository = repository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
        this.employeeRepository = employeeRepository;
    }

    public MentorProfile create(MentorProfile profile) {
        return repository.save(profile);
    }

    public List<MentorProfile> getAll() {
        return repository.findAll().stream()
                .filter(this::isMentorEligible)
                .collect(Collectors.toList());
    }

    public MentorProfile getById(Long id) {
        MentorProfile profile = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));
        if (!isMentorEligible(profile)) {
            throw new RuntimeException("Target user is not eligible to be a mentor.");
        }
        return profile;
    }

    private boolean isMentorEligible(MentorProfile profile) {
        if (profile == null || profile.getEmployeeId() == null) return false;
        return employeeRepository.findById(profile.getEmployeeId())
                .map(emp -> "EMPLOYEE".equalsIgnoreCase(emp.getRole()) || "MENTOR".equalsIgnoreCase(emp.getRole()))
                .orElse(false);
    }

    private boolean isEmployeeMentorEligible(Long employeeId) {
        if (employeeId == null) return false;
        return employeeRepository.findById(employeeId)
                .map(emp -> "EMPLOYEE".equalsIgnoreCase(emp.getRole()) || "MENTOR".equalsIgnoreCase(emp.getRole()))
                .orElse(false);
    }

    /**
     * Enhanced search:
     * 1. Finds registered mentors matching expertise.
     * 2. Finds employees with EXPERT/ADVANCED proficiency in matching skills.
     */
    public List<MentorProfile> search(String expertise) {
        if ("All".equalsIgnoreCase(expertise)) {
            List<MentorProfile> allMentors = getAll();
            Set<Long> foundEmployeeIds = allMentors.stream()
                    .map(MentorProfile::getEmployeeId)
                    .collect(Collectors.toSet());

            List<MentorProfile> allResults = new ArrayList<>(allMentors);

            List<Skill> allSkills = skillRepository.findAll();
            for (Skill skill : allSkills) {
                List<EmployeeSkill> experts = employeeSkillRepository.findAll().stream()
                        .filter(es -> es.getSkillId().equals(skill.getId()))
                        .filter(es -> "EXPERT".equalsIgnoreCase(es.getProficiencyLevel()) || "ADVANCED".equalsIgnoreCase(es.getProficiencyLevel()))
                        .filter(es -> isEmployeeMentorEligible(es.getEmployeeId()))
                        .collect(Collectors.toList());

                for (EmployeeSkill expert : experts) {
                    if (expert.getEmployeeId().equals(1L)) continue;
                    if (!foundEmployeeIds.contains(expert.getEmployeeId())) {
                        MentorProfile suggested = new MentorProfile();
                        suggested.setEmployeeId(expert.getEmployeeId());
                        suggested.setExpertise(skill.getSkillName());
                        suggested.setExperienceYears(expert.getProficiencyLevel().equalsIgnoreCase("EXPERT") ? 5 : 4);
                        suggested.setAvailability("Available (Suggested Expert)");
                        suggested.setBio("Top performer in " + skill.getSkillName() + " (" + expert.getProficiencyLevel() + " level). Reach out for peer mentoring.");
                        
                        allResults.add(suggested);
                        foundEmployeeIds.add(expert.getEmployeeId());
                    }
                }
            }
            return allResults;
        }

        List<MentorProfile> registeredMentors = repository.findByExpertiseContainingIgnoreCase(expertise).stream()
                .filter(this::isMentorEligible)
                .collect(Collectors.toList());
        
        Set<Long> foundEmployeeIds = registeredMentors.stream()
                .map(MentorProfile::getEmployeeId)
                .collect(Collectors.toSet());
        
        List<MentorProfile> allResults = new ArrayList<>(registeredMentors);

        List<Skill> matchingSkills = skillRepository.findAll().stream()
                .filter(s -> s.getSkillName().toLowerCase().contains(expertise.toLowerCase()))
                .collect(Collectors.toList());

        for (Skill skill : matchingSkills) {
            List<EmployeeSkill> experts = employeeSkillRepository.findAll().stream()
                    .filter(es -> es.getSkillId().equals(skill.getId()))
                    .filter(es -> "EXPERT".equalsIgnoreCase(es.getProficiencyLevel()) || "ADVANCED".equalsIgnoreCase(es.getProficiencyLevel()))
                    .filter(es -> isEmployeeMentorEligible(es.getEmployeeId()))
                    .collect(Collectors.toList());

            for (EmployeeSkill expert : experts) {
                if (expert.getEmployeeId().equals(1L)) continue;

                if (!foundEmployeeIds.contains(expert.getEmployeeId())) {
                    MentorProfile suggested = new MentorProfile();
                    suggested.setEmployeeId(expert.getEmployeeId());
                    suggested.setExpertise(skill.getSkillName());
                    suggested.setExperienceYears(expert.getProficiencyLevel().equalsIgnoreCase("EXPERT") ? 5 : 3);
                    suggested.setAvailability("Available (Suggested Expert)");
                    suggested.setBio("Suggested peer expert based on high proficiency in " + skill.getSkillName());
                    
                    allResults.add(suggested);
                    foundEmployeeIds.add(expert.getEmployeeId());
                }
            }
        }

        return allResults;
    }
}