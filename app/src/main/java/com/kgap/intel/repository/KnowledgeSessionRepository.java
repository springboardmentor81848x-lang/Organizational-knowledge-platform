package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.KnowledgeSessionApiService;
import com.kgap.intel.models.KnowledgeSession;
import com.kgap.intel.models.KnowledgeSessionFeedback;
import com.kgap.intel.models.KnowledgeSessionRegistration;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class KnowledgeSessionRepository {
    private final KnowledgeSessionApiService apiService;

    public KnowledgeSessionRepository(Context context) {
        apiService = ApiClient.getKnowledgeSessionApiService(context);
    }

    public LiveData<KnowledgeSession> createSession(KnowledgeSession session) {
        MutableLiveData<KnowledgeSession> sessionData = new MutableLiveData<>();
        apiService.createSession(session).enqueue(new Callback<KnowledgeSession>() {
            @Override
            public void onResponse(Call<KnowledgeSession> call, Response<KnowledgeSession> response) {
                if (response.isSuccessful()) {
                    sessionData.setValue(response.body());
                } else {
                    sessionData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<KnowledgeSession> call, Throwable t) {
                sessionData.setValue(null);
            }
        });
        return sessionData;
    }

    public LiveData<KnowledgeSessionRegistration> registerForSession(Long sessionId, Long employeeId) {
        MutableLiveData<KnowledgeSessionRegistration> liveData = new MutableLiveData<>();
        KnowledgeSessionRegistration req = new KnowledgeSessionRegistration(sessionId, employeeId);
        apiService.registerForSession(req).enqueue(new Callback<KnowledgeSessionRegistration>() {
            @Override
            public void onResponse(Call<KnowledgeSessionRegistration> call, Response<KnowledgeSessionRegistration> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<KnowledgeSessionRegistration> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }

    public LiveData<List<KnowledgeSessionRegistration>> getUserRegistrations(Long employeeId) {
        MutableLiveData<List<KnowledgeSessionRegistration>> liveData = new MutableLiveData<>();
        apiService.getUserRegistrations(employeeId).enqueue(new Callback<List<KnowledgeSessionRegistration>>() {
            @Override
            public void onResponse(Call<List<KnowledgeSessionRegistration>> call, Response<List<KnowledgeSessionRegistration>> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<KnowledgeSessionRegistration>> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }

    public LiveData<KnowledgeSessionRegistration> cancelRegistration(Long registrationId) {
        MutableLiveData<KnowledgeSessionRegistration> liveData = new MutableLiveData<>();
        apiService.cancelRegistration(registrationId).enqueue(new Callback<KnowledgeSessionRegistration>() {
            @Override
            public void onResponse(Call<KnowledgeSessionRegistration> call, Response<KnowledgeSessionRegistration> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<KnowledgeSessionRegistration> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }

    public LiveData<KnowledgeSessionRegistration> markAttendance(Long registrationId) {
        MutableLiveData<KnowledgeSessionRegistration> liveData = new MutableLiveData<>();
        apiService.markAttendance(registrationId).enqueue(new Callback<KnowledgeSessionRegistration>() {
            @Override
            public void onResponse(Call<KnowledgeSessionRegistration> call, Response<KnowledgeSessionRegistration> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<KnowledgeSessionRegistration> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }

    public LiveData<KnowledgeSessionFeedback> submitFeedback(Long sessionId, Long employeeId, Integer rating, String comments) {
        MutableLiveData<KnowledgeSessionFeedback> liveData = new MutableLiveData<>();
        KnowledgeSessionFeedback req = new KnowledgeSessionFeedback(sessionId, employeeId, rating, comments);
        apiService.submitFeedback(req).enqueue(new Callback<KnowledgeSessionFeedback>() {
            @Override
            public void onResponse(Call<KnowledgeSessionFeedback> call, Response<KnowledgeSessionFeedback> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<KnowledgeSessionFeedback> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }
}
