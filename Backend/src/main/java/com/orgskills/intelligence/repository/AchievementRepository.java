package com.orgskills.intelligence.repository;

import com.orgskills.intelligence.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByEmployeeIdOrderByEarnedAtDesc(Long employeeId);
}
