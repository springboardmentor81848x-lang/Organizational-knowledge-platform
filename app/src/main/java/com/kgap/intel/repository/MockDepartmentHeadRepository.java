package com.kgap.intel.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.models.*;
import java.util.ArrayList;
import java.util.List;

public class MockDepartmentHeadRepository implements DepartmentHeadRepository {

    @Override
    public LiveData<List<DepartmentSkill>> getDepartmentSkillCoverage() {
        MutableLiveData<List<DepartmentSkill>> data = new MutableLiveData<>();
        List<DepartmentSkill> list = new ArrayList<>();
        list.add(new DepartmentSkill("Java Backend", 75, 90, "Technical"));
        list.add(new DepartmentSkill("Cloud Architecture", 60, 85, "Technical"));
        list.add(new DepartmentSkill("Project Management", 80, 80, "Soft Skill"));
        list.add(new DepartmentSkill("Data Analysis", 45, 75, "Technical"));
        data.setValue(list);
        return data;
    }

    @Override
    public LiveData<List<SkillGap>> getTeamGapHeatmap() {
        MutableLiveData<List<SkillGap>> data = new MutableLiveData<>();
        List<SkillGap> list = new ArrayList<>();
        String[] skills = {"Java", "Python", "React", "AWS", "Agile"};
        String[] teams = {"Core Team", "Cloud Team", "UI/UX Team", "Data Team"};
        
        for (String skill : skills) {
            for (String team : teams) {
                int value = (int) (Math.random() * 100);
                String level = value > 70 ? "High" : (value > 30 ? "Medium" : "Low");
                list.add(new SkillGap(skill, team, level, value));
            }
        }
        data.setValue(list);
        return data;
    }

    @Override
    public LiveData<List<HeatmapRow>> getDepartmentHeatmapRows() {
        MutableLiveData<List<HeatmapRow>> data = new MutableLiveData<>();
        List<HeatmapRow> rows = new ArrayList<>();
        data.setValue(rows);
        return data;
    }

    @Override
    public LiveData<TrainingAdoption> getTrainingAdoptionRates() {
        MutableLiveData<TrainingAdoption> data = new MutableLiveData<>();
        data.setValue(new TrainingAdoption(120, 45, 65, 68.5));
        return data;
    }

    @Override
    public LiveData<List<HighRiskGap>> getHighRiskSkillGaps() {
        MutableLiveData<List<HighRiskGap>> data = new MutableLiveData<>();
        List<HighRiskGap> list = new ArrayList<>();
        list.add(new HighRiskGap("Cybersecurity", "Critical", 30, 95));
        list.add(new HighRiskGap("DevOps Automation", "High", 50, 85));
        list.add(new HighRiskGap("Microservices", "High", 55, 90));
        data.setValue(list);
        return data;
    }

    @Override
    public LiveData<List<EmployeeProgress>> getIndividualProgressSnapshots() {
        MutableLiveData<List<EmployeeProgress>> data = new MutableLiveData<>();
        List<EmployeeProgress> list = new ArrayList<>();
        list.add(new EmployeeProgress("Alice Vance", 85, 90, 5));
        list.add(new EmployeeProgress("Bob Marley", 60, 45, 2));
        list.add(new EmployeeProgress("Charlie Day", 75, 80, 4));
        list.add(new EmployeeProgress("Diana Prince", 95, 100, 8));
        data.setValue(list);
        return data;
    }

    @Override
    public LiveData<String> getDepartmentName() {
        MutableLiveData<String> data = new MutableLiveData<>();
        data.setValue("Engineering");
        return data;
    }
}
