package com.kgap.intel.api;

import com.kgap.intel.models.SkillItem;
import com.kgap.intel.models.EmployeeSkillResponse;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface SkillApiService {
    @GET("skills")
    Call<List<SkillItem>> getAllSkills();

    @POST("skills")
    Call<SkillItem> addSkill(@Body SkillItem skill);

    @PUT("skills/{id}")
    Call<SkillItem> updateSkill(@Path("id") String id, @Body SkillItem skill);

    @DELETE("skills/{id}")
    Call<Void> deleteSkill(@Path("id") String id);

    @GET("employee-skills/employee/{employeeId}")
    Call<List<EmployeeSkillResponse>> getEmployeeSkills(@Path("employeeId") Long employeeId);
}
