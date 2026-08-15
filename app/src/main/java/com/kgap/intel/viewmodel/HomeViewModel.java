package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.models.SkillGapResponse;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.utils.SharedPrefManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class HomeViewModel extends AndroidViewModel {
    // Admin Specific
    private final MutableLiveData<String> adminName = new MutableLiveData<>();
    private final MutableLiveData<Integer> totalUsers = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> activeUsers = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> inactiveUsers = new MutableLiveData<>(0);
    private final MutableLiveData<Map<String, Integer>> usersByRole = new MutableLiveData<>(new HashMap<>());
    private final MutableLiveData<String> systemStatus = new MutableLiveData<>("Checking...");
    
    // Employee Specific
    private final MutableLiveData<String> employeeName = new MutableLiveData<>();
    private final MutableLiveData<Integer> highGapsCount = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> mediumGapsCount = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> lowGapsCount = new MutableLiveData<>(0);

    private final SharedPrefManager prefManager;
    private final GapRepository gapRepository;

    public HomeViewModel(@NonNull Application application) {
        super(application);
        prefManager = SharedPrefManager.getInstance(application);
        gapRepository = new GapRepository(application);
        
        String role = prefManager.getUserRole();
        if ("ADMIN".equals(role)) {
            loadAdminStats();
        } else {
            loadEmployeeSkills();
        }
    }

    // Getters for Admin
    public LiveData<String> getAdminName() { return adminName; }
    public LiveData<Integer> getTotalUsers() { return totalUsers; }
    public LiveData<Integer> getActiveUsers() { return activeUsers; }
    public LiveData<Integer> getInactiveUsers() { return inactiveUsers; }
    public LiveData<Map<String, Integer>> getUsersByRole() { return usersByRole; }
    public LiveData<String> getSystemStatus() { return systemStatus; }

    // Getters for Employee
    public LiveData<String> getEmployeeName() { return employeeName; }
    public LiveData<Integer> getHighGapsCount() { return highGapsCount; }
    public LiveData<Integer> getMediumGapsCount() { return mediumGapsCount; }
    public LiveData<Integer> getLowGapsCount() { return lowGapsCount; }

    public void loadAdminStats() {
        ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<EmployeeResponse> employees = response.body();
                    totalUsers.setValue(employees.size());
                    systemStatus.setValue("Operational");
                    
                    int active = 0;
                    Map<String, Integer> roleCounts = new HashMap<>();
                    String adminEmail = prefManager.getUserEmail();

                    for (EmployeeResponse e : employees) {
                        active++; 
                        String r = e.getRole() != null ? e.getRole() : "UNKNOWN";
                        roleCounts.put(r, roleCounts.getOrDefault(r, 0) + 1);
                        
                        if (e.getEmail().equalsIgnoreCase(adminEmail)) {
                            adminName.setValue(e.getFirstName() + " " + e.getLastName());
                        }
                    }
                    activeUsers.setValue(active);
                    usersByRole.setValue(roleCounts);
                } else {
                    systemStatus.setValue("Degraded");
                }
            }
            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                systemStatus.setValue("Offline");
            }
        });
    }

    public void loadEmployeeSkills() {
        String email = prefManager.getUserEmail();
        gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
            if (id != null) {
                gapRepository.getEmployeeGaps(id).observeForever(gaps -> {
                    if (gaps != null) {
                        long high = gaps.stream().filter(g -> "HIGH".equalsIgnoreCase(g.getGapLevel())).count();
                        long medium = gaps.stream().filter(g -> "MEDIUM".equalsIgnoreCase(g.getGapLevel())).count();
                        long low = gaps.stream().filter(g -> "LOW".equalsIgnoreCase(g.getGapLevel())).count();
                        
                        highGapsCount.setValue((int) high);
                        mediumGapsCount.setValue((int) medium);
                        lowGapsCount.setValue((int) low);
                    }
                });
                
                ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
                    @Override
                    public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            for (EmployeeResponse e : response.body()) {
                                if (e.getId().equals(id)) {
                                    employeeName.setValue(e.getFirstName() + " " + e.getLastName());
                                    break;
                                }
                            }
                        }
                    }
                    @Override
                    public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
                });
            }
        });
    }
}
