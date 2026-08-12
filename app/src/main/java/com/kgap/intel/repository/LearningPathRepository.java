package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.LearningPathApiService;
import com.kgap.intel.models.LearningPathResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import com.kgap.intel.models.LearningProgressUpdateRequest;

public class LearningPathRepository {
    private final LearningPathApiService apiService;

    public LearningPathRepository(Context context) {
        apiService = ApiClient.getLearningPathApiService(context);
    }

    public LiveData<List<LearningPathResponse>> getLearningPaths(Long employeeId) {
        MutableLiveData<List<LearningPathResponse>> data = new MutableLiveData<>();
        apiService.getLearningPaths(employeeId).enqueue(new Callback<List<LearningPathResponse>>() {
            @Override
            public void onResponse(Call<List<LearningPathResponse>> call, Response<List<LearningPathResponse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    android.util.Log.e("LearningPathRepo", "getLearningPaths error: " + response.code());
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<LearningPathResponse>> call, Throwable t) {
                android.util.Log.e("LearningPathRepo", "getLearningPaths failure: " + t.getMessage());
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<LearningPathResponse>> generateLearningPaths(Long employeeId) {
        MutableLiveData<List<LearningPathResponse>> data = new MutableLiveData<>();
        apiService.generateLearningPaths(employeeId).enqueue(new Callback<List<LearningPathResponse>>() {
            @Override
            public void onResponse(Call<List<LearningPathResponse>> call, Response<List<LearningPathResponse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    android.util.Log.e("LearningPathRepo", "generateLearningPaths error: " + response.code());
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<LearningPathResponse>> call, Throwable t) {
                android.util.Log.e("LearningPathRepo", "generateLearningPaths failure: " + t.getMessage());
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<LearningPathResponse> updateProgress(Long pathId, String status, Integer completionPercentage) {
        MutableLiveData<LearningPathResponse> result = new MutableLiveData<>();
        LearningProgressUpdateRequest req = new LearningProgressUpdateRequest(status, completionPercentage);
        apiService.updateProgress(pathId, req).enqueue(new Callback<LearningPathResponse>() {
            @Override
            public void onResponse(Call<LearningPathResponse> call, Response<LearningPathResponse> response) {
                if (response.isSuccessful()) {
                    result.setValue(response.body());
                } else {
                    android.util.Log.e("LearningPathRepo", "updateProgress error: " + response.code());
                    result.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<LearningPathResponse> call, Throwable t) {
                android.util.Log.e("LearningPathRepo", "updateProgress failure: " + t.getMessage());
                result.setValue(null);
            }
        });
        return result;
    }
}
