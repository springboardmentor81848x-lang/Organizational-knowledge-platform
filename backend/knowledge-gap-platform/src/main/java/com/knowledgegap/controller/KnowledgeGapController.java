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

    public KnowledgeGapController(KnowledgeGapService knowledgeGapService,
                                  EmployeeService employeeService) {
        this.knowledgeGapService = knowledgeGapService;
        this.employeeService = employeeService;
    }

    @PostMapping
    public KnowledgeGap saveKnowledgeGap(@RequestBody KnowledgeGap knowledgeGap) {
        return knowledgeGapService.saveKnowledgeGap(knowledgeGap);
    }

    @PostMapping("/detect/{employeeIdentifier}")
    public ResponseEntity<List<KnowledgeGap>> detectAndSaveKnowledgeGaps(
            @PathVariable String employeeIdentifier) {

        try {

            System.out.println("==================================");
            System.out.println("Gap Detection API Called");
            System.out.println("Employee Identifier: " + employeeIdentifier);

            Optional<Employee> employee =
                    employeeService.getEmployeeByIdentifier(employeeIdentifier);

            if (employee.isEmpty()) {
                System.out.println("Employee not found!");
                return ResponseEntity.notFound().build();
            }

            System.out.println("Employee Found: " + employee.get().getEmployeeId());
            System.out.println("Designation: " + employee.get().getDesignation());

            List<KnowledgeGap> gaps =
                    knowledgeGapService.detectAndSaveGaps(employee.get());

            System.out.println("Gap Detection Completed");
            System.out.println("Number of Gaps: " + gaps.size());
            System.out.println("==================================");

            return ResponseEntity.ok(gaps);

        } catch (Exception e) {

            System.out.println("========== ERROR ==========");
            e.printStackTrace();
            System.out.println("===========================");

            return ResponseEntity.internalServerError().build();
        }
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
    public ResponseEntity<List<KnowledgeGap>> getKnowledgeGapsByEmployee(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(employeeIdentifier);

        return employee
                .map(value -> ResponseEntity.ok(
                        knowledgeGapService.getKnowledgeGapsByEmployee(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public String deleteKnowledgeGap(@PathVariable Long id) {
        knowledgeGapService.deleteKnowledgeGap(id);
        return "Knowledge Gap deleted successfully!";
    }
}