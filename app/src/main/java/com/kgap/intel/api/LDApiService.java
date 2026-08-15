package com.kgap.intel.api;

import com.kgap.intel.models.LDDashboardStats;
import com.kgap.intel.models.TrainingProgram;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;

public interface LDApiService {
    @GET("learning/dashboard-stats")
    Call<LDDashboardStats> getDashboardStats();

    @GET("learning/programs")
    Call<List<TrainingProgram>> getTrainingPrograms();
}
