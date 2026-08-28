package com.kgap.intel.api;

import com.kgap.intel.models.EmployeeResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;

public interface EmployeeApiService {
    @GET("employees")
    Call<List<EmployeeResponse>> getAllEmployees();

    @GET("employees/{id}")
    Call<EmployeeResponse> getEmployeeById(@retrofit2.http.Path("id") Long id);

    @retrofit2.http.PUT("employees/{id}/role/{newRole}")
    Call<EmployeeResponse> updateEmployeeRole(
        @retrofit2.http.Path("id") Long id,
        @retrofit2.http.Path("newRole") String newRole
    );
}
