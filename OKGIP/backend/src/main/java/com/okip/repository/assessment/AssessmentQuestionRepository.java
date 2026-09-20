package com.okip.repository.assessment;
import com.okip.entity.assessment.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AssessmentQuestionRepository extends JpaRepository<AssessmentQuestion,Long>{ List<AssessmentQuestion> findByAssessmentAssessmentIdOrderByQuestionOrderAsc(Long assessmentId); }
