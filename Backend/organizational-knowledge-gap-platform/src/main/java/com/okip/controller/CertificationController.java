package com.okip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.okip.dto.certification.AddCertificationRequestDTO;
import com.okip.dto.certification.CertificationResponseDTO;
import com.okip.service.certification.CertificationService;

@RestController
@RequestMapping("/api/certification")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(
            CertificationService certificationService) {

        this.certificationService = certificationService;
    }

    @PostMapping
    public ResponseEntity<CertificationResponseDTO>
            addCertification(
                    @RequestBody
                    AddCertificationRequestDTO request) {

        CertificationResponseDTO response =
                certificationService.addCertification(request);

        return new ResponseEntity<>(
                response,
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CertificationResponseDTO>>
            getMyCertifications() {

        return ResponseEntity.ok(
                certificationService.getMyCertifications());
    }

    @PutMapping("/{certificationId}")
    public ResponseEntity<CertificationResponseDTO>
            updateCertification(
                    @PathVariable Long certificationId,
                    @RequestBody
                    AddCertificationRequestDTO request) {

        return ResponseEntity.ok(
                certificationService.updateCertification(
                        certificationId,
                        request));
    }

    @DeleteMapping("/{certificationId}")
    public ResponseEntity<String>
            deleteCertification(
                    @PathVariable Long certificationId) {

        certificationService.deleteCertification(
                certificationId);

        return ResponseEntity.ok(
                "Certification deleted successfully.");
    }
}