package com.orgskills.intelligence.service;

import com.orgskills.intelligence.dto.auth.AccessDecisionRequest;
import com.orgskills.intelligence.dto.auth.AccessRequestResponse;
import com.orgskills.intelligence.entity.User;
import com.orgskills.intelligence.entity.enums.AccessStatus;
import com.orgskills.intelligence.entity.enums.NotificationType;
import com.orgskills.intelligence.entity.enums.Role;
import com.orgskills.intelligence.exception.ForbiddenException;
import com.orgskills.intelligence.exception.ResourceNotFoundException;
import com.orgskills.intelligence.exception.ValidationException;
import com.orgskills.intelligence.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Granting access to people who have signed up.
 *
 * <h2>Why an approval rather than an emailed code</h2>
 * A one-time code proves that whoever is signing up can read that mailbox. It cannot tell you
 * whether they should have an account at all — anybody with a working address passes it. Routing
 * a sign-up to a person instead answers the question the organisation actually cares about, and
 * gives it an owner and an audit trail.
 *
 * <h2>Who decides</h2>
 * The department head of the department the applicant named, plus HR and system administrators,
 * who can decide any request. Both, rather than only the department head: a department with
 * nobody holding that role would otherwise be a dead end where a sign-up could never be actioned
 * by anyone. See {@link #ANY_DEPARTMENT_APPROVERS}.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AccessRequestService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    /** Roles that may decide a sign-up in any department. */
    private static final Set<Role> ANY_DEPARTMENT_APPROVERS =
            Set.of(Role.HR_ADMIN, Role.HR_SPECIALIST, Role.SYSTEM_ADMIN, Role.ADMIN);

    // ── Routing a new sign-up ───────────────────────────────────────────────────

    /**
     * Tells the people who can grant access that somebody is waiting.
     *
     * <p>Runs inside the sign-up's own transaction and lets a failure propagate. Catching one
     * here would be worse than useless: the notification insert and the sign-up share a
     * transaction, so a failed insert has already marked it rollback-only and swallowing the
     * exception only turns a clear error into an "unexpected rollback" at commit, with the
     * account silently not created either way.
     *
     * <p>A sign-up with nobody to approve it is not an error, though — it is recorded and waits
     * in the queue until somebody who can act on it looks.
     */
    @Transactional
    public void notifyApprovers(User applicant) {
        List<User> approvers = approversFor(applicant);
        if (approvers.isEmpty()) {
            log.warn("Sign-up from {} has no eligible approver; it will wait in the pending queue.",
                    applicant.getEmail());
            return;
        }

        String title = "New account request";
        String message = applicant.getFullName() + " (" + applicant.getJobTitle() + ", "
                + applicant.getDepartment() + ") has requested access and is waiting for a decision.";

        for (User approver : approvers) {
            notificationService.createNotification(approver, title, message,
                    NotificationType.ACCESS_REQUEST);
        }
    }

    /**
     * Everyone entitled to decide this applicant's request: the heads of the department they
     * named, and every HR or system administrator.
     *
     * <p>De-duplicated by id, because an administrator who also heads that department would
     * otherwise be notified twice about one sign-up.
     */
    private List<User> approversFor(User applicant) {
        Map<Long, User> byId = new LinkedHashMap<>();

        if (applicant.getDepartment() != null && !applicant.getDepartment().isBlank()) {
            userRepository.findByRoleAndDepartmentIgnoreCase(Role.DEPARTMENT_HEAD, applicant.getDepartment())
                    .forEach(head -> byId.put(head.getId(), head));
        }
        userRepository.findByRoleIn(ANY_DEPARTMENT_APPROVERS)
                .forEach(admin -> byId.put(admin.getId(), admin));

        return byId.values().stream()
                .filter(candidate -> Boolean.TRUE.equals(candidate.getActive()))
                .toList();
    }

    // ── The queue ───────────────────────────────────────────────────────────────

    /**
     * Sign-ups still waiting, oldest first.
     *
     * <p>A department head sees only their own department; HR and administrators see everything.
     * The scoping happens here rather than in the UI because it is the actual rule — a head has
     * no business reading the details of a stranger in another department.
     */
    @Transactional(readOnly = true)
    public List<AccessRequestResponse> pendingRequests(Long callerId) {
        User caller = getUser(callerId);
        requireApprover(caller);

        return userRepository.findByAccessStatusOrderByIdAsc(AccessStatus.PENDING).stream()
                .filter(applicant -> canDecide(caller, applicant))
                .map(applicant -> toResponse(applicant, caller))
                .toList();
    }

    // ── Decisions ───────────────────────────────────────────────────────────────

    @Transactional
    public AccessRequestResponse approve(Long approverId, Long applicantId, AccessDecisionRequest request) {
        return decide(approverId, applicantId, request, AccessStatus.APPROVED);
    }

    @Transactional
    public AccessRequestResponse reject(Long approverId, Long applicantId, AccessDecisionRequest request) {
        return decide(approverId, applicantId, request, AccessStatus.REJECTED);
    }

    private AccessRequestResponse decide(Long approverId, Long applicantId,
                                         AccessDecisionRequest request, AccessStatus outcome) {
        User approver = getUser(approverId);
        User applicant = getUser(applicantId);

        requireApprover(approver);
        if (!canDecide(approver, applicant)) {
            throw new ForbiddenException("You may not decide access requests for the "
                    + applicant.getDepartment() + " department.");
        }
        if (applicant.getAccessStatus() != AccessStatus.PENDING) {
            throw new ValidationException("This request has already been decided: it is "
                    + applicant.getAccessStatus().name().toLowerCase() + ".");
        }

        String note = request == null || request.getNote() == null ? null : request.getNote().trim();

        applicant.setAccessStatus(outcome);
        applicant.setAccessDecidedBy(approver);
        applicant.setAccessDecidedAt(Instant.now());
        applicant.setAccessDecisionNote(note == null || note.isBlank() ? null : note);
        User saved = userRepository.save(applicant);

        notifyApplicant(saved, outcome, note);

        auditLogService.logEvent(approver.getId(), approver.getEmail(),
                outcome == AccessStatus.APPROVED ? "ACCESS_GRANTED" : "ACCESS_REFUSED",
                "User", saved.getId().toString(),
                "Access " + outcome.name().toLowerCase() + " for " + saved.getEmail()
                        + (note == null || note.isBlank() ? "" : ": " + note));

        return toResponse(saved, approver);
    }

    /**
     * Tells the applicant what was decided.
     *
     * <p>A refused applicant is told too, and given the reason where one was left. They cannot
     * sign in to read it, so the notification is mostly a record — but the same message is what
     * sign-in returns, and writing it once keeps the two consistent.
     */
    private void notifyApplicant(User applicant, AccessStatus outcome, String note) {
        boolean approved = outcome == AccessStatus.APPROVED;
        String message = approved
                ? "Your account has been approved. You can sign in now."
                : "Your access request was declined.";
        if (note != null && !note.isBlank()) {
            message += " " + note;
        }

        notificationService.createNotification(applicant,
                approved ? "Account approved" : "Account request declined",
                message, NotificationType.ACCESS_DECISION);
    }

    // ── Rules ───────────────────────────────────────────────────────────────────

    private void requireApprover(User caller) {
        if (!ANY_DEPARTMENT_APPROVERS.contains(caller.getRole()) && caller.getRole() != Role.DEPARTMENT_HEAD) {
            throw new ForbiddenException("Granting access is limited to department heads, "
                    + "HR administrators and system administrators.");
        }
    }

    /** Whether this approver may decide this applicant's request. */
    private boolean canDecide(User approver, User applicant) {
        if (ANY_DEPARTMENT_APPROVERS.contains(approver.getRole())) {
            return true;
        }
        return approver.getRole() == Role.DEPARTMENT_HEAD
                && approver.getDepartment() != null
                && approver.getDepartment().equalsIgnoreCase(applicant.getDepartment());
    }

    /** The refusal shown at sign-in, which is also what the applicant was notified with. */
    public static String refusalMessage(User user) {
        String note = user.getAccessDecisionNote();
        return "Your access request was declined."
                + (note == null || note.isBlank() ? "" : " " + note)
                + " Contact your department head or HR if you believe this is a mistake.";
    }

    // ── Mapping ─────────────────────────────────────────────────────────────────

    private AccessRequestResponse toResponse(User applicant, User caller) {
        User decidedBy = applicant.getAccessDecidedBy();
        return AccessRequestResponse.builder()
                .id(applicant.getId())
                .fullName(applicant.getFullName())
                .email(applicant.getEmail())
                .department(applicant.getDepartment())
                .jobTitle(applicant.getJobTitle())
                .targetJobTitle(applicant.getTargetJobTitle())
                .targetDepartment(applicant.getTargetDepartment())
                .status(applicant.getAccessStatus().name())
                .decidedByName(decidedBy == null ? null : decidedBy.getFullName())
                .decidedAt(applicant.getAccessDecidedAt())
                .decisionNote(applicant.getAccessDecisionNote())
                .decidableByCaller(applicant.getAccessStatus() == AccessStatus.PENDING
                        && canDecide(caller, applicant))
                .build();
    }

    private User getUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for id: " + id));
    }
}
