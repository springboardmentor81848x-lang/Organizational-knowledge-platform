package com.okip.service.admin.impl;

import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.sql.DataSource;

import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.okip.dto.admin.CreateUserRequestDTO;
import com.okip.dto.admin.CreateUserResponseDTO;
import com.okip.entity.assessment.AssessmentAttempt;
import com.okip.entity.master.Department;
import com.okip.entity.master.Employee;
import com.okip.entity.master.JobRole;
import com.okip.entity.master.Role;
import com.okip.entity.master.Skill;
import com.okip.entity.master.Training;
import com.okip.entity.transaction.EmployeeTraining;
import com.okip.entity.transaction.KnowledgeGap;
import com.okip.entity.transaction.MentorshipRequest;
import com.okip.enums.AccountStatus;
import com.okip.exception.ResourceAlreadyExistsException;
import com.okip.exception.ResourceNotFoundException;
import com.okip.repository.CertificationRepository;
import com.okip.repository.DepartmentRepository;
import com.okip.repository.EmployeeJobRoleRepository;
import com.okip.repository.EmployeeRepository;
import com.okip.repository.EmployeeSkillRepository;
import com.okip.repository.EmployeeTrainingRepository;
import com.okip.repository.JobRoleRepository;
import com.okip.repository.KnowledgeGapRepository;
import com.okip.repository.MentorshipRequestRepository;
import com.okip.repository.RoleRepository;
import com.okip.repository.SkillRepository;
import com.okip.repository.TrainingRepository;
import com.okip.repository.assessment.AssessmentAttemptRepository;
import com.okip.repository.assessment.AssessmentRepository;
import com.okip.service.admin.AdminService;
import com.okip.dto.notification.NotificationResponseDTO;
import com.okip.entity.transaction.Notification;
import com.okip.repository.NotificationRepository;
@Service
@Transactional(readOnly = true)
public class AdminServiceImpl implements AdminService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final RoleRepository roleRepository;
    private final SkillRepository skillRepository;
    private final JobRoleRepository jobRoleRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeJobRoleRepository employeeJobRoleRepository;
    private final KnowledgeGapRepository knowledgeGapRepository;
    private final TrainingRepository trainingRepository;
    private final EmployeeTrainingRepository employeeTrainingRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentAttemptRepository assessmentAttemptRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final CertificationRepository certificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final DataSource dataSource;
    private final Environment environment;
    private final NotificationRepository notificationRepository;

    public AdminServiceImpl(EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            RoleRepository roleRepository,
            SkillRepository skillRepository,
            JobRoleRepository jobRoleRepository,
            EmployeeSkillRepository employeeSkillRepository,
            EmployeeJobRoleRepository employeeJobRoleRepository,
            KnowledgeGapRepository knowledgeGapRepository,
            TrainingRepository trainingRepository,
            EmployeeTrainingRepository employeeTrainingRepository,
            AssessmentRepository assessmentRepository,
            AssessmentAttemptRepository assessmentAttemptRepository,
            MentorshipRequestRepository mentorshipRequestRepository,
            CertificationRepository certificationRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder,
            DataSource dataSource,
            Environment environment) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.roleRepository = roleRepository;
        this.skillRepository = skillRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.employeeJobRoleRepository = employeeJobRoleRepository;
        this.knowledgeGapRepository = knowledgeGapRepository;
        this.trainingRepository = trainingRepository;
        this.employeeTrainingRepository = employeeTrainingRepository;
        this.assessmentRepository = assessmentRepository;
        this.assessmentAttemptRepository = assessmentAttemptRepository;
        this.mentorshipRequestRepository = mentorshipRequestRepository;
        this.certificationRepository = certificationRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
        this.dataSource = dataSource;
        this.environment = environment;
    }

    @Override
    @Transactional
    public CreateUserResponseDTO createUser(CreateUserRequestDTO request) {
        if (employeeRepository.existsByOfficialEmail(request.getOfficialEmail())) {
            throw new ResourceAlreadyExistsException("Official email already exists.");
        }
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found."));
        Role role = roleRepository.findByRoleName(request.getRole())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found."));

        Employee employee = new Employee();
        employee.setEmployeeCode(generateEmployeeCode());
        employee.setFirstName(request.getFirstName());
        employee.setLastName(request.getLastName());
        employee.setOfficialEmail(request.getOfficialEmail());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setDepartment(department);
        employee.setRole(role);
        employee.setStatus(AccountStatus.APPROVED);
        employee = employeeRepository.save(employee);

        CreateUserResponseDTO response = new CreateUserResponseDTO();
        response.setEmployeeId(employee.getEmployeeId());
        response.setEmployeeCode(employee.getEmployeeCode());
        response.setMessage("User created successfully.");
        return response;
    }

    private String generateEmployeeCode() {
        long next = employeeRepository.count() + 1;
        String code;
        do { code = String.format("EMP%04d", next++); } while (employeeRepository.existsByEmployeeCode(code));
        return code;
    }

    @Override
    public Map<String, Object> getDashboard() {
        List<Employee> employees = employeeRepository.findAll();
        List<EmployeeTraining> trainings = employeeTrainingRepository.findAll();
        List<KnowledgeGap> gaps = knowledgeGapRepository.findAll();
        List<AssessmentAttempt> attempts = assessmentAttemptRepository.findAll();
        List<MentorshipRequest> mentorships = mentorshipRequestRepository.findAll();

        long approved = employees.stream().filter(e -> e.getStatus() == AccountStatus.APPROVED).count();
        long pending = employees.stream().filter(e -> e.getStatus() == AccountStatus.PENDING).count();
        long active = employees.stream().filter(e -> e.getStatus() == AccountStatus.APPROVED).count();
        long employeesWithGaps = gaps.stream().map(g -> g.getEmployeeJobRole().getEmployee().getEmployeeId()).distinct().count();
        long critical = gaps.stream().filter(g -> g.getGapType() != null && "MISSING_SKILL".equalsIgnoreCase(g.getGapType().name())).count();
        long inTraining = trainings.stream().filter(t -> t.getStatus() == EmployeeTraining.Status.IN_PROGRESS).map(t -> t.getEmployee().getEmployeeId()).distinct().count();
        long completed = trainings.stream().filter(t -> t.getStatus() == EmployeeTraining.Status.COMPLETED).count();
        double completionRate = trainings.isEmpty() ? 0 : completed * 100.0 / trainings.size();
        double avgProgress = trainings.isEmpty() ? 0 : trainings.stream().mapToDouble(EmployeeTraining::getProgressPercentage).average().orElse(0);
        double avgAssessment = attempts.isEmpty() ? 0 : attempts.stream().mapToDouble(a -> a.getPercentage() == null ? 0 : a.getPercentage()).average().orElse(0);
        long activeMentorships = mentorships.stream().filter(m -> m.getStatus() == MentorshipRequest.Status.ACCEPTED).count();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalUsers", employees.size());
        out.put("approvedUsers", approved);
        out.put("pendingUsers", pending);
        out.put("activeUsers", active);
        out.put("employeesWithGaps", employeesWithGaps);
        out.put("criticalSkillGaps", critical);
        out.put("employeesInTraining", inTraining);
        out.put("trainingCompletionRate", round(completionRate));
        out.put("averageLearningProgress", round(avgProgress));
        out.put("averageAssessmentScore", round(avgAssessment));
        out.put("activeMentorships", activeMentorships);
        out.put("roles", roleCounts(employees));
        out.put("departments", departmentCounts(employees));
        out.put("gapSkills", gapSkillCounts(gaps));
        out.put("trainingStatuses", trainingStatusCounts(trainings));
        out.put("assessmentTypes", assessmentTypeCounts(attempts));
        out.put("certifications", certificationRepository.count());
        out.put("skills", skillRepository.count());
        out.put("jobRoles", jobRoleRepository.count());
        out.put("trainings", trainingRepository.count());
        return out;
    }

    @Override
    public List<Map<String, Object>> getUsers() {
        return employeeRepository.findAll().stream()
                .sorted(Comparator.comparing(Employee::getEmployeeId, Comparator.nullsLast(Long::compareTo)).reversed())
                .map(this::employeeMap).collect(Collectors.toList());
    }

    private Map<String, Object> employeeMap(Employee e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("employeeId", e.getEmployeeId());
        m.put("employeeCode", e.getEmployeeCode());
        m.put("firstName", e.getFirstName());
        m.put("lastName", e.getLastName());
        m.put("name", (e.getFirstName() + " " + e.getLastName()).trim());
        m.put("email", e.getOfficialEmail());
        m.put("status", e.getStatus() == null ? null : e.getStatus().name());
        m.put("roleId", e.getRole() == null ? null : e.getRole().getRoleId());
        m.put("role", e.getRole() == null ? null : e.getRole().getRoleName().name());
        m.put("departmentId", e.getDepartment() == null ? null : e.getDepartment().getDepartmentId());
        m.put("department", e.getDepartment() == null ? null : e.getDepartment().getDepartmentName());
        m.put("createdAt", e.getCreatedAt());
        m.put("updatedAt", e.getUpdatedAt());
        return m;
    }

    @Override public List<Map<String, Object>> getRoles() {
        return roleRepository.findAll().stream().map(r -> {
            Map<String,Object> m=new LinkedHashMap<>(); m.put("roleId",r.getRoleId()); m.put("roleName",r.getRoleName().name()); m.put("description",r.getDescription());
            m.put("userCount", employeeRepository.findAll().stream().filter(e -> e.getRole()!=null && Objects.equals(e.getRole().getRoleId(), r.getRoleId())).count()); return m;
        }).collect(Collectors.toList());
    }

    @Override public List<Map<String, Object>> getDepartments() {
        return departmentRepository.findAll().stream().map(d -> {
            Map<String,Object> m=new LinkedHashMap<>(); m.put("departmentId",d.getDepartmentId()); m.put("departmentName",d.getDepartmentName()); m.put("description",d.getDescription());
            m.put("employeeCount", employeeRepository.findAll().stream().filter(e -> e.getDepartment()!=null && Objects.equals(e.getDepartment().getDepartmentId(), d.getDepartmentId())).count()); return m;
        }).collect(Collectors.toList());
    }

    @Override public List<Map<String, Object>> getSkills() {
        return skillRepository.findAll().stream().map(s -> {
            Map<String,Object> m=new LinkedHashMap<>(); m.put("skillId",s.getSkillId()); m.put("skillName",s.getSkillName()); m.put("category",s.getSkillCategory()==null?null:s.getSkillCategory().name()); m.put("description",s.getDescription());
            m.put("assignedEmployees", employeeSkillRepository.findAll().stream().filter(es -> es.getSkill()!=null && Objects.equals(es.getSkill().getSkillId(),s.getSkillId())).map(es -> es.getEmployee().getEmployeeId()).distinct().count()); return m;
        }).collect(Collectors.toList());
    }

    @Override public List<Map<String, Object>> getJobRoles() {
        return jobRoleRepository.findAll().stream().map(j -> {
            Map<String,Object> m=new LinkedHashMap<>(); m.put("jobRoleId",j.getJobRoleId()); m.put("jobRoleName",j.getJobRoleName()); m.put("description",j.getDescription());
            m.put("assignedEmployees", employeeJobRoleRepository.findByJobRole(j).stream().filter(x -> Boolean.TRUE.equals(x.getActive())).count()); return m;
        }).collect(Collectors.toList());
    }

    @Override public List<Map<String, Object>> getTrainings() {
        return trainingRepository.findAll().stream().map(t -> {
            Map<String,Object> m=new LinkedHashMap<>(); m.put("trainingId",t.getTrainingId()); m.put("trainingName",t.getTrainingName()); m.put("provider",t.getProvider()); m.put("duration",t.getDuration()); m.put("level",t.getLevel()); m.put("description",t.getDescription()); m.put("courseUrl",t.getCourseUrl());
            List<EmployeeTraining> ets=employeeTrainingRepository.findAll().stream().filter(x -> x.getTraining()!=null && Objects.equals(x.getTraining().getTrainingId(),t.getTrainingId())).toList();
            m.put("enrollments",ets.size()); m.put("completed",ets.stream().filter(x->x.getStatus()==EmployeeTraining.Status.COMPLETED).count()); m.put("averageProgress",round(ets.stream().mapToDouble(EmployeeTraining::getProgressPercentage).average().orElse(0))); return m;
        }).collect(Collectors.toList());
    }

    @Override public List<Map<String, Object>> getGaps() {
        return knowledgeGapRepository.findAll().stream().map(g -> {
            Map<String,Object> m=new LinkedHashMap<>(); Employee e=g.getEmployeeJobRole().getEmployee(); Skill s=g.getSkill(); JobRole j=g.getEmployeeJobRole().getJobRole();
            m.put("id",g.getKnowledgeGapId()); m.put("employeeId",e.getEmployeeId()); m.put("employee",(e.getFirstName()+" "+e.getLastName()).trim()); m.put("department",e.getDepartment()==null?null:e.getDepartment().getDepartmentName()); m.put("jobRole",j==null?null:j.getJobRoleName()); m.put("skill",s==null?null:s.getSkillName()); m.put("current",g.getCurrentProficiency()==null?null:g.getCurrentProficiency().name()); m.put("required",g.getRequiredProficiency()==null?null:g.getRequiredProficiency().name()); m.put("gapType",g.getGapType()==null?null:g.getGapType().name()); m.put("gapScore",g.getGapScore()); m.put("gapPercentage",g.getGapPercentage()); m.put("status",g.getStatus()==null?null:g.getStatus().name()); m.put("analyzedAt",g.getAnalyzedAt()); return m;
        }).sorted((a,b)->Double.compare(num(b.get("gapPercentage")),num(a.get("gapPercentage")))).collect(Collectors.toList());
    }

    @Override public List<Map<String, Object>> getAssessments() {
        return assessmentAttemptRepository.findAll().stream().sorted(Comparator.comparing(AssessmentAttempt::getStartedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed()).map(a -> {
            Map<String,Object> m=new LinkedHashMap<>(); Employee e=a.getEmployee(); m.put("attemptId",a.getAttemptId()); m.put("employeeId",e.getEmployeeId()); m.put("employee",(e.getFirstName()+" "+e.getLastName()).trim()); m.put("assessment",a.getAssessment()==null?null:a.getAssessment().getAssessmentName()); m.put("skill",a.getAssessment()==null||a.getAssessment().getSkill()==null?null:a.getAssessment().getSkill().getSkillName()); m.put("type",a.getAssessment()==null?null:a.getAssessment().getAssessmentType().name()); m.put("status",a.getStatus().name()); m.put("percentage",a.getPercentage()); m.put("score",a.getScore()); m.put("startedAt",a.getStartedAt()); m.put("submittedAt",a.getSubmittedAt()); return m;
        }).collect(Collectors.toList());
    }

    @Override public List<Map<String, Object>> getMentorships() {
        return mentorshipRequestRepository.findAll().stream().sorted(Comparator.comparing(MentorshipRequest::getCreatedAt, Comparator.nullsLast(LocalDateTime::compareTo)).reversed()).map(mr -> {
            Map<String,Object> m=new LinkedHashMap<>(); Employee mentee=mr.getMentee(), mentor=mr.getMentor(); m.put("id",mr.getMentorshipRequestId()); m.put("mentee",person(mentee)); m.put("mentor",person(mentor)); m.put("skill",mr.getSkill()==null?null:mr.getSkill().getSkillName()); m.put("status",mr.getStatus().name()); m.put("createdAt",mr.getCreatedAt()); return m;
        }).collect(Collectors.toList());
    }

    private String person(Employee e){ return e==null?null:(e.getFirstName()+" "+e.getLastName()).trim(); }

    @Override public Map<String, Object> getSystemHealth() {
        Map<String,Object> m=new LinkedHashMap<>();
        long start=System.nanoTime(); boolean connected=false; String dbMessage="";
        try(Connection c=dataSource.getConnection()){ connected=c.isValid(2); dbMessage=c.getMetaData().getDatabaseProductName()+" "+c.getMetaData().getDatabaseProductVersion(); } catch(Exception ex){ dbMessage=ex.getMessage(); }
        Runtime rt=Runtime.getRuntime(); long max=rt.maxMemory(), used=rt.totalMemory()-rt.freeMemory();
        m.put("databaseConnected",connected); m.put("database",dbMessage); m.put("responseTimeMs",TimeUnit.NANOSECONDS.toMillis(System.nanoTime()-start)); m.put("javaVersion",System.getProperty("java.version")); m.put("processors",rt.availableProcessors()); m.put("memoryUsedMb",used/(1024*1024)); m.put("memoryMaxMb",max/(1024*1024)); m.put("memoryUsagePercent",round(max==0?0:used*100.0/max)); m.put("serverPort",environment.getProperty("server.port")); m.put("applicationName",environment.getProperty("spring.application.name")); m.put("uptimeSeconds",TimeUnit.MILLISECONDS.toSeconds(java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime())); return m;
    }

    @Override public Map<String, Object> getSystemConfiguration() {
        Map<String,Object> m=new LinkedHashMap<>();
        String db=environment.getProperty("spring.datasource.url");
        m.put("applicationName",environment.getProperty("spring.application.name")); m.put("serverPort",environment.getProperty("server.port")); m.put("databaseUrl",db); m.put("databaseDriver",environment.getProperty("spring.datasource.driver-class-name")); m.put("jpaDdlAuto",environment.getProperty("spring.jpa.hibernate.ddl-auto")); m.put("jwtConfigured",environment.getProperty("jwt.secret")!=null && !environment.getProperty("jwt.secret","").isBlank()); m.put("jwtExpirationMs",environment.getProperty("jwt.expiration")); m.put("geminiConfigured",environment.getProperty("spring.ai.google.genai.api-key")!=null && !environment.getProperty("spring.ai.google.genai.api-key","").contains("${")); m.put("geminiModel",environment.getProperty("spring.ai.google.genai.chat.model")); return m;
    }

    @Override
public List<NotificationResponseDTO> getNotifications() {

    return notificationRepository.findAll()
            .stream()
            .sorted(Comparator.comparing(
                    Notification::getCreatedAt,
                    Comparator.nullsLast(LocalDateTime::compareTo)
            ).reversed())
            .map(this::notificationDto)
            .collect(Collectors.toList());
}

private NotificationResponseDTO notificationDto(Notification n) {

    NotificationResponseDTO dto = new NotificationResponseDTO();

    dto.setNotificationId(n.getNotificationId());
    dto.setType(n.getType());
    dto.setTitle(n.getTitle());
    dto.setMessage(n.getMessage());
    dto.setRead(n.isRead());
    dto.setCreatedAt(n.getCreatedAt());

    return dto;
}

    @Override @Transactional public Map<String,Object> updateUserStatus(Long employeeId, AccountStatus status){ Employee e=employeeRepository.findById(employeeId).orElseThrow(()->new ResourceNotFoundException("Employee not found.")); e.setStatus(status); employeeRepository.save(e); return employeeMap(e); }
    @Override @Transactional public Map<String,Object> updateUserRole(Long employeeId, Long roleId){ Employee e=employeeRepository.findById(employeeId).orElseThrow(()->new ResourceNotFoundException("Employee not found.")); Role r=roleRepository.findById(roleId).orElseThrow(()->new ResourceNotFoundException("Role not found.")); e.setRole(r); employeeRepository.save(e); return employeeMap(e); }

    private List<Map<String,Object>> roleCounts(List<Employee> es){ Map<String,Long> c=es.stream().filter(e->e.getRole()!=null).collect(Collectors.groupingBy(e->e.getRole().getRoleName().name(),Collectors.counting())); return c.entrySet().stream().map(x->{Map<String,Object>m=new LinkedHashMap<>();m.put("name",x.getKey());m.put("count",x.getValue());return m;}).toList(); }
    private List<Map<String,Object>> departmentCounts(List<Employee> es){ Map<String,Long> c=es.stream().filter(e->e.getDepartment()!=null).collect(Collectors.groupingBy(e->e.getDepartment().getDepartmentName(),Collectors.counting())); return c.entrySet().stream().map(x->{Map<String,Object>m=new LinkedHashMap<>();m.put("name",x.getKey());m.put("count",x.getValue());return m;}).toList(); }
    private List<Map<String,Object>> gapSkillCounts(List<KnowledgeGap> gs){ Map<String,Long> c=gs.stream().filter(g->g.getSkill()!=null).collect(Collectors.groupingBy(g->g.getSkill().getSkillName(),Collectors.counting())); return c.entrySet().stream().map(x->{Map<String,Object>m=new LinkedHashMap<>();m.put("name",x.getKey());m.put("count",x.getValue());return m;}).sorted((a,b)->Long.compare((Long)b.get("count"),(Long)a.get("count"))).toList(); }
    private List<Map<String,Object>> trainingStatusCounts(List<EmployeeTraining> ts){ Map<String,Long> c=ts.stream().collect(Collectors.groupingBy(t->t.getStatus().name(),Collectors.counting())); return c.entrySet().stream().map(x->{Map<String,Object>m=new LinkedHashMap<>();m.put("name",x.getKey());m.put("count",x.getValue());return m;}).toList(); }
    private List<Map<String,Object>> assessmentTypeCounts(List<AssessmentAttempt> as){ Map<String,Long> c=as.stream().filter(a->a.getAssessment()!=null).collect(Collectors.groupingBy(a->a.getAssessment().getAssessmentType().name(),Collectors.counting())); return c.entrySet().stream().map(x->{Map<String,Object>m=new LinkedHashMap<>();m.put("name",x.getKey());m.put("count",x.getValue());return m;}).toList(); }
    private double round(double v){return Math.round(v*100.0)/100.0;}
    private double num(Object v){return v instanceof Number ? ((Number)v).doubleValue() : 0;}
}
