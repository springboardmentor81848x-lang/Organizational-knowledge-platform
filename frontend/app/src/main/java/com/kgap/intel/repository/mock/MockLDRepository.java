package com.kgap.intel.repository.mock;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.kgap.intel.models.LDDashboardStats;
import com.kgap.intel.models.TrainingProgram;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MockLDRepository {
    private static MockLDRepository instance;

    public static MockLDRepository getInstance() {
        if (instance == null) {
            instance = new MockLDRepository();
        }
        return instance;
    }

    public LiveData<LDDashboardStats> getDashboardStats() {
        MutableLiveData<LDDashboardStats> data = new MutableLiveData<>();
        data.setValue(new LDDashboardStats(25, 18, 150, 85, 78.5, 92.0, 84.5, 12));
        return data;
    }

    public LiveData<List<TrainingProgram>> getTrainingPrograms() {
        MutableLiveData<List<TrainingProgram>> data = new MutableLiveData<>();
        List<TrainingProgram> list = new ArrayList<>();
        list.add(new TrainingProgram("1", "Advanced Java", "Deep dive into JVM", "Internal", "", "20h", "Advanced", Arrays.asList("Java", "Performance"), true));
        list.add(new TrainingProgram("2", "Cloud Architecture", "AWS and Azure", "Coursera", "https://coursera.org", "40h", "Intermediate", Arrays.asList("Cloud", "DevOps"), true));
        list.add(new TrainingProgram("3", "Leadership 101", "Soft skills for managers", "Internal", "", "10h", "Beginner", Arrays.asList("Management", "Communication"), true));
        data.setValue(list);
        return data;
    }
}
