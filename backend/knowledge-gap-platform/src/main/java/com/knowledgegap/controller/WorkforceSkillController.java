package com.knowledgegap.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.WorkforceSkillService;

@RestController
@RequestMapping("/api/hr")
public class WorkforceSkillController {

    private final WorkforceSkillService workforceSkillService;

    public WorkforceSkillController(
            WorkforceSkillService workforceSkillService) {

        this.workforceSkillService =
                workforceSkillService;
    }

    @GetMapping("/workforce-skills")
    public ResponseEntity<Map<String, Object>>
            getWorkforceSkillInventory() {

        return ResponseEntity.ok(
                workforceSkillService
                        .getWorkforceSkillInventory()
        );
    }
}