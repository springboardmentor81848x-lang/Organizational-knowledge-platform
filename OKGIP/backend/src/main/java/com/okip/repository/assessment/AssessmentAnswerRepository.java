package com.okip.repository.assessment;
import com.okip.entity.assessment.AssessmentAnswer; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswer,Long>{ List<AssessmentAnswer> findByAttemptAttemptId(Long attemptId); }
