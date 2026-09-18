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

    public KnowledgeGapController(
            KnowledgeGapService knowledgeGapService,
            EmployeeService employeeService) {

        this.knowledgeGapService = knowledgeGapService;
        this.employeeService = employeeService;
    }


    // =========================================================
    // SAVE KNOWLEDGE GAP
    // =========================================================

    @PostMapping
    public ResponseEntity<KnowledgeGap> saveKnowledgeGap(
            @RequestBody KnowledgeGap knowledgeGap) {

        return ResponseEntity.ok(
                knowledgeGapService.saveKnowledgeGap(
                        knowledgeGap
                )
        );
    }


    // =========================================================
    // DETECT AND SAVE KNOWLEDGE GAPS
    //
    // IMPORTANT:
    // This endpoint should be called when you intentionally
    // want to generate/update knowledge gaps.
    //
    // DO NOT call this automatically from EmployeeDashboard.
    // =========================================================

    @PostMapping("/detect/{employeeIdentifier}")
    public ResponseEntity<List<KnowledgeGap>>
    detectAndSaveKnowledgeGaps(
            @PathVariable String employeeIdentifier) {

        try {

            Optional<Employee> employee =
                    employeeService.getEmployeeByIdentifier(
                            employeeIdentifier
                    );

            if (employee.isEmpty()) {

                return ResponseEntity.notFound().build();
            }

            List<KnowledgeGap> gaps =
                    knowledgeGapService.detectAndSaveGaps(
                            employee.get()
                    );

            return ResponseEntity.ok(gaps);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .build();
        }
    }


    // =========================================================
    // GET ALL KNOWLEDGE GAPS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<KnowledgeGap>>
    getAllKnowledgeGaps() {

        return ResponseEntity.ok(
                knowledgeGapService.getAllKnowledgeGaps()
        );
    }


    // =========================================================
    // GET KNOWLEDGE GAP BY ID
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeGap>
    getKnowledgeGapById(
            @PathVariable Long id) {

        Optional<KnowledgeGap> gap =
                knowledgeGapService.getKnowledgeGapById(id);

        return gap
                .map(ResponseEntity::ok)
                .orElseGet(
                        () -> ResponseEntity.notFound().build()
                );
    }


    // =========================================================
    // GET STORED KNOWLEDGE GAPS BY EMPLOYEE
    //
    // THIS IS WHAT EMPLOYEE DASHBOARD USES.
    //
    // It only retrieves saved data.
    // It does NOT generate new gaps.
    // =========================================================

    @GetMapping("/employee/{employeeIdentifier}")
    public ResponseEntity<List<KnowledgeGap>>
    getKnowledgeGapsByEmployee(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {

            return ResponseEntity.notFound().build();
        }

        List<KnowledgeGap> gaps =
                knowledgeGapService.getKnowledgeGapsByEmployee(
                        employee.get()
                );

        return ResponseEntity.ok(gaps);
    }


    // =========================================================
    // GET TARGET ROLE FROM LATEST ASSESSMENT
    // =========================================================

    @GetMapping(
            "/employee/{employeeIdentifier}/target-role"
    )
    public ResponseEntity<String>
    getTargetRole(
            @PathVariable String employeeIdentifier) {

        Optional<Employee> employee =
                employeeService.getEmployeeByIdentifier(
                        employeeIdentifier
                );

        if (employee.isEmpty()) {

            return ResponseEntity.notFound().build();
        }

        String targetRole =
                knowledgeGapService
                        .getLatestAssessmentTargetRole(
                                employee.get()
                        );

        if (targetRole == null ||
                targetRole.trim().isEmpty()) {

            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(targetRole);
    }


    // =========================================================
    // DELETE KNOWLEDGE GAP
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteKnowledgeGap(
            @PathVariable Long id) {

        knowledgeGapService.deleteKnowledgeGap(id);

        return ResponseEntity.ok(
                "Knowledge Gap deleted successfully!"
        );
    }
}