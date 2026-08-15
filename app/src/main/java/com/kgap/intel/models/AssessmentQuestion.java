package com.kgap.intel.models;

import java.util.ArrayList;
import java.util.List;

public class AssessmentQuestion {
    private Long id;
    private Long assessmentId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;

    public Long getId() { return id; }
    public Long getAssessmentId() { return assessmentId; }
    public String getQuestionText() { return questionText; }
    public String getOptionA() { return optionA; }
    public String getOptionB() { return optionB; }
    public String getOptionC() { return optionC; }
    public String getOptionD() { return optionD; }
    
    public List<String> getOptions() {
        List<String> options = new ArrayList<>();
        if (optionA != null) options.add(optionA);
        if (optionB != null) options.add(optionB);
        if (optionC != null) options.add(optionC);
        if (optionD != null) options.add(optionD);
        return options;
    }
}
