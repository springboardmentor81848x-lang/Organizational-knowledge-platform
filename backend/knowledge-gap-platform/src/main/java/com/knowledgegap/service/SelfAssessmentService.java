package com.knowledgegap.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.knowledgegap.dto.SelfAssessmentRequest;
import com.knowledgegap.dto.SelfAssessmentResponse;
import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.EmployeeSkill;
import com.knowledgegap.entity.SelfAssessment;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.repository.EmployeeRepository;
import com.knowledgegap.repository.EmployeeSkillRepository;
import com.knowledgegap.repository.SelfAssessmentRepository;
import com.knowledgegap.repository.SkillRepository;

@Service
@Transactional
public class SelfAssessmentService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final SelfAssessmentRepository selfAssessmentRepository;
    private final SkillRepository skillRepository;

    public SelfAssessmentService(
            EmployeeRepository employeeRepository,
            EmployeeSkillRepository employeeSkillRepository,
            SelfAssessmentRepository selfAssessmentRepository,
            SkillRepository skillRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.selfAssessmentRepository = selfAssessmentRepository;
        this.skillRepository = skillRepository;
    }

    public SelfAssessmentResponse submitSelfAssessment(
            String employeeIdentifier,
            SelfAssessmentRequest request) {

        Employee employee = employeeRepository
                .findByEmployeeId(employeeIdentifier)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found."));

        if (request == null ||
                request.getRatings() == null ||
                request.getRatings().isEmpty()) {

            throw new RuntimeException(
                    "At least one skill rating is required.");
        }

        LocalDateTime now = LocalDateTime.now();

        List<SelfAssessmentResponse.SelfSkillRatingResponse> responses =
                new ArrayList<>();

        for (SelfAssessmentRequest.SelfSkillRatingRequest rating
                : request.getRatings()) {

            if (rating.getSkillName() == null ||
                    rating.getSkillName().isBlank()) {

                throw new RuntimeException(
                        "Skill name is required.");
            }

            if (rating.getLevel() == null ||
                    rating.getLevel() < 1 ||
                    rating.getLevel() > 5) {

                throw new RuntimeException(
                        "Skill level must be between 1 and 5.");
            }

            Skill skill = skillRepository
                    .findBySkillNameIgnoreCase(rating.getSkillName())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Skill not found: "
                                    + rating.getSkillName()));

            /*
             * Make sure the employee actually has this skill
             * in their skill inventory.
             */
            employeeSkillRepository
                    .findByEmployeeAndSkill(employee, skill)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Skill is not assigned to this employee: "
                                    + skill.getSkillName()));

            /*
             * Check whether the employee has already
             * submitted a self-rating for this skill.
             */
            SelfAssessment selfAssessment =
                    selfAssessmentRepository
                            .findByEmployeeAndSkill(employee, skill)
                            .orElseGet(SelfAssessment::new);

            selfAssessment.setEmployee(employee);
            selfAssessment.setSkill(skill);
            selfAssessment.setSelfRating(rating.getLevel());
            selfAssessment.setAssessedAt(now);

            selfAssessmentRepository.save(selfAssessment);

            responses.add(
                    new SelfAssessmentResponse.SelfSkillRatingResponse(
                            skill.getSkillName(),
                            rating.getLevel(),
                            getLevelName(rating.getLevel())
                    )
            );
        }

        SelfAssessmentResponse response =
                new SelfAssessmentResponse();

        response.setEmployeeIdentifier(
                employee.getEmployeeId());

        response.setAssessedAt(now);
        response.setRatings(responses);

        return response;
    }

    @Transactional(readOnly = true)
    public List<SelfAssessmentResponse.SelfSkillRatingResponse>
            getSelfAssessment(String employeeIdentifier) {

        Employee employee = employeeRepository
                .findByEmployeeId(employeeIdentifier)
                .orElseThrow(() ->
                        new RuntimeException("Employee not found."));

        List<SelfAssessment> assessments =
                selfAssessmentRepository
                        .findByEmployeeOrderByAssessedAtDesc(employee);

        List<SelfAssessmentResponse.SelfSkillRatingResponse> response =
                new ArrayList<>();

        for (SelfAssessment assessment : assessments) {

            Integer level = assessment.getSelfRating();

            response.add(
                    new SelfAssessmentResponse.SelfSkillRatingResponse(
                            assessment.getSkill().getSkillName(),
                            level,
                            getLevelName(level)
                    )
            );
        }

        return response;
    }

    private String getLevelName(Integer level) {

        return switch (level) {

            case 1 -> "Beginner";
            case 2 -> "Intermediate";
            case 3 -> "Competent";
            case 4 -> "Advanced";
            case 5 -> "Expert";

            default -> "Unknown";
        };
    }
}
