package com.kgap.intel.api;

import java.util.Map;
import okhttp3.ResponseBody;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.Path;
import retrofit2.http.Streaming;

public interface ReportApiService {

    @GET("reports/employee/{employeeId}")
    Call<Map<String, Object>> getEmployeeReport(@Path("employeeId") Long employeeId);

    @GET("reports/department/{departmentName}")
    Call<Map<String, Object>> getDepartmentReport(@Path("departmentName") String departmentName);

    @GET("reports/organization")
    Call<Map<String, Object>> getOrganizationReport();

    @GET("reports/employee/{employeeId}/pdf")
    @Streaming
    Call<ResponseBody> downloadEmployeePdf(@Path("employeeId") Long employeeId);

    @GET("reports/employee/{employeeId}/excel")
    @Streaming
    Call<ResponseBody> downloadEmployeeExcel(@Path("employeeId") Long employeeId);
}
