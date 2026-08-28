package com.kgap.intel.api;

import com.kgap.intel.models.AssessmentComparisonResponse;
import com.kgap.intel.models.AssessmentQuestion;
import com.kgap.intel.models.AssessmentResultItem;
import com.kgap.intel.models.AssessmentSubmission;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface AssessmentApiService {
    @GET("assessments/by-skill/{skillId}/questions")
    Call<List<AssessmentQuestion>> getQuestionsForSkill(@Path("skillId") String skillId);

    @GET("assessments/skill/{skillId}/type/{assessmentType}/questions")
    Call<List<AssessmentQuestion>> getQuestionsForSkillAndType(
            @Path("skillId") String skillId,
            @Path("assessmentType") String assessmentType);

    @POST("assessments/{assessmentId}/submit")
    Call<AssessmentResult> submitAssessment(
            @Path("assessmentId") Long assessmentId,
            @Body AssessmentSubmission submission);

    @GET("assessments/results/employee/{employeeId}/skill/{skillId}/comparison")
    Call<AssessmentComparisonResponse> getComparison(@Path("employeeId") Long employeeId,
                                                     @Path("skillId") Long skillId);

    @GET("assessments/results/employee/{employeeId}/skill/{skillId}")
    Call<List<AssessmentResultItem>> getHistoricalResults(@Path("employeeId") Long employeeId,
                                                          @Path("skillId") Long skillId);



    class AssessmentResult {
        private int scorePercentage;
        private String proficiencyLevel;
        private int correctAnswers;
        private int totalQuestions;

        public int getScore() { return scorePercentage; }
        public String getLevel() { return proficiencyLevel; }
        public int getCorrectAnswers() { return correctAnswers; }
        public int getTotalQuestions() { return totalQuestions; }
    }
}
