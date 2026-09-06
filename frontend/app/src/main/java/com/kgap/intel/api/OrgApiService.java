package com.kgap.intel.api;

import com.kgap.intel.models.DepartmentSkill;
import com.kgap.intel.models.HighRiskGap;
import com.kgap.intel.models.TrainingAdoption;
import com.kgap.intel.models.EmployeeProgress;
import com.kgap.intel.models.DepartmentResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;

public interface OrgApiService {
    @GET("departments/{id}/skill-coverage")
    Call<List<DepartmentSkill>> getDepartmentSkillCoverage(@Path("id") Long deptId);

    @GET("departments/{id}/training-adoption")
    Call<TrainingAdoption> getTrainingAdoption(@Path("id") Long deptId);

    @GET("departments/{id}/high-risk-gaps")
    Call<List<HighRiskGap>> getHighRiskGaps(@Path("id") Long deptId);

    @GET("departments/{id}/employee-progress")
    Call<List<EmployeeProgress>> getEmployeeProgress(@Path("id") Long deptId);

    @GET("departments")
    Call<List<DepartmentResponse>> getAllDepartments();
}
