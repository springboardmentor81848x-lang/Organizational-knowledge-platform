package com.kgap.intel.repository;

import androidx.lifecycle.LiveData;
import com.kgap.intel.models.MentorDashboardStats;
import com.kgap.intel.models.MenteeProgress;
import com.kgap.intel.models.MentorProfileResponse;
import java.util.List;

public interface MentorRepository {
    LiveData<MentorDashboardStats> getDashboardStats();
    LiveData<List<MenteeProgress>> getMentees();
    LiveData<List<MentorProfileResponse>> getMentors();
}

