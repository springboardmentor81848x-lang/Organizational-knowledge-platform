package com.okgip.repository;

import com.okgip.entity.AssessmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AssessmentResultRepository extends JpaRepository<AssessmentResult, Long> {
    List<AssessmentResult> findByEmployeeId(Long employeeId);
    List<AssessmentResult> findBySkillId(Long skillId);
    List<AssessmentResult> findByAssessmentId(Long assessmentId);
    List<AssessmentResult> findByEmployeeIdOrderByTakenAtDesc(Long employeeId);
}
