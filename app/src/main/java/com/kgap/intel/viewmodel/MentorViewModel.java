package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;

import com.kgap.intel.models.MentorDashboardStats;
import com.kgap.intel.models.MenteeProgress;
import com.kgap.intel.repository.MentorRepository;
import com.kgap.intel.repository.RealMentorRepository;

import java.util.List;

public class MentorViewModel extends AndroidViewModel {
    private final MentorRepository repository;

    public MentorViewModel(@NonNull Application application) {
        super(application);
        repository = new RealMentorRepository(application);
    }

    public LiveData<MentorDashboardStats> getDashboardStats() {
        return repository.getDashboardStats();
    }

    public LiveData<List<MenteeProgress>> getMentees() {
        return repository.getMentees();
    }
}
