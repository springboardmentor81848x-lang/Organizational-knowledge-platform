package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.repository.LearningPathRepository;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.TrainingEnrollment;
import com.kgap.intel.api.ApiClient;
import java.util.List;

public class LearningViewModel extends AndroidViewModel {
    private final LearningPathRepository repository;
    private final GapRepository gapRepository;
    private final MutableLiveData<List<LearningPathResponse>> learningPaths = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>(null);
    private final MutableLiveData<Integer> totalHours = new MutableLiveData<>(0);
    private final SharedPrefManager prefManager;

    public LearningViewModel(@NonNull Application application) {
        super(application);
        repository = new LearningPathRepository(application);
        gapRepository = new GapRepository(application);
        prefManager = SharedPrefManager.getInstance(application);
    }

    public LiveData<List<LearningPathResponse>> getLearningPaths() {
        return learningPaths;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<Integer> getTotalHours() {
        return totalHours;
    }

    public void loadLearningPaths() {
        String email = prefManager.getUserEmail();
        isLoading.setValue(true);
        errorMessage.setValue(null);

        gapRepository.findEmployeeIdByEmail(email).observeForever(employeeId -> {
            if (employeeId != null) {
                repository.getLearningPaths(employeeId).observeForever(paths -> {
                    if (paths != null) {
                        setPathsData(paths);
                    } else {
                        isLoading.setValue(false);
                        errorMessage.setValue("Failed to load learning paths from server.");
                    }
                });
            } else {
                isLoading.setValue(false);
                errorMessage.setValue("Employee details not found for logged in user.");
            }
        });
    }

    public void generateLearningPaths() {
        String email = prefManager.getUserEmail();
        isLoading.setValue(true);
        errorMessage.setValue(null);

        gapRepository.findEmployeeIdByEmail(email).observeForever(employeeId -> {
            if (employeeId != null) {
                generateLearningPathsForEmployee(employeeId);
            } else {
                isLoading.setValue(false);
                errorMessage.setValue("Employee details not found.");
            }
        });
    }

    private void generateLearningPathsForEmployee(Long employeeId) {
        repository.generateLearningPaths(employeeId).observeForever(paths -> {
            isLoading.setValue(false);
            if (paths != null) {
                setPathsData(paths);
            } else {
                errorMessage.setValue("Unable to generate learning path. Please try again.");
            }
        });
    }

    private void setPathsData(List<LearningPathResponse> paths) {
        learningPaths.setValue(paths);
        isLoading.setValue(false);
        int sumHours = 0;
        if (paths != null) {
            for (LearningPathResponse path : paths) {
                if (path.getEstimatedHours() != null) {
                    sumHours += path.getEstimatedHours();
                }
            }
        }
        totalHours.setValue(sumHours);
    }

    public void updateCourseProgress(Long pathId, String status, int newPercentage) {
        isLoading.setValue(true);
        errorMessage.setValue(null);
        repository.updateProgress(pathId, status, newPercentage).observeForever(updatedItem -> {
            isLoading.setValue(false);
            if (updatedItem != null) {
                List<LearningPathResponse> currentList = learningPaths.getValue();
                if (currentList != null) {
                    for (int i = 0; i < currentList.size(); i++) {
                        if (currentList.get(i).getId() != null && currentList.get(i).getId().equals(updatedItem.getId())) {
                            currentList.set(i, updatedItem);
                            break;
                        }
                    }
                    setPathsData(currentList);
                } else {
                    loadLearningPaths();
                }
            } else {
                errorMessage.setValue("Failed to update learning progress on server.");
            }
        });
    }
    // ----- External Courses & Enrollments -----
    private final MutableLiveData<List<ExternalCourse>> externalCourses = new MutableLiveData<>();
    private final MutableLiveData<List<TrainingEnrollment>> employeeEnrollments = new MutableLiveData<>();
    private final MutableLiveData<String> enrollmentError = new MutableLiveData<>();

    public LiveData<List<ExternalCourse>> getExternalCourses() { return externalCourses; }
    public LiveData<List<TrainingEnrollment>> getEmployeeEnrollments() { return employeeEnrollments; }
    public LiveData<String> getEnrollmentError() { return enrollmentError; }

    public void loadExternalCourses() {
        isLoading.setValue(true);
        errorMessage.setValue(null);
        ApiClient.getTrainingApiService(getApplication()).getAllCourses().enqueue(new retrofit2.Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(retrofit2.Call<List<ExternalCourse>> call, retrofit2.Response<List<ExternalCourse>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    externalCourses.setValue(response.body());
                } else {
                    errorMessage.setValue("Failed to load courses: " + response.code());
                }
            }
            @Override
            public void onFailure(retrofit2.Call<List<ExternalCourse>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Error loading courses: " + t.getMessage());
            }
        });
    }

    public void loadEmployeeEnrollments() {
        Long employeeId = SharedPrefManager.getInstance(getApplication()).getUserId();
        if (employeeId == null) {
            errorMessage.setValue("Unable to determine employee ID for enrollments.");
            return;
        }
        isLoading.setValue(true);
        ApiClient.getTrainingApiService(getApplication()).getEmployeeEnrollments(employeeId).enqueue(new retrofit2.Callback<List<TrainingEnrollment>>() {
            @Override
            public void onResponse(retrofit2.Call<List<TrainingEnrollment>> call, retrofit2.Response<List<TrainingEnrollment>> response) {
                isLoading.setValue(false);
                if (response.isSuccessful() && response.body() != null) {
                    employeeEnrollments.setValue(response.body());
                } else {
                    errorMessage.setValue("Failed to load enrollments: " + response.code());
                }
            }
            @Override
            public void onFailure(retrofit2.Call<List<TrainingEnrollment>> call, Throwable t) {
                isLoading.setValue(false);
                errorMessage.setValue("Error loading enrollments: " + t.getMessage());
            }
        });
    }

    public void enrollInCourse(Long trainingId) {
        Long employeeId = SharedPrefManager.getInstance(getApplication()).getUserId();
        if (employeeId == null) {
            enrollmentError.setValue("User not logged in.");
            return;
        }
        TrainingEnrollment request = new TrainingEnrollment(trainingId, employeeId);
        ApiClient.getTrainingApiService(getApplication()).enrollInTraining(request).enqueue(new retrofit2.Callback<TrainingEnrollment>() {
            @Override
            public void onResponse(retrofit2.Call<TrainingEnrollment> call, retrofit2.Response<TrainingEnrollment> response) {
                if (response.isSuccessful()) {
                    // Refresh enrollments to update UI state
                    loadEmployeeEnrollments();
                } else if (response.code() == 409) {
                    enrollmentError.setValue("You are already enrolled in this training.");
                } else {
                    enrollmentError.setValue("Enrollment failed: " + response.code());
                }
            }
            @Override
            public void onFailure(retrofit2.Call<TrainingEnrollment> call, Throwable t) {
                enrollmentError.setValue("Enrollment error: " + t.getMessage());
            }
        });
    }
}
