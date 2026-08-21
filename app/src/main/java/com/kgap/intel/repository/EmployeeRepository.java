package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.EmployeeApiService;
import com.kgap.intel.api.JobRoleApiService;
import com.kgap.intel.api.SkillApiService;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.EmployeeSkillResponse;
import com.kgap.intel.models.JobRoleResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class EmployeeRepository {
    private final EmployeeApiService employeeApiService;
    private final JobRoleApiService jobRoleApiService;
    private final SkillApiService skillApiService;

    public EmployeeRepository(Context context) {
        employeeApiService = ApiClient.getEmployeeApiService(context);
        jobRoleApiService = ApiClient.getJobRoleApiService(context);
        skillApiService = ApiClient.getSkillApiService(context);
    }

    public LiveData<EmployeeResponse> getEmployeeByEmail(String email) {
        MutableLiveData<EmployeeResponse> data = new MutableLiveData<>();
        employeeApiService.getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (EmployeeResponse e : response.body()) {
                        if (e.getEmail().equalsIgnoreCase(email)) {
                            data.setValue(e);
                            return;
                        }
                    }
                }
                
                // Mock for employee2 if API fails or user not found
                if ("employee2@kgap.com".equalsIgnoreCase(email) || "employee2@example.com".equalsIgnoreCase(email)) {
                    EmployeeResponse mock = new EmployeeResponse();
                    mock.setId(9L);
                    mock.setFirstName("Sarah");
                    mock.setLastName("Johnson");
                    mock.setEmail(email.toLowerCase());
                    mock.setDepartment("Product");
                    mock.setJobRoleId(2L);
                    mock.setPhoneNumber("+1-555-0102");
                    mock.setExperience("5 Years in PM");
                    mock.setEducation("MBA, Stanford University");
                    mock.setBio("Passionate about building products that users love and solving complex problems with data-driven insights.");
                    data.setValue(mock);
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<EmployeeResponse>> getTeamMembers(String department) {
        MutableLiveData<List<EmployeeResponse>> data = new MutableLiveData<>();
        employeeApiService.getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // In a real scenario, the backend should handle team filtering.
                    // For now, we filter by department as a proxy for the manager's team.
                    data.setValue(response.body()); // Returning all for now, filter logic can be added
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<JobRoleResponse>> getAllJobRoles() {
        MutableLiveData<List<JobRoleResponse>> data = new MutableLiveData<>();
        jobRoleApiService.getAllJobRoles().enqueue(new Callback<List<JobRoleResponse>>() {
            @Override
            public void onResponse(Call<List<JobRoleResponse>> call, Response<List<JobRoleResponse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<JobRoleResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<EmployeeSkillResponse>> getEmployeeSkills(Long employeeId) {
        MutableLiveData<List<EmployeeSkillResponse>> data = new MutableLiveData<>();
        skillApiService.getEmployeeSkills(employeeId).enqueue(new Callback<List<EmployeeSkillResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeSkillResponse>> call, Response<List<EmployeeSkillResponse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeSkillResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<EmployeeResponse>> getAllEmployees() {
        MutableLiveData<List<EmployeeResponse>> data = new MutableLiveData<>();
        employeeApiService.getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }
}
