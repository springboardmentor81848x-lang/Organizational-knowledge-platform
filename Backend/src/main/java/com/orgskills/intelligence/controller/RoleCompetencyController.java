package com.orgskills.intelligence.controller;

import com.orgskills.intelligence.dto.role.RoleCompetencyRequest;
import com.orgskills.intelligence.dto.role.RoleCompetencyResponse;
import com.orgskills.intelligence.dto.role.TargetRoleOption;
import com.orgskills.intelligence.service.RoleCompetencyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

@RestController
@RequestMapping("/api/role-competencies")
@RequiredArgsConstructor
public class RoleCompetencyController {

    private final RoleCompetencyService roleCompetencyService;

    @GetMapping
    public ResponseEntity<List<RoleCompetencyResponse>> getAll(
            @RequestParam(required = false) String jobTitle,
            @RequestParam(required = false) String department) {
        return ResponseEntity.ok(roleCompetencyService.getCompetencies(jobTitle, department));
    }

    /**
     * The roles a new employee can pick as their target during sign-up.
     *
     * <p>Reachable without a token, because the person choosing has no account yet. It exposes
     * only role titles and a count - no personal data - which is what makes that safe.
     */
    @GetMapping("/target-roles")
    public ResponseEntity<List<TargetRoleOption>> getTargetRoles() {
        return ResponseEntity.ok(roleCompetencyService.getTargetRoleOptions());
    }

    @PostMapping
    public ResponseEntity<RoleCompetencyResponse> create(@Valid @RequestBody RoleCompetencyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(roleCompetencyService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoleCompetencyResponse> update(@PathVariable Long id,
                                                          @Valid @RequestBody RoleCompetencyRequest request) {
        return ResponseEntity.ok(roleCompetencyService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleCompetencyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
