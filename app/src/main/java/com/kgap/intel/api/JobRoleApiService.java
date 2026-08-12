package com.kgap.intel.api;

import com.kgap.intel.models.JobRoleResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;

public interface JobRoleApiService {
    @GET("job-roles")
    Call<List<JobRoleResponse>> getAllJobRoles();
}
