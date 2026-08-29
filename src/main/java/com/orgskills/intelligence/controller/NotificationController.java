package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.notification.NotificationResponse;
import com.orgskills.intelligence.exception.UnauthorizedException;
import com.orgskills.intelligence.security.CustomPrincipal;
import com.orgskills.intelligence.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * A user's notification feed.
 *
 * <p>A feed is a running commentary on somebody's assessments, gaps and deadlines, so it is scoped
 * to the person it belongs to: reading or acting on another user's notifications requires an admin
 * role, which {@link NotificationService} enforces.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    /** Newest first. Omitting {@code userId} returns the caller's own feed. */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(
            Authentication authentication,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(notificationService.getForUser(getUserId(authentication), userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationResponse>> getByUser(
            Authentication authentication,
            @PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getForUser(getUserId(authentication), userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(getUserId(authentication), id));
    }

    /** Retained alongside PUT: clients written against the earlier route keep working. */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> patchAsRead(
            Authentication authentication,
            @PathVariable Long id) {
        return markAsRead(authentication, id);
    }

    private Long getUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomPrincipal principal) {
            return principal.getUserId();
        }
        throw new UnauthorizedException("Not authenticated");
    }
}
