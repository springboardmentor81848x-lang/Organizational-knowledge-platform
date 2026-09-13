package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.skill.UserSkillRequest;
import com.orgskills.intelligence.dto.skill.UserSkillResponse;
import com.orgskills.intelligence.service.UserSkillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * An employee's held skills.
 *
 * <p>Scoped to the person the record belongs to. Everyone may curate their own skill profile;
 * reading or changing somebody else's needs a role that is responsible for them. Without this
 * the endpoint took the id straight from the path and acted on it, so any signed-in user could
 * read — and rewrite — anyone's proficiency levels, including their own manager's.
 *
 * <p>A level recorded here is a self-declaration. It is not evidence: proficiency that counts
 * towards a closed gap is awarded by the assessment module, which is the only place a level
 * changes on somebody else's judgement.
 */
@RestController
@RequestMapping("/api/users/{userId}/skills")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserSkillController {

    private static final String SCOPED_MANAGER_ROLES =
            "hasAnyRole('MANAGER', 'DEPARTMENT_HEAD', 'HR_SPECIALIST', 'HR_ADMIN', 'LND_ADMIN', 'SYSTEM_ADMIN', 'ADMIN')";

    private final UserSkillService userSkillService;

    @GetMapping
    @PreAuthorize("#userId == authentication.principal.userId or " + SCOPED_MANAGER_ROLES)
    public ResponseEntity<List<UserSkillResponse>> getUserSkills(@PathVariable Long userId) {
        return ResponseEntity.ok(userSkillService.getUserSkills(userId));
    }

    @PostMapping
    @PreAuthorize("#userId == authentication.principal.userId or " + SCOPED_MANAGER_ROLES)
    public ResponseEntity<UserSkillResponse> addSkill(@PathVariable Long userId,
                                                       @Valid @RequestBody UserSkillRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userSkillService.addSkillToUser(userId, request));
    }

    @PutMapping("/{userSkillId}")
    @PreAuthorize("#userId == authentication.principal.userId or " + SCOPED_MANAGER_ROLES)
    public ResponseEntity<UserSkillResponse> updateSkill(@PathVariable Long userId,
                                                          @PathVariable Long userSkillId,
                                                          @Valid @RequestBody UserSkillRequest request) {
        return ResponseEntity.ok(userSkillService.updateUserSkill(userId, userSkillId, request));
    }

    @DeleteMapping("/{userSkillId}")
    @PreAuthorize("#userId == authentication.principal.userId or " + SCOPED_MANAGER_ROLES)
    public ResponseEntity<Void> deleteSkill(@PathVariable Long userId, @PathVariable Long userSkillId) {
        userSkillService.deleteUserSkill(userId, userSkillId);
        return ResponseEntity.noContent().build();
    }
}
