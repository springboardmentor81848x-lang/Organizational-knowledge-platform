package com.okgip.controller;

import com.okgip.entity.*;
import com.okgip.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/assessments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssessmentController {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentResultRepository assessmentResultRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private KnowledgeGapRepository knowledgeGapRepository;

    @GetMapping
    public ResponseEntity<?> getAllAssessments() {
        List<Assessment> list = assessmentRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getAssessmentById(@PathVariable Long id) {
        return assessmentRepository.findById(id)
                .map(a -> ResponseEntity.ok(Map.of("success", true, "data", a)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitExam(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long employeeId = body.containsKey("employeeId") ? Long.valueOf(body.get("employeeId").toString()) : 1L;
        List<?> answers = (List<?>) body.get("answers");

        Assessment assessment = assessmentRepository.findById(id).orElse(null);
        Employee employee = employeeRepository.findById(employeeId).orElse(null);

        if (assessment == null || employee == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Assessment or Employee not found"));
        }

        int total = assessment.getQuestions().size();
        int correctCount = 0;
        for (int i = 0; i < total && i < answers.size(); i++) {
            Integer ans = Integer.valueOf(answers.get(i).toString());
            if (ans.equals(assessment.getQuestions().get(i).getCorrectIndex())) {
                correctCount++;
            }
        }

        int scorePercent = total > 0 ? (int) Math.round(((double) correctCount / total) * 100) : 100;
        boolean passed = scorePercent >= assessment.getPassScore();

        // Calculate skill level improvement
        int prevLevel = 2; // e.g. Intermediate
        int newLevel = passed ? Math.min(5, prevLevel + (scorePercent >= 90 ? 2 : 1)) : prevLevel;
        int improvement = newLevel - prevLevel;

        int reqLevel = 4;
        int gapBefore = Math.max(0, reqLevel - prevLevel);
        int gapAfter = Math.max(0, reqLevel - newLevel);

        AssessmentResult result = AssessmentResult.builder()
                .employee(employee)
                .assessment(assessment)
                .skill(assessment.getSkill())
                .assessmentType("SKILL_EXAM")
                .score(scorePercent)
                .passed(passed)
                .previousProficiencyLevel(prevLevel)
                .newProficiencyLevel(newLevel)
                .skillImprovement(improvement)
                .gapBefore(gapBefore)
                .gapAfter(gapAfter)
                .feedback("Assessment completed with " + correctCount + "/" + total + " correct answers.")
                .takenAt(LocalDateTime.now())
                .build();

        AssessmentResult saved = assessmentResultRepository.save(result);

        // Recalculate Knowledge Gap in DB
        List<KnowledgeGap> gaps = knowledgeGapRepository.findByEmployeeId(employeeId);
        for (KnowledgeGap gap : gaps) {
            if (gap.getSkill().getId().equals(assessment.getSkill().getId())) {
                gap.setCurrentLevel(newLevel);
                if (gapAfter == 0) {
                    gap.setStatus("RESOLVED");
                } else {
                    gap.setStatus("IN_TRAINING");
                }
                knowledgeGapRepository.save(gap);
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", passed ? "Congratulations! Skill verified and gap recalculated." : "Assessment completed.",
                "data", saved
        ));
    }

    @PostMapping("/evaluate")
    public ResponseEntity<?> submitEvaluation(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.valueOf(body.get("employeeId").toString());
        Long skillId = Long.valueOf(body.get("skillId").toString());
        Long assessorId = body.containsKey("assessorId") ? Long.valueOf(body.get("assessorId").toString()) : null;
        String type = body.getOrDefault("assessmentType", "MANAGER_EVALUATION").toString(); // SELF, PEER_360, MANAGER_EVALUATION
        Integer evaluatedProficiency = Integer.valueOf(body.get("evaluatedProficiency").toString()); // 1 to 5 scale
        String feedback = body.getOrDefault("feedback", "Demonstrated solid technical execution.").toString();

        Employee emp = employeeRepository.findById(employeeId).orElse(null);
        Skill skill = skillRepository.findById(skillId).orElse(null);

        if (emp == null || skill == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Employee or Skill not found"));
        }

        int prevLevel = 2;
        int improvement = evaluatedProficiency - prevLevel;
        int reqLevel = 4;
        int gapBefore = Math.max(0, reqLevel - prevLevel);
        int gapAfter = Math.max(0, reqLevel - evaluatedProficiency);

        Assessment dummyAssessment = assessmentRepository.findAll().stream().findFirst().orElse(null);

        AssessmentResult result = AssessmentResult.builder()
                .employee(emp)
                .assessment(dummyAssessment)
                .skill(skill)
                .assessorId(assessorId)
                .assessmentType(type)
                .score(evaluatedProficiency * 20)
                .passed(evaluatedProficiency >= 3)
                .previousProficiencyLevel(prevLevel)
                .newProficiencyLevel(evaluatedProficiency)
                .skillImprovement(improvement)
                .gapBefore(gapBefore)
                .gapAfter(gapAfter)
                .feedback(feedback)
                .takenAt(LocalDateTime.now())
                .build();

        AssessmentResult saved = assessmentResultRepository.save(result);

        // Recalculate gap in database
        List<KnowledgeGap> gaps = knowledgeGapRepository.findByEmployeeId(employeeId);
        for (KnowledgeGap gap : gaps) {
            if (gap.getSkill().getId().equals(skillId)) {
                gap.setCurrentLevel(evaluatedProficiency);
                if (gapAfter == 0) {
                    gap.setStatus("RESOLVED");
                }
                knowledgeGapRepository.save(gap);
            }
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", type + " saved. Skill proficiency updated to level " + evaluatedProficiency + ", gap recalculated to " + gapAfter,
                "data", saved
        ));
    }

    @GetMapping("/results/employee/{employeeId}")
    public ResponseEntity<?> getResultsByEmployee(@PathVariable Long employeeId) {
        List<AssessmentResult> list = assessmentResultRepository.findByEmployeeIdOrderByTakenAtDesc(employeeId);
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }
}
