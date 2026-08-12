package com.kgap.intel.viewmodel;

import android.app.Application;
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
    private String currentCategory = "All";
    private String currentSearchQuery = "";
    private final SharedPrefManager prefManager;
    private LiveData<List<SkillItem>> repoLiveData;

    public SkillsViewModel(@NonNull Application application) {
        super(application);
        repository = new SkillRepository(application);
        prefManager = SharedPrefManager.getInstance(application);
    }

    public void loadData() {
        isLoading.setValue(true);
        String email = prefManager.getUserEmail();
        
        ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (EmployeeResponse e : response.body()) {
                        if (e.getEmail().equalsIgnoreCase(email)) {
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
        repoLiveData = repository.getEmployeeSkills(employeeId);
        repoLiveData.observeForever(new Observer<List<SkillItem>>() {
            @Override
            public void onChanged(List<SkillItem> skills) {
                isLoading.setValue(false);
                if (skills != null) {
                    allSkillsList = new ArrayList<>(skills);
                    applyFilter();
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
        this.currentCategory = category;
        applyFilter();
    }

    public void setSearchQuery(String query) {
        this.currentSearchQuery = query;
        applyFilter();
    }

    private void applyFilter() {
        List<SkillItem> filtered = allSkillsList.stream()
            .filter(skill -> {
                boolean matchesCategory;
                String skillCat = skill.getCategory() != null ? skill.getCategory() : "";

                if (currentCategory.equals("All")) {
                    matchesCategory = true;
                } else if (currentCategory.equals("Others")) {
                    matchesCategory = !skillCat.equalsIgnoreCase("Technical") &&
                                      !skillCat.equalsIgnoreCase("Soft Skill") &&
                                      !skillCat.equalsIgnoreCase("Soft Skills") &&
                                      !skillCat.equalsIgnoreCase("Tools") &&
                                      !skillCat.equalsIgnoreCase("Language") &&
                                      !skillCat.equalsIgnoreCase("Languages");
                } else if (currentCategory.equals("Soft Skill")) {
                    matchesCategory = skillCat.equalsIgnoreCase("Soft Skill") || 
                                     skillCat.equalsIgnoreCase("Soft Skills");
                } else if (currentCategory.equals("Language")) {
                    matchesCategory = skillCat.equalsIgnoreCase("Language") || 
                                     skillCat.equalsIgnoreCase("Languages");
                } else {
                    matchesCategory = skillCat.equalsIgnoreCase(currentCategory);
                }

                boolean matchesSearch = currentSearchQuery.isEmpty() || 
                                        skill.getName().toLowerCase().contains(currentSearchQuery.toLowerCase());
                return matchesCategory && matchesSearch;
            })
            .collect(Collectors.toList());
        filteredSkillsLiveData.setValue(filtered);
    }

    public void addSkill(String name, String category, int proficiency) {
        String id = String.valueOf(allSkillsList.size() + 1);
        String level = proficiency >= 75 ? "Advanced" : (proficiency >= 50 ? "Intermediate" : "Beginner");
        SkillItem newItem = new SkillItem(id, name, category, proficiency, level, "0 Years", "Just now");
        
        allSkillsList.add(0, newItem);
        applyFilter();
    }

    @Override
    protected void onCleared() {
        super.onCleared();
    }
}
