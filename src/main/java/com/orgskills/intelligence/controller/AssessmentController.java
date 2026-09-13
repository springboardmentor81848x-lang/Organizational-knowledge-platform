package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.assessment.AssessmentAttemptStatusResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResponse;
import com.orgskills.intelligence.dto.assessment.AssessmentResultResponse;
import com.orgskills.intelligence.dto.assessment.CreateAssessmentRequest;
import com.orgskills.intelligence.dto.assessment.QuizResponse;
import com.orgskills.intelligence.dto.assessment.QuizResultResponse;
import com.orgskills.intelligence.dto.assessment.QuizSubmissionRequest;
import com.orgskills.intelligence.dto.assessment.CreateReattemptRequest;
import com.orgskills.intelligence.dto.assessment.ReattemptDecisionRequest;
import com.orgskills.intelligence.dto.assessment.ReattemptRequestResponse;
import com.orgskills.intelligence.dto.assessment.SkillProgressionResponse;
import com.orgskills.intelligence.dto.assessment.SubmitAssessmentRequest;
import com.orgskills.intelligence.entity.enums.ReattemptRequestStatus;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AssessmentAttemptService;
import com.orgskills.intelligence.service.AssessmentService;
import com.orgskills.intelligence.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Assessments. An employee sits the marked target-role assessment and reads their own history;
 * assessing or reading somebody else requires a manager, HR or L&amp;D role, which the service
 * checks so the rule stays in one place.
 *
 * <p>The assessment may be taken once. A further attempt has to be unlocked by an approval, so
 * the endpoints below come in two halves: the {@code /quiz/*} ones an employee uses to see where
 * they stand and to ask for another attempt, and the {@code /reattempt-requests} ones an approver
 * uses to rule on those asks.
 */
@RestController
@RequestMapping("/api/assessments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final QuizService quizService;
    private final AssessmentAttemptService assessmentAttemptService;

    /**
     * The question paper for the signed-in employee's target role.
     *
     * <p>Always the caller's own quiz - the user id comes from the token, never from a
     * parameter - so nobody can pull the paper for a role they are not working towards.
     */
    @GetMapping("/quiz")
    public ResponseEntity<QuizResponse> getTargetRoleQuiz(Authentication authentication) {
        return ResponseEntity.ok(quizService.generateQuizForTargetRole(getUserId(authentication)));
    }

    /**
     * Marks the submitted answers and records them as a self-assessment, which is what makes the
     * employee's skill levels, gaps, heatmap and recommendations move.
     */
    @PostMapping("/quiz/submit")
    public ResponseEntity<QuizResultResponse> submitTargetRoleQuiz(
            Authentication authentication,
            @Valid @RequestBody QuizSubmissionRequest request) {
        return ResponseEntity.ok(quizService.submitQuiz(getUserId(authentication), request));
    }

    @PostMapping
    public ResponseEntity<AssessmentResponse> createAssessment(
            Authentication authentication,
            @Valid @RequestBody CreateAssessmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assessmentService.createAssessment(getUserId(authentication), request));
    }

    /**
     * Submits results and runs the whole chain — skill levels, improvement, gap recalculation,
     * recommendations and notification — in a single transaction.
     */
    @PostMapping("/{id}/submit")
    public ResponseEntity<AssessmentResponse> submitAssessment(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SubmitAssessmentRequest request) {
        return ResponseEntity.ok(assessmentService.submitAssessment(getUserId(authentication), id, request));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<List<AssessmentResultResponse>> getResults(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(assessmentService.getResults(getUserId(authentication), id));
    }

    @GetMapping
    public ResponseEntity<List<AssessmentResponse>> getAssessments(
            Authentication authentication,
            @RequestParam(required = false) Long employeeId) {
        return ResponseEntity.ok(assessmentService.getAssessments(getUserId(authentication), employeeId));
    }

    @GetMapping("/history/{employeeId}")
    public ResponseEntity<List<SkillProgressionResponse>> getHistory(
            Authentication authentication,
            @PathVariable Long employeeId) {
        return ResponseEntity.ok(assessmentService.getHistory(getUserId(authentication), employeeId));
    }

    // -- Attempts and the approval that unlocks another one ---------------------

    /**
     * Whether the signed-in employee may sit the assessment right now, and why not if they may
     * not. The client reads this before asking for a paper, so a locked employee is shown the
     * request form rather than a failed request.
     */
    @GetMapping("/quiz/attempt-status")
    public ResponseEntity<AssessmentAttemptStatusResponse> getAttemptStatus(Authentication authentication) {
        return ResponseEntity.ok(assessmentAttemptService.getAttemptStatus(getUserId(authentication)));
    }

    /**
     * Asks a higher authority for another attempt. Always on the caller's own behalf - the
     * employee id comes from the token - so nobody can raise a request in somebody else's name.
     */
    @PostMapping("/quiz/reattempt-requests")
    public ResponseEntity<ReattemptRequestResponse> requestReattempt(
            Authentication authentication,
            @Valid @RequestBody CreateReattemptRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(assessmentAttemptService.requestReattempt(getUserId(authentication), request));
    }

    /** The caller's own requests, newest first. */
    @GetMapping("/quiz/reattempt-requests")
    public ResponseEntity<List<ReattemptRequestResponse>> getMyReattemptRequests(Authentication authentication) {
        return ResponseEntity.ok(assessmentAttemptService.getMyRequests(getUserId(authentication)));
    }

    /**
     * The requests the caller may rule on, optionally narrowed to one state. The service decides
     * whose requests those are: a manager sees their reports, a department head their department,
     * and HR, L&amp;D and administrator accounts the organisation.
     */
    @GetMapping("/reattempt-requests")
    public ResponseEntity<List<ReattemptRequestResponse>> getReattemptRequests(
            Authentication authentication,
            @RequestParam(required = false) ReattemptRequestStatus status) {
        return ResponseEntity.ok(
                assessmentAttemptService.getRequestsForApprover(getUserId(authentication), status));
    }

    @PostMapping("/reattempt-requests/{id}/approve")
    public ResponseEntity<ReattemptRequestResponse> approveReattempt(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ReattemptDecisionRequest request) {
        return ResponseEntity.ok(assessmentAttemptService.decide(
                getUserId(authentication), id, true, request == null ? null : request.getNote()));
    }

    @PostMapping("/reattempt-requests/{id}/reject")
    public ResponseEntity<ReattemptRequestResponse> rejectReattempt(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ReattemptDecisionRequest request) {
        return ResponseEntity.ok(assessmentAttemptService.decide(
                getUserId(authentication), id, false, request == null ? null : request.getNote()));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
