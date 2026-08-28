package com.kgap.intel.api;

import com.kgap.intel.models.NotificationItem;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.GET;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface NotificationApiService {

    @GET("notifications/employee/{employeeId}")
    Call<List<NotificationItem>> getNotifications(@Path("employeeId") Long employeeId);

    @GET("notifications/employee/{employeeId}/unread")
    Call<List<NotificationItem>> getUnreadNotifications(@Path("employeeId") Long employeeId);

    @PUT("notifications/{id}/read")
    Call<NotificationItem> markAsRead(@Path("id") Long id);

    @retrofit2.http.POST("notifications")
    Call<NotificationItem> createNotification(@retrofit2.http.Body NotificationItem item);
}
