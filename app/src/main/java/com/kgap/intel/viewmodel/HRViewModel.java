package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.models.*;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class HRViewModel extends AndroidViewModel {
    private final MutableLiveData<Integer> totalEmployees = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> totalDepartments = new MutableLiveData<>(0);
    private final MutableLiveData<List<DepartmentResponse>> departments = new MutableLiveData<>();
    private final MutableLiveData<Integer> criticalGaps = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> trainingNeeds = new MutableLiveData<>(0);
    private final MutableLiveData<Map<String, Integer>> deptGapCounts = new MutableLiveData<>(new HashMap<>());

    public HRViewModel(@NonNull Application application) {
        super(application);
        loadDashboardData();
    }

    public LiveData<Integer> getTotalEmployees() { return totalEmployees; }
    public LiveData<Integer> getTotalDepartments() { return totalDepartments; }
    public LiveData<List<DepartmentResponse>> getDepartments() { return departments; }
    public LiveData<Integer> getCriticalGaps() { return criticalGaps; }
    public LiveData<Integer> getTrainingNeeds() { return trainingNeeds; }
    public LiveData<Map<String, Integer>> getDeptGapCounts() { return deptGapCounts; }

    public void loadDashboardData() {
        // 1. Total Employees
        ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<EmployeeResponse> employees = response.body();
                    totalEmployees.setValue(employees.size());
                    
                    // Fetch gaps and group by department
                    fetchAndGroupGaps(employees);
                }
            }
            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
        });

        // 2. Total Departments
        ApiClient.getOrgApiService(getApplication()).getAllDepartments().enqueue(new Callback<List<DepartmentResponse>>() {
            @Override
            public void onResponse(Call<List<DepartmentResponse>> call, Response<List<DepartmentResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    departments.setValue(response.body());
                    totalDepartments.setValue(response.body().size());
                }
            }
            @Override
            public void onFailure(Call<List<DepartmentResponse>> call, Throwable t) {}
        });
    }

    private void fetchAndGroupGaps(List<EmployeeResponse> employees) {
        ApiClient.getGapApiService(getApplication()).getAllGaps().enqueue(new Callback<List<SkillGapResponse>>() {
            @Override
            public void onResponse(Call<List<SkillGapResponse>> call, Response<List<SkillGapResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<SkillGapResponse> gaps = response.body();
                    
                    // Overall stats
                    long critical = gaps.stream().filter(g -> "HIGH".equalsIgnoreCase(g.getGapLevel())).count();
                    criticalGaps.setValue((int) critical);
                    trainingNeeds.setValue(gaps.size());

                    // Group by Department
                    Map<Long, String> employeeDeptMap = employees.stream()
                        .collect(Collectors.toMap(EmployeeResponse::getId, 
                            e -> e.getDepartment() != null ? e.getDepartment() : "Unknown"));

                    Map<String, Integer> counts = new HashMap<>();
                    for (SkillGapResponse gap : gaps) {
                        String dept = employeeDeptMap.get(gap.getEmployeeId());
                        if (dept != null) {
                            counts.put(dept, counts.getOrDefault(dept, 0) + 1);
                        }
                    }
                    deptGapCounts.setValue(counts);
                }
            }
            @Override
            public void onFailure(Call<List<SkillGapResponse>> call, Throwable t) {}
        });
    }
}
