package com.kgap.intel.repository;

import androidx.lifecycle.LiveData;
import com.kgap.intel.models.*;
import java.util.List;

public interface DepartmentHeadRepository {
    LiveData<List<DepartmentSkill>> getDepartmentSkillCoverage();
    LiveData<List<SkillGap>> getTeamGapHeatmap();
    LiveData<TrainingAdoption> getTrainingAdoptionRates();
    LiveData<List<HighRiskGap>> getHighRiskSkillGaps();
    LiveData<List<EmployeeProgress>> getIndividualProgressSnapshots();
}
