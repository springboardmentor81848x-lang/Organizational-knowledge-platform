package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.education.AddEducationRequestDTO;
import com.okip.dto.education.EducationResponseDTO;
import com.okip.service.education.EducationService;

@RestController
@RequestMapping("/api/education")
public class EducationController {

    private final EducationService educationService;

    public EducationController(
            EducationService educationService) {

        this.educationService = educationService;
    }

    @PostMapping
    public ResponseEntity<EducationResponseDTO> addEducation(
            @RequestBody AddEducationRequestDTO request) {

        EducationResponseDTO response =
                educationService.addEducation(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EducationResponseDTO>>
            getMyEducation() {

        return ResponseEntity.ok(
                educationService.getMyEducation());
    }

    @PutMapping("/{educationId}")
    public ResponseEntity<EducationResponseDTO>
            updateEducation(
                    @PathVariable Long educationId,
                    @RequestBody AddEducationRequestDTO request) {

        return ResponseEntity.ok(
                educationService.updateEducation(
                        educationId,
                        request));
    }

    @DeleteMapping("/{educationId}")
    public ResponseEntity<String>
            deleteEducation(
                    @PathVariable Long educationId) {

        educationService.deleteEducation(
                educationId);

        return ResponseEntity.ok(
                "Education deleted successfully.");
    }

}