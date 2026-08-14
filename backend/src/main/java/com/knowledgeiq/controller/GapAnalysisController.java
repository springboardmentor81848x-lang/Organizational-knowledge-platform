package com.knowledgeiq.controller;

import com.knowledgeiq.dto.HeatmapResponseDto;
import com.knowledgeiq.dto.SkillGapDto;
import com.knowledgeiq.model.User;
import com.knowledgeiq.repository.UserRepository;
import com.knowledgeiq.service.GapAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gap-analysis")
public class GapAnalysisController {

    @Autowired
    private GapAnalysisService gapAnalysisService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<List<SkillGapDto>> getMyGaps(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(gapAnalysisService.calculateUserGaps(UUID.fromString(userIdStr)));
    }

    @GetMapping("/scoped-heatmap")
    public ResponseEntity<HeatmapResponseDto> getScopedHeatmap(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        User currentUser = userRepository.findById(UUID.fromString(userIdStr)).orElse(null);
        return ResponseEntity.ok(gapAnalysisService.getScopedHeatmap(currentUser));
    }

    @GetMapping("/trends")
    public ResponseEntity<?> getMyGapTrends(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        return ResponseEntity.ok(gapAnalysisService.getUserGapSnapshots(UUID.fromString(userIdStr)));
    }

    @GetMapping("/team/{teamId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'DEPARTMENT_HEAD', 'HR_SPECIALIST', 'SYSTEM_ADMIN', 'L_AND_D_ADMIN')")
    public ResponseEntity<List<SkillGapDto>> getTeamGaps(@PathVariable UUID teamId) {
        return ResponseEntity.ok(gapAnalysisService.calculateTeamGaps(teamId));
    }

    @GetMapping("/department/{deptId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('MANAGER', 'DEPARTMENT_HEAD', 'HR_SPECIALIST', 'SYSTEM_ADMIN', 'L_AND_D_ADMIN')")
    public ResponseEntity<List<SkillGapDto>> getDepartmentGaps(@PathVariable UUID deptId) {
        return ResponseEntity.ok(gapAnalysisService.calculateDepartmentGaps(deptId));
    }

    @GetMapping("/heatmap")
    public ResponseEntity<HeatmapResponseDto> getHeatmap(Authentication auth) {
        return getScopedHeatmap(auth);
    }

    @PostMapping("/recalculate")
    public ResponseEntity<HeatmapResponseDto> recalculateGaps(Authentication auth) {
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).build();
        }
        String userIdStr = (String) auth.getPrincipal();
        UUID userId = UUID.fromString(userIdStr);
        User currentUser = userRepository.findById(userId).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Recalculate gaps (this will also update snapshots/growth trend and notifications)
        gapAnalysisService.recalculateUserGaps(userId);
        
        return ResponseEntity.ok(gapAnalysisService.getScopedHeatmap(currentUser));
    }
}
