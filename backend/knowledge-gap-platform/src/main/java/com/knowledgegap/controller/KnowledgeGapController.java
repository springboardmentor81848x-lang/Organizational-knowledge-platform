package com.knowledgegap.controller;

import com.knowledgegap.entity.Employee;
import com.knowledgegap.entity.KnowledgeGap;
import com.knowledgegap.service.EmployeeService;
import com.knowledgegap.service.KnowledgeGapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/knowledge-gaps")
@CrossOrigin(origins = "*")
public class KnowledgeGapController {

    private final KnowledgeGapService knowledgeGapService;
    private final EmployeeService employeeService;

    public KnowledgeGapController(KnowledgeGapService knowledgeGapService, EmployeeService employeeService) {
        this.knowledgeGapService = knowledgeGapService;
        this.employeeService = employeeService;
    }

    @PostMapping
    public KnowledgeGap saveKnowledgeGap(@RequestBody KnowledgeGap knowledgeGap) {
        return knowledgeGapService.saveKnowledgeGap(knowledgeGap);
    }

    @PostMapping("/detect/{employeeIdentifier}")
    public ResponseEntity<List<KnowledgeGap>> detectAndSaveKnowledgeGaps(@PathVariable String employeeIdentifier) {
        Optional<Employee> employee = employeeService.getEmployeeByIdentifier(employeeIdentifier);
        if (employee.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(knowledgeGapService.detectAndSaveGaps(employee.get()));
    }

    @GetMapping
    public List<KnowledgeGap> getAllKnowledgeGaps() {
        return knowledgeGapService.getAllKnowledgeGaps();
    }

    @GetMapping("/{id}")
    public Optional<KnowledgeGap> getKnowledgeGapById(@PathVariable Long id) {
        return knowledgeGapService.getKnowledgeGapById(id);
    }

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<KnowledgeGap>> getKnowledgeGapsByEmployee(@PathVariable String employeeIdentifier) {
        Optional<Employee> employee = employeeService.getEmployeeByIdentifier(employeeIdentifier);
        return employee.map(value -> ResponseEntity.ok(knowledgeGapService.getKnowledgeGapsByEmployee(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public String deleteKnowledgeGap(@PathVariable Long id) {
        knowledgeGapService.deleteKnowledgeGap(id);
        return "Knowledge Gap deleted successfully!";
    }
}