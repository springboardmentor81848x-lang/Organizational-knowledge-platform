package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.models.AIRecommendationResponse;
import com.kgap.intel.repository.AIRecommendationRepository;
import com.kgap.intel.repository.GapRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
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
        String role = prefManager.getUserRole();
        String email = prefManager.getUserEmail();
        boolean isHR = "HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);

        isLoading.setValue(true);

        if (isHR) {
            loadStrategicOrgForecasts();
            return;
        }

        gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
            if (id != null) {
                repository.getRecommendations(id).observeForever(recs -> {
                    if (recs != null && !recs.isEmpty()) {
                        recommendations.setValue(recs);
                        isLoading.setValue(false);
                    } else {
                        generateRecommendationsForEmployee(id);
                    }
                });
            } else {
                loadStrategicOrgForecasts();
            }
        });
    }

    public void generateRecommendations() {
        String role = prefManager.getUserRole();
        String email = prefManager.getUserEmail();
        boolean isHR = "HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);

        isLoading.setValue(true);

        if (isHR) {
            loadStrategicOrgForecasts();
            return;
        }

        gapRepository.findEmployeeIdByEmail(email).observeForever(id -> {
            if (id != null) {
                generateRecommendationsForEmployee(id);
            } else {
                loadStrategicOrgForecasts();
            }
        });
    }

    private void generateRecommendationsForEmployee(Long employeeId) {
        repository.generateRecommendations(employeeId).observeForever(recs -> {
            if (recs != null && !recs.isEmpty()) {
                recommendations.setValue(recs);
            } else {
                loadStrategicOrgForecasts();
            }
            isLoading.setValue(false);
        });
    }

    private void loadStrategicOrgForecasts() {
        List<AIRecommendationResponse> orgForecasts = new ArrayList<>();

        AIRecommendationResponse f1 = new AIRecommendationResponse(
                "Generative AI & LLM Engineering",
                "INTERMEDIATE",
                "EXPERT",
                "HIGH",
                1,
                "Mandate organization-wide GenAI & LLM curriculum across Data Science and Backend Engineering teams.",
                "Projected +85% industry surge in Enterprise GenAI integration over the next 2 quarters."
        );
        orgForecasts.add(f1);

        AIRecommendationResponse f2 = new AIRecommendationResponse(
                "Cloud-Native Kubernetes & Microservices",
                "BEGINNER",
                "EXPERT",
                "HIGH",
                1,
                "Execute intensive DevSecOps & Container Orchestration bootcamps for DevOps and Core Backend staff.",
                "High workload migration to multi-cloud architectures; mitigates 65% organizational capability gap."
        );
        orgForecasts.add(f2);

        AIRecommendationResponse f3 = new AIRecommendationResponse(
                "Zero-Trust Architecture & Threat Modeling",
                "INTERMEDIATE",
                "EXPERT",
                "MEDIUM",
                2,
                "Coordinate with Cybersecurity Dept Head to implement continuous security compliance training.",
                "Upcoming regulatory data compliance standards require threat modeling proficiency across engineering."
        );
        orgForecasts.add(f3);

        AIRecommendationResponse f4 = new AIRecommendationResponse(
                "Advanced Reactive UI & Performance Optimization",
                "ADVANCED",
                "EXPERT",
                "MEDIUM",
                2,
                "Introduce modern component architecture workshops for Frontend Engineering teams.",
                "Increases mobile responsiveness and reduces client-side latency metrics."
        );
        orgForecasts.add(f4);

        recommendations.setValue(orgForecasts);
        isLoading.setValue(false);
    }
}
