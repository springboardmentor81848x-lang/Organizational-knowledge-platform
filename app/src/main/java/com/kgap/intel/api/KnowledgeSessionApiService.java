package com.kgap.intel.api;

import com.kgap.intel.models.KnowledgeSession;
import com.kgap.intel.models.KnowledgeSessionRegistration;
import com.kgap.intel.models.KnowledgeSessionFeedback;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.*;

public interface KnowledgeSessionApiService {
    @POST("knowledge-sessions")
    Call<KnowledgeSession> createSession(@Body KnowledgeSession session);

    @GET("knowledge-sessions")
    Call<List<KnowledgeSession>> getAllSessions();

    @POST("knowledge-session-registrations")
    Call<KnowledgeSessionRegistration> registerForSession(@Body KnowledgeSessionRegistration registration);

    @GET("knowledge-session-registrations/employee/{employeeId}")
    Call<List<KnowledgeSessionRegistration>> getUserRegistrations(@Path("employeeId") Long employeeId);

    @PUT("knowledge-session-registrations/{id}/cancel")
    Call<KnowledgeSessionRegistration> cancelRegistration(@Path("id") Long id);

    @PUT("knowledge-session-registrations/{id}/attendance")
    Call<KnowledgeSessionRegistration> markAttendance(@Path("id") Long id);

    @POST("knowledge-session-feedback")
    Call<KnowledgeSessionFeedback> submitFeedback(@Body KnowledgeSessionFeedback feedback);
}
