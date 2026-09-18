package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.mentorship.MentorshipMatchRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipMatchResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipRequest;
import com.orgskills.intelligence.dto.mentorship.MentorshipResponse;
import com.orgskills.intelligence.dto.mentorship.MentorshipStatusUpdateRequest;
import com.orgskills.intelligence.dto.mentorship.RecommendedMentorResponse;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.MentorshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Mentorship endpoints. The module API lives under {@code /api/mentorships}; the
 * older gap-driven auto-match endpoints under {@code /api/mentorship} are kept for
 * the existing clients, so paths are declared per method rather than class-wide.
 */
@RestController
@RequiredArgsConstructor
public class MentorshipController {

    private static final String SCOPED_VIEWER_ROLES =
            "hasAnyRole('MANAGER', 'DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'LND_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')";

    private final MentorshipService mentorshipService;

    // ── Module API ──────────────────────────────────────────────────────────────

    @GetMapping("/api/mentorships/recommendations")
    @PreAuthorize("#employeeId == authentication.principal.userId or " + SCOPED_VIEWER_ROLES)
    public ResponseEntity<List<RecommendedMentorResponse>> getRecommendations(
            @RequestParam Long employeeId,
            @RequestParam Long skillId) {
        return ResponseEntity.ok(mentorshipService.findRecommendedMentors(employeeId, skillId));
    }

    @PostMapping("/api/mentorships")
    @PreAuthorize("#request.menteeId == authentication.principal.userId or " + SCOPED_VIEWER_ROLES)
    public ResponseEntity<MentorshipResponse> requestMentorship(@Valid @RequestBody MentorshipRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorshipService.requestMentorship(request));
    }

    @PutMapping("/api/mentorships/{id}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MentorshipResponse> acceptMentorship(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(mentorshipService.acceptMentorship(id, getUserId(authentication)));
    }

    @PutMapping("/api/mentorships/{id}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MentorshipResponse> rejectMentorship(Authentication authentication, @PathVariable Long id) {
        return ResponseEntity.ok(mentorshipService.rejectMentorship(id, getUserId(authentication)));
    }

    @GetMapping("/api/mentorships")
    @PreAuthorize("#employeeId == authentication.principal.userId or " + SCOPED_VIEWER_ROLES)
    public ResponseEntity<List<MentorshipResponse>> getMentorships(@RequestParam Long employeeId) {
        return ResponseEntity.ok(mentorshipService.getMentorshipsForUser(employeeId));
    }

    // ── Legacy gap-driven auto-match ────────────────────────────────────────────

    @PostMapping("/api/mentorship/match")
    public ResponseEntity<MentorshipMatchResponse> match(@Valid @RequestBody MentorshipMatchRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mentorshipService.createMatch(request));
    }

    @GetMapping("/api/mentorship/user/{userId}")
    public ResponseEntity<List<MentorshipMatchResponse>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(mentorshipService.getMatchesByUser(userId));
    }

    @PatchMapping("/api/mentorship/{id}/status")
    public ResponseEntity<MentorshipMatchResponse> updateStatus(@PathVariable Long id,
                                                                 @Valid @RequestBody MentorshipStatusUpdateRequest request) {
        return ResponseEntity.ok(mentorshipService.updateStatus(id, request.getStatus()));
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
