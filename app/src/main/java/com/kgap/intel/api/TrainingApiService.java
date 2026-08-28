package com.kgap.intel.api;

import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.TrainingEnrollment;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;
import java.util.Map;

public interface TrainingApiService {

    @GET("external-courses")
    Call<List<ExternalCourse>> getAllCourses();

    @GET("external-courses/skill/{skillName}")
    Call<List<ExternalCourse>> getCoursesBySkill(@Path("skillName") String skillName);

    @GET("external-courses/level/{level}")
    Call<List<ExternalCourse>> getCoursesByLevel(@Path("level") String level);

    @GET("external-courses/provider/{provider}")
    Call<List<ExternalCourse>> getCoursesByProvider(@Path("provider") String provider);

    @POST("training-enrollments")
    Call<TrainingEnrollment> enrollInTraining(@Body TrainingEnrollment request);

    @GET("training-enrollments/employee/{employeeId}")
    Call<List<TrainingEnrollment>> getEmployeeEnrollments(@Path("employeeId") Long employeeId);

    @PUT("training-enrollments/{id}/progress")
    Call<TrainingEnrollment> updateProgress(@Path("id") Long enrollmentId, @Body Map<String, Integer> body);

    @PUT("training-enrollments/{id}/complete")
    Call<TrainingEnrollment> markComplete(@Path("id") Long enrollmentId);
}
