package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import com.kgap.intel.models.*;
import com.kgap.intel.repository.DepartmentHeadRepository;
import com.kgap.intel.repository.RealDepartmentHeadRepository;
import java.util.List;

public class DepartmentHeadViewModel extends AndroidViewModel {
    private final DepartmentHeadRepository repository;

    public DepartmentHeadViewModel(@NonNull Application application) {
        super(application);
        repository = new RealDepartmentHeadRepository(application);
    }

    public LiveData<List<DepartmentSkill>> getSkillCoverage() {
        return repository.getDepartmentSkillCoverage();
    }

    public LiveData<List<SkillGap>> getHeatmap() {
        return repository.getTeamGapHeatmap();
    }

    public LiveData<TrainingAdoption> getAdoptionRates() {
        return repository.getTrainingAdoptionRates();
    }

    public LiveData<List<HighRiskGap>> getHighRiskGaps() {
        return repository.getHighRiskSkillGaps();
    }

    public LiveData<List<EmployeeProgress>> getEmployeeProgress() {
        return repository.getIndividualProgressSnapshots();
    }
}
