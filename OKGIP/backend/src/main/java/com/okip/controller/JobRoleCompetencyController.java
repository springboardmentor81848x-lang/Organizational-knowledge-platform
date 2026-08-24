package com.okip.controller;

import java.util.List;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.competency.JobRoleCompetencyRequestDTO;
import com.okip.dto.competency.JobRoleCompetencyResponseDTO;
import com.okip.service.competency.JobRoleCompetencyService;
@SecurityRequirement(name = "bearerAuth")
@RestController
@RequestMapping("/api/job-role-competencies")
public class JobRoleCompetencyController {

    private final JobRoleCompetencyService competencyService;

    public JobRoleCompetencyController(
            JobRoleCompetencyService competencyService) {

        this.competencyService = competencyService;
    }

    @PostMapping
    public ResponseEntity<JobRoleCompetencyResponseDTO>
            createCompetency(
                    @RequestBody
                    JobRoleCompetencyRequestDTO request) {

        JobRoleCompetencyResponseDTO response =
                competencyService.createCompetency(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping("/job-role/{jobRoleId}")
    public ResponseEntity<List<JobRoleCompetencyResponseDTO>>
            getCompetenciesByJobRole(
                    @PathVariable Long jobRoleId) {

        return ResponseEntity.ok(
                competencyService
                        .getCompetenciesByJobRole(jobRoleId));
    }

    @PutMapping("/{competencyId}")
    public ResponseEntity<JobRoleCompetencyResponseDTO>
            updateCompetency(
                    @PathVariable Long competencyId,
                    @RequestBody
                    JobRoleCompetencyRequestDTO request) {

        return ResponseEntity.ok(
                competencyService.updateCompetency(
                        competencyId,
                        request));
    }

    @DeleteMapping("/{competencyId}")
    public ResponseEntity<String>
            deleteCompetency(
                    @PathVariable Long competencyId) {

        competencyService.deleteCompetency(
                competencyId);

        return ResponseEntity.ok(
                "Competency deleted successfully.");
    }

}