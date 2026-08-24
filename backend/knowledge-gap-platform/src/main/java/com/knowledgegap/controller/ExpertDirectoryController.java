package com.knowledgegap.controller;

import com.knowledgegap.dto.ExpertDirectoryDTO;
import com.knowledgegap.entity.Skill;
import com.knowledgegap.service.ExpertDirectoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expert-directory")
@CrossOrigin(origins = "*")
public class ExpertDirectoryController {

    private final ExpertDirectoryService expertDirectoryService;

    public ExpertDirectoryController(ExpertDirectoryService expertDirectoryService) {
        this.expertDirectoryService = expertDirectoryService;
    }

    @GetMapping("/search")
    public ResponseEntity<List<ExpertDirectoryDTO>> searchExperts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer minProficiency,
            @RequestParam(required = false) String skillCategory,
            @RequestParam(required = false) Long skillId,
            @RequestParam(required = false) String currentEmployeeId) {

        List<ExpertDirectoryDTO> results = expertDirectoryService.searchExperts(
                query,
                department,
                minProficiency,
                skillCategory,
                skillId,
                currentEmployeeId
        );

        return ResponseEntity.ok(results);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ExpertDirectoryDTO>> getAllExperts() {
        List<ExpertDirectoryDTO> results = expertDirectoryService.searchExperts(
                null, null, 1, null, null, null
        );
        return ResponseEntity.ok(results);
    }

    @GetMapping("/departments")
    public ResponseEntity<List<String>> getDepartments() {
        return ResponseEntity.ok(expertDirectoryService.getAllDepartments());
    }

    @GetMapping("/skills")
    public ResponseEntity<List<Skill>> getSkills() {
        return ResponseEntity.ok(expertDirectoryService.getAllSkills());
    }
}
