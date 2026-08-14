package com.knowledgeiq.service;

import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MentorshipService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private MentorshipSessionRepository sessionRepository;

    @Autowired
    private SkillRepository skillRepository;

    public List<User> findMentorsForSkill(UUID skillId, UUID menteeId) {
        List<EmployeeSkill> skilledEmployees = employeeSkillRepository.findAll().stream()
                .filter(es -> es.getSkill().getId().equals(skillId) && es.getProficiencyLevel() >= 4)
                .filter(es -> !es.getUser().getId().equals(menteeId))
                .collect(Collectors.toList());

        return skilledEmployees.stream()
                .map(EmployeeSkill::getUser)
                .distinct()
                .collect(Collectors.toList());
    }

    public MentorshipSession requestSession(UUID mentorId, UUID menteeId, UUID skillId, String notes) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found: " + mentorId));
        User mentee = userRepository.findById(menteeId)
                .orElseThrow(() -> new RuntimeException("Mentee not found: " + menteeId));
        Skill skill = skillRepository.findById(skillId).orElse(null);

        MentorshipSession session = new MentorshipSession();
        session.setMentor(mentor);
        session.setMentee(mentee);
        session.setFocusSkill(skill);
        session.setNotes(notes);
        session.setStatus("REQUESTED");

        return sessionRepository.save(session);
    }

    public List<MentorshipSession> getUserSessions(UUID userId) {
        return sessionRepository.findByMentorIdOrMenteeId(userId, userId);
    }
}
