package com.okip.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.okip.entity.master.Employee;
import com.okip.entity.transaction.SkillAssessment;
import com.okip.enums.AssessmentStatus;
import com.okip.enums.AssessmentType;

@Repository
public interface SkillAssessmentRepository extends JpaRepository<SkillAssessment, Long> {
    List<SkillAssessment> findByEmployeeOrderByCreatedAtDesc(Employee employee);
    List<SkillAssessment> findByEvaluatorOrderByCreatedAtDesc(Employee evaluator);
    List<SkillAssessment> findByStatusOrderByCreatedAtDesc(AssessmentStatus status);
    List<SkillAssessment> findByEmployeeAndStatusOrderByCreatedAtDesc(Employee employee, AssessmentStatus status);
    
    @Query("SELECT a FROM SkillAssessment a WHERE a.status = :status AND (a.evaluator = :evaluator OR a.employee.department = :department)")
    List<SkillAssessment> findPendingForManagerOrPeer(@Param("status") AssessmentStatus status, @Param("evaluator") Employee evaluator, @Param("department") com.okip.entity.master.Department department);
}
