package com.kgap.intel.api;

import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.LDDashboardStats;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.models.ScoredCourseRecommendation;
import com.kgap.intel.models.TrainingProgram;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface LDApiService {
    @GET("learning/dashboard-stats")
    Call<LDDashboardStats> getDashboardStats();

    @GET("learning/programs")
    Call<List<TrainingProgram>> getTrainingPrograms();

    @GET("external-courses")
    Call<List<ExternalCourse>> getAllExternalCourses();

    @POST("external-courses")
    Call<ExternalCourse> createExternalCourse(@Body ExternalCourse course);

    @GET("course-recommendations/scored/employee/{employeeId}")
    Call<List<ScoredCourseRecommendation>> getScoredRecommendations(@Path("employeeId") Long employeeId);

    @GET("learning-paths")
    Call<List<LearningPathResponse>> getAllLearningPaths();

    @GET("learning-paths/employee/{employeeId}")
    Call<List<LearningPathResponse>> getLearningPathsByEmployee(@Path("employeeId") Long employeeId);
}
