package com.okgip.controller;

import com.okgip.entity.KnowledgeGap;
import com.okgip.repository.KnowledgeGapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/gaps")
@CrossOrigin(origins = "*", maxAge = 3600)
public class KnowledgeGapController {

    @Autowired
    private KnowledgeGapRepository knowledgeGapRepository;

    @GetMapping
    public ResponseEntity<?> getAllGaps(@RequestParam(required = false) Long employeeId,
                                        @RequestParam(required = false) String priority) {
        List<KnowledgeGap> list;
        if (employeeId != null) {
            list = knowledgeGapRepository.findByEmployeeId(employeeId);
        } else if (priority != null) {
            list = knowledgeGapRepository.findByPriority(priority);
        } else {
            list = knowledgeGapRepository.findAll();
        }
        return ResponseEntity.ok(Map.of("success", true, "data", list));
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getGapAnalytics() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalEmployees", 145);
        map.put("activeGaps", 32);
        map.put("criticalGaps", 8);
        map.put("overallHealthScore", 81);
        map.put("avgProficiency", 3.2);
        return ResponseEntity.ok(Map.of("success", true, "data", map));
    }
}
