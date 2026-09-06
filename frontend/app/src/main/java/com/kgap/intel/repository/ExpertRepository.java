package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.EmployeeApiService;
import com.kgap.intel.api.SkillApiService;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.EmployeeSkillResponse;
import com.kgap.intel.models.ExpertItem;
import com.kgap.intel.models.SkillItem;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ExpertRepository {
    private final EmployeeApiService employeeApiService;
    private final SkillApiService skillApiService;

    public ExpertRepository(Context context) {
        employeeApiService = ApiClient.getEmployeeApiService(context);
        skillApiService = ApiClient.getSkillApiService(context);
    }

    public LiveData<List<ExpertItem>> getExperts() {
        MutableLiveData<List<ExpertItem>> liveData = new MutableLiveData<>();

        // 1. Fetch real employees from backend
        employeeApiService.getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> empResponse) {
                if (!empResponse.isSuccessful() || empResponse.body() == null) {
                    liveData.setValue(null);
                    return;
                }

                Map<Long, EmployeeResponse> employeeMap = new LinkedHashMap<>();
                for (EmployeeResponse emp : empResponse.body()) {
                    if (emp.getId() != null) {
                        employeeMap.put(emp.getId(), emp);
                    }
                }

                // 2. Fetch skills catalog from backend
                skillApiService.getAllSkills().enqueue(new Callback<List<SkillItem>>() {
                    @Override
                    public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> skillResponse) {
                        Map<Long, String> skillCatalog = new HashMap<>();
                        if (skillResponse.isSuccessful() && skillResponse.body() != null) {
                            for (SkillItem item : skillResponse.body()) {
                                try {
                                    Long sId = Long.parseLong(item.getId());
                                    skillCatalog.put(sId, item.getName());
                                } catch (NumberFormatException ignored) {}
                            }
                        }

                        // 3. Fetch employee skills from backend
                        skillApiService.getAllEmployeeSkills().enqueue(new Callback<List<EmployeeSkillResponse>>() {
                            @Override
                            public void onResponse(Call<List<EmployeeSkillResponse>> call, Response<List<EmployeeSkillResponse>> empSkillResponse) {
                                Map<Long, List<String>> empSkillsMap = new HashMap<>();
                                Map<Long, String> empProficiencyMap = new HashMap<>();

                                if (empSkillResponse.isSuccessful() && empSkillResponse.body() != null) {
                                    for (EmployeeSkillResponse es : empSkillResponse.body()) {
                                        Long empId = es.getEmployeeId();
                                        String skillName = skillCatalog.getOrDefault(es.getSkillId(), "Skill #" + es.getSkillId());
                                        
                                        empSkillsMap.computeIfAbsent(empId, k -> new ArrayList<>());
                                        if (!empSkillsMap.get(empId).contains(skillName)) {
                                            empSkillsMap.get(empId).add(skillName);
                                        }

                                        // Keep track of highest proficiency level
                                        String currentProf = empProficiencyMap.get(empId);
                                        String newProf = es.getProficiencyLevel() != null ? es.getProficiencyLevel() : "INTERMEDIATE";
                                        if (currentProf == null || "EXPERT".equalsIgnoreCase(newProf)) {
                                            empProficiencyMap.put(empId, newProf);
                                        }
                                    }
                                }

                                List<ExpertItem> resultList = new ArrayList<>();
                                for (Map.Entry<Long, EmployeeResponse> entry : employeeMap.entrySet()) {
                                    Long empId = entry.getKey();
                                    EmployeeResponse emp = entry.getValue();

                                    List<String> skills = empSkillsMap.get(empId);
                                    if (skills == null || skills.isEmpty()) {
                                        continue; // Only include employees who have registered skills/competencies
                                    }

                                    String formattedName = emp.getFirstName() + (emp.getLastName() != null && !emp.getLastName().isEmpty() ? " " + emp.getLastName() : "");
                                    String skillSummary = String.join(", ", skills);
                                    String prof = empProficiencyMap.getOrDefault(empId, "EXPERT");
                                    String dept = emp.getDepartment() != null ? emp.getDepartment() : "Engineering";
                                    String role = emp.getRole() != null ? emp.getRole() : "Subject Matter Expert";

                                    resultList.add(new ExpertItem(
                                            empId,
                                            formattedName,
                                            skillSummary,
                                            prof,
                                            dept,
                                            role,
                                            emp.getBio() != null ? emp.getBio() : "Verified subject matter expert in " + skillSummary
                                    ));
                                }

                                liveData.setValue(resultList);
                            }

                            @Override
                            public void onFailure(Call<List<EmployeeSkillResponse>> call, Throwable t) {
                                liveData.setValue(null);
                            }
                        });
                    }

                    @Override
                    public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                        liveData.setValue(null);
                    }
                });
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                liveData.setValue(null);
            }
        });

        return liveData;
    }
}
