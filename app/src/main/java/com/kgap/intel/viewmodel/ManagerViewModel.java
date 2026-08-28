package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.EmployeeApiService;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.repository.EmployeeRepository;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ManagerViewModel extends AndroidViewModel {
    private final EmployeeRepository repository;
    private final GapRepository gapRepository;
    private final EmployeeApiService employeeApiService;
    private final MutableLiveData<List<EmployeeResponse>> teamMembers = new MutableLiveData<>();
    private final MutableLiveData<Integer> teamCoverage = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> totalMembers = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> totalGaps = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> highRiskGaps = new MutableLiveData<>(0);
    private final MutableLiveData<String> trainingAdoption = new MutableLiveData<>("\u2013");
    private final MutableLiveData<Integer> learningProgress = new MutableLiveData<>(-1);
    private final MutableLiveData<Map<Long, Integer>> employeeProgressMap = new MutableLiveData<>(new HashMap<>());
    private final SharedPrefManager prefManager;

    public ManagerViewModel(@NonNull Application application) {
        super(application);
        repository = new EmployeeRepository(application);
        gapRepository = new GapRepository(application);
        employeeApiService = ApiClient.getEmployeeApiService(application);
        prefManager = SharedPrefManager.getInstance(application);
    }

    public LiveData<List<EmployeeResponse>> getTeamMembers() { return teamMembers; }
    public LiveData<Integer> getTeamCoverage() { return teamCoverage; }
    public LiveData<Integer> getTotalMembers() { return totalMembers; }
    public LiveData<Integer> getTotalGaps() { return totalGaps; }
    public LiveData<Integer> getHighRiskGaps() { return highRiskGaps; }
    public LiveData<String> getTrainingAdoption() { return trainingAdoption; }
    public LiveData<Integer> getLearningProgress() { return learningProgress; }
    public LiveData<Map<Long, Integer>> getEmployeeProgressMap() { return employeeProgressMap; }

    private boolean isEngineeringTeam(String deptName) {
        if (deptName == null) return false;
        String lower = deptName.toLowerCase();
        return lower.contains("engineering") || 
               lower.contains("devops") || 
               lower.contains("science") || 
               lower.contains("security");
    }

    public void loadTeamDashboard() {
        String managerEmail = prefManager.getUserEmail();
        if (managerEmail == null || managerEmail.isEmpty()) {
            return;
        }

        employeeApiService.getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<EmployeeResponse> all = response.body();

                    // Filter team members (only EMPLOYEE role in same department/engineering group)
                    List<EmployeeResponse> filteredMembers = new ArrayList<>();
                    final Set<Long> teamMemberIds = new java.util.HashSet<>();
                    for (EmployeeResponse emp : all) {
                        boolean isEmployee = emp.getRole() != null && "EMPLOYEE".equalsIgnoreCase(emp.getRole());
                        if (isEmployee && isEngineeringTeam(emp.getDepartment())) {
                            filteredMembers.add(emp);
                            teamMemberIds.add(emp.getId());
                        }
                    }

                    teamMembers.setValue(filteredMembers);
                    totalMembers.setValue(filteredMembers.size());

                    // Calculate Gaps and High Risk Gaps dynamically
                    gapRepository.getAllGaps().observeForever(allGaps -> {
                        if (allGaps != null) {
                            List<com.kgap.intel.models.SkillGapResponse> teamGaps = new ArrayList<>();
                            int highRisk = 0;
                            for (com.kgap.intel.models.SkillGapResponse g : allGaps) {
                                if (teamMemberIds.contains(g.getEmployeeId())) {
                                    teamGaps.add(g);
                                    if ("HIGH".equalsIgnoreCase(g.getGapLevel())) {
                                        highRisk++;
                                    }
                                }
                            }
                            totalGaps.setValue(teamGaps.size());
                            highRiskGaps.setValue(highRisk);
                        } else {
                            totalGaps.setValue(0);
                            highRiskGaps.setValue(0);
                        }
                    });

                    // Calculate Team Skill Coverage dynamically
                    ApiClient.getSkillApiService(getApplication()).getAllEmployeeSkills().enqueue(new Callback<List<com.kgap.intel.models.EmployeeSkillResponse>>() {
                        @Override
                        public void onResponse(Call<List<com.kgap.intel.models.EmployeeSkillResponse>> call,
                                               Response<List<com.kgap.intel.models.EmployeeSkillResponse>> skillResp) {
                            if (skillResp.isSuccessful() && skillResp.body() != null) {
                                double sum = 0;
                                int count = 0;
                                for (com.kgap.intel.models.EmployeeSkillResponse es : skillResp.body()) {
                                    if (teamMemberIds.contains(es.getEmployeeId()) && es.getProficiencyScore() != null) {
                                        sum += es.getProficiencyScore();
                                        count++;
                                    }
                                }
                                int coverage = count > 0 ? (int) Math.round(sum / count) : 0;
                                teamCoverage.setValue(coverage);
                            } else {
                                teamCoverage.setValue(0);
                            }
                        }

                        @Override
                        public void onFailure(Call<List<com.kgap.intel.models.EmployeeSkillResponse>> call, Throwable t) {
                            teamCoverage.setValue(0);
                        }
                    });

                    // Calculate Training Adoption dynamically
                    loadTrainingAdoptionForTeam(filteredMembers);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
        });
    }

    private void loadTrainingAdoptionForTeam(List<EmployeeResponse> team) {
        if (team.isEmpty()) {
            trainingAdoption.setValue("0%");
            employeeProgressMap.setValue(new HashMap<>());
            learningProgress.setValue(0);
            return;
        }

        final int totalEmployees = team.size();
        final java.util.concurrent.atomic.AtomicInteger responsesReceived = new java.util.concurrent.atomic.AtomicInteger(0);
        final java.util.concurrent.atomic.AtomicInteger totalCourses = new java.util.concurrent.atomic.AtomicInteger(0);
        final java.util.concurrent.atomic.AtomicInteger completedCourses = new java.util.concurrent.atomic.AtomicInteger(0);
        final java.util.concurrent.atomic.AtomicInteger totalProgressSum = new java.util.concurrent.atomic.AtomicInteger(0);
        final Map<Long, Integer> progressMap = new java.util.concurrent.ConcurrentHashMap<>();

        for (EmployeeResponse emp : team) {
            ApiClient.getTrainingApiService(getApplication()).getEmployeeEnrollments(emp.getId()).enqueue(new Callback<List<com.kgap.intel.models.TrainingEnrollment>>() {
                @Override
                public void onResponse(Call<List<com.kgap.intel.models.TrainingEnrollment>> call, Response<List<com.kgap.intel.models.TrainingEnrollment>> response) {
                    double empSum = 0;
                    int empCount = 0;

                    if (response.isSuccessful() && response.body() != null) {
                        for (com.kgap.intel.models.TrainingEnrollment en : response.body()) {
                            totalCourses.incrementAndGet();
                            if ("COMPLETED".equalsIgnoreCase(en.getStatus()) || (en.getProgressPercentage() != null && en.getProgressPercentage() >= 100)) {
                                completedCourses.incrementAndGet();
                            }
                            if (en.getProgressPercentage() != null) {
                                empSum += en.getProgressPercentage();
                                empCount++;
                                totalProgressSum.addAndGet(en.getProgressPercentage());
                            }
                        }
                    }
                    int avgProgress = empCount > 0 ? (int) Math.round(empSum / empCount) : 0;
                    progressMap.put(emp.getId(), avgProgress);

                    if (responsesReceived.incrementAndGet() == totalEmployees) {
                        int tot = totalCourses.get();
                        int comp = completedCourses.get();
                        int rate = tot > 0 ? (int) Math.round(((double) comp / tot) * 100) : 0;
                        int progressAvg = tot > 0 ? (int) Math.round((double) totalProgressSum.get() / tot) : 0;

                        trainingAdoption.postValue(rate + "%");
                        learningProgress.postValue(progressAvg);
                        employeeProgressMap.postValue(progressMap);
                    }
                }

                @Override
                public void onFailure(Call<List<com.kgap.intel.models.TrainingEnrollment>> call, Throwable t) {
                    progressMap.put(emp.getId(), 0);
                    if (responsesReceived.incrementAndGet() == totalEmployees) {
                        int tot = totalCourses.get();
                        int comp = completedCourses.get();
                        int rate = tot > 0 ? (int) Math.round(((double) comp / tot) * 100) : 0;
                        int progressAvg = tot > 0 ? (int) Math.round((double) totalProgressSum.get() / tot) : 0;

                        trainingAdoption.postValue(rate + "%");
                        learningProgress.postValue(progressAvg);
                        employeeProgressMap.postValue(progressMap);
                    }
                }
            });
        }
    }
}