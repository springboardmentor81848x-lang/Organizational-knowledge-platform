package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.EmployeeImprovement;
import com.infosys.knowledgeplatform.repository.EmployeeImprovementRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employee-improvements")
public class EmployeeImprovementController {

    private final EmployeeImprovementRepository improvementRepository;

    public EmployeeImprovementController(EmployeeImprovementRepository improvementRepository) {
        this.improvementRepository = improvementRepository;
    }

    @GetMapping
    public ResponseEntity<List<EmployeeImprovement>> getAll() {
        return ResponseEntity.ok(improvementRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<EmployeeImprovement> save(@RequestBody EmployeeImprovement improvement) {
        return ResponseEntity.ok(improvementRepository.save(improvement));
    }
}
