package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.NotificationApiService;
import com.kgap.intel.models.NotificationItem;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NotificationRepository {

    private final NotificationApiService apiService;

    public NotificationRepository(Context context) {
        this.apiService = ApiClient.getNotificationApiService(context);
    }

    public LiveData<List<NotificationItem>> getNotifications(Long employeeId) {
        MutableLiveData<List<NotificationItem>> liveData = new MutableLiveData<>();
        if (employeeId == null) {
            liveData.setValue(new java.util.ArrayList<>());
            return liveData;
        }
        apiService.getNotifications(employeeId).enqueue(new Callback<List<NotificationItem>>() {
            @Override
            public void onResponse(Call<List<NotificationItem>> call, Response<List<NotificationItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(new java.util.ArrayList<>());
                }
            }

            @Override
            public void onFailure(Call<List<NotificationItem>> call, Throwable t) {
                liveData.setValue(new java.util.ArrayList<>());
            }
        });
        return liveData;
    }

    public LiveData<List<NotificationItem>> getUnreadNotifications(Long employeeId) {
        MutableLiveData<List<NotificationItem>> liveData = new MutableLiveData<>();
        if (employeeId == null) {
            liveData.setValue(new java.util.ArrayList<>());
            return liveData;
        }
        apiService.getUnreadNotifications(employeeId).enqueue(new Callback<List<NotificationItem>>() {
            @Override
            public void onResponse(Call<List<NotificationItem>> call, Response<List<NotificationItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    liveData.setValue(response.body());
                } else {
                    liveData.setValue(new java.util.ArrayList<>());
                }
            }

            @Override
            public void onFailure(Call<List<NotificationItem>> call, Throwable t) {
                liveData.setValue(new java.util.ArrayList<>());
            }
        });
        return liveData;
    }

    public LiveData<Boolean> markAsRead(Long notificationId) {
        MutableLiveData<Boolean> liveData = new MutableLiveData<>();
        if (notificationId == null) {
            liveData.setValue(false);
            return liveData;
        }
        apiService.markAsRead(notificationId).enqueue(new Callback<NotificationItem>() {
            @Override
            public void onResponse(Call<NotificationItem> call, Response<NotificationItem> response) {
                liveData.setValue(response.isSuccessful());
            }

            @Override
            public void onFailure(Call<NotificationItem> call, Throwable t) {
                liveData.setValue(false);
            }
        });
        return liveData;
    }

    public LiveData<Integer> getUnreadCount(Long employeeId) {
        MutableLiveData<Integer> liveData = new MutableLiveData<>();
        if (employeeId == null) {
            liveData.setValue(0);
            return liveData;
        }
        apiService.getUnreadNotifications(employeeId).enqueue(new Callback<List<NotificationItem>>() {
            @Override
            public void onResponse(Call<List<NotificationItem>> call, Response<List<NotificationItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    liveData.setValue(response.body().size());
                } else {
                    liveData.setValue(0);
                }
            }

            @Override
            public void onFailure(Call<List<NotificationItem>> call, Throwable t) {
                liveData.setValue(0);
            }
        });
        return liveData;
    }

    public LiveData<Boolean> markAllRead(Long employeeId) {
        MutableLiveData<Boolean> liveData = new MutableLiveData<>();
        if (employeeId == null) {
            liveData.setValue(true);
            return liveData;
        }
        apiService.getUnreadNotifications(employeeId).enqueue(new Callback<List<NotificationItem>>() {
            @Override
            public void onResponse(Call<List<NotificationItem>> call, Response<List<NotificationItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<NotificationItem> unread = response.body();
                    if (unread.isEmpty()) {
                        liveData.setValue(true);
                        return;
                    }
                    for (NotificationItem item : unread) {
                        if (item.getId() != null) {
                            markAsRead(item.getId());
                        }
                    }
                    liveData.setValue(true);
                } else {
                    liveData.setValue(false);
                }
            }

            @Override
            public void onFailure(Call<List<NotificationItem>> call, Throwable t) {
                liveData.setValue(false);
            }
        });
        return liveData;
    }

    public LiveData<Boolean> createNotification(Long recipientId, String type, String message) {
        String title = type != null ? type.replace("_", " ") : "Notification";
        return createNotification(recipientId, title, type, message);
    }

    public LiveData<Boolean> createNotification(Long recipientId, String title, String type, String message) {
        MutableLiveData<Boolean> liveData = new MutableLiveData<>();
        if (recipientId == null) {
            liveData.setValue(false);
            return liveData;
        }
        NotificationItem item = new NotificationItem();
        item.setRecipientId(recipientId);
        item.setTitle(title != null ? title : "Notification");
        item.setType(type != null ? type : "INFO");
        item.setMessage(message);
        item.setIsRead(false);

        apiService.createNotification(item).enqueue(new Callback<NotificationItem>() {
            @Override
            public void onResponse(Call<NotificationItem> call, Response<NotificationItem> response) {
                liveData.setValue(response.isSuccessful());
            }

            @Override
            public void onFailure(Call<NotificationItem> call, Throwable t) {
                liveData.setValue(false);
            }
        });
        return liveData;
    }
}
