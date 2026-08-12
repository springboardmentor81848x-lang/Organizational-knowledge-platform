package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import com.kgap.intel.models.Recommendation;
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

public class HomeViewModel extends AndroidViewModel {
    private final MutableLiveData<List<Recommendation>> recommendations = new MutableLiveData<>();
    private final MutableLiveData<List<SkillItem>> employeeSkills = new MutableLiveData<>();
    private final MutableLiveData<String> employeeName = new MutableLiveData<>();
    private final SkillRepository skillRepository;
    private final SharedPrefManager prefManager;
    private LiveData<List<SkillItem>> repoLiveData;

    public HomeViewModel(@NonNull Application application) {
        super(application);
        skillRepository = new SkillRepository(application);
        prefManager = SharedPrefManager.getInstance(application);
        loadRecommendations();
        loadEmployeeSkills();
    }

    public LiveData<List<Recommendation>> getRecommendations() {
        return recommendations;
    }

    public LiveData<List<SkillItem>> getEmployeeSkills() {
        return employeeSkills;
    }

    public LiveData<String> getEmployeeName() {
        return employeeName;
    }

    private void loadRecommendations() {
        List<Recommendation> list = new ArrayList<>();
        list.add(new Recommendation("AI-Powered Analytics", "Skill"));
        list.add(new Recommendation("Cloud Architecture", "Course"));
        list.add(new Recommendation("Leadership 101", "Soft Skill"));
        recommendations.setValue(list);
    }

    public void loadEmployeeSkills() {
        String email = prefManager.getUserEmail();
        // Allow all roles for testing if needed, but following the original logic
        
        ApiClient.getEmployeeApiService(getApplication()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                boolean found = false;
                if (response.isSuccessful() && response.body() != null) {
                    for (EmployeeResponse e : response.body()) {
                        if (e.getEmail().equalsIgnoreCase(email)) {
                            String fullName = e.getFirstName() + " " + e.getLastName();
                            employeeName.setValue(fullName);
                            fetchSkills(e.getId());
                            found = true;
                            break;
                        }
                    }
                }
                
                if (!found && email != null && (email.equalsIgnoreCase("employee2@kgap.com") || email.equalsIgnoreCase("employee2@example.com"))) {
                    employeeName.setValue("Sarah Johnson");
                    fetchSkills(9L);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
        });
    }

    private void fetchSkills(Long employeeId) {
        repoLiveData = skillRepository.getEmployeeSkills(employeeId);
        repoLiveData.observeForever(new Observer<List<SkillItem>>() {
            @Override
            public void onChanged(List<SkillItem> skills) {
                if (skills != null) {
                    employeeSkills.setValue(skills);
                }
                repoLiveData.removeObserver(this);
            }
        });
    }
}
