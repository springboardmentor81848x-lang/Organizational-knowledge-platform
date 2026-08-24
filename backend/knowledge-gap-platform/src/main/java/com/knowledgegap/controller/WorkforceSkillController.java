package com.knowledgegap.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
<<<<<<< HEAD
import org.springframework.web.bind.annotation.CrossOrigin;
=======
>>>>>>> origin/team1-krishnapriya
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.knowledgegap.service.WorkforceSkillService;

@RestController
<<<<<<< HEAD
@RequestMapping("/api/hr/workforce-skills")
@CrossOrigin(origins = "http://localhost:5173")
=======
@RequestMapping("/api/hr")
>>>>>>> origin/team1-krishnapriya
public class WorkforceSkillController {

    private final WorkforceSkillService workforceSkillService;

    public WorkforceSkillController(
            WorkforceSkillService workforceSkillService) {

<<<<<<< HEAD
        this.workforceSkillService = workforceSkillService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getWorkforceSkillInventory() {

        return ResponseEntity.ok(
                workforceSkillService.getWorkforceSkillInventory()
        );
    }
}
=======
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
>>>>>>> origin/team1-krishnapriya
