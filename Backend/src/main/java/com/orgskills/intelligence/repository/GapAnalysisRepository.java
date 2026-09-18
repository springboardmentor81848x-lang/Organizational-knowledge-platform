package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.GapAnalysis;
import com.orgskills.intelligence.entity.enums.RiskSeverity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GapAnalysisRepository extends JpaRepository<GapAnalysis, Long> {
    List<GapAnalysis> findByUserIdOrderByGapScoreDesc(Long userId);

    List<GapAnalysis> findByUserIdIn(List<Long> userIds);

    List<GapAnalysis> findByUserIdAndRiskSeverity(Long userId, RiskSeverity riskSeverity);

    List<GapAnalysis> findByUserIdAndCurrentScoreEquals(Long userId, Double currentScore);

    List<GapAnalysis> findByUserIdAndCurrentScoreGreaterThanAndGapScoreGreaterThan(Long userId, Double currentScore, Double gapScore);

    void deleteByUserId(Long userId);
}
