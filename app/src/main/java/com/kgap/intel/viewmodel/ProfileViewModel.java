package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.models.Certification;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.EmployeeSkillResponse;
import com.kgap.intel.models.JobRoleResponse;
import com.kgap.intel.models.Skill;
import com.kgap.intel.models.UserProfile;
import com.kgap.intel.repository.EmployeeRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;

import com.kgap.intel.api.SkillApiService;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.api.ApiClient;

public class ProfileViewModel extends AndroidViewModel {
    private final EmployeeRepository repository;
    private final SkillApiService skillApiService; // Added for skill names
    private final MutableLiveData<UserProfile> userProfile = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>(null);

    public ProfileViewModel(@NonNull Application application) {
        super(application);
        repository = new EmployeeRepository(application);
        skillApiService = ApiClient.getSkillApiService(application);
        loadUserProfile();
    }

    public LiveData<UserProfile> getUserProfile() {
        return userProfile;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public void loadUserProfile() {
        String email = SharedPrefManager.getInstance(getApplication()).getUserEmail();
        loadUserProfile(email);
    }

    public void loadUserProfile(String email) {
        if (email == null) {
            errorMessage.setValue("Employee email not found");
            return;
        }

        isLoading.setValue(true);
        errorMessage.setValue(null);

        repository.getEmployeeByEmail(email).observeForever(employee -> {
            if (employee != null) {
                fetchAdditionalInfo(employee);
            } else {
                isLoading.setValue(false);
                errorMessage.setValue("Employee profile not found");
            }
        });
    }

    private void fetchAdditionalInfo(EmployeeResponse employee) {
        // Fetch Job Roles and Skills in parallel or sequence
        repository.getAllJobRoles().observeForever(roles -> {
            String jobRoleName = "Not Provided";
            if (roles != null && employee.getJobRoleId() != null) {
                for (JobRoleResponse role : (java.util.List<JobRoleResponse>) roles) {
                    if (role.getId().equals(employee.getJobRoleId())) {
                        jobRoleName = role.getName();
                        break;
                    }
                }
            }

            String finalJobRoleName = jobRoleName;
            
            // Fetch All Skills for mapping names
            skillApiService.getAllSkills().enqueue(new retrofit2.Callback<List<SkillItem>>() {
                @Override
                public void onResponse(@NonNull retrofit2.Call<List<SkillItem>> call, @NonNull retrofit2.Response<List<SkillItem>> skillNamesResponse) {
                    java.util.Map<Long, String> skillMap = new java.util.HashMap<>();
                    if (skillNamesResponse.isSuccessful() && skillNamesResponse.body() != null) {
                        for (SkillItem si : skillNamesResponse.body()) {
                            try {
                                skillMap.put(Long.parseLong(si.getId()), si.getName());
                            } catch (Exception ignored) {}
                        }
                    }

                    // Fetch Employee's Skills
                    repository.getEmployeeSkills(employee.getId()).observeForever(skills -> {
                        List<Skill> uiSkills = new ArrayList<>();
                        if (skills != null) {
                            for (EmployeeSkillResponse es : (java.util.List<EmployeeSkillResponse>) skills) {
                                String name = skillMap.getOrDefault(es.getSkillId(), "Skill " + es.getSkillId());
                                int level = mapProficiencyToLevel(es.getProficiencyLevel());
                                uiSkills.add(new Skill(name, level));
                            }
                        }

                        List<Certification> certifications = new ArrayList<>();
                        if (employee.getId() != null && employee.getId() == 9L) {
                            certifications.add(new Certification("PMP Certified", "PMI", "2023"));
                            certifications.add(new Certification("Google Project Management", "Coursera", "2022"));
                        }

                        UserProfile profile = new UserProfile(
                            String.valueOf(employee.getId()),
                            employee.getFirstName() + " " + employee.getLastName(),
                            employee.getEmail(),
                            employee.getPhoneNumber() != null ? employee.getPhoneNumber() : "Not provided",
                            employee.getDepartment() != null ? employee.getDepartment() : "Not provided",
                            finalJobRoleName,
                            employee.getExperience() != null ? employee.getExperience() : "Not provided",
                            employee.getEducation() != null ? employee.getEducation() : "Not provided",
                            employee.getBio() != null ? employee.getBio() : "Not provided",
                            uiSkills,
                            certifications,
                            uiSkills.isEmpty() ? 0 : 75 // Mock progress
                        );

                        userProfile.setValue(profile);
                        isLoading.setValue(false);
                    });
                }

                @Override
                public void onFailure(retrofit2.Call<List<SkillItem>> call, Throwable t) {
                    // Fallback if skill names fail
                    isLoading.setValue(false);
                    errorMessage.setValue("Error loading skill details");
                }
            });
        });
    }

    private int mapProficiencyToLevel(String proficiency) {
        if (proficiency == null) return 0;
        switch (proficiency.toUpperCase()) {
            case "BEGINNER": return 25;
            case "INTERMEDIATE": return 50;
            case "ADVANCED": return 75;
            case "EXPERT": return 100;
            default: return 0;
        }
    }
}
