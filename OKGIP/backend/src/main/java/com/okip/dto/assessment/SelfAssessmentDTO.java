package com.okip.dto.assessment;
import java.util.*;
public class SelfAssessmentDTO { public Long assessmentId; public Long skillId; public String skillName; public String assessmentName; public Integer totalMarks; public List<SelfAssessmentQuestionDTO> questions=new ArrayList<>(); }
