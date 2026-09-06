package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.MentorshipSessionApiService;
import com.kgap.intel.models.MentorshipSession;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorshipSessionRepository {
    private final MentorshipSessionApiService apiService;

    public MentorshipSessionRepository(Context context) {
        apiService = ApiClient.getMentorshipSessionApiService(context);
    }

    public LiveData<List<MentorshipSession>> getSessionsByMentee(Long menteeId) {
        MutableLiveData<List<MentorshipSession>> data = new MutableLiveData<>();
        apiService.getSessionsByMentee(menteeId).enqueue(new Callback<List<MentorshipSession>>() {
            @Override
            public void onResponse(Call<List<MentorshipSession>> call, Response<List<MentorshipSession>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<MentorshipSession>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<MentorshipSession>> getSessionsByMentor(Long mentorId) {
        MutableLiveData<List<MentorshipSession>> data = new MutableLiveData<>();
        apiService.getSessionsByMentor(mentorId).enqueue(new Callback<List<MentorshipSession>>() {
            @Override
            public void onResponse(Call<List<MentorshipSession>> call, Response<List<MentorshipSession>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<MentorshipSession>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipSession> scheduleSession(MentorshipSession session) {
        MutableLiveData<MentorshipSession> data = new MutableLiveData<>();
        apiService.scheduleSession(session).enqueue(new Callback<MentorshipSession>() {
            @Override
            public void onResponse(Call<MentorshipSession> call, Response<MentorshipSession> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<MentorshipSession> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipSession> rescheduleSession(Long sessionId, String scheduledAt) {
        MutableLiveData<MentorshipSession> data = new MutableLiveData<>();
        Map<String, String> body = new HashMap<>();
        body.put("scheduledAt", scheduledAt);
        apiService.rescheduleSession(sessionId, body).enqueue(new Callback<MentorshipSession>() {
            @Override
            public void onResponse(Call<MentorshipSession> call, Response<MentorshipSession> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<MentorshipSession> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipSession> cancelSession(Long sessionId) {
        MutableLiveData<MentorshipSession> data = new MutableLiveData<>();
        apiService.cancelSession(sessionId).enqueue(new Callback<MentorshipSession>() {
            @Override
            public void onResponse(Call<MentorshipSession> call, Response<MentorshipSession> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<MentorshipSession> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipSession> completeSession(Long sessionId) {
        MutableLiveData<MentorshipSession> data = new MutableLiveData<>();
        apiService.completeSession(sessionId).enqueue(new Callback<MentorshipSession>() {
            @Override
            public void onResponse(Call<MentorshipSession> call, Response<MentorshipSession> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<MentorshipSession> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }
}
