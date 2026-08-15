package com.kgap.intel.api;

import com.kgap.intel.models.MentorDashboardStats;
import com.kgap.intel.models.MenteeProgress;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;

public interface MentorApiService {
    @GET("mentors/dashboard-stats")
    Call<MentorDashboardStats> getDashboardStats();

    @GET("mentors/mentees")
    Call<List<MenteeProgress>> getMentees();
}
