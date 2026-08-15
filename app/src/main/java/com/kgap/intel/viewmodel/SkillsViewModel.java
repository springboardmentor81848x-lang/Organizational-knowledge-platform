package com.kgap.intel.viewmodel;

import android.app.Application;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.repository.SkillRepository;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.utils.SharedPrefManager;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class SkillsViewModel extends AndroidViewModel {
    private final SkillRepository repository;
    private final MutableLiveData<List<SkillItem>> filteredSkillsLiveData = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private List<SkillItem> allSkillsList = new ArrayList<>();
    private List<SkillItem> catalogSkills = new ArrayList<>();
    private String currentCategory = "All";
    private String currentSearchQuery = "";
    private final SharedPrefManager prefManager;
    private LiveData<List<SkillItem>> repoLiveData;

    public SkillsViewModel(@NonNull Application application) {
        super(application);
        repository = new SkillRepository(application);
        prefManager = SharedPrefManager.getInstance(application);
        loadCatalog();
    }

    private void loadCatalog() {
        repository.getCatalogSkills().observeForever(new Observer<List<SkillItem>>() {
            @Override
            public void onChanged(List<SkillItem> skills) {
                if (skills != null) {
                    catalogSkills = skills;
                }
            }
        });
    }

    public List<SkillItem> getCatalog() {
        return catalogSkills;
    }

    public void loadData() {
        Log.d("SkillsViewModel", "loadData triggered");
        isLoading.setValue(true);
        loadCatalog();
        
        Long userId = prefManager.getUserId();
        if (userId != -1L) {
            fetchSkills(userId);
            return;
        }

        String email = prefManager.getUserEmail();
        if (email == null) {
            isLoading.setValue(false);
            return;
        }

        ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (EmployeeResponse e : response.body()) {
                        if (e != null && e.getEmail() != null && e.getEmail().equalsIgnoreCase(email)) {
                            fetchSkills(e.getId());
                            return;
                        }
                    }
                }
                isLoading.setValue(false);
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                isLoading.setValue(false);
            }
        });
    }

    private void fetchSkills(Long employeeId) {
        Log.d("SkillsViewModel", "Fetching skills for employeeId: " + employeeId);
        if (employeeId == null) {
            isLoading.setValue(false);
            return;
        }
        repoLiveData = repository.getEmployeeSkills(employeeId);
        repoLiveData.observeForever(new Observer<List<SkillItem>>() {
            @Override
            public void onChanged(List<SkillItem> skills) {
                isLoading.setValue(false);
                if (skills != null) {
                    Log.d("SkillsViewModel", "Fetched " + skills.size() + " skills");
                    for (SkillItem s : skills) {
                        Log.d("SkillsViewModel", "Skill: " + s.getName() + ", Prof: " + s.getProficiency());
                    }
                    allSkillsList = new ArrayList<>(skills);
                    applyFilter();
                } else {
                    Log.e("SkillsViewModel", "Failed to fetch skills (null response)");
                    allSkillsList = new ArrayList<>();
                    filteredSkillsLiveData.setValue(new ArrayList<>());
                }
                repoLiveData.removeObserver(this);
            }
        });
    }

    public LiveData<List<SkillItem>> getSkills() {
        return filteredSkillsLiveData;
    }
    
    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public void setCategoryFilter(String category) {
        this.currentCategory = category != null ? category : "All";
        applyFilter();
    }

    public void setSearchQuery(String query) {
        this.currentSearchQuery = query != null ? query : "";
        applyFilter();
    }

    private void applyFilter() {
        if (allSkillsList == null) {
            filteredSkillsLiveData.setValue(new ArrayList<>());
            return;
        }

        List<SkillItem> filtered = allSkillsList.stream()
            .filter(skill -> {
                if (skill == null) return false;
                
                boolean matchesCategory;
                String skillCat = skill.getCategory() != null ? skill.getCategory() : "";

                if ("All".equals(currentCategory)) {
                    matchesCategory = true;
                } else if ("Technical".equals(currentCategory)) {
                    matchesCategory = skillCat.equalsIgnoreCase("Backend Development") ||
                                      skillCat.equalsIgnoreCase("Database") ||
                                      skillCat.equalsIgnoreCase("Frontend Development") ||
                                      skillCat.equalsIgnoreCase("Data Science") ||
                                      skillCat.equalsIgnoreCase("DevOps") ||
                                      skillCat.equalsIgnoreCase("Cloud & DevOps") ||
                                      skillCat.equalsIgnoreCase("Cybersecurity") ||
                                      skillCat.equalsIgnoreCase("Data Engineering") ||
                                      skillCat.equalsIgnoreCase("Design") ||
                                      skillCat.equalsIgnoreCase("Technical");
                } else if ("Soft Skill".equals(currentCategory)) {
                    matchesCategory = skillCat.equalsIgnoreCase("Communication") ||
                                      skillCat.equalsIgnoreCase("Management") ||
                                      skillCat.equalsIgnoreCase("Soft Skill") || 
                                      skillCat.equalsIgnoreCase("Soft Skills");
                } else if ("Language".equals(currentCategory)) {
                    matchesCategory = skillCat.equalsIgnoreCase("Language") || 
                                     skillCat.equalsIgnoreCase("Languages");
                } else if ("Tools".equals(currentCategory)) {
                    matchesCategory = skillCat.equalsIgnoreCase("Tools");
                } else if ("Others".equals(currentCategory)) {
                    matchesCategory = !skillCat.equalsIgnoreCase("Backend Development") &&
                                      !skillCat.equalsIgnoreCase("Database") &&
                                      !skillCat.equalsIgnoreCase("Frontend Development") &&
                                      !skillCat.equalsIgnoreCase("Data Science") &&
                                      !skillCat.equalsIgnoreCase("DevOps") &&
                                      !skillCat.equalsIgnoreCase("Cloud & DevOps") &&
                                      !skillCat.equalsIgnoreCase("Cybersecurity") &&
                                      !skillCat.equalsIgnoreCase("Data Engineering") &&
                                      !skillCat.equalsIgnoreCase("Design") &&
                                      !skillCat.equalsIgnoreCase("Communication") &&
                                      !skillCat.equalsIgnoreCase("Management");
                } else {
                    matchesCategory = skillCat.equalsIgnoreCase(currentCategory);
                }

                String skillName = skill.getName() != null ? skill.getName() : "";
                boolean matchesSearch = currentSearchQuery.isEmpty() || 
                                        skillName.toLowerCase().contains(currentSearchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            })
            .collect(Collectors.toList());
        filteredSkillsLiveData.setValue(filtered);
    }

    public void addSkill(String name, String category, int proficiency) {
        Long userId = prefManager.getUserId();
        if (userId == -1L) {
            Log.e("SkillsViewModel", "No userId found in SharedPrefs");
            return;
        }

        Long skillId = -1L;
        for (SkillItem s : catalogSkills) {
            if (s.getName().equalsIgnoreCase(name)) {
                try {
                    skillId = Long.parseLong(s.getId());
                } catch (NumberFormatException ignored) {}
                break;
            }
        }

        if (skillId == -1L) {
            Log.e("SkillsViewModel", "Skill not found in catalog: " + name);
            // In a real app, maybe add to catalog or show error
            // For now, let's assume it MUST be in the catalog to be assessable
            return;
        }

        String level = proficiency >= 75 ? "Advanced" : (proficiency >= 50 ? "Intermediate" : "Beginner");
        
        repository.addEmployeeSkill(userId, skillId, level, new Callback<com.kgap.intel.models.EmployeeSkillResponse>() {
            @Override
            public void onResponse(Call<com.kgap.intel.models.EmployeeSkillResponse> call, Response<com.kgap.intel.models.EmployeeSkillResponse> response) {
                if (response.isSuccessful()) {
                    loadData(); // Refresh list
                } else {
                    Log.e("SkillsViewModel", "Failed to add skill: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<com.kgap.intel.models.EmployeeSkillResponse> call, Throwable t) {
                Log.e("SkillsViewModel", "Error adding skill", t);
            }
        });
    }

    public void deleteSkill(SkillItem item) {
        if (item.getEmployeeSkillId() == null) return;
        
        repository.deleteEmployeeSkill(item.getEmployeeSkillId(), new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    loadData();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Log.e("SkillsViewModel", "Failed to delete skill", t);
            }
        });
    }

    public void updateSkill(SkillItem item, String newLevel) {
        if (item.getEmployeeSkillId() == null) return;
        Long userId = prefManager.getUserId();
        
        repository.updateEmployeeSkill(item.getEmployeeSkillId(), userId, Long.parseLong(item.getId()), newLevel, new Callback<com.kgap.intel.models.EmployeeSkillResponse>() {
            @Override
            public void onResponse(Call<com.kgap.intel.models.EmployeeSkillResponse> call, Response<com.kgap.intel.models.EmployeeSkillResponse> response) {
                if (response.isSuccessful()) {
                    loadData();
                }
            }

            @Override
            public void onFailure(Call<com.kgap.intel.models.EmployeeSkillResponse> call, Throwable t) {
                Log.e("SkillsViewModel", "Failed to update skill", t);
            }
        });
    }
}
