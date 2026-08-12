package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.repository.EmployeeRepository;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.List;

public class ManagerViewModel extends AndroidViewModel {
    private final EmployeeRepository repository;
    private final GapRepository gapRepository;
    private final MutableLiveData<List<EmployeeResponse>> teamMembers = new MutableLiveData<>();
    private final MutableLiveData<Integer> teamCoverage = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> totalMembers = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> totalGaps = new MutableLiveData<>(0);
    private final MutableLiveData<Integer> highRiskGaps = new MutableLiveData<>(0);
    private final MutableLiveData<String> trainingAdoption = new MutableLiveData<>("0%");
    private final MutableLiveData<Integer> learningProgress = new MutableLiveData<>(0);
    private final SharedPrefManager prefManager;

    public ManagerViewModel(@NonNull Application application) {
        super(application);
        repository = new EmployeeRepository(application);
        gapRepository = new GapRepository(application);
        prefManager = SharedPrefManager.getInstance(application);
    }

    public LiveData<List<EmployeeResponse>> getTeamMembers() { return teamMembers; }
    public LiveData<Integer> getTeamCoverage() { return teamCoverage; }
    public LiveData<Integer> getTotalMembers() { return totalMembers; }
    public LiveData<Integer> getTotalGaps() { return totalGaps; }
    public LiveData<Integer> getHighRiskGaps() { return highRiskGaps; }
    public LiveData<String> getTrainingAdoption() { return trainingAdoption; }
    public LiveData<Integer> getLearningProgress() { return learningProgress; }

    public void loadTeamDashboard() {
        // Fetch team members
        repository.getTeamMembers(null).observeForever(members -> {
            if (members != null) {
                teamMembers.setValue(members);
            }
        });

        // Fetch aggregate team metrics
        gapRepository.getTeamMetrics(null, (members, gaps, highRisk, coverage, progress) -> {
            totalMembers.setValue(members);
            totalGaps.setValue(gaps);
            highRiskGaps.setValue(highRisk);
            teamCoverage.setValue(coverage);
            learningProgress.setValue(progress);
            trainingAdoption.setValue("74%"); // Mock for now
        });
    }
}
