package com.knowledgegap.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.dto.RoleSkillResponse;
import com.knowledgegap.service.RoleSkillService;

@RestController
@RequestMapping("/api/role-skills")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
})
public class RoleSkillController {

    private final RoleSkillService roleSkillService;

    public RoleSkillController(
            RoleSkillService roleSkillService) {

        this.roleSkillService = roleSkillService;
    }

    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<RoleSkillResponse>>
            getSkillsForRole(
                    @PathVariable Long roleId) {

        return ResponseEntity.ok(
                roleSkillService.getSkillsForRole(roleId)
        );
    }
}