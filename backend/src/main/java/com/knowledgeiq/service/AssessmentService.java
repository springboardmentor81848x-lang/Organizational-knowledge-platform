package com.knowledgeiq.service;

import com.knowledgeiq.dto.*;
import com.knowledgeiq.model.*;
import com.knowledgeiq.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    @Autowired
    private AssessmentRepository assessmentRepository;

    @Autowired
    private AssessmentResponseRepository assessmentResponseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private EmployeeSkillRepository employeeSkillRepository;

    @Autowired
    private RoleSkillBenchmarkRepository benchmarkRepository;

    @Autowired
    private CustomQuestionnaireRepository customQuestionnaireRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CertificationRepository certificationRepository;

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Transactional(readOnly = true)
    public List<AssessmentDto> getUserAssessments(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        List<Assessment> assessments = assessmentRepository.findByUserIdOrEvaluatorIdOrderByCreatedAtDesc(userId, userId);
        
        return assessments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssessmentDto> getPendingEvaluationsForUser(String evaluatorIdStr) {
        UUID evaluatorId = UUID.fromString(evaluatorIdStr);
        List<Assessment> pending = assessmentRepository.findByEvaluatorIdOrderByCreatedAtDesc(evaluatorId).stream()
                .filter(a -> a.getStatus() == AssessmentStatus.PENDING)
                .collect(Collectors.toList());
        
        return pending.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public CustomQuestionnaireDto createCustomQuestionnaire(String creatorIdStr, CustomQuestionnaireDto dto) {
        User creator = userRepository.findById(UUID.fromString(creatorIdStr)).orElse(null);
        
        CustomQuestionnaire cq = new CustomQuestionnaire();
        cq.setTitle(dto.getTitle() != null ? dto.getTitle() : "Custom Skill Assessment");
        cq.setDescription(dto.getDescription());
        cq.setTargetRole(dto.getTargetRole());
        cq.setCreatedBy(creator != null ? creator.getFullName() : "HR Specialist");

        if (dto.getSkillIds() != null && !dto.getSkillIds().isEmpty()) {
            cq.setSkillIdsJson(dto.getSkillIds().stream().map(UUID::toString).collect(Collectors.joining(",")));
        }

        cq = customQuestionnaireRepository.save(cq);
        
        dto.setId(cq.getId());
        dto.setCreatedBy(cq.getCreatedBy());
        return dto;
    }

    public List<CustomQuestionnaireDto> getCustomQuestionnaires() {
        return customQuestionnaireRepository.findByOrderByCreatedAtDesc().stream().map(cq -> {
            CustomQuestionnaireDto dto = new CustomQuestionnaireDto();
            dto.setId(cq.getId());
            dto.setTitle(cq.getTitle());
            dto.setDescription(cq.getDescription());
            dto.setTargetRole(cq.getTargetRole());
            dto.setCreatedBy(cq.getCreatedBy());
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public AssessmentDto scheduleAssessment(String creatorIdStr, ScheduleAssessmentDto dto) {
        User targetUser = null;
        if (dto.getTargetUserId() != null) {
            targetUser = userRepository.findById(dto.getTargetUserId()).orElse(null);
        }
        if (targetUser == null && dto.getTargetUserEmail() != null) {
            targetUser = userRepository.findAllByEmailIgnoreCase(dto.getTargetUserEmail()).stream().findFirst().orElse(null);
        }

        if (targetUser == null) {
            throw new RuntimeException("Target user for scheduled assessment not found");
        }

        User creator = userRepository.findById(UUID.fromString(creatorIdStr)).orElse(targetUser);

        Assessment assessment = new Assessment();
        assessment.setUser(targetUser);
        assessment.setEvaluator(creator.getId().equals(targetUser.getId()) ? null : creator);
        assessment.setTitle(dto.getTitle() != null && !dto.getTitle().isBlank() 
                ? dto.getTitle() 
                : "Scheduled Assessment: " + targetUser.getFullName());
        
        AssessmentType type = AssessmentType.SELF_ASSESSMENT;
        if (dto.getType() != null) {
            try {
                type = AssessmentType.valueOf(dto.getType().toUpperCase());
            } catch (Exception ignored) {}
        }
        assessment.setType(type);
        assessment.setStatus(AssessmentStatus.PENDING);
        assessment.setNotes(dto.getNotes());
        assessment.setScheduledFor(ZonedDateTime.now().plusDays(3));
        assessment.setDueDate(ZonedDateTime.now().plusDays(10));
        assessment.setReminderSent(true);

        assessment = assessmentRepository.save(assessment);

        // Create Automated Reminder Notification
        Notification notification = new Notification();
        notification.setUser(targetUser);
        notification.setTitle("Upcoming Assessment Scheduled");
        notification.setMessage("You have an upcoming " + type.name().replace("_", " ") + " scheduled (" + assessment.getTitle() + "). Please complete before the due date.");
        notification.setType("ASSESSMENT_REMINDER");
        notification.setIsRead(false);
        notificationRepository.save(notification);

        return mapToDto(assessment);
    }

    public AssessmentComparisonDto compareHistoricalAssessments(String id1Str, String id2Str) {
        UUID id1 = UUID.fromString(id1Str);
        UUID id2 = UUID.fromString(id2Str);

        Assessment a1 = assessmentRepository.findById(id1)
                .orElseThrow(() -> new RuntimeException("Assessment 1 not found"));
        Assessment a2 = assessmentRepository.findById(id2)
                .orElseThrow(() -> new RuntimeException("Assessment 2 not found"));

        AssessmentDto dto1 = mapToDto(a1);
        AssessmentDto dto2 = mapToDto(a2);

        double score1 = dto1.getOverallScore() != null ? dto1.getOverallScore() : 0.0;
        double score2 = dto2.getOverallScore() != null ? dto2.getOverallScore() : 0.0;
        double scoreDelta = Math.round((score2 - score1) * 10.0) / 10.0;

        Map<String, Integer> map1 = new HashMap<>();
        if (dto1.getResponses() != null) {
            dto1.getResponses().forEach(r -> map1.put(r.getSkillName(), r.getProficiencyLevel()));
        }

        Map<String, Integer> map2 = new HashMap<>();
        if (dto2.getResponses() != null) {
            dto2.getResponses().forEach(r -> map2.put(r.getSkillName(), r.getProficiencyLevel()));
        }

        Set<String> allSkillNames = new HashSet<>();
        allSkillNames.addAll(map1.keySet());
        allSkillNames.addAll(map2.keySet());

        List<AssessmentComparisonDto.SkillDeltaItem> deltas = new ArrayList<>();
        for (String skillName : allSkillNames) {
            Integer l1 = map1.getOrDefault(skillName, 0);
            Integer l2 = map2.getOrDefault(skillName, 0);
            deltas.add(new AssessmentComparisonDto.SkillDeltaItem(skillName, l1, l2, l2 - l1));
        }

        return new AssessmentComparisonDto(dto1, dto2, scoreDelta, deltas);
    }

    @Transactional
    public AssessmentQuestionnaireDto getQuestionnaireForUser(String userIdStr) {
        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ensureRoleBenchmarksForUser(user);

        Map<UUID, Integer> requiredLevels = new HashMap<>();
        if (user.getRole() != null) {
            benchmarkRepository.findByRoleId(user.getRole().getId()).forEach(bm -> {
                requiredLevels.put(bm.getSkill().getId(), bm.getRequiredLevel());
            });
        }

        Map<UUID, Integer> currentLevels = employeeSkillRepository.findByUserId(userId).stream()
                .collect(Collectors.toMap(es -> es.getSkill().getId(), EmployeeSkill::getProficiencyLevel, (a, b) -> a));

        List<Skill> allSkills = skillRepository.findAll();
        List<AssessmentQuestionnaireDto.SkillQuestionItem> questionItems = new ArrayList<>();

        for (Skill skill : allSkills) {
            boolean isRoleBenchmark = requiredLevels.containsKey(skill.getId());
            boolean isRecordedSkill = currentLevels.containsKey(skill.getId());

            if (isRoleBenchmark || isRecordedSkill) {
                Integer current = currentLevels.getOrDefault(skill.getId(), 1);
                Integer required = requiredLevels.getOrDefault(skill.getId(), 3);
                String categoryName = skill.getCategory() != null ? skill.getCategory().getName() : "General";

                questionItems.add(new AssessmentQuestionnaireDto.SkillQuestionItem(
                        skill.getId(),
                        skill.getName(),
                        categoryName,
                        current,
                        required,
                        skill.getDescription() != null ? skill.getDescription() : "Rate your proficiency in " + skill.getName()
                ));
            }
        }

        if (questionItems.isEmpty()) {
            for (Skill skill : allSkills) {
                String cat = skill.getCategory() != null ? skill.getCategory().getName() : "";
                if ("Soft Skills".equalsIgnoreCase(cat) || "General".equalsIgnoreCase(cat)) {
                    questionItems.add(new AssessmentQuestionnaireDto.SkillQuestionItem(
                            skill.getId(), skill.getName(), cat, 1, 3, "Rate your proficiency in " + skill.getName()
                    ));
                }
            }
        }

        String title = (user.getRole() != null ? user.getRole().getTitle() : "Employee") + " Skill Self-Assessment";
        String description = "Evaluate your current proficiency levels (1-5) across key domain skills for " +
                (user.getRole() != null ? user.getRole().getTitle() : "your role") + ". Submitting updates your real-time knowledge gap analysis.";

        return new AssessmentQuestionnaireDto(title, description, questionItems);
    }

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    private void ensureRoleBenchmarksForUser(User user) {
        if (user.getRole() == null) return;

        ensureDomainSkillsExist();

        List<RoleSkillBenchmark> existing = benchmarkRepository.findByRoleId(user.getRole().getId());

        Role role = user.getRole();
        String titleLower = role.getTitle() != null ? role.getTitle().toLowerCase() : "";
        String deptLower = (role.getDepartment() != null && role.getDepartment().getName() != null)
                ? role.getDepartment().getName().toLowerCase() : "";

        boolean isMarketing = titleLower.contains("marketing") || deptLower.contains("marketing");
        boolean isHR = titleLower.contains("hr") || titleLower.contains("human") || deptLower.contains("hr");
        boolean isDesign = titleLower.contains("design") || deptLower.contains("design");

        boolean hasMismatchedSkills = false;
        if (!existing.isEmpty()) {
            for (RoleSkillBenchmark bm : existing) {
                String catName = bm.getSkill() != null && bm.getSkill().getCategory() != null
                        ? bm.getSkill().getCategory().getName().toLowerCase() : "";
                String sName = bm.getSkill() != null ? bm.getSkill().getName().toLowerCase() : "";
                if ((isMarketing || isHR || isDesign) && (catName.contains("technical") || sName.contains("react") || sName.contains("spring") || sName.contains("sql"))) {
                    hasMismatchedSkills = true;
                    break;
                }
            }
        }

        if (hasMismatchedSkills) {
            benchmarkRepository.deleteAll(existing);
            existing = Collections.emptyList();
        }

        // If role has fewer than 3 benchmarks, populate full domain benchmarks
        if (existing.size() >= 3) return;

        Set<UUID> existingSkillIds = existing.stream().map(bm -> bm.getSkill().getId()).collect(Collectors.toSet());

        List<Skill> targetSkills = new ArrayList<>();
        List<Skill> allSkills = skillRepository.findAll();

        for (Skill skill : allSkills) {
            if (existingSkillIds.contains(skill.getId())) continue;

            String catName = skill.getCategory() != null ? skill.getCategory().getName().toLowerCase() : "";
            String sName = skill.getName() != null ? skill.getName().toLowerCase() : "";

            if (isMarketing) {
                if (catName.contains("marketing") || sName.contains("content") || sName.contains("seo") || sName.contains("social") || sName.contains("campaign") || sName.contains("brand") || catName.contains("soft") || sName.contains("communication")) {
                    targetSkills.add(skill);
                }
            } else if (isHR) {
                if (catName.contains("human") || catName.contains("hr") || sName.contains("talent") || sName.contains("recruiting") || sName.contains("performance") || catName.contains("soft") || sName.contains("communication")) {
                    targetSkills.add(skill);
                }
            } else if (isDesign) {
                if (catName.contains("design") || sName.contains("ui") || sName.contains("ux") || sName.contains("visual") || catName.contains("soft") || sName.contains("communication")) {
                    targetSkills.add(skill);
                }
            } else {
                if (catName.contains("technical") || catName.contains("soft") || sName.contains("react") || sName.contains("spring") || sName.contains("sql") || sName.contains("communication")) {
                    targetSkills.add(skill);
                }
            }
        }

        if (targetSkills.isEmpty() && existing.isEmpty()) {
            targetSkills = allSkills.stream().limit(5).collect(Collectors.toList());
        }

        for (Skill skill : targetSkills) {
            RoleSkillBenchmark bm = new RoleSkillBenchmark();
            bm.setRole(role);
            bm.setSkill(skill);
            bm.setRequiredLevel(4);
            bm.setIsCritical(true);
            benchmarkRepository.save(bm);
        }
    }

    private void ensureDomainSkillsExist() {
        SkillCategory mktCat = getOrCreateCategory("Marketing", "Digital marketing, content, SEO, and brand growth");
        SkillCategory hrCat = getOrCreateCategory("Human Resources", "People operations, talent acquisition, and compliance");
        SkillCategory softCat = getOrCreateCategory("Soft Skills", "Communication and stakeholder management");

        getOrCreateSkill("Content Strategy & Copywriting", "Content creation, messaging, and storytelling", mktCat);
        getOrCreateSkill("SEO & Digital Advertising", "Search engine optimization and paid media strategy", mktCat);
        getOrCreateSkill("Social Media Analytics & Growth", "Social channel metrics and audience engagement", mktCat);
        getOrCreateSkill("Campaign Management & ROI", "Marketing campaign execution and conversion tracking", mktCat);
        getOrCreateSkill("Brand Strategy & Positioning", "Brand identity and competitive market positioning", mktCat);

        getOrCreateSkill("Talent Acquisition & Recruiting", "Candidate sourcing and structured interviewing", hrCat);
        getOrCreateSkill("Performance Management", "Employee evaluation and performance framework design", hrCat);
        getOrCreateSkill("HR Compliance & Labor Policy", "Regulatory compliance and organizational policy", hrCat);

        getOrCreateSkill("Communication & Stakeholder Management", "Oral, written, and presentation clarity", softCat);
    }

    private SkillCategory getOrCreateCategory(String name, String desc) {
        return skillCategoryRepository.findAll().stream()
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    SkillCategory cat = new SkillCategory();
                    cat.setName(name);
                    cat.setDescription(desc);
                    return skillCategoryRepository.save(cat);
                });
    }

    private Skill getOrCreateSkill(String name, String desc, SkillCategory cat) {
        return skillRepository.findAll().stream()
                .filter(s -> s.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    Skill s = new Skill();
                    s.setName(name);
                    s.setDescription(desc);
                    s.setCategory(cat);
                    return skillRepository.save(s);
                });
    }

    @Transactional
    public AssessmentDto submitAssessment(String userIdStr, AssessmentSubmissionDto submissionDto) {
        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Assessment assessment;
        if (submissionDto.getAssessmentId() != null) {
            assessment = assessmentRepository.findById(submissionDto.getAssessmentId())
                    .orElseGet(() -> createNewAssessment(user, submissionDto));
        } else {
            assessment = createNewAssessment(user, submissionDto);
        }

        assessment.setStatus(AssessmentStatus.COMPLETED);
        assessment.setSubmittedAt(ZonedDateTime.now());

        List<AssessmentSubmissionDto.SubmissionItem> items = submissionDto.getResponses() != null 
                ? submissionDto.getResponses() 
                : Collections.emptyList();

        double totalScore = 0.0;
        int count = 0;

        for (AssessmentSubmissionDto.SubmissionItem item : items) {
            if (item.getProficiencyLevel() == null || item.getProficiencyLevel() < 1 || item.getProficiencyLevel() > 5) {
                continue;
            }

            Skill skill = null;
            if (item.getSkillId() != null) {
                skill = skillRepository.findById(item.getSkillId()).orElse(null);
            }
            if (skill == null && item.getSkillName() != null) {
                String sName = item.getSkillName();
                skill = skillRepository.findAllByName(sName).stream().findFirst().orElse(null);
            }

            if (skill == null) continue;

            // 1. Save AssessmentResponse
            AssessmentResponse response = new AssessmentResponse();
            response.setAssessment(assessment);
            response.setSkill(skill);
            response.setProficiencyLevel(item.getProficiencyLevel());
            response.setNotes(item.getNotes());
            assessmentResponseRepository.save(response);

            // 2. LIVE GAP RECALCULATION: Update EmployeeSkill table directly
            final Skill targetSkill = skill;
            User targetEmployee = assessment.getUser();
            UUID targetEmployeeId = targetEmployee.getId();

            EmployeeSkill employeeSkill = employeeSkillRepository.findByUserIdAndSkillId(targetEmployeeId, targetSkill.getId())
                    .orElseGet(() -> {
                        EmployeeSkill es = new EmployeeSkill();
                        es.setUser(targetEmployee);
                        es.setSkill(targetSkill);
                        return es;
                    });
            employeeSkill.setProficiencyLevel(item.getProficiencyLevel());
            employeeSkillRepository.save(employeeSkill);

            // 3. Update associated certifications
            List<Certification> matchingCerts = certificationRepository.findByUserIdOrderByCreatedAtDesc(targetEmployeeId).stream()
                    .filter(c -> c.getSkill() != null && c.getSkill().getId().equals(targetSkill.getId()))
                    .collect(Collectors.toList());
            for (Certification cert : matchingCerts) {
                cert.setStatus("COMPLETED");
                cert.setAssessmentStatus("Completed");
                cert.setAssessmentScore((double) item.getProficiencyLevel() * 20.0); // 1-5 scale mapped to percentage
                certificationRepository.save(cert);
            }

            totalScore += item.getProficiencyLevel();
            count++;
        }

        double overallScore = count > 0 ? Math.round((totalScore / count) * 20.0 * 10.0) / 10.0 : 0.0; // Percentage out of 100
        assessment.setOverallScore(overallScore);
        assessment = assessmentRepository.save(assessment);

        // Recalculate gaps and save snapshot
        gapAnalysisService.recalculateUserGaps(assessment.getUser().getId());

        return mapToDto(assessment);
    }

    @Transactional
    public AssessmentDto requestPeerAssessment(String userIdStr, PeerRequestDto requestDto) {
        UUID userId = UUID.fromString(userIdStr);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User evaluator = null;
        if (requestDto.getEvaluatorId() != null) {
            evaluator = userRepository.findById(requestDto.getEvaluatorId()).orElse(null);
        }
        if (evaluator == null && requestDto.getEvaluatorEmail() != null) {
            evaluator = userRepository.findAllByEmailIgnoreCase(requestDto.getEvaluatorEmail()).stream().findFirst().orElse(null);
        }

        if (evaluator == null) {
            throw new RuntimeException("Evaluator not found");
        }

        Assessment assessment = new Assessment();
        assessment.setUser(user);
        assessment.setEvaluator(evaluator);
        assessment.setTitle(requestDto.getTitle() != null && !requestDto.getTitle().isBlank() 
                ? requestDto.getTitle() 
                : "360° Peer Review for " + user.getFullName());
        assessment.setType(AssessmentType.PEER_360);
        assessment.setStatus(AssessmentStatus.PENDING);
        assessment.setCreatedAt(ZonedDateTime.now());

        assessment = assessmentRepository.save(assessment);

        return mapToDto(assessment);
    }

    private Assessment createNewAssessment(User user, AssessmentSubmissionDto submissionDto) {
        Assessment assessment = new Assessment();
        assessment.setUser(user);
        assessment.setTitle(submissionDto.getTitle() != null && !submissionDto.getTitle().isBlank() 
                ? submissionDto.getTitle() 
                : "Skill Self-Assessment");
        
        AssessmentType type = AssessmentType.SELF_ASSESSMENT;
        if (submissionDto.getType() != null) {
            try {
                type = AssessmentType.valueOf(submissionDto.getType().toUpperCase());
            } catch (Exception ignored) {}
        }
        assessment.setType(type);
        assessment.setStatus(AssessmentStatus.PENDING);
        assessment.setCreatedAt(ZonedDateTime.now());
        return assessmentRepository.save(assessment);
    }

    @Transactional(readOnly = true)
    public AssessmentDto getAssessmentResults(UUID assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Assessment not found with id: " + assessmentId));
        return mapToDto(assessment);
    }

    public AssessmentDto mapToDto(Assessment assessment) {
        AssessmentDto dto = new AssessmentDto();
        dto.setId(assessment.getId());
        dto.setTitle(assessment.getTitle());
        dto.setType(assessment.getType().name());
        dto.setStatus(assessment.getStatus().name());

        if (assessment.getUser() != null) {
            dto.setUserId(assessment.getUser().getId());
            try {
                dto.setUserName(assessment.getUser().getFullName());
            } catch (Exception e) {
                userRepository.findById(assessment.getUser().getId())
                        .ifPresent(u -> dto.setUserName(u.getFullName()));
            }
        }

        if (assessment.getEvaluator() != null) {
            dto.setEvaluatorId(assessment.getEvaluator().getId());
            try {
                dto.setEvaluatorName(assessment.getEvaluator().getFullName());
            } catch (Exception e) {
                userRepository.findById(assessment.getEvaluator().getId())
                        .ifPresent(u -> dto.setEvaluatorName(u.getFullName()));
            }
        }

        dto.setOverallScore(assessment.getOverallScore());
        dto.setSubmittedAt(assessment.getSubmittedAt());
        dto.setCreatedAt(assessment.getCreatedAt());

        List<AssessmentResponse> responses = assessmentResponseRepository.findByAssessmentId(assessment.getId());
        if (!responses.isEmpty()) {
            List<AssessmentDto.AssessmentResponseItemDto> responseDtos = responses.stream().map(r -> {
                UUID skillId = null;
                String skillName = "Skill";
                String categoryName = "General";
                if (r.getSkill() != null) {
                    skillId = r.getSkill().getId();
                    try {
                        skillName = r.getSkill().getName();
                        if (r.getSkill().getCategory() != null) {
                            categoryName = r.getSkill().getCategory().getName();
                        }
                    } catch (Exception ignored) {}
                }
                return new AssessmentDto.AssessmentResponseItemDto(
                        skillId,
                        skillName,
                        categoryName,
                        r.getProficiencyLevel(),
                        r.getNotes()
                );
            }).collect(Collectors.toList());
            dto.setResponses(responseDtos);
        }

        return dto;
    }
}
