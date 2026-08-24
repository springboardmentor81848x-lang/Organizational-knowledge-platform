package com.knowledgegap.service;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.Mentorship;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.MentorshipRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class MentorManagementService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final MentorshipRepository mentorshipRepository;
    private final MentorshipService mentorshipService;

    public MentorManagementService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            MentorshipRepository mentorshipRepository,
            MentorshipService mentorshipService) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.mentorshipRepository = mentorshipRepository;
        this.mentorshipService = mentorshipService;
    }

    // =========================================================
    // DASHBOARD SUMMARY
    // =========================================================

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary() {

        Map<String, Object> summary = new HashMap<>();

        List<Map<String, Object>> mentors = getAllMentors();
        List<Map<String, Object>> requests = getMentorRequests();
        List<Map<String, Object>> active = getActiveMentorships();
        List<Map<String, Object>> history = getMentorshipHistory();

        summary.put("totalMentors", mentors.size());
        summary.put("pendingRequests", requests.size());
        summary.put("activeMentorships", active.size());

        long completedCount = history.stream()
                .filter(item ->
                        "COMPLETED".equalsIgnoreCase(
                                String.valueOf(item.get("status"))
                        )
                )
                .count();

        summary.put("completedMentorships", completedCount);

        return summary;
    }

    // =========================================================
    // GET ALL MENTORS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAllMentors() {

        List<Map<String, Object>> mentors = new ArrayList<>();

        List<Employee> employees = employeeRepository.findAll();

        for (Employee employee : employees) {

            if (employee == null ||
                    employee.getRole() == null ||
                    employee.getRole().getRoleName() == null) {
                continue;
            }

            if (!"MENTOR".equalsIgnoreCase(
                    employee.getRole().getRoleName())) {
                continue;
            }

            Map<String, Object> mentor = new HashMap<>();

            mentor.put("id", employee.getId());
            mentor.put("employeeId", employee.getEmployeeId());
            mentor.put("firstName", employee.getFirstName());
            mentor.put("lastName", employee.getLastName());
            mentor.put("email", employee.getEmail());
            mentor.put("designation", employee.getDesignation());

            List<Map<String, Object>> expertise =
                    getExpertiseForEmployee(employee);

            mentor.put("expertise", expertise);
            mentor.put("expertiseCount", expertise.size());

            mentors.add(mentor);
        }

        return mentors;
    }

    // =========================================================
    // GET MENTOR PROFILE
    // =========================================================
    // IMPORTANT:
    // This is the method your controller was missing.
    //
    // Supports both:
    //   MEN001 -> business employeeId
    //   50     -> database employee id
    // =========================================================

    @Transactional(readOnly = true)
    public Map<String, Object> getMentorProfile(
            String employeeIdentifier) {

        Employee mentor = findEmployee(employeeIdentifier);

        validateMentor(mentor);

        Map<String, Object> profile = new HashMap<>();

        profile.put("id", mentor.getId());
        profile.put("employeeId", mentor.getEmployeeId());
        profile.put("firstName", mentor.getFirstName());
        profile.put("lastName", mentor.getLastName());
        profile.put("email", mentor.getEmail());
        profile.put("designation", mentor.getDesignation());

        if (mentor.getRole() != null) {
            profile.put(
                    "role",
                    mentor.getRole().getRoleName()
            );
        }

        List<Map<String, Object>> expertise =
                getExpertiseForEmployee(mentor);

        profile.put("expertise", expertise);
        profile.put("expertiseCount", expertise.size());

        return profile;
    }

    // =========================================================
    // FIND EMPLOYEE
    // =========================================================

    private Employee findEmployee(String employeeIdentifier) {

        if (employeeIdentifier == null ||
                employeeIdentifier.trim().isEmpty()) {

            throw new RuntimeException(
                    "Employee identifier cannot be empty"
            );
        }

        String identifier = employeeIdentifier.trim();

        /*
         * First try business employeeId.
         *
         * Example:
         * MEN001
         * EMP1001
         */

        Employee employee =
                employeeRepository
                        .findByEmployeeId(identifier)
                        .orElse(null);

        if (employee != null) {
            return employee;
        }

        /*
         * If not found, try database primary-key ID.
         *
         * Example:
         * 50
         * 43
         */

        try {

            Long databaseId = Long.parseLong(identifier);

            return employeeRepository
                    .findById(databaseId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Employee not found: "
                                            + employeeIdentifier
                            )
                    );

        } catch (NumberFormatException e) {

            throw new RuntimeException(
                    "Employee not found: "
                            + employeeIdentifier
            );
        }
    }

    // =========================================================
    // GET MENTOR EXPERTISE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getExpertise(
            String employeeIdentifier) {

        Employee mentor = findEmployee(employeeIdentifier);

        validateMentor(mentor);

        return getExpertiseForEmployee(mentor);
    }

    // =========================================================
    // INTERNAL EXPERTISE METHOD
    // =========================================================

    private List<Map<String, Object>> getExpertiseForEmployee(
            Employee mentor) {

        List<Map<String, Object>> expertise =
                new ArrayList<>();

        List<EmployeeSkill> employeeSkills =
                employeeSkillRepository.findByEmployee(mentor);

        if (employeeSkills == null) {
            return expertise;
        }

        for (EmployeeSkill employeeSkill : employeeSkills) {

            if (employeeSkill == null ||
                    employeeSkill.getSkill() == null) {
                continue;
            }

            Map<String, Object> skill =
                    new HashMap<>();

            skill.put(
                    "skillId",
                    employeeSkill.getSkill().getId()
            );

            skill.put(
                    "skillName",
                    employeeSkill.getSkill().getSkillName()
            );

            skill.put(
                    "category",
                    employeeSkill.getSkill().getCategory()
            );

            skill.put(
                    "description",
                    employeeSkill.getSkill().getDescription()
            );

            skill.put(
                    "currentLevel",
                    employeeSkill.getCurrentLevel()
            );

            skill.put(
                    "levelName",
                    getLevelName(
                            employeeSkill.getCurrentLevel()
                    )
            );

            expertise.add(skill);
        }

        return expertise;
    }

    // =========================================================
    // SKILL LEVEL NAME
    // =========================================================

    private String getLevelName(Integer level) {

        if (level == null) {
            return "Not Rated";
        }

        switch (level) {

            case 1:
                return "Beginner";

            case 2:
                return "Elementary";

            case 3:
                return "Intermediate";

            case 4:
                return "Advanced";

            case 5:
                return "Expert";

            default:
                return "Not Rated";
        }
    }

    // =========================================================
    // GET MENTOR REQUESTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMentorRequests() {

        List<Map<String, Object>> requests =
                new ArrayList<>();

        List<Mentorship> mentorships =
                mentorshipRepository.findAll();

        for (Mentorship mentorship : mentorships) {

            if (mentorship == null ||
                    mentorship.getMentor() == null) {
                continue;
            }

            if (!"REQUESTED".equalsIgnoreCase(
                    mentorship.getStatus())) {
                continue;
            }

            requests.add(
                    convertMentorshipToMap(mentorship)
            );
        }

        return requests;
    }

    // =========================================================
    // GET ACTIVE MENTORSHIPS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getActiveMentorships() {

        List<Map<String, Object>> active =
                new ArrayList<>();

        List<Mentorship> mentorships =
                mentorshipRepository.findAll();

        for (Mentorship mentorship : mentorships) {

            if (mentorship == null) {
                continue;
            }

            String status = mentorship.getStatus();

            if ("ACTIVE".equalsIgnoreCase(status) ||
                    "ACCEPTED".equalsIgnoreCase(status)) {

                active.add(
                        convertMentorshipToMap(mentorship)
                );
            }
        }

        return active;
    }

    // =========================================================
    // GET MENTORSHIP HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMentorshipHistory() {

        List<Map<String, Object>> history =
                new ArrayList<>();

        List<Mentorship> mentorships =
                mentorshipRepository.findAll();

        for (Mentorship mentorship : mentorships) {

            if (mentorship == null) {
                continue;
            }

            String status = mentorship.getStatus();

            if ("COMPLETED".equalsIgnoreCase(status) ||
                    "REJECTED".equalsIgnoreCase(status)) {

                history.add(
                        convertMentorshipToMap(mentorship)
                );
            }
        }

        return history;
    }

    // =========================================================
    // CONVERT MENTORSHIP TO SAFE RESPONSE
    // =========================================================

    private Map<String, Object> convertMentorshipToMap(
            Mentorship mentorship) {

        Map<String, Object> data =
                new HashMap<>();

        data.put("id", mentorship.getId());
        data.put("status", mentorship.getStatus());
        data.put("goal", mentorship.getGoal());
        data.put("startDate", mentorship.getStartDate());
        data.put("endDate", mentorship.getEndDate());

        // -----------------------------------------------------
        // MENTEE
        // -----------------------------------------------------

        Employee mentee =
                mentorship.getMentee();

        if (mentee != null) {

            Map<String, Object> menteeData =
                    new HashMap<>();

            menteeData.put("id", mentee.getId());
            menteeData.put(
                    "employeeId",
                    mentee.getEmployeeId()
            );
            menteeData.put(
                    "firstName",
                    mentee.getFirstName()
            );
            menteeData.put(
                    "lastName",
                    mentee.getLastName()
            );
            menteeData.put(
                    "email",
                    mentee.getEmail()
            );

            data.put("mentee", menteeData);
        }

        // -----------------------------------------------------
        // MENTOR
        // -----------------------------------------------------

        Employee mentor =
                mentorship.getMentor();

        if (mentor != null) {

            Map<String, Object> mentorData =
                    new HashMap<>();

            mentorData.put("id", mentor.getId());

            mentorData.put(
                    "employeeId",
                    mentor.getEmployeeId()
            );

            mentorData.put(
                    "firstName",
                    mentor.getFirstName()
            );

            mentorData.put(
                    "lastName",
                    mentor.getLastName()
            );

            mentorData.put(
                    "email",
                    mentor.getEmail()
            );

            mentorData.put(
                    "designation",
                    mentor.getDesignation()
            );

            data.put("mentor", mentorData);
        }

        // -----------------------------------------------------
        // SKILL
        // -----------------------------------------------------

        if (mentorship.getSkill() != null) {

            Map<String, Object> skillData =
                    new HashMap<>();

            skillData.put(
                    "id",
                    mentorship.getSkill().getId()
            );

            skillData.put(
                    "skillName",
                    mentorship.getSkill().getSkillName()
            );

            skillData.put(
                    "category",
                    mentorship.getSkill().getCategory()
            );

            data.put("skill", skillData);
        }

        return data;
    }

    // =========================================================
    // ACCEPT REQUEST
    // =========================================================

    public Mentorship acceptRequest(Long mentorshipId) {

        return mentorshipService
                .acceptMentorship(mentorshipId);
    }

    // =========================================================
    // REJECT REQUEST
    // =========================================================

    public Mentorship rejectRequest(Long mentorshipId) {

        return mentorshipService
                .rejectMentorship(mentorshipId);
    }

    // =========================================================
    // ACTIVATE MENTORSHIP
    // =========================================================

    public Mentorship activateMentorship(Long mentorshipId) {

        return mentorshipService
                .activateMentorship(mentorshipId);
    }

    // =========================================================
    // COMPLETE MENTORSHIP
    // =========================================================

    public Mentorship completeMentorship(Long mentorshipId) {

        return mentorshipService
                .completeMentorship(mentorshipId);
    }

    // =========================================================
    // VALIDATE MENTOR
    // =========================================================

    private void validateMentor(Employee employee) {

        if (employee == null) {

            throw new RuntimeException(
                    "Mentor not found"
            );
        }

        if (employee.getRole() == null ||
                employee.getRole().getRoleName() == null ||
                !"MENTOR".equalsIgnoreCase(
                        employee.getRole().getRoleName())) {

            throw new RuntimeException(
                    "Employee is not a mentor"
            );
        }
    }
}