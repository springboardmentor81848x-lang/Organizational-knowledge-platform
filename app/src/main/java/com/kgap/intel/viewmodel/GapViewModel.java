package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.kgap.intel.models.HeatmapResponse;
import com.kgap.intel.models.HeatmapRow;
import com.kgap.intel.models.SkillGapResponse;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.utils.SharedPrefManager;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
        android.util.Log.d("SkillGapDebug", "loadData: email=" + email + ", role=" + role);
        
        isLoading.setValue(true);
        errorMessage.setValue(null);

        if ("EMPLOYEE".equalsIgnoreCase(role)) {
            gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
                if (id != null) {
                    android.util.Log.d("SkillGapDebug", "Resolved employeeId: " + id);
                    fetchGaps(id);
                } else {
                    android.util.Log.e("SkillGapDebug", "Could not resolve employeeId for " + email);
                    isLoading.setValue(false);
                    errorMessage.setValue("Employee record not found for " + email);
                }
            });
        } else if ("HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role)) {
            gapRepository.getAllGaps().observeForever(gaps -> {
                isLoading.setValue(false);
                if (gaps != null) {
                    skillGaps.setValue(gaps);
                } else if (errorMessage.getValue() == null) {
                    errorMessage.setValue("Unable to load organization skill gaps");
                }
            });
        } else {
            isLoading.setValue(false);
            errorMessage.setValue("Team data unavailable for role: " + role);
        }
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
        } else if ("HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "MANAGER".equalsIgnoreCase(role)) {
            gapRepository.getHeatmapData().observeForever(data -> {
                isLoading.setValue(false);
                if (data != null) {
                    heatmapData.setValue(data);
                    processHeatmapRows(data, false);
                } else {
                    errorMessage.setValue("Unable to load organization heatmap");
                }
            });
        } else {
            isLoading.setValue(false);
            errorMessage.setValue("Team heatmap is currently unavailable");
        }
    }

    private void processHeatmapRows(List<HeatmapResponse> data, boolean isEmployee) {
        List<HeatmapRow> rows = new ArrayList<>();
        if (data == null || data.isEmpty()) {
            heatmapRows.setValue(rows);
            return;
        }

        if (isEmployee) {
            // For employee, each row is a Skill
            for (HeatmapResponse h : data) {
                List<HeatmapResponse> cells = new ArrayList<>();
                cells.add(h);
                rows.add(new HeatmapRow(h.getSkillName(), cells));
            }
        } else {
            // For HR/Admin, each row is an Employee
            Map<String, List<HeatmapResponse>> grouped = data.stream()
                .filter(h -> h.getEmployeeName() != null)
                .collect(Collectors.groupingBy(HeatmapResponse::getEmployeeName));
            
            for (Map.Entry<String, List<HeatmapResponse>> entry : grouped.entrySet()) {
                rows.add(new HeatmapRow(entry.getKey(), entry.getValue()));
            }
        }
        heatmapRows.setValue(rows);
    }

    private void fetchGaps(Long employeeId) {
        gapRepository.getEmployeeGaps(employeeId).observeForever(gaps -> {
            isLoading.setValue(false);
            if (gaps != null) {
                skillGaps.setValue(gaps);
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
