package com.knowledgeiq.service;

import com.knowledgeiq.dto.*;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private RoleSkillBenchmarkRepository benchmarkRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private NotificationService notificationService;

    public UserProfileDto getEmployeeProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<EmployeeSkill> empSkills = employeeSkillRepository.findByUserId(userId);

        List<RoleSkillBenchmark> benchmarks = new ArrayList<>();
        if (user.getRole() != null) {
            benchmarks = benchmarkRepository.findByRoleId(user.getRole().getId());
        }

        Map<UUID, RoleSkillBenchmark> benchmarkMap = benchmarks.stream()
                .collect(Collectors.toMap(b -> b.getSkill().getId(), b -> b, (b1, b2) -> b1));

        List<SkillDto> skillDtos = empSkills.stream().map(es -> {
            RoleSkillBenchmark bm = benchmarkMap.get(es.getSkill().getId());
            String reqLevel = bm != null ? String.valueOf(bm.getRequiredLevel()) : "Not Set";
            Boolean isCritical = bm != null ? bm.getIsCritical() : false;

            return new SkillDto(
                    es.getSkill().getId(),
                    es.getSkill().getName(),
                    es.getSkill().getCategory() != null ? es.getSkill().getCategory().getName() : "General",
                    String.valueOf(es.getProficiencyLevel()),
                    reqLevel,
                    isCritical
            );
        }).collect(Collectors.toList());

        String roleTitle = user.getRole() != null ? user.getRole().getTitle() : "Unassigned";
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : "Unassigned";

        UserProfileDto dto = new UserProfileDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getSystemRole().name(),
                roleTitle,
                deptName,
                user.getAvatarUrl(),
                skillDtos
        );

        dto.setBio(user.getBio());
        dto.setCompany(user.getCompany() != null ? user.getCompany() : "Northwind Labs");
        dto.setExperience(user.getExperience());
        dto.setEducation(user.getEducation());

        return dto;
    }

    @Transactional
    public SkillDto updateSkillRating(UUID userId, UpdateSkillRatingDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Skill skill = null;
        if (dto.getSkillId() != null) {
            skill = skillRepository.findById(dto.getSkillId()).orElse(null);
        }
        if (skill == null && dto.getSkillName() != null && !dto.getSkillName().isBlank()) {
            skill = skillRepository.findAll().stream()
                    .filter(s -> s.getName().equalsIgnoreCase(dto.getSkillName().trim()))
                    .findFirst().orElse(null);
        }
        if (skill == null) {
            throw new RuntimeException("Skill not found: " + (dto.getSkillId() != null ? dto.getSkillId() : dto.getSkillName()));
        }

        final Skill targetSkill = skill;
        EmployeeSkill empSkill = employeeSkillRepository.findByUserIdAndSkillId(userId, targetSkill.getId())
                .orElseGet(() -> {
                    EmployeeSkill es = new EmployeeSkill();
                    es.setUser(user);
                    es.setSkill(targetSkill);
                    return es;
                });

        int level = dto.getProficiencyLevel() != null ? Math.max(1, Math.min(5, dto.getProficiencyLevel())) : 3;
        empSkill.setProficiencyLevel(level);
        employeeSkillRepository.save(empSkill);

        try {
            gapAnalysisService.recalculateUserGaps(userId);
        } catch (Exception e) {
            System.err.println("Gap recalculation error: " + e.getMessage());
        }

        RoleSkillBenchmark bm = null;
        if (user.getRole() != null) {
            bm = benchmarkRepository.findByRoleId(user.getRole().getId()).stream()
                    .filter(b -> b.getSkill().getId().equals(targetSkill.getId()))
                    .findFirst().orElse(null);
        }

        String reqLevel = bm != null ? String.valueOf(bm.getRequiredLevel()) : "Not Set";
        Boolean isCritical = bm != null ? bm.getIsCritical() : false;

        return new SkillDto(
                targetSkill.getId(),
                targetSkill.getName(),
                targetSkill.getCategory() != null ? targetSkill.getCategory().getName() : "General",
                String.valueOf(empSkill.getProficiencyLevel()),
                reqLevel,
                isCritical
        );
    }

    @Transactional
    public SkillDto addCustomSkill(UUID userId, UpdateSkillRatingDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String catName = dto.getCategoryName() != null ? dto.getCategoryName() : "General";
        SkillCategory category = skillCategoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(catName))
                .findFirst()
                .orElseGet(() -> {
                    SkillCategory c = new SkillCategory();
                    c.setName(catName);
                    c.setDescription(catName + " Category");
                    return skillCategoryRepository.save(c);
                });

        Skill skill = skillRepository.findAll().stream()
                .filter(s -> s.getName().equalsIgnoreCase(dto.getSkillName()))
                .findFirst()
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(dto.getSkillName());
                    s.setDescription("Custom skill " + dto.getSkillName());
                    s.setCategory(category);
                    return skillRepository.save(s);
                });

        EmployeeSkill empSkill = employeeSkillRepository.findByUserIdAndSkillId(userId, skill.getId())
                .orElseGet(() -> {
                    EmployeeSkill es = new EmployeeSkill();
                    es.setUser(user);
                    es.setSkill(skill);
                    return es;
                });

        empSkill.setProficiencyLevel(dto.getProficiencyLevel() != null ? dto.getProficiencyLevel() : 3);
        employeeSkillRepository.save(empSkill);

        try {
            gapAnalysisService.recalculateUserGaps(userId);
        } catch (Exception e) {
            System.err.println("Gap recalculation error: " + e.getMessage());
        }

        return new SkillDto(
                skill.getId(),
                skill.getName(),
                category.getName(),
                String.valueOf(empSkill.getProficiencyLevel()),
                "Not Set",
                false
        );
    }

    public List<CertificationDto> getCertifications(UUID userId) {
        return certificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(c -> {
                    CertificationDto dto = new CertificationDto(
                            c.getId(),
                            c.getUser().getId(),
                            c.getName(),
                            c.getIssuingOrganization(),
                            c.getIssueDate(),
                            c.getExpirationDate(),
                            c.getCredentialId(),
                            c.getCredentialUrl()
                    );
                    if (c.getSkill() != null) {
                        dto.setSkillId(c.getSkill().getId());
                        dto.setSkillName(c.getSkill().getName());
                    }
                    dto.setStatus(c.getStatus());
                    dto.setStoragePath(c.getStoragePath());
                    dto.setFileType(c.getFileType());
                    dto.setFileSize(c.getFileSize());
                    dto.setAssessmentStatus(c.getAssessmentStatus());
                    dto.setAssessmentScore(c.getAssessmentScore());
                    return dto;
                }).collect(Collectors.toList());
    }

    @Transactional
    public CertificationDto addCertification(UUID userId, CertificationDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Certification cert = new Certification(
                user,
                dto.getName(),
                dto.getIssuingOrganization(),
                dto.getIssueDate(),
                dto.getExpirationDate(),
                dto.getCredentialId(),
                dto.getCredentialUrl()
        );
        
        if (dto.getSkillId() != null) {
            Skill skill = skillRepository.findById(dto.getSkillId()).orElse(null);
            cert.setSkill(skill);
        }
        cert.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING_VERIFICATION");
        cert.setStoragePath(dto.getStoragePath());
        cert.setFileType(dto.getFileType());
        cert.setFileSize(dto.getFileSize());
        cert.setAssessmentStatus(dto.getAssessmentStatus() != null ? dto.getAssessmentStatus() : "Pending Verification");
        cert.setAssessmentScore(dto.getAssessmentScore());

        cert = certificationRepository.save(cert);

        // Notify L&D Admin(s) of new certification submission
        try {
            if (user.getOrganization() != null) {
                List<User> ldAdmins = userRepository.findByOrganizationId(user.getOrganization().getId()).stream()
                        .filter(u -> u.getSystemRole() == SystemRole.L_AND_D_ADMIN || "L_AND_D_ADMIN".equalsIgnoreCase(u.getRoleTitle()))
                        .collect(Collectors.toList());
                for (User admin : ldAdmins) {
                    notificationService.notifyLdCertSubmitted(admin, user.getFullName(), cert.getName(), cert.getId());
                }
            }
        } catch (Exception e) {
            System.err.println("Notification error on cert submission: " + e.getMessage());
        }

        try {
            gapAnalysisService.recalculateUserGaps(userId);
        } catch (Exception e) {
            System.err.println("Gap recalculation error: " + e.getMessage());
        }
        
        CertificationDto result = new CertificationDto(
                cert.getId(),
                user.getId(),
                cert.getName(),
                cert.getIssuingOrganization(),
                cert.getIssueDate(),
                cert.getExpirationDate(),
                cert.getCredentialId(),
                cert.getCredentialUrl()
        );
        if (cert.getSkill() != null) {
            result.setSkillId(cert.getSkill().getId());
            result.setSkillName(cert.getSkill().getName());
        }
        result.setStatus(cert.getStatus());
        result.setStoragePath(cert.getStoragePath());
        result.setFileType(cert.getFileType());
        result.setFileSize(cert.getFileSize());
        result.setAssessmentStatus(cert.getAssessmentStatus());
        result.setAssessmentScore(cert.getAssessmentScore());
        result.setEmployeeName(user.getFullName());
        result.setEmployeeEmail(user.getEmail());
        result.setDepartmentName(user.getDepartment() != null ? user.getDepartment().getName() : "Enterprise");
        result.setRoleTitle(user.getRoleTitle());
        
        return result;
    }

    @Transactional
    public void deleteCertification(UUID userId, UUID certId) {
        Certification cert = certificationRepository.findById(certId)
                .orElseThrow(() -> new RuntimeException("Certification not found"));
        if (!cert.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        certificationRepository.delete(cert);
    }

    @Transactional
    public UserProfileDto updateExperience(UUID userId, String experienceText) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setExperience(experienceText);
        userRepository.save(user);
        return getEmployeeProfile(userId);
    }

    @Transactional
    public UserProfileDto updateEducation(UUID userId, String educationText) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEducation(educationText);
        userRepository.save(user);
        return getEmployeeProfile(userId);
    }

    public RoleMappingDto getRoleMapping(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = user.getRole();
        Department dept = user.getDepartment();

        String roleTitle = role != null ? role.getTitle() : "Unassigned Role";
        String roleDesc = role != null && role.getDescription() != null ? role.getDescription() : "Standard organizational role.";
        String deptName = dept != null ? dept.getName() : "Unassigned Department";
        String deptDesc = dept != null && dept.getDescription() != null ? dept.getDescription() : "Core department unit.";

        List<RoleSkillBenchmark> benchmarks = role != null ? benchmarkRepository.findByRoleId(role.getId()) : Collections.emptyList();
        Map<UUID, Integer> currentLevels = employeeSkillRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(es -> es.getSkill().getId(), EmployeeSkill::getProficiencyLevel, (a, b) -> a));

        List<RoleMappingDto.BenchmarkMappingItem> items = benchmarks.stream().map(bm -> {
            Integer actual = currentLevels.getOrDefault(bm.getSkill().getId(), 1);
            Integer required = bm.getRequiredLevel();
            int gap = Math.max(0, (int) Math.round(((double)(required - actual) / required) * 100));

            return new RoleMappingDto.BenchmarkMappingItem(
                    bm.getSkill().getId(),
                    bm.getSkill().getName(),
                    bm.getSkill().getCategory() != null ? bm.getSkill().getCategory().getName() : "General",
                    required,
                    actual,
                    gap,
                    bm.getIsCritical()
            );
        }).collect(Collectors.toList());

        return new RoleMappingDto(roleTitle, roleDesc, deptName, deptDesc, items);
    }
}

