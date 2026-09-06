package com.kgap.intel.api;

import com.kgap.intel.models.MentorshipSession;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface MentorshipSessionApiService {
    @POST("mentorship-sessions")
    Call<MentorshipSession> scheduleSession(@Body MentorshipSession session);

    @GET("mentorship-sessions/mentee/{menteeId}")
    Call<List<MentorshipSession>> getSessionsByMentee(@Path("menteeId") Long menteeId);

    @GET("mentorship-sessions/mentor/{mentorId}")
    Call<List<MentorshipSession>> getSessionsByMentor(@Path("mentorId") Long mentorId);

    @PUT("mentorship-sessions/{sessionId}/reschedule")
    Call<MentorshipSession> rescheduleSession(@Path("sessionId") Long sessionId, @Body Map<String, String> body);

    @PUT("mentorship-sessions/{sessionId}/cancel")
    Call<MentorshipSession> cancelSession(@Path("sessionId") Long sessionId);

    @PUT("mentorship-sessions/{sessionId}/complete")
    Call<MentorshipSession> completeSession(@Path("sessionId") Long sessionId);
}
