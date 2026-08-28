package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.MutableLiveData;

import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.AssessmentApiService;
import com.kgap.intel.models.AssessmentComparisonResponse;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AssessmentComparisonViewModel extends AndroidViewModel {
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<AssessmentComparisonResponse> comparison = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();

    public AssessmentComparisonViewModel(@NonNull Application application) {
        super(application);
    }

    public MutableLiveData<Boolean> getIsLoading() { return isLoading; }
    public MutableLiveData<AssessmentComparisonResponse> getComparison() { return comparison; }
    public MutableLiveData<String> getErrorMessage() { return errorMessage; }

    public void loadComparison(Long employeeId, Long skillId) {
        if (employeeId == null || employeeId <= 0) {
            employeeId = 1L; // Fallback to primary employee ID if invalid/unset
        }
        isLoading.setValue(true);
        AssessmentApiService api = ApiClient.getAssessmentApiService(getApplication());
        api.getComparison(employeeId, skillId).enqueue(new Callback<AssessmentComparisonResponse>() {
            @Override
            public void onResponse(Call<AssessmentComparisonResponse> call, Response<AssessmentComparisonResponse> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    comparison.setValue(response.body());
                } else {
                    errorMessage.setValue("Failed to load comparison data (HTTP " + response.code() + ")");
                }
            }

            @Override
            public void onFailure(Call<AssessmentComparisonResponse> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue(t.getMessage());
            }
        });
    }
}
