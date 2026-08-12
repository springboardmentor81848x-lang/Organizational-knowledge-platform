package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.models.AIRecommendationResponse;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.repository.AIRecommendationRepository;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.List;

public class AIRecommendationViewModel extends AndroidViewModel {
    private final AIRecommendationRepository repository;
    private final GapRepository gapRepository;
    private final MutableLiveData<List<AIRecommendationResponse>> recommendations = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final SharedPrefManager prefManager;

    public AIRecommendationViewModel(@NonNull Application application) {
        super(application);
        repository = new AIRecommendationRepository(application);
        gapRepository = new GapRepository(application);
        prefManager = SharedPrefManager.getInstance(application);
    }

    public LiveData<List<AIRecommendationResponse>> getRecommendations() {
        return recommendations;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public void loadRecommendations() {
        String email = prefManager.getUserEmail();
        isLoading.setValue(true);
        gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
            if (id != null) {
                repository.getRecommendations(id).observeForever(recs -> {
                    if (recs != null && !recs.isEmpty()) {
                        recommendations.setValue(recs);
                        isLoading.setValue(false);
                    } else {
                        // Generate if none exist
                        generateRecommendationsForEmployee(id);
                    }
                });
            } else {
                isLoading.setValue(false);
            }
        });
    }

    public void generateRecommendations() {
        String email = prefManager.getUserEmail();
        isLoading.setValue(true);
        gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
            if (id != null) {
                generateRecommendationsForEmployee(id);
            } else {
                isLoading.setValue(false);
            }
        });
    }

    private void generateRecommendationsForEmployee(Long employeeId) {
        repository.generateRecommendations(employeeId).observeForever(recs -> {
            recommendations.setValue(recs);
            isLoading.setValue(false);
        });
    }
}
