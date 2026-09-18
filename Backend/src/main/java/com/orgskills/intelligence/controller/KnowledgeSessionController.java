package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.session.AttendanceRequest;
import com.orgskills.intelligence.dto.session.SessionFeedbackRequest;
import com.orgskills.intelligence.dto.session.SessionRegistrationResponse;
import com.orgskills.intelligence.dto.session.SessionRequest;
import com.orgskills.intelligence.dto.session.SessionResponse;
import com.orgskills.intelligence.entity.enums.SessionStatus;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.KnowledgeSessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Knowledge-sharing sessions. Hosting, editing, cancelling and attendance are limited to
 * the hosting mentor or an L&D administrator; the service performs that check, since
 * "mentor" is a skill-profile property rather than a role in the security model.
 */
@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class KnowledgeSessionController {

    private final KnowledgeSessionService knowledgeSessionService;

    @PostMapping
    public ResponseEntity<SessionResponse> createSession(
            Authentication authentication,
            @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(knowledgeSessionService.createSession(getUserId(authentication), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionResponse> updateSession(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SessionRequest request) {
        return ResponseEntity.ok(knowledgeSessionService.updateSession(getUserId(authentication), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelSession(Authentication authentication, @PathVariable Long id) {
        knowledgeSessionService.cancelSession(getUserId(authentication), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SessionResponse>> listSessions(
            Authentication authentication,
            @RequestParam(required = false) SessionStatus status,
            @RequestParam(required = false) Long mentorId,
            @RequestParam(defaultValue = "false") boolean availableOnly) {
        return ResponseEntity.ok(knowledgeSessionService.listSessions(
                getUserId(authentication), status, mentorId, availableOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SessionResponse> getSession(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(knowledgeSessionService.getSession(getUserId(authentication), id));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<SessionRegistrationResponse> register(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(knowledgeSessionService.register(getUserId(authentication), id));
    }

    @DeleteMapping("/{id}/register")
    public ResponseEntity<Void> cancelRegistration(Authentication authentication, @PathVariable Long id) {
        knowledgeSessionService.cancelRegistration(getUserId(authentication), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/attendance")
    public ResponseEntity<SessionResponse> markAttendance(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AttendanceRequest request) {
        return ResponseEntity.ok(knowledgeSessionService.markAttendance(getUserId(authentication), id, request));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<SessionRegistrationResponse> submitFeedback(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody SessionFeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(knowledgeSessionService.submitFeedback(getUserId(authentication), id, request));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
