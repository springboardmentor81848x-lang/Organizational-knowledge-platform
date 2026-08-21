package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.MentorshipRequestApiService;
import com.kgap.intel.models.MentorshipRequest;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorshipRequestRepository {
    private final MentorshipRequestApiService apiService;

    public MentorshipRequestRepository(Context context) {
        apiService = ApiClient.getMentorshipRequestApiService(context);
    }

    public LiveData<List<MentorshipRequest>> getRequestsForMentor(Long mentorId) {
        MutableLiveData<List<MentorshipRequest>> data = new MutableLiveData<>();
        apiService.getRequestsForMentor(mentorId).enqueue(new Callback<List<MentorshipRequest>>() {
            @Override
            public void onResponse(Call<List<MentorshipRequest>> call, Response<List<MentorshipRequest>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }
            @Override
            public void onFailure(Call<List<MentorshipRequest>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<MentorshipRequest>> getRequestsForMentee(Long menteeId) {
        MutableLiveData<List<MentorshipRequest>> data = new MutableLiveData<>();
        apiService.getRequestsForMentee(menteeId).enqueue(new Callback<List<MentorshipRequest>>() {
            @Override
            public void onResponse(Call<List<MentorshipRequest>> call, Response<List<MentorshipRequest>> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<List<MentorshipRequest>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipRequest> acceptRequest(Long requestId) {
        MutableLiveData<MentorshipRequest> data = new MutableLiveData<>();
        apiService.acceptRequest(requestId).enqueue(new Callback<MentorshipRequest>() {
            @Override
            public void onResponse(Call<MentorshipRequest> call, Response<MentorshipRequest> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorshipRequest> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipRequest> rejectRequest(Long requestId) {
        MutableLiveData<MentorshipRequest> data = new MutableLiveData<>();
        apiService.rejectRequest(requestId).enqueue(new Callback<MentorshipRequest>() {
            @Override
            public void onResponse(Call<MentorshipRequest> call, Response<MentorshipRequest> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorshipRequest> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipRequest> cancelRequest(Long requestId) {
        MutableLiveData<MentorshipRequest> data = new MutableLiveData<>();
        apiService.cancelRequest(requestId).enqueue(new Callback<MentorshipRequest>() {
            @Override
            public void onResponse(Call<MentorshipRequest> call, Response<MentorshipRequest> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorshipRequest> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorshipRequest> sendRequest(MentorshipRequest request) {
        MutableLiveData<MentorshipRequest> data = new MutableLiveData<>();
        apiService.sendRequest(request).enqueue(new Callback<MentorshipRequest>() {
            @Override
            public void onResponse(Call<MentorshipRequest> call, Response<MentorshipRequest> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorshipRequest> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }
}
