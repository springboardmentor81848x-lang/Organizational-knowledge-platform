package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.GapApiService;
import com.kgap.intel.api.OrgApiService;
import com.kgap.intel.models.*;
import java.util.List;
import java.util.stream.Collectors;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RealDepartmentHeadRepository implements DepartmentHeadRepository {
    private final OrgApiService apiService;
    private final GapApiService gapApiService;

    public RealDepartmentHeadRepository(Context context) {
        apiService = ApiClient.getOrgApiService(context);
        gapApiService = ApiClient.getGapApiService(context);
    }

    @Override
    public LiveData<List<DepartmentSkill>> getDepartmentSkillCoverage() {
        MutableLiveData<List<DepartmentSkill>> data = new MutableLiveData<>();
        // For demo/prototype, using deptId 1
        apiService.getDepartmentSkillCoverage(1L).enqueue(new Callback<List<DepartmentSkill>>() {
            @Override
            public void onResponse(Call<List<DepartmentSkill>> call, Response<List<DepartmentSkill>> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<List<DepartmentSkill>> call, Throwable t) {}
        });
        return data;
    }

    @Override
    public LiveData<List<SkillGap>> getTeamGapHeatmap() {
        MutableLiveData<List<SkillGap>> data = new MutableLiveData<>();
        gapApiService.getHeatmapData().enqueue(new Callback<List<HeatmapResponse>>() {
            @Override
            public void onResponse(Call<List<HeatmapResponse>> call, Response<List<HeatmapResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<SkillGap> gaps = response.body().stream()
                        .map(h -> new SkillGap(h.getSkillName(), h.getEmployeeName(), h.getGapLevel(), h.getGapScore()))
                        .collect(Collectors.toList());
                    data.setValue(gaps);
                }
            }
            @Override
            public void onFailure(Call<List<HeatmapResponse>> call, Throwable t) {}
        });
        return data;
    }

    @Override
    public LiveData<TrainingAdoption> getTrainingAdoptionRates() {
        MutableLiveData<TrainingAdoption> data = new MutableLiveData<>();
        apiService.getTrainingAdoption(1L).enqueue(new Callback<TrainingAdoption>() {
            @Override
            public void onResponse(Call<TrainingAdoption> call, Response<TrainingAdoption> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<TrainingAdoption> call, Throwable t) {}
        });
        return data;
    }

    @Override
    public LiveData<List<HighRiskGap>> getHighRiskSkillGaps() {
        MutableLiveData<List<HighRiskGap>> data = new MutableLiveData<>();
        apiService.getHighRiskGaps(1L).enqueue(new Callback<List<HighRiskGap>>() {
            @Override
            public void onResponse(Call<List<HighRiskGap>> call, Response<List<HighRiskGap>> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<List<HighRiskGap>> call, Throwable t) {}
        });
        return data;
    }

    @Override
    public LiveData<List<EmployeeProgress>> getIndividualProgressSnapshots() {
        MutableLiveData<List<EmployeeProgress>> data = new MutableLiveData<>();
        apiService.getEmployeeProgress(1L).enqueue(new Callback<List<EmployeeProgress>>() {
            @Override
            public void onResponse(Call<List<EmployeeProgress>> call, Response<List<EmployeeProgress>> response) {
                if (response.isSuccessful()) data.setValue(response.body());
            }
            @Override
            public void onFailure(Call<List<EmployeeProgress>> call, Throwable t) {}
        });
        return data;
    }
}
