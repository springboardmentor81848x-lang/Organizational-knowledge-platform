package com.infosys.knowledgeplatform.controller;

import com.infosys.knowledgeplatform.model.User;
import com.infosys.knowledgeplatform.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "name", user.getName() == null ? "Unnamed User" : user.getName(),
                        "email", user.getEmail(),
                        "role", user.getRole() == null ? "Employee" : user.getRole(),
                        "targetRole", user.getTargetRole() == null ? "" : user.getTargetRole(),
                        "department", user.getDepartment() == null ? "Unassigned" : user.getDepartment()
                ))
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
