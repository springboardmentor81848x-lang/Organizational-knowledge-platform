package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.EmployeeSkill;
import com.infosys.knowledgeplatform.repository.EmployeeSkillRepository;
import com.infosys.knowledgeplatform.repository.SkillRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/user-skills")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
@Deprecated
public class EmployeeSkillController {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;

    public EmployeeSkillController(EmployeeSkillRepository employeeSkillRepository, SkillRepository skillRepository) {
        this.employeeSkillRepository = employeeSkillRepository;
        this.skillRepository = skillRepository;
    }

    @GetMapping
    public List<EmployeeSkill> listByEmail(@RequestParam(name = "email", required = false) String email) {
        if (email == null) return employeeSkillRepository.findAll();
        return employeeSkillRepository.findByEmployeeEmail(email);
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody EmployeeSkill payload) {
        if (payload.getEmployeeEmail() == null || payload.getSkillName() == null) return ResponseEntity.badRequest().body("email and skillName required");
        payload.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(employeeSkillRepository.save(payload));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EmployeeSkill payload) {
        return employeeSkillRepository.findById(id).map(es -> {
            if (payload.getProficiency() != null) es.setProficiency(payload.getProficiency());
            if (payload.getTargetProficiency() != null) es.setTargetProficiency(payload.getTargetProficiency());
            es.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(employeeSkillRepository.save(es));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

}
