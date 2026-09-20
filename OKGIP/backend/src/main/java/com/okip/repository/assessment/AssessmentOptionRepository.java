package com.okip.repository.assessment;
import com.okip.entity.assessment.AssessmentOption; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AssessmentOptionRepository extends JpaRepository<AssessmentOption,Long>{ List<AssessmentOption> findByQuestionQuestionIdOrderByOptionOrderAsc(Long questionId); }
