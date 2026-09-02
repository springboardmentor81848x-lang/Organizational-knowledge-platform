package com.okgip.repository;

import com.okgip.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findBySkillId(Long skillId);
    List<Assessment> findByAssessmentType(String assessmentType);
}
