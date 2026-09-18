package com.knowledgegap.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.knowledgegap.entity.Certification;
import com.knowledgegap.service.CertificationService;

@RestController
@RequestMapping("/api/certifications")
@CrossOrigin(origins = "http://localhost:5173")
public class CertificationController {

    private final CertificationService certificationService;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public CertificationController(
            CertificationService certificationService) {

        this.certificationService =
                certificationService;
    }

    // =========================================================
    // CREATE CERTIFICATION
    // =========================================================

    @PostMapping(
            "/employee/{employeeIdentifier}/course/{courseId}"
    )
    public ResponseEntity<Certification> createCertification(

            @PathVariable String employeeIdentifier,

            @PathVariable Long courseId,

            @RequestBody CertificationRequest request) {

        return ResponseEntity.ok(
                certificationService.createCertification(
                        employeeIdentifier,
                        courseId,
                        request.getCertificateName(),
                        request.getCertificateNumber(),
                        request.getIssueDate(),
                        request.getExpiryDate()
                )
        );
    }

    // =========================================================
    // GET EMPLOYEE CERTIFICATIONS
    // =========================================================

    @GetMapping(
            "/employee/{employeeIdentifier}"
    )
    public ResponseEntity<List<Certification>>
    getEmployeeCertifications(

            @PathVariable String employeeIdentifier) {

        return ResponseEntity.ok(
                certificationService
                        .getEmployeeCertifications(
                                employeeIdentifier
                        )
        );
    }

    // =========================================================
    // GET SINGLE CERTIFICATION
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<Certification>
    getCertificationById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                certificationService
                        .getCertificationById(id)
        );
    }

    // =========================================================
    // MARK EXPIRED
    // =========================================================

    @PutMapping("/{id}/expire")
    public ResponseEntity<Certification>
    markExpired(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                certificationService
                        .markExpired(id)
        );
    }

    // =========================================================
    // MARK RENEWAL REQUIRED
    // =========================================================

    @PutMapping("/{id}/renewal-required")
    public ResponseEntity<Certification>
    markRenewalRequired(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                certificationService
                        .markRenewalRequired(id)
        );
    }

    // =========================================================
    // RENEW CERTIFICATION
    // =========================================================

    @PutMapping("/{id}/renew")
    public ResponseEntity<Certification>
    renewCertification(

            @PathVariable Long id,

            @RequestBody RenewalRequest request) {

        return ResponseEntity.ok(
                certificationService.renewCertification(
                        id,
                        request.getIssueDate(),
                        request.getExpiryDate()
                )
        );
    }

    // =========================================================
    // DELETE CERTIFICATION
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deleteCertification(
            @PathVariable Long id) {

        certificationService
                .deleteCertification(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =========================================================
    // CREATE CERTIFICATION DTO
    // =========================================================

    public static class CertificationRequest {

        private String certificateName;

        private String certificateNumber;

        private LocalDate issueDate;

        private LocalDate expiryDate;

        public String getCertificateName() {
            return certificateName;
        }

        public void setCertificateName(
                String certificateName) {

            this.certificateName =
                    certificateName;
        }

        public String getCertificateNumber() {
            return certificateNumber;
        }

        public void setCertificateNumber(
                String certificateNumber) {

            this.certificateNumber =
                    certificateNumber;
        }

        public LocalDate getIssueDate() {
            return issueDate;
        }

        public void setIssueDate(
                LocalDate issueDate) {

            this.issueDate =
                    issueDate;
        }

        public LocalDate getExpiryDate() {
            return expiryDate;
        }

        public void setExpiryDate(
                LocalDate expiryDate) {

            this.expiryDate =
                    expiryDate;
        }
    }

    // =========================================================
    // RENEWAL DTO
    // =========================================================

    public static class RenewalRequest {

        private LocalDate issueDate;

        private LocalDate expiryDate;

        public LocalDate getIssueDate() {
            return issueDate;
        }

        public void setIssueDate(
                LocalDate issueDate) {

            this.issueDate =
                    issueDate;
        }

        public LocalDate getExpiryDate() {
            return expiryDate;
        }

        public void setExpiryDate(
                LocalDate expiryDate) {

            this.expiryDate =
                    expiryDate;
        }
    }
}