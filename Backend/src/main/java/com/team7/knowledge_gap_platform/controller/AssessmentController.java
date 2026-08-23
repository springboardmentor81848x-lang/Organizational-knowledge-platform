package com.team7.knowledge_gap_platform.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.knowledge_gap_platform.dto.AssessmentComparisonResponse;
import com.team7.knowledge_gap_platform.dto.AssessmentResultResponse;
import com.team7.knowledge_gap_platform.dto.AssessmentSubmitRequest;
import com.team7.knowledge_gap_platform.entity.Assessment;
import com.team7.knowledge_gap_platform.entity.AssessmentQuestion;
import com.team7.knowledge_gap_platform.entity.AssessmentResult;
import com.team7.knowledge_gap_platform.service.AssessmentService;

@RestController
@RequestMapping("/assessments")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(
            AssessmentService assessmentService) {

        this.assessmentService =
                assessmentService;
    }

    @PostMapping
    public ResponseEntity<Assessment> createAssessment(
            @RequestBody Assessment assessment) {

        return ResponseEntity.ok(
                assessmentService
                        .createAssessment(
                                assessment)
        );
    }

    @GetMapping("/skill/{skillId}")
    public ResponseEntity<Assessment> getAssessmentBySkill(
            @PathVariable Long skillId) {

        return ResponseEntity.ok(
                assessmentService
                        .getAssessmentBySkillId(
                                skillId)
        );
    }

    @GetMapping(
            "/skill/{skillId}/type/{assessmentType}")
    public ResponseEntity<Assessment>
    getAssessmentBySkillAndType(
            @PathVariable Long skillId,
            @PathVariable String assessmentType) {

        return ResponseEntity.ok(
                assessmentService
                        .getAssessmentBySkillIdAndType(
                                skillId,
                                assessmentType)
        );
    }

    @GetMapping(
            "/by-skill/{skillId}/questions")
    public ResponseEntity<List<AssessmentQuestion>>
    getQuestionsBySkill(
            @PathVariable Long skillId) {

        Assessment assessment =
                assessmentService
                        .getAssessmentBySkillId(
                                skillId);

        return ResponseEntity.ok(
                assessmentService
                        .getQuestions(
                                assessment.getId())
        );
    }

    @GetMapping(
            "/skill/{skillId}/type/{assessmentType}/questions")
    public ResponseEntity<List<AssessmentQuestion>>
    getQuestionsBySkillAndType(
            @PathVariable Long skillId,
            @PathVariable String assessmentType) {

        Assessment assessment =
                assessmentService
                        .getAssessmentBySkillIdAndType(
                                skillId,
                                assessmentType);

        List<AssessmentQuestion> questions =
                assessmentService
                        .getQuestions(
                                assessment.getId());

        if (questions.isEmpty()) {

            Assessment defaultAssessment =
                    assessmentService
                            .getAssessmentBySkillId(
                                    skillId);

            questions =
                    assessmentService
                            .getQuestions(
                                    defaultAssessment
                                            .getId());
        }

        return ResponseEntity.ok(
                questions);
    }

    @PostMapping("/questions")
    public ResponseEntity<AssessmentQuestion>
    addQuestion(
            @RequestBody AssessmentQuestion question) {

        return ResponseEntity.ok(
                assessmentService
                        .addQuestion(
                                question)
        );
    }

    @GetMapping("/{assessmentId}/questions")
    public ResponseEntity<List<AssessmentQuestion>>
    getQuestions(
            @PathVariable Long assessmentId) {

        return ResponseEntity.ok(
                assessmentService
                        .getQuestions(
                                assessmentId)
        );
    }

    @PostMapping("/{assessmentId}/submit")
    public ResponseEntity<AssessmentResultResponse>
    submitAssessment(
            @PathVariable Long assessmentId,
            @RequestBody AssessmentSubmitRequest request) {

        return ResponseEntity.ok(
                assessmentService
                        .submitAssessment(
                                assessmentId,
                                request)
        );
    }

    // =========================================================
    // HISTORICAL ASSESSMENT RESULTS
    // =========================================================

    @GetMapping(
            "/results/employee/{employeeId}/skill/{skillId}")
    public ResponseEntity<List<AssessmentResult>>
    getHistoricalResults(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {

        return ResponseEntity.ok(
                assessmentService
                        .getHistoricalResults(
                                employeeId,
                                skillId)
        );
    }

    // =========================================================
    // SELF + PEER + MANAGER COMPARISON
    // =========================================================

    @GetMapping(
            "/results/employee/{employeeId}/skill/{skillId}/comparison")
    public ResponseEntity<AssessmentComparisonResponse>
    getAssessmentComparison(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {

        return ResponseEntity.ok(
                assessmentService
                        .getAssessmentComparison(
                                employeeId,
                                skillId)
        );
    }
}