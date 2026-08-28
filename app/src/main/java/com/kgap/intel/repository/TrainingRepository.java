package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.TrainingApiService;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.TrainingEnrollment;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TrainingRepository {
    private final TrainingApiService apiService;

    public static class EnrollmentResult {
        private final boolean success;
        private final TrainingEnrollment enrollment;
        private final String errorMessage;

        public EnrollmentResult(TrainingEnrollment enrollment) {
            this.success = true;
            this.enrollment = enrollment;
            this.errorMessage = null;
        }

        public EnrollmentResult(String errorMessage) {
            this.success = false;
            this.enrollment = null;
            this.errorMessage = errorMessage;
        }

        public boolean isSuccess() {
            return success;
        }

        public TrainingEnrollment getEnrollment() {
            return enrollment;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }

    public TrainingRepository(Context context) {
        this.apiService = ApiClient.getTrainingApiService(context);
    }

    public LiveData<List<ExternalCourse>> getCourses() {
        MutableLiveData<List<ExternalCourse>> data = new MutableLiveData<>();
        apiService.getAllCourses().enqueue(new Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(Call<List<ExternalCourse>> call, Response<List<ExternalCourse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<ExternalCourse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<ExternalCourse>> getCoursesBySkill(String skillName) {
        MutableLiveData<List<ExternalCourse>> data = new MutableLiveData<>();
        apiService.getCoursesBySkill(skillName).enqueue(new Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(Call<List<ExternalCourse>> call, Response<List<ExternalCourse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<ExternalCourse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<ExternalCourse>> getCoursesByLevel(String level) {
        MutableLiveData<List<ExternalCourse>> data = new MutableLiveData<>();
        apiService.getCoursesByLevel(level).enqueue(new Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(Call<List<ExternalCourse>> call, Response<List<ExternalCourse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<ExternalCourse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<List<ExternalCourse>> getCoursesByProvider(String provider) {
        MutableLiveData<List<ExternalCourse>> data = new MutableLiveData<>();
        apiService.getCoursesByProvider(provider).enqueue(new Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(Call<List<ExternalCourse>> call, Response<List<ExternalCourse>> response) {
                if (response.isSuccessful()) {
                    data.setValue(response.body());
                } else {
                    data.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<ExternalCourse>> call, Throwable t) {
                data.setValue(null);
            }
        });
        return data;
    }

    public LiveData<EnrollmentResult> enrollInTraining(Long trainingId, Long employeeId) {
        MutableLiveData<EnrollmentResult> liveData = new MutableLiveData<>();
        TrainingEnrollment req = new TrainingEnrollment(trainingId, employeeId);
        apiService.enrollInTraining(req).enqueue(new Callback<TrainingEnrollment>() {
            @Override
            public void onResponse(Call<TrainingEnrollment> call, Response<TrainingEnrollment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    liveData.setValue(new EnrollmentResult(response.body()));
                } else {
                    String error = "Enrollment failed";
                    try {
                        if (response.errorBody() != null) {
                            String errBody = response.errorBody().string();
                            if (errBody != null && !errBody.trim().isEmpty()) {
                                error = errBody;
                            }
                        }
                    } catch (Exception ignored) {
                    }
                    liveData.setValue(new EnrollmentResult(error));
                }
            }

            @Override
            public void onFailure(Call<TrainingEnrollment> call, Throwable t) {
                liveData.setValue(new EnrollmentResult("Network error: " + (t.getMessage() != null ? t.getMessage() : "Unknown error")));
            }
        });
        return liveData;
    }

    public LiveData<List<TrainingEnrollment>> getEmployeeEnrollments(Long employeeId) {
        MutableLiveData<List<TrainingEnrollment>> liveData = new MutableLiveData<>();
        apiService.getEmployeeEnrollments(employeeId).enqueue(new Callback<List<TrainingEnrollment>>() {
            @Override
            public void onResponse(Call<List<TrainingEnrollment>> call, Response<List<TrainingEnrollment>> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<List<TrainingEnrollment>> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }

    public LiveData<TrainingEnrollment> updateProgress(Long enrollmentId, int progressPercentage) {
        MutableLiveData<TrainingEnrollment> liveData = new MutableLiveData<>();
        java.util.Map<String, Integer> body = new java.util.HashMap<>();
        body.put("progressPercentage", progressPercentage);
        apiService.updateProgress(enrollmentId, body).enqueue(new Callback<TrainingEnrollment>() {
            @Override
            public void onResponse(Call<TrainingEnrollment> call, Response<TrainingEnrollment> response) {
                if (response.isSuccessful()) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<TrainingEnrollment> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }

    public LiveData<TrainingEnrollment> markComplete(Long enrollmentId) {
        MutableLiveData<TrainingEnrollment> liveData = new MutableLiveData<>();
        apiService.markComplete(enrollmentId).enqueue(new Callback<TrainingEnrollment>() {
            @Override
            public void onResponse(Call<TrainingEnrollment> call, Response<TrainingEnrollment> response) {
                if (response.isSuccessful() && response.body() != null) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<TrainingEnrollment> call, Throwable t) {
                liveData.setValue(null);
            }
        });
        return liveData;
    }
}
