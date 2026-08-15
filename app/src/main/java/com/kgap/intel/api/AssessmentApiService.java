package com.kgap.intel.api;

import com.kgap.intel.models.AssessmentQuestion;
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

    @POST("assessments/{assessmentId}/submit")
    Call<AssessmentResult> submitAssessment(
            @Path("assessmentId") Long assessmentId,
            @Body AssessmentSubmission submission);

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
