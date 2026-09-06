package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.MentorAssignmentApiService;
import com.kgap.intel.models.MentorAssignment;
import com.kgap.intel.models.MentorAssignmentRequest;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorAssignmentRepository {
    private final MentorAssignmentApiService apiService;

    public MentorAssignmentRepository(Context context) {
        apiService = ApiClient.getMentorAssignmentApiService(context);
    }

    public LiveData<MentorAssignment> createAssignment(MentorAssignmentRequest request) {
        MutableLiveData<MentorAssignment> data = new MutableLiveData<>();
        apiService.createAssignment(request).enqueue(new Callback<MentorAssignment>() {
            @Override
            public void onResponse(Call<MentorAssignment> call, Response<MentorAssignment> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorAssignment> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorAssignment> getCurrentAssignmentForEmployee(Long employeeId) {
        MutableLiveData<MentorAssignment> data = new MutableLiveData<>();
        apiService.getCurrentAssignmentForEmployee(employeeId).enqueue(new Callback<MentorAssignment>() {
            @Override
            public void onResponse(Call<MentorAssignment> call, Response<MentorAssignment> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorAssignment> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<MentorAssignment>> getAssignmentsForMentor(Long mentorId) {
        MutableLiveData<List<MentorAssignment>> data = new MutableLiveData<>();
        apiService.getAssignmentsForMentor(mentorId).enqueue(new Callback<List<MentorAssignment>>() {
            @Override
            public void onResponse(Call<List<MentorAssignment>> call, Response<List<MentorAssignment>> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<List<MentorAssignment>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorAssignment> updateAssignment(Long assignmentId, MentorAssignmentRequest request) {
        MutableLiveData<MentorAssignment> data = new MutableLiveData<>();
        apiService.updateAssignment(assignmentId, request).enqueue(new Callback<MentorAssignment>() {
            @Override
            public void onResponse(Call<MentorAssignment> call, Response<MentorAssignment> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorAssignment> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<MentorAssignment> cancelAssignment(Long assignmentId) {
        MutableLiveData<MentorAssignment> data = new MutableLiveData<>();
        apiService.cancelAssignment(assignmentId).enqueue(new Callback<MentorAssignment>() {
            @Override
            public void onResponse(Call<MentorAssignment> call, Response<MentorAssignment> response) {
                if (response.isSuccessful()) data.setValue(response.body());
                else data.setValue(null);
            }
            @Override
            public void onFailure(Call<MentorAssignment> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }
}
