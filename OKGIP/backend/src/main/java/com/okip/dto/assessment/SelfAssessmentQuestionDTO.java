package com.okip.dto.assessment;
import java.util.*;
public class SelfAssessmentQuestionDTO {
 public Long questionId; public String type; public String difficulty; public String questionText; public Integer marks; public String starterCode; public List<OptionDTO> options=new ArrayList<>();
 public static class OptionDTO { public Long optionId; public String optionText; public Integer optionOrder; }
}
