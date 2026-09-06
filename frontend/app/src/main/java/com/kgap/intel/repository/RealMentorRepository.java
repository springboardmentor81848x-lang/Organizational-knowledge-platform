package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.MentorApiService;
import com.kgap.intel.models.MentorDashboardStats;
import com.kgap.intel.models.MenteeProgress;
import com.kgap.intel.models.MentorProfileResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RealMentorRepository implements MentorRepository {
    private final MentorApiService apiService;

    public RealMentorRepository(Context context) {
        apiService = ApiClient.getMentorApiService(context);
    }

    @Override
    public LiveData<MentorDashboardStats> getDashboardStats() {
        MutableLiveData<MentorDashboardStats> data = new MutableLiveData<>();
        apiService.getDashboardStats().enqueue(new Callback<MentorDashboardStats>() {
            @Override
            public void onResponse(Call<MentorDashboardStats> call, Response<MentorDashboardStats> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<MentorDashboardStats> call, Throwable t) {}
        });
        return data;
    }

    @Override
    public LiveData<List<MenteeProgress>> getMentees() {
        MutableLiveData<List<MenteeProgress>> data = new MutableLiveData<>();
        apiService.getMentees().enqueue(new Callback<List<MenteeProgress>>() {
            @Override
            public void onResponse(Call<List<MenteeProgress>> call, Response<List<MenteeProgress>> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<List<MenteeProgress>> call, Throwable t) {}
        });
        return data;
    }

    @Override
    public LiveData<List<MentorProfileResponse>> getMentors() {
        return getMentors(null);
    }

    @Override
    public LiveData<List<MentorProfileResponse>> getMentors(Long requesterId) {
        MutableLiveData<List<MentorProfileResponse>> data = new MutableLiveData<>();
        Call<List<MentorProfileResponse>> call = requesterId != null ? 
                apiService.getAllMentors(requesterId) : apiService.getAllMentors();

        call.enqueue(new Callback<List<MentorProfileResponse>>() {
            @Override
            public void onResponse(Call<List<MentorProfileResponse>> call, Response<List<MentorProfileResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }
            @Override
            public void onFailure(Call<List<MentorProfileResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }
}

