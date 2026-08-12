package com.kgap.intel.api;

import com.kgap.intel.models.EmployeeResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;

public interface EmployeeApiService {
    @GET("employees")
    Call<List<EmployeeResponse>> getAllEmployees();
}
