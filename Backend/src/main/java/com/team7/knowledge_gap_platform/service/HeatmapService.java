package com.team7.knowledge_gap_platform.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.team7.knowledge_gap_platform.dto.HeatmapResponse;
import com.team7.knowledge_gap_platform.entity.SkillGap;
import com.team7.knowledge_gap_platform.repository.SkillGapRepository;

@Service
public class HeatmapService {

    private final SkillGapRepository skillGapRepository;

    public HeatmapService(SkillGapRepository skillGapRepository) {
        this.skillGapRepository = skillGapRepository;
    }

    public List<HeatmapResponse> getHeatmapData() {

        List<SkillGap> gaps = skillGapRepository.findAll();
        List<HeatmapResponse> response = new ArrayList<>();

        for (SkillGap gap : gaps) {

            HeatmapResponse item = new HeatmapResponse(
                    gap.getEmployeeId(),
                    gap.getSkillId(),
                    gap.getGapScore(),
                    gap.getGapLevel(),
                    getColor(gap.getGapLevel())
            );

            response.add(item);
        }

        return response;
    }

    public List<HeatmapResponse> getHeatmapByEmployee(Long employeeId) {

        List<SkillGap> gaps =
                skillGapRepository.findByEmployeeId(employeeId);

        List<HeatmapResponse> response = new ArrayList<>();

        for (SkillGap gap : gaps) {

            response.add(
                    new HeatmapResponse(
                            gap.getEmployeeId(),
                            gap.getSkillId(),
                            gap.getGapScore(),
                            gap.getGapLevel(),
                            getColor(gap.getGapLevel())
                    )
            );
        }

        return response;
    }

    private String getColor(String gapLevel) {

        if (gapLevel == null) {
            return "GRAY";
        }

        return switch (gapLevel.toUpperCase()) {
            case "HIGH" -> "RED";
            case "MEDIUM" -> "ORANGE";
            case "LOW" -> "YELLOW";
            case "NO_GAP" -> "GREEN";
            default -> "GRAY";
        };
    }
}