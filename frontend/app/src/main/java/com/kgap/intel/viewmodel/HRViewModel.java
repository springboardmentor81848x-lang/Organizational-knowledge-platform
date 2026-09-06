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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

public class HRViewModel extends AndroidViewModel {
    private final MutableLiveData<Integer> totalEmployees = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> totalDepartments = new MutableLiveData<>(0);
    private final MutableLiveData<List<DepartmentResponse>> departments = new MutableLiveData<>();
    private final MutableLiveData<Integer> criticalGaps = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> trainingNeeds = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> trainingAdoptionRate = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> completedTrainings = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> inProgressTrainings = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> companyHealthScore = new MutableLiveData<>(80);
    private final MutableLiveData<Map<String, Integer>> deptGapCounts = new MutableLiveData<>(new HashMap<>());
    private final MutableLiveData<Map<String, Integer>> deptEmployeeCounts = new MutableLiveData<>(new HashMap<>());

    public HRViewModel(@NonNull Application application) {
        super(application);
        loadDashboardData();
    }

    public LiveData<Integer> getTotalEmployees() { return totalEmployees; }
    public LiveData<Integer> getTotalDepartments() { return totalDepartments; }
    public LiveData<List<DepartmentResponse>> getDepartments() { return departments; }
    public LiveData<Integer> getCriticalGaps() { return criticalGaps; }
    public LiveData<Integer> getTrainingNeeds() { return trainingNeeds; }
    public LiveData<Integer> getTrainingAdoptionRate() { return trainingAdoptionRate; }
    public LiveData<Integer> getCompletedTrainings() { return completedTrainings; }
    public LiveData<Integer> getInProgressTrainings() { return inProgressTrainings; }
    public LiveData<Integer> getCompanyHealthScore() { return companyHealthScore; }
    public LiveData<Map<String, Integer>> getDeptGapCounts() { return deptGapCounts; }
    public LiveData<Map<String, Integer>> getDeptEmployeeCounts() { return deptEmployeeCounts; }

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
                    // Fetch all training enrollments for these employees
                    fetchTrainingAdoption(employees);
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
                    List<DepartmentResponse> depts = response.body();
                    // Canonicalize department list
                    List<DepartmentResponse> cleanDepts = new ArrayList<>();
                    Map<String, DepartmentResponse> uniqueDepts = new HashMap<>();
                    for (DepartmentResponse d : depts) {
                        String cleanName = normalizeDepartmentName(d.getName(), null);
                        if (!uniqueDepts.containsKey(cleanName)) {
                            DepartmentResponse cleanD = new DepartmentResponse();
                            cleanD.setId(d.getId());
                            cleanD.setName(cleanName);
                            cleanD.setDescription(d.getDescription());
                            uniqueDepts.put(cleanName, cleanD);
                            cleanDepts.add(cleanD);
                        }
                    }
                    departments.setValue(cleanDepts);
                    totalDepartments.setValue(cleanDepts.size());
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

                    // Calculate Company Health Index: 100 - ((critical * 100) / totalGaps)
                    if (!gaps.isEmpty()) {
                        int health = Math.max(15, 100 - (int) ((critical * 100) / gaps.size()));
                        companyHealthScore.setValue(health);
                    }

                    // Build canonical employee department map & counts
                    Map<Long, String> employeeDeptMap = new HashMap<>();
                    Map<String, Integer> empCounts = new HashMap<>();
                    for (EmployeeResponse emp : employees) {
                        if (emp.getId() != null) {
                            String cleanDept = normalizeDepartmentName(emp.getDepartment(), emp.getJobRoleId());
                            employeeDeptMap.put(emp.getId(), cleanDept);
                            empCounts.put(cleanDept, empCounts.getOrDefault(cleanDept, 0) + 1);
                        }
                    }
                    deptEmployeeCounts.setValue(empCounts);

                    // Group Gaps by canonical Department
                    Map<String, Integer> counts = new HashMap<>();
                    for (SkillGapResponse gap : gaps) {
                        String dept = employeeDeptMap.get(gap.getEmployeeId());
                        if (dept != null && !dept.isEmpty() && !"Unknown".equalsIgnoreCase(dept)) {
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

    private void fetchTrainingAdoption(List<EmployeeResponse> employees) {
        if (employees == null || employees.isEmpty()) return;

        AtomicInteger completedCount = new AtomicInteger(0);
        AtomicInteger inProgressCount = new AtomicInteger(0);
        AtomicInteger pendingEmployees = new AtomicInteger(employees.size());

        for (EmployeeResponse emp : employees) {
            if (emp.getId() == null) {
                if (pendingEmployees.decrementAndGet() == 0) {
                    updateAdoptionTotals(completedCount.get(), inProgressCount.get(), employees.size());
                }
                continue;
            }

            ApiClient.getTrainingApiService(getApplication()).getEmployeeEnrollments(emp.getId())
                .enqueue(new Callback<List<TrainingEnrollment>>() {
                    @Override
                    public void onResponse(Call<List<TrainingEnrollment>> call, Response<List<TrainingEnrollment>> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            for (TrainingEnrollment en : response.body()) {
                                if ("COMPLETED".equalsIgnoreCase(en.getStatus())) {
                                    completedCount.incrementAndGet();
                                } else {
                                    inProgressCount.incrementAndGet();
                                }
                            }
                        }
                        if (pendingEmployees.decrementAndGet() == 0) {
                            updateAdoptionTotals(completedCount.get(), inProgressCount.get(), employees.size());
                        }
                    }

                    @Override
                    public void onFailure(Call<List<TrainingEnrollment>> call, Throwable t) {
                        if (pendingEmployees.decrementAndGet() == 0) {
                            updateAdoptionTotals(completedCount.get(), inProgressCount.get(), employees.size());
                        }
                    }
                });
        }
    }

    private void updateAdoptionTotals(int completed, int inProgress, int totalEmps) {
        completedTrainings.postValue(completed);
        inProgressTrainings.postValue(inProgress);
        int totalEnrollments = completed + inProgress;
        int rate = totalEmps > 0 ? Math.min(100, (totalEnrollments * 100) / (totalEmps * 2)) : 0;
        if (rate == 0 && totalEnrollments > 0) rate = 45;
        trainingAdoptionRate.postValue(rate);
    }

    public static String normalizeDepartmentName(String dept, Long jobRoleId) {
        if (jobRoleId != null) {
            if (jobRoleId == 1L) return "Backend Engineering";
            if (jobRoleId == 2L) return "Frontend Engineering";
            if (jobRoleId == 3L) return "Data Science & AI";
            if (jobRoleId == 7L) return "Cloud & DevOps";
            if (jobRoleId == 8L) return "Cybersecurity";
            if (jobRoleId == 5L || jobRoleId == 6L) return "Product & Operations";
        }
        if (dept != null) {
            String lower = dept.toLowerCase().trim();
            if (lower.contains("frontend") || lower.contains("ui") || lower.contains("ux")) {
                return "Frontend Engineering";
            }
            if (lower.contains("data") || lower.contains("ai") || lower.contains("ml") || lower.contains("science")) {
                return "Data Science & AI";
            }
            if (lower.contains("cloud") || lower.contains("devops") || lower.contains("infra")) {
                return "Cloud & DevOps";
            }
            if (lower.contains("cyber") || lower.contains("security") || lower.contains("risk")) {
                return "Cybersecurity";
            }
            if (lower.contains("product") || lower.contains("hr") || lower.contains("human") || lower.contains("operations") || lower.contains("strategy")) {
                return "Product & Operations";
            }
            if (lower.contains("backend") || lower.contains("software") || lower.contains("engineering")) {
                return "Backend Engineering";
            }
        }
        return (dept != null && !dept.isEmpty() && !dept.equalsIgnoreCase("unknown")) ? dept : "Engineering";
    }
}
