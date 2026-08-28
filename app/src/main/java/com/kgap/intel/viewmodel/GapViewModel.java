package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.HeatmapResponse;
import com.kgap.intel.models.HeatmapRow;
import com.kgap.intel.models.SkillGapResponse;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class GapViewModel extends AndroidViewModel {
    private final GapRepository gapRepository;
    private final MutableLiveData<List<SkillGapResponse>> skillGaps = new MutableLiveData<>();
    private final MutableLiveData<List<HeatmapResponse>> heatmapData = new MutableLiveData<>();
    private final MutableLiveData<List<HeatmapRow>> heatmapRows = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>(null);
    private final SharedPrefManager prefManager;

    public GapViewModel(@NonNull Application application) {
        super(application);
        gapRepository = new GapRepository(application);
        prefManager = SharedPrefManager.getInstance(application);
        
        // Observe repository errors
        gapRepository.getErrorData().observeForever(error -> {
            if (error != null) {
                errorMessage.setValue(error);
                isLoading.setValue(false);
            }
        });
    }

    public LiveData<List<SkillGapResponse>> getSkillGaps() { return skillGaps; }
    public LiveData<List<HeatmapResponse>> getHeatmapData() { return heatmapData; }
    public LiveData<List<HeatmapRow>> getHeatmapRows() { return heatmapRows; }
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<String> getErrorMessage() { return errorMessage; }

    public void loadData() {
        String role = prefManager.getUserRole();
        String email = prefManager.getUserEmail();
        
        isLoading.setValue(true);
        errorMessage.setValue(null);

        if ("EMPLOYEE".equalsIgnoreCase(role)) {
            gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
                if (id != null) {
                    fetchGaps(id);
                } else {
                    isLoading.setValue(false);
                    errorMessage.setValue("Employee record not found for " + email);
                }
            });
        } else if ("HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role) || "DEPARTMENT_HEAD".equalsIgnoreCase(role) || "DEPT_HEAD".equalsIgnoreCase(role) || "SYSTEM_ADMIN".equalsIgnoreCase(role) || "LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(role) || "LD_ADMIN".equalsIgnoreCase(role)) {
            gapRepository.getAllGaps().observeForever(gaps -> {
                isLoading.setValue(false);
                if (gaps != null) {
                    // Filter out System Admin completely
                    List<SkillGapResponse> cleanGaps = gaps.stream()
                        .filter(g -> g.getEmployeeName() != null && !g.getEmployeeName().toLowerCase().contains("admin") && (g.getEmployeeId() == null || g.getEmployeeId() != 1L))
                        .collect(Collectors.toList());

                    if ("MANAGER".equalsIgnoreCase(role) || "DEPARTMENT_HEAD".equalsIgnoreCase(role) || "DEPT_HEAD".equalsIgnoreCase(role)) {
                        filterGapsForManager(cleanGaps);
                    } else {
                        skillGaps.setValue(cleanGaps);
                    }
                } else if (errorMessage.getValue() == null) {
                    errorMessage.setValue("Unable to load organization skill gaps");
                }
            });
        } else {
            isLoading.setValue(false);
            errorMessage.setValue("Team data unavailable for role: " + role);
        }
    }

    private void filterGapsForManager(List<SkillGapResponse> allGaps) {
        String email = prefManager.getUserEmail();
        ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<EmployeeResponse> all = response.body();
                    String managerDept = null;
                    for (EmployeeResponse emp : all) {
                        if (email != null && email.equalsIgnoreCase(emp.getEmail())) {
                            managerDept = emp.getDepartment();
                            break;
                        }
                    }

                    if (managerDept != null) {
                        java.util.Set<Long> teamMemberIds = new java.util.HashSet<>();
                        for (EmployeeResponse emp : all) {
                            boolean isEmployee = emp.getRole() != null && "EMPLOYEE".equalsIgnoreCase(emp.getRole());
                            if (isEmployee) {
                                String empDept = emp.getDepartment();
                                if (empDept != null) {
                                    String lower = empDept.toLowerCase();
                                    if (lower.contains("engineering") || lower.contains("devops") || lower.contains("science") || lower.contains("security")) {
                                        teamMemberIds.add(emp.getId());
                                    }
                                }
                            }
                        }

                        List<SkillGapResponse> filtered = allGaps.stream()
                            .filter(g -> teamMemberIds.contains(g.getEmployeeId()))
                            .collect(Collectors.toList());
                        skillGaps.setValue(filtered);
                    } else {
                        skillGaps.setValue(new ArrayList<>());
                    }
                } else {
                    skillGaps.setValue(new ArrayList<>());
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                skillGaps.setValue(new ArrayList<>());
            }
        });
    }

    public void loadHeatmap() {
        String role = prefManager.getUserRole();
        String email = prefManager.getUserEmail();
        
        isLoading.setValue(true);
        errorMessage.setValue(null);

        if ("EMPLOYEE".equalsIgnoreCase(role)) {
            gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
                if (id != null) {
                    fetchEmployeeHeatmap(id);
                } else {
                    isLoading.setValue(false);
                    errorMessage.setValue("Employee record not found");
                }
            });
        } else if ("HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role) || "DEPARTMENT_HEAD".equalsIgnoreCase(role) || "DEPT_HEAD".equalsIgnoreCase(role) || "SYSTEM_ADMIN".equalsIgnoreCase(role) || "LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(role) || "LD_ADMIN".equalsIgnoreCase(role)) {
            gapRepository.getHeatmapData().observeForever(data -> {
                isLoading.setValue(false);
                if (data != null) {
                    // Filter out System Admin
                    List<HeatmapResponse> cleanData = data.stream()
                        .filter(h -> h.getEmployeeName() != null && !h.getEmployeeName().toLowerCase().contains("admin") && (h.getEmployeeId() == null || h.getEmployeeId() != 1L))
                        .collect(Collectors.toList());

                    if ("MANAGER".equalsIgnoreCase(role) || "DEPARTMENT_HEAD".equalsIgnoreCase(role) || "DEPT_HEAD".equalsIgnoreCase(role)) {
                        filterHeatmapForManager(cleanData);
                    } else {
                        heatmapData.setValue(cleanData);
                        processHeatmapRows(cleanData, false);
                    }
                } else {
                    errorMessage.setValue("Unable to load organization heatmap");
                }
            });
        } else {
            isLoading.setValue(false);
            errorMessage.setValue("Team heatmap is currently unavailable");
        }
    }

    private void filterHeatmapForManager(List<HeatmapResponse> allData) {
        String email = prefManager.getUserEmail();
        ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<EmployeeResponse> all = response.body();
                    String managerDept = null;
                    for (EmployeeResponse emp : all) {
                        if (email != null && email.equalsIgnoreCase(emp.getEmail())) {
                            managerDept = emp.getDepartment();
                            break;
                        }
                    }

                    if (managerDept != null) {
                        java.util.Set<Long> teamMemberIds = new java.util.HashSet<>();
                        for (EmployeeResponse emp : all) {
                            boolean isEmployee = emp.getRole() != null && "EMPLOYEE".equalsIgnoreCase(emp.getRole());
                            if (isEmployee) {
                                String empDept = emp.getDepartment();
                                if (empDept != null) {
                                    String lower = empDept.toLowerCase();
                                    if (lower.contains("engineering") || lower.contains("devops") || lower.contains("science") || lower.contains("security")) {
                                        teamMemberIds.add(emp.getId());
                                    }
                                }
                            }
                        }

                        List<HeatmapResponse> filtered = allData.stream()
                            .filter(h -> teamMemberIds.contains(h.getEmployeeId()))
                            .collect(Collectors.toList());
                        
                        heatmapData.setValue(filtered);
                        processHeatmapRows(filtered, false);
                    } else {
                        heatmapData.setValue(new ArrayList<>());
                        processHeatmapRows(new ArrayList<>(), false);
                    }
                } else {
                    heatmapData.setValue(new ArrayList<>());
                    processHeatmapRows(new ArrayList<>(), false);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                heatmapData.setValue(new ArrayList<>());
                processHeatmapRows(new ArrayList<>(), false);
            }
        });
    }

    private void processHeatmapRows(List<HeatmapResponse> data, boolean isEmployee) {
        List<HeatmapRow> rows = new ArrayList<>();
        if (data == null || data.isEmpty()) {
            heatmapRows.setValue(rows);
            return;
        }

        if (isEmployee) {
            for (HeatmapResponse h : data) {
                List<HeatmapResponse> cells = new ArrayList<>();
                cells.add(h);
                rows.add(new HeatmapRow(h.getSkillName(), cells));
            }
        } else {
            Map<String, List<HeatmapResponse>> grouped = data.stream()
                .filter(h -> h.getEmployeeName() != null && !h.getEmployeeName().toLowerCase().contains("admin"))
                .collect(Collectors.groupingBy(HeatmapResponse::getEmployeeName));
            
            for (Map.Entry<String, List<HeatmapResponse>> entry : grouped.entrySet()) {
                rows.add(new HeatmapRow(entry.getKey(), entry.getValue()));
            }
        }
        heatmapRows.setValue(rows);
    }

    public void loadEmployeeGapsDirect(Long employeeId) {
        isLoading.setValue(true);
        errorMessage.setValue(null);
        gapRepository.getEmployeeGaps(employeeId).observeForever(gaps -> {
            isLoading.setValue(false);
            if (gaps != null) {
                List<SkillGapResponse> cleanGaps = gaps.stream()
                    .filter(g -> g.getEmployeeName() != null && !g.getEmployeeName().toLowerCase().contains("admin") && (g.getEmployeeId() == null || g.getEmployeeId() != 1L))
                    .collect(Collectors.toList());
                skillGaps.setValue(cleanGaps);
            } else if (errorMessage.getValue() == null) {
                errorMessage.setValue("Unable to load employee skill gaps");
            }
        });
    }

    private void fetchGaps(Long employeeId) {
        gapRepository.getEmployeeGaps(employeeId).observeForever(gaps -> {
            isLoading.setValue(false);
            if (gaps != null) {
                List<SkillGapResponse> cleanGaps = gaps.stream()
                    .filter(g -> g.getEmployeeName() != null && !g.getEmployeeName().toLowerCase().contains("admin") && (g.getEmployeeId() == null || g.getEmployeeId() != 1L))
                    .collect(Collectors.toList());
                skillGaps.setValue(cleanGaps);
            } else if (errorMessage.getValue() == null) {
                errorMessage.setValue("Unable to load skill gap data");
            }
        });
    }

    private void fetchEmployeeHeatmap(Long employeeId) {
        gapRepository.getHeatmapByEmployee(employeeId).observeForever(data -> {
            isLoading.setValue(false);
            if (data != null) {
                heatmapData.setValue(data);
                processHeatmapRows(data, true);
            } else {
                errorMessage.setValue("Unable to load your heatmap");
            }
        });
    }
}
