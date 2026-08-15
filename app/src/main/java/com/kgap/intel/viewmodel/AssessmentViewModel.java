package com.kgap.intel.viewmodel;

import android.app.Application;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.AssessmentApiService;
import com.kgap.intel.models.AssessmentQuestion;
import com.kgap.intel.models.AssessmentSubmission;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AssessmentViewModel extends AndroidViewModel {
    private static final String TAG = "AssessmentViewModel";
    private final AssessmentApiService apiService;
    private final MutableLiveData<List<AssessmentQuestion>> questions = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<AssessmentApiService.AssessmentResult> assessmentResult = new MutableLiveData<>();
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();

    public AssessmentViewModel(@NonNull Application application) {
        super(application);
        apiService = ApiClient.getAssessmentApiService(application);
    }

    public LiveData<List<AssessmentQuestion>> getQuestions() { return questions; }
    public LiveData<Boolean> getIsLoading() { return isLoading; }
    public LiveData<AssessmentApiService.AssessmentResult> getAssessmentResult() { return assessmentResult; }
    public LiveData<String> getErrorMessage() { return errorMessage; }

    public void loadQuestions(String skillId) {
        isLoading.setValue(true);
        apiService.getQuestionsForSkill(skillId).enqueue(new Callback<List<AssessmentQuestion>>() {
            @Override
            public void onResponse(Call<List<AssessmentQuestion>> call, Response<List<AssessmentQuestion>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    questions.setValue(response.body());
                } else {
                    errorMessage.setValue("Failed to load questions: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<List<AssessmentQuestion>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Error: " + t.getMessage());
            }
        });
    }

    public void submitAssessment(Long assessmentId, AssessmentSubmission submission) {
        isLoading.setValue(true);
        apiService.submitAssessment(assessmentId, submission).enqueue(new Callback<AssessmentApiService.AssessmentResult>() {
            @Override
            public void onResponse(Call<AssessmentApiService.AssessmentResult> call, Response<AssessmentApiService.AssessmentResult> response) {
                isLoading.setValue(false);
                if (response.isSuccessful()) {
                    assessmentResult.setValue(response.body());
                } else {
                    errorMessage.setValue("Submission failed: " + response.code());
                }
            }

            @Override
            public void onFailure(Call<AssessmentApiService.AssessmentResult> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue(t.getMessage());
            }
        });
    }
}
