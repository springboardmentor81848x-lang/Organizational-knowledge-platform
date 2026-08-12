package com.kgap.intel.api;

import com.kgap.intel.models.AIRecommendationResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Path;

public interface AIRecommendationApiService {
    @GET("recommendations/employee/{employeeId}")
    Call<List<AIRecommendationResponse>> getRecommendations(@Path("employeeId") Long employeeId);

    @POST("recommendations/generate/{employeeId}")
    Call<List<AIRecommendationResponse>> generateRecommendations(@Path("employeeId") Long employeeId);
}
