package com.kgap.intel.api;

import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.models.LearningProgressUpdateRequest;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface LearningPathApiService {
    @GET("learning-paths/employee/{employeeId}")
    Call<List<LearningPathResponse>> getLearningPaths(@Path("employeeId") Long employeeId);

    @POST("learning-paths/generate/{employeeId}")
    Call<List<LearningPathResponse>> generateLearningPaths(@Path("employeeId") Long employeeId);

    @PUT("learning-paths/{id}/progress")
    Call<LearningPathResponse> updateProgress(@Path("id") Long id, @Body LearningProgressUpdateRequest request);
}
