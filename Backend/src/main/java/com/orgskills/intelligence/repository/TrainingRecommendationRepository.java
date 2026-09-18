package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.TrainingRecommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrainingRecommendationRepository extends JpaRepository<TrainingRecommendation, Long> {
    List<TrainingRecommendation> findByEmployeeIdOrderByPriorityRankAsc(Long employeeId);

    void deleteByEmployeeId(Long employeeId);
}
