package com.team7.knowledge_gap_platform.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mentorship-requests")
public class MentorshipRequestController {

    private final AtomicLong requestSeq = new AtomicLong(10);
    private final List<Map<String, Object>> requests = new ArrayList<>();

    public MentorshipRequestController() {
        requests.add(new ConcurrentHashMap<>(Map.of(
                "id", 1L,
                "menteeId", 1L,
                "mentorId", 3L,
                "skillId", 1L,
                "learningGoal", "Master Microservice Architecture & Event Driven Systems",
                "message", "Hi Vikram, I would like guidance on scalable Java Spring Boot backend design.",
                "status", "ACCEPTED",
                "createdAt", LocalDateTime.now().minusDays(5).toString()
        )));
    }

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<Map<String, Object>>> getRequestsForMentor(@PathVariable Long mentorId) {
        List<Map<String, Object>> list = requests.stream()
                .filter(r -> mentorId.equals(Long.valueOf(String.valueOf(r.get("mentorId")))))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/mentee/{menteeId}")
    public ResponseEntity<List<Map<String, Object>>> getRequestsForMentee(@PathVariable Long menteeId) {
        List<Map<String, Object>> list = requests.stream()
                .filter(r -> menteeId.equals(Long.valueOf(String.valueOf(r.get("menteeId")))))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> sendRequest(@RequestBody Map<String, Object> req) {
        long id = requestSeq.incrementAndGet();
        req.put("id", id);
        req.put("status", "PENDING");
        req.put("createdAt", LocalDateTime.now().toString());
        requests.add(new ConcurrentHashMap<>(req));
        return ResponseEntity.ok(req);
    }

    @PutMapping("/{requestId}/accept")
    public ResponseEntity<Map<String, Object>> acceptRequest(@PathVariable Long requestId) {
        for (Map<String, Object> req : requests) {
            if (requestId.equals(Long.valueOf(String.valueOf(req.get("id"))))) {
                req.put("status", "ACCEPTED");
                req.put("updatedAt", LocalDateTime.now().toString());
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectRequest(@PathVariable Long requestId) {
        for (Map<String, Object> req : requests) {
            if (requestId.equals(Long.valueOf(String.valueOf(req.get("id"))))) {
                req.put("status", "REJECTED");
                req.put("updatedAt", LocalDateTime.now().toString());
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{requestId}/cancel")
    public ResponseEntity<Map<String, Object>> cancelRequest(@PathVariable Long requestId) {
        for (Map<String, Object> req : requests) {
            if (requestId.equals(Long.valueOf(String.valueOf(req.get("id"))))) {
                req.put("status", "CANCELLED");
                req.put("updatedAt", LocalDateTime.now().toString());
                return ResponseEntity.ok(req);
            }
        }
        return ResponseEntity.notFound().build();
    }
}
