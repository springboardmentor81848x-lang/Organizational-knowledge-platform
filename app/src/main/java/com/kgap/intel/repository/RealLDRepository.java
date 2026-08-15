package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.LDApiService;
import com.kgap.intel.models.LDDashboardStats;
import com.kgap.intel.models.TrainingProgram;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RealLDRepository implements LDRepository {
    private final LDApiService apiService;

    public RealLDRepository(Context context) {
        apiService = ApiClient.getLDApiService(context);
    }

    @Override
    public LiveData<LDDashboardStats> getDashboardStats() {
        MutableLiveData<LDDashboardStats> data = new MutableLiveData<>();
        apiService.getDashboardStats().enqueue(new Callback<LDDashboardStats>() {
            @Override
            public void onResponse(Call<LDDashboardStats> call, Response<LDDashboardStats> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<LDDashboardStats> call, Throwable t) {}
        });
        return data;
    }

    @Override
    public LiveData<List<TrainingProgram>> getTrainingPrograms() {
        MutableLiveData<List<TrainingProgram>> data = new MutableLiveData<>();
        apiService.getTrainingPrograms().enqueue(new Callback<List<TrainingProgram>>() {
            @Override
            public void onResponse(Call<List<TrainingProgram>> call, Response<List<TrainingProgram>> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<List<TrainingProgram>> call, Throwable t) {}
        });
        return data;
    }
}
