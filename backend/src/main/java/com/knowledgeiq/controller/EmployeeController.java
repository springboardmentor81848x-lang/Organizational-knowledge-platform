package com.knowledgeiq.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgeiq.dto.CertificationDto;
import com.knowledgeiq.dto.EmployeeDashboardDto;
import com.knowledgeiq.dto.UserProfileDto;
import com.knowledgeiq.model.Certification;
import com.knowledgeiq.repository.CertificationRepository;
import com.knowledgeiq.service.DashboardService;
import com.knowledgeiq.service.EmployeeService;
import com.knowledgeiq.service.SupabaseStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private SupabaseStorageService supabaseStorageService;

    @Autowired
    private CertificationRepository certificationRepository;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getMyProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        UserProfileDto profile = employeeService.getEmployeeProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/profile/{userId}")
    public ResponseEntity<?> getProfileById(@PathVariable UUID userId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String callerIdStr = (String) authentication.getPrincipal();
        boolean isSelf = callerIdStr.equals(userId.toString());
        boolean hasElevatedRole = authentication.getAuthorities().stream().anyMatch(a -> {
            String role = a.getAuthority();
            return "ROLE_MANAGER".equals(role) || "ROLE_DEPARTMENT_HEAD".equals(role)
                    || "ROLE_HR_SPECIALIST".equals(role) || "ROLE_L_AND_D_ADMIN".equals(role)
                    || "ROLE_SYSTEM_ADMIN".equals(role);
        });

        if (!isSelf && !hasElevatedRole) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied: cannot view other employee profiles"));
        }

        UserProfileDto profile = employeeService.getEmployeeProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<EmployeeDashboardDto> getDashboardData() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        EmployeeDashboardDto dto = dashboardService.getEmployeeDashboard(userId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/skills/rating")
    public ResponseEntity<?> updateSkillRating(@RequestBody com.knowledgeiq.dto.UpdateSkillRatingDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        return ResponseEntity.ok(employeeService.updateSkillRating(userId, dto));
    }

    @PostMapping("/skills/add")
    public ResponseEntity<?> addCustomSkill(@RequestBody com.knowledgeiq.dto.UpdateSkillRatingDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        return ResponseEntity.ok(employeeService.addCustomSkill(userId, dto));
    }

    @GetMapping("/certifications")
    public ResponseEntity<?> getCertifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        return ResponseEntity.ok(employeeService.getCertifications(userId));
    }

    @PostMapping(value = "/certifications", consumes = {"multipart/form-data"})
    public ResponseEntity<?> addCertificationMultipart(
            @RequestPart("certificationData") String certDataJson,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userIdStr = (String) authentication.getPrincipal();
            UUID userId = UUID.fromString(userIdStr);

            ObjectMapper mapper = new ObjectMapper();
            CertificationDto dto = mapper.readValue(certDataJson, CertificationDto.class);

            if (file != null && !file.isEmpty()) {
                String storagePath = supabaseStorageService.uploadFile(
                        userIdStr,
                        file.getOriginalFilename(),
                        file.getBytes(),
                        file.getContentType()
                );
                dto.setStoragePath(storagePath);
                dto.setFileType(file.getContentType());
                dto.setFileSize(file.getSize());
            }

            if (dto.getStatus() == null) {
                dto.setStatus("PENDING_VERIFICATION");
            }
            if (dto.getAssessmentStatus() == null) {
                dto.setAssessmentStatus("Pending Verification");
            }

            return ResponseEntity.ok(employeeService.addCertification(userId, dto));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        }
    }

    @PostMapping(value = "/certifications", consumes = {"application/json"})
    public ResponseEntity<?> addCertificationJson(@RequestBody CertificationDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        if (dto.getStatus() == null) {
            dto.setStatus("PENDING_VERIFICATION");
        }
        if (dto.getAssessmentStatus() == null) {
            dto.setAssessmentStatus("Pending Verification");
        }
        return ResponseEntity.ok(employeeService.addCertification(userId, dto));
    }

    @GetMapping("/certifications/{id}/view")
    public ResponseEntity<?> viewCertificate(@PathVariable UUID id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userIdStr = (String) authentication.getPrincipal();
            UUID userId = UUID.fromString(userIdStr);

            Certification cert = certificationRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Certification not found"));

            if (!cert.getUser().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized access to certificate"));
            }

            String signedUrl = supabaseStorageService.getSignedUrl(cert.getStoragePath());
            if (signedUrl == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Certificate URL could not be generated"));
            }

            return ResponseEntity.ok(Map.of("url", signedUrl));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/uploads/certificates/{filename:.+}")
    public ResponseEntity<byte[]> serveLocalCertificate(@PathVariable String filename) {
        byte[] data = supabaseStorageService.getLocalFileContent(filename);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        
        HttpHeaders headers = new HttpHeaders();
        if (filename.toLowerCase().endsWith(".pdf")) {
            headers.setContentType(MediaType.APPLICATION_PDF);
        } else if (filename.toLowerCase().endsWith(".png")) {
            headers.setContentType(MediaType.IMAGE_PNG);
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg")) {
            headers.setContentType(MediaType.IMAGE_JPEG);
        } else {
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        }
        
        headers.setCacheControl("max-age=604800");
        return new ResponseEntity<>(data, headers, HttpStatus.OK);
    }

    @DeleteMapping("/certifications/{id}")
    public ResponseEntity<?> deleteCertification(@PathVariable UUID id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        employeeService.deleteCertification(userId, id);
        return ResponseEntity.ok(Map.of("message", "Certification deleted successfully"));
    }

    @PutMapping("/profile/experience")
    public ResponseEntity<?> updateExperience(@RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        String experience = body.get("experience");
        return ResponseEntity.ok(employeeService.updateExperience(userId, experience));
    }

    @PutMapping("/profile/education")
    public ResponseEntity<?> updateEducation(@RequestBody Map<String, String> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        String education = body.get("education");
        return ResponseEntity.ok(employeeService.updateEducation(userId, education));
    }

    @GetMapping("/role-mapping")
    public ResponseEntity<?> getRoleMapping() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userIdStr = (String) authentication.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);

        return ResponseEntity.ok(employeeService.getRoleMapping(userId));
    }
}
