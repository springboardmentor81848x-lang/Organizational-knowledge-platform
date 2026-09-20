package com.okip.entity.assessment;

import jakarta.persistence.*;

@Entity
@Table(name="assessment_options")
public class AssessmentOption {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long optionId;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="question_id",nullable=false) private AssessmentQuestion question;
 @Column(nullable=false,length=500) private String optionText;
 @Column(nullable=false) private boolean correct;
 @Column(nullable=false) private Integer optionOrder;
 public Long getOptionId(){return optionId;} public void setOptionId(Long v){optionId=v;}
 public AssessmentQuestion getQuestion(){return question;} public void setQuestion(AssessmentQuestion v){question=v;}
 public String getOptionText(){return optionText;} public void setOptionText(String v){optionText=v;}
 public boolean isCorrect(){return correct;} public void setCorrect(boolean v){correct=v;}
 public Integer getOptionOrder(){return optionOrder;} public void setOptionOrder(Integer v){optionOrder=v;}
}
