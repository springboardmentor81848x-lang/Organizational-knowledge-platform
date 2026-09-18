package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.auth.AccessDecisionRequest;
import com.orgskills.intelligence.dto.auth.AccessRequestResponse;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.AccessRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * The queue of people waiting to be let in.
 *
 * <p>The role check here is the coarse one — department heads, HR and administrators. Which
 * particular requests a caller may see and decide is narrower than that and is settled in
 * {@link AccessRequestService}, because it depends on the applicant's department rather than on
 * the caller's role alone.
 */
@RestController
@RequestMapping("/api/access-requests")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')")
public class AccessRequestController {

    private final AccessRequestService accessRequestService;

    /** Sign-ups awaiting a decision that this caller is entitled to make. */
    @GetMapping("/pending")
    public ResponseEntity<List<AccessRequestResponse>> pending(
            @AuthenticationPrincipal CustomPrincipal principal) {
        return ResponseEntity.ok(accessRequestService.pendingRequests(principal.getUserId()));
    }

    /** Grants access. The applicant can sign in from this moment. */
    @PostMapping("/{userId}/approve")
    public ResponseEntity<AccessRequestResponse> approve(
            @AuthenticationPrincipal CustomPrincipal principal,
            @PathVariable Long userId,
            @Valid @RequestBody(required = false) AccessDecisionRequest request) {
        return ResponseEntity.ok(accessRequestService.approve(principal.getUserId(), userId, request));
    }

    /** Refuses access, keeping the reason on the record and telling the applicant. */
    @PostMapping("/{userId}/reject")
    public ResponseEntity<AccessRequestResponse> reject(
            @AuthenticationPrincipal CustomPrincipal principal,
            @PathVariable Long userId,
            @Valid @RequestBody(required = false) AccessDecisionRequest request) {
        return ResponseEntity.ok(accessRequestService.reject(principal.getUserId(), userId, request));
    }
}
