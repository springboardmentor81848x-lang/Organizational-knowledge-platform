package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.AIRecommendationApiService;
import com.kgap.intel.models.AIRecommendationResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AIRecommendationRepository {
    private final AIRecommendationApiService apiService;

    public AIRecommendationRepository(Context context) {
        apiService = ApiClient.getAIRecommendationApiService(context);
    }

    public LiveData<List<AIRecommendationResponse>> getRecommendations(Long employeeId) {
        MutableLiveData<List<AIRecommendationResponse>> data = new MutableLiveData<>();
        apiService.getRecommendations(employeeId).enqueue(new Callback<List<AIRecommendationResponse>>() {
            @Override
            public void onResponse(Call<List<AIRecommendationResponse>> call, Response<List<AIRecommendationResponse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<AIRecommendationResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<AIRecommendationResponse>> generateRecommendations(Long employeeId) {
        MutableLiveData<List<AIRecommendationResponse>> data = new MutableLiveData<>();
        apiService.generateRecommendations(employeeId).enqueue(new Callback<List<AIRecommendationResponse>>() {
            @Override
            public void onResponse(Call<List<AIRecommendationResponse>> call, Response<List<AIRecommendationResponse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<AIRecommendationResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }
}
