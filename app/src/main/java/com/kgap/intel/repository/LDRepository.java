package com.kgap.intel.repository;

import androidx.lifecycle.LiveData;
import com.kgap.intel.models.LDDashboardStats;
import com.kgap.intel.models.TrainingProgram;
import java.util.List;

public interface LDRepository {
    LiveData<LDDashboardStats> getDashboardStats();
    LiveData<List<TrainingProgram>> getTrainingPrograms();
}
