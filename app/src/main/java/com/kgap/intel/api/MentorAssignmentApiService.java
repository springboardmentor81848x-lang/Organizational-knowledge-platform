package com.kgap.intel.api;

import com.kgap.intel.models.MentorAssignment;
import com.kgap.intel.models.MentorAssignmentRequest;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface MentorAssignmentApiService {
    @POST("mentor-assignments")
    Call<MentorAssignment> createAssignment(@Body MentorAssignmentRequest request);

    @GET("mentor-assignments/employee/{employeeId}")
    Call<MentorAssignment> getCurrentAssignmentForEmployee(@Path("employeeId") Long employeeId);

    @GET("mentor-assignments/mentor/{mentorId}")
    Call<List<MentorAssignment>> getAssignmentsForMentor(@Path("mentorId") Long mentorId);

    @PUT("mentor-assignments/{assignmentId}")
    Call<MentorAssignment> updateAssignment(@Path("assignmentId") Long assignmentId, @Body MentorAssignmentRequest request);

    @DELETE("mentor-assignments/{assignmentId}")
    Call<MentorAssignment> cancelAssignment(@Path("assignmentId") Long assignmentId);
}
