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
                    if (paths != null && !paths.isEmpty()) {
                        setPathsData(paths);
                    } else if (paths != null && paths.isEmpty()) {
                        // Attempt generating paths if none exist
                        generateLearningPathsForEmployee(employeeId);
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
}
