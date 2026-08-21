package com.kgap.intel.api;

import com.kgap.intel.models.MentorDashboardStats;
import com.kgap.intel.models.MenteeProgress;
import com.kgap.intel.models.MentorProfileResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Query;

public interface MentorApiService {
    @GET("mentors/dashboard-stats")
    Call<MentorDashboardStats> getDashboardStats();

    @GET("mentors/mentees")
    Call<List<MenteeProgress>> getMentees();

    @GET("mentors")
    Call<List<MentorProfileResponse>> getAllMentors();

    @GET("mentors/{id}")
    Call<MentorProfileResponse> getMentorById(@Path("id") Long id);

    @GET("mentors/search")
    Call<List<MentorProfileResponse>> searchMentors(@Query("expertise") String expertise);
}

