package com.kgap.intel.api;

import com.kgap.intel.models.MentorshipRequest;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface MentorshipRequestApiService {
    @GET("mentorship-requests/mentor/{mentorId}")
    Call<List<MentorshipRequest>> getRequestsForMentor(@Path("mentorId") Long mentorId);

    @GET("mentorship-requests/mentee/{menteeId}")
    Call<List<MentorshipRequest>> getRequestsForMentee(@Path("menteeId") Long menteeId);

    @PUT("mentorship-requests/{requestId}/accept")
    Call<MentorshipRequest> acceptRequest(@Path("requestId") Long requestId);

    @PUT("mentorship-requests/{requestId}/reject")
    Call<MentorshipRequest> rejectRequest(@Path("requestId") Long requestId);

    @PUT("mentorship-requests/{requestId}/cancel")
    Call<MentorshipRequest> cancelRequest(@Path("requestId") Long requestId);

    @POST("mentorship-requests")
    Call<MentorshipRequest> sendRequest(@Body MentorshipRequest request);
}
