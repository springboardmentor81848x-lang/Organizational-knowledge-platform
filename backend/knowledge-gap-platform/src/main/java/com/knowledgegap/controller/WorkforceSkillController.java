package com.knowledgegap.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.WorkforceSkillService;

@RestController
@RequestMapping("/api/hr/workforce-skills")
@CrossOrigin(origins = "http://localhost:5173")
public class WorkforceSkillController {

    private final WorkforceSkillService workforceSkillService;

    public WorkforceSkillController(
            WorkforceSkillService workforceSkillService) {

        this.workforceSkillService = workforceSkillService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkforceSkillInventory() {

        return ResponseEntity.ok(
                workforceSkillService.getWorkforceSkillInventory()
        );
    }
}