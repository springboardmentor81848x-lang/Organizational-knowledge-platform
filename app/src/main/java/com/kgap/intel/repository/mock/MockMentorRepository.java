package com.kgap.intel.repository.mock;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.kgap.intel.models.MentorDashboardStats;
import com.kgap.intel.models.MenteeProgress;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MockMentorRepository {
    private static MockMentorRepository instance;

    public static MockMentorRepository getInstance() {
        if (instance == null) {
            instance = new MockMentorRepository();
        }
        return instance;
    }

    public LiveData<MentorDashboardStats> getDashboardStats() {
        MutableLiveData<MentorDashboardStats> data = new MutableLiveData<>();
        data.setValue(new MentorDashboardStats(5, 4, 1, 2, 3));
        return data;
    }

    public LiveData<List<MenteeProgress>> getMentees() {
        MutableLiveData<List<MenteeProgress>> data = new MutableLiveData<>();
        List<MenteeProgress> list = new ArrayList<>();
        list.add(new MenteeProgress("m1", "John Doe", "Junior Dev", 65, Arrays.asList("Java", "Git"), Arrays.asList("Spring Boot", "Testing"), "Backend Path"));
        list.add(new MenteeProgress("m2", "Jane Smith", "Data Analyst", 40, Arrays.asList("Python", "SQL"), Arrays.asList("R", "Statistics"), "Data Science Path"));
        data.setValue(list);
        return data;
    }
}
