package com.kgap.intel.viewmodel;

import android.app.Application;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.models.MentorshipSession;
import com.kgap.intel.repository.MentorshipSessionRepository;
import java.util.List;

public class MentorshipSessionViewModel extends AndroidViewModel {
    private final MentorshipSessionRepository repository;
    private final MutableLiveData<List<MentorshipSession>> sessions = new MutableLiveData<>();
    private final MutableLiveData<Boolean> isLoading = new MutableLiveData<>(false);
    private final MutableLiveData<String> errorMessage = new MutableLiveData<>();
    private final MutableLiveData<MentorshipSession> scheduleResult = new MutableLiveData<>();
    private final MutableLiveData<MentorshipSession> cancelResult = new MutableLiveData<>();
    private final MutableLiveData<MentorshipSession> rescheduleResult = new MutableLiveData<>();
    private final MutableLiveData<MentorshipSession> completeResult = new MutableLiveData<>();

    public MentorshipSessionViewModel(@NonNull Application application) {
        super(application);
        repository = new MentorshipSessionRepository(application);
    }

    public LiveData<List<MentorshipSession>> getSessions() {
        return sessions;
    }

    public LiveData<Boolean> getIsLoading() {
        return isLoading;
    }

    public LiveData<String> getErrorMessage() {
        return errorMessage;
    }

    public LiveData<MentorshipSession> getScheduleResult() {
        return scheduleResult;
    }

    public LiveData<MentorshipSession> getCancelResult() {
        return cancelResult;
    }

    public LiveData<MentorshipSession> getRescheduleResult() {
        return rescheduleResult;
    }

    public LiveData<MentorshipSession> getCompleteResult() {
        return completeResult;
    }

    public void loadSessions(Long userId, String role) {
        isLoading.setValue(true);
        errorMessage.setValue(null);

        LiveData<List<MentorshipSession>> liveData;
        if ("MENTOR".equalsIgnoreCase(role)) {
            liveData = repository.getSessionsByMentor(userId);
        } else {
            liveData = repository.getSessionsByMentee(userId);
        }

        liveData.observeForever(list -> {
            isLoading.setValue(false);
            if (list != null) {
                sessions.setValue(list);
            } else {
                errorMessage.setValue("Failed to load mentorship sessions from backend.");
            }
        });
    }

    public void scheduleSession(MentorshipSession session) {
        isLoading.setValue(true);
        errorMessage.setValue(null);
        scheduleResult.setValue(null);

        repository.scheduleSession(session).observeForever(result -> {
            isLoading.setValue(false);
            if (result != null) {
                scheduleResult.setValue(result);
            } else {
                errorMessage.setValue("Failed to schedule session on backend.");
            }
        });
    }

    public void rescheduleSession(Long sessionId, String newDateTime) {
        isLoading.setValue(true);
        errorMessage.setValue(null);
        rescheduleResult.setValue(null);

        repository.rescheduleSession(sessionId, newDateTime).observeForever(result -> {
            isLoading.setValue(false);
            if (result != null) {
                rescheduleResult.setValue(result);
            } else {
                errorMessage.setValue("Failed to reschedule session on backend.");
            }
        });
    }

    public void cancelSession(Long sessionId) {
        isLoading.setValue(true);
        errorMessage.setValue(null);
        cancelResult.setValue(null);

        repository.cancelSession(sessionId).observeForever(result -> {
            isLoading.setValue(false);
            if (result != null) {
                cancelResult.setValue(result);
            } else {
                errorMessage.setValue("Failed to cancel session on backend.");
            }
        });
    }

    public void completeSession(Long sessionId) {
        isLoading.setValue(true);
        errorMessage.setValue(null);
        completeResult.setValue(null);

        repository.completeSession(sessionId).observeForever(result -> {
            isLoading.setValue(false);
            if (result != null) {
                completeResult.setValue(result);
            } else {
                errorMessage.setValue("Failed to complete session on backend.");
            }
        });
    }
}
