package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.User;
import com.infosys.knowledgeplatform.repository.UserRepository;
import com.infosys.knowledgeplatform.repository.EmployeeImprovementRepository;
import com.infosys.knowledgeplatform.repository.EmployeeSkillRepository;
import com.infosys.knowledgeplatform.repository.EnrollmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final EmployeeImprovementRepository employeeImprovementRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EnrollmentRepository enrollmentRepository;

    public UserController(UserRepository userRepository, EmployeeImprovementRepository employeeImprovementRepository, EmployeeSkillRepository employeeSkillRepository, EnrollmentRepository enrollmentRepository) {
        this.userRepository = userRepository;
        this.employeeImprovementRepository = employeeImprovementRepository;
        this.employeeSkillRepository = employeeSkillRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
            .map(user -> {
                var skills = employeeSkillRepository.findByEmployeeEmail(user.getEmail());
                var enrollments = enrollmentRepository.findByEmployeeEmail(user.getEmail());
                int trainingProgress = enrollments.isEmpty() ? 0 : (int) Math.round(enrollments.stream()
                    .mapToInt(enrollment -> enrollment.getProgressPercent() == null ? 0 : enrollment.getProgressPercent())
                    .average().orElse(0));
                int averageSkill = skills.isEmpty() ? 0 : (int) Math.round(skills.stream()
                    .mapToInt(skill -> skill.getProficiency() == null ? 0 : skill.getProficiency() * 25)
                    .average().orElse(0));
                int assessmentScore = employeeImprovementRepository.findByEmployeeEmail(user.getEmail())
                    .map(progress -> progress.getOverallScore() == null ? 0 : progress.getOverallScore())
                    .orElse(0);
                return Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getName() == null ? "Unnamed User" : user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole() == null ? "Employee" : user.getRole(),
                        "targetRole", user.getTargetRole() == null ? "" : user.getTargetRole(),
                "department", user.getDepartment() == null ? "Unassigned" : user.getDepartment(),
                "assessmentScore", assessmentScore,
                "skillProgress", averageSkill,
                "trainingProgress", trainingProgress,
                "skillGap", Math.max(0, 100 - Math.max(assessmentScore, averageSkill))
                );
            })
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userRepository.save(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
