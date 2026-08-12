package com.kgap.intel.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.SkillApiService;
import com.kgap.intel.models.EmployeeSkillResponse;
import com.kgap.intel.models.SkillItem;
import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SkillRepository {
    private final SkillApiService apiService;

    public SkillRepository(android.content.Context context) {
        apiService = ApiClient.getSkillApiService(context);
    }

    public LiveData<List<SkillItem>> getEmployeeSkills(Long employeeId) {
        MutableLiveData<List<SkillItem>> data = new MutableLiveData<>();
        
        apiService.getAllSkills().enqueue(new Callback<List<SkillItem>>() {
            @Override
            public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> catalogResponse) {
                Map<Long, SkillItem> catalogMap = new HashMap<>();
                if (catalogResponse.isSuccessful() && catalogResponse.body() != null) {
                    for (SkillItem s : catalogResponse.body()) {
                        try {
                            catalogMap.put(Long.parseLong(s.getId()), s);
                        } catch (Exception ignored) {}
                    }
                }

                apiService.getEmployeeSkills(employeeId).enqueue(new Callback<List<EmployeeSkillResponse>>() {
                    @Override
                    public void onResponse(Call<List<EmployeeSkillResponse>> call, Response<List<EmployeeSkillResponse>> response) {
                        List<SkillItem> result = new ArrayList<>();
                        if (response.isSuccessful() && response.body() != null) {
                            for (EmployeeSkillResponse es : response.body()) {
                                SkillItem base = catalogMap.get(es.getSkillId());
                                if (base != null) {
                                    int proficiencyPercent = getProficiencyPercent(es.getProficiencyLevel());
                                    result.add(new SkillItem(
                                        base.getId(),
                                        base.getName(),
                                        base.getCategory(),
                                        proficiencyPercent,
                                        es.getProficiencyLevel(),
                                        base.getExperience(),
                                        "Updated"
                                    ));
                                }
                            }
                        }
                        
                        // Add mock skills for employee2
                        if (result.isEmpty() && employeeId != null && employeeId == 9L) {
                            result.add(new SkillItem("1", "Product Management", "Product", 85, "EXPERT", "5 years", "Mock"));
                            result.add(new SkillItem("2", "Agile Methodology", "Management", 90, "EXPERT", "6 years", "Mock"));
                            result.add(new SkillItem("3", "Data Analytics", "Technical", 60, "INTERMEDIATE", "2 years", "Mock"));
                        }
                        
                        data.setValue(result);
                    }

                    @Override
                    public void onFailure(Call<List<EmployeeSkillResponse>> call, Throwable t) {
                        data.setValue(null);
                    }
                });
            }

            @Override
            public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                data.setValue(null);
            }
        });

        return data;
    }

    private int getProficiencyPercent(String level) {
        if (level == null) return 0;
        switch (level.toUpperCase()) {
            case "BEGINNER": return 25;
            case "INTERMEDIATE": return 50;
            case "ADVANCED": return 75;
            case "EXPERT": return 100;
            default: return 0;
        }
    }
}
