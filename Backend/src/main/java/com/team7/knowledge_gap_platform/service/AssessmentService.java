package com.team7.knowledge_gap_platform.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.dto.AssessmentAnswerRequest;
import com.team7.knowledge_gap_platform.dto.AssessmentResultResponse;
import com.team7.knowledge_gap_platform.dto.AssessmentSubmitRequest;
import com.team7.knowledge_gap_platform.entity.Assessment;
import com.team7.knowledge_gap_platform.entity.AssessmentQuestion;
import com.team7.knowledge_gap_platform.entity.AssessmentResult;
import com.team7.knowledge_gap_platform.entity.EmployeeSkill;
import com.team7.knowledge_gap_platform.repository.AssessmentQuestionRepository;
import com.team7.knowledge_gap_platform.repository.AssessmentRepository;
import com.team7.knowledge_gap_platform.repository.AssessmentResultRepository;
import com.team7.knowledge_gap_platform.repository.EmployeeSkillRepository;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;
    private final AssessmentQuestionRepository assessmentQuestionRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final EmployeeSkillRepository employeeSkillRepository;

    public AssessmentService(
            AssessmentRepository assessmentRepository,
            AssessmentQuestionRepository assessmentQuestionRepository,
            AssessmentResultRepository assessmentResultRepository,
            EmployeeSkillRepository employeeSkillRepository) {

        this.assessmentRepository = assessmentRepository;
        this.assessmentQuestionRepository = assessmentQuestionRepository;
        this.assessmentResultRepository = assessmentResultRepository;
        this.employeeSkillRepository = employeeSkillRepository;
    }

    public Assessment createAssessment(Assessment assessment) {
        return assessmentRepository.save(assessment);
    }

    public AssessmentQuestion addQuestion(AssessmentQuestion question) {
        return assessmentQuestionRepository.save(question);
    }

    public List<AssessmentQuestion> getQuestions(Long assessmentId) {
        return assessmentQuestionRepository.findByAssessmentId(assessmentId);
    }

    public AssessmentResultResponse submitAssessment(
            Long assessmentId,
            AssessmentSubmitRequest request) {

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() ->
                        new RuntimeException("Assessment not found"));

        List<AssessmentQuestion> questions =
                assessmentQuestionRepository.findByAssessmentId(assessmentId);

        if (questions.isEmpty()) {
            throw new RuntimeException("No questions found for assessment");
        }

        int correctAnswers = 0;

        for (AssessmentAnswerRequest answer : request.getAnswers()) {

            AssessmentQuestion question =
                    assessmentQuestionRepository.findById(answer.getQuestionId())
                            .orElse(null);

            if (question == null) {
                continue;
            }

            if (!question.getAssessmentId().equals(assessmentId)) {
                continue;
            }

            if (question.getCorrectAnswer() != null
                    && answer.getSelectedAnswer() != null
                    && question.getCorrectAnswer()
                            .equalsIgnoreCase(
                                    answer.getSelectedAnswer())) {

                correctAnswers++;
            }
        }

        int totalQuestions = questions.size();

        double scorePercentage =
                ((double) correctAnswers / totalQuestions) * 100.0;

        String proficiencyLevel =
                getProficiencyLevel(scorePercentage);

        AssessmentResult result = new AssessmentResult();

        result.setAssessmentId(assessmentId);
        result.setEmployeeId(request.getEmployeeId());
        result.setSkillId(assessment.getSkillId());
        result.setCorrectAnswers(correctAnswers);
        result.setTotalQuestions(totalQuestions);
        result.setScorePercentage(scorePercentage);
        result.setProficiencyLevel(proficiencyLevel);
        result.setCompletedAt(LocalDateTime.now());

        assessmentResultRepository.save(result);

        updateEmployeeSkill(
                request.getEmployeeId(),
                assessment.getSkillId(),
                proficiencyLevel
        );

        AssessmentResultResponse response =
                new AssessmentResultResponse();

        response.setAssessmentId(assessmentId);
        response.setEmployeeId(request.getEmployeeId());
        response.setSkillId(assessment.getSkillId());
        response.setCorrectAnswers(correctAnswers);
        response.setTotalQuestions(totalQuestions);
        response.setScorePercentage(scorePercentage);
        response.setProficiencyLevel(proficiencyLevel);

        return response;
    }

    private void updateEmployeeSkill(
            Long employeeId,
            Long skillId,
            String proficiencyLevel) {

        EmployeeSkill employeeSkill =
                employeeSkillRepository
                        .findByEmployeeIdAndSkillId(
                                employeeId,
                                skillId)
                        .orElseGet(() -> {

                            EmployeeSkill newSkill =
                                    new EmployeeSkill();

                            newSkill.setEmployeeId(employeeId);
                            newSkill.setSkillId(skillId);

                            return newSkill;
                        });

        employeeSkill.setProficiencyLevel(proficiencyLevel);

        employeeSkillRepository.save(employeeSkill);
    }

    private String getProficiencyLevel(double score) {

        if (score >= 90) {
            return "Expert";
        }

        if (score >= 75) {
            return "Advanced";
        }

        if (score >= 50) {
            return "Intermediate";
        }

        if (score >= 25) {
            return "Beginner";
        }

        return "Unaware";
    }
}