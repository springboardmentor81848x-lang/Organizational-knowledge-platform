package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.kgap.intel.models.LDDashboardStats;
import com.kgap.intel.models.TrainingProgram;
import com.kgap.intel.repository.LDRepository;
import com.kgap.intel.repository.RealLDRepository;

import java.util.List;

public class LDViewModel extends AndroidViewModel {
    private final LDRepository repository;

    public LDViewModel(@NonNull Application application) {
        super(application);
        repository = new RealLDRepository(application);
    }

    public LiveData<LDDashboardStats> getDashboardStats() {
        return repository.getDashboardStats();
    }

    public LiveData<List<TrainingProgram>> getTrainingPrograms() {
        return repository.getTrainingPrograms();
    }
}
