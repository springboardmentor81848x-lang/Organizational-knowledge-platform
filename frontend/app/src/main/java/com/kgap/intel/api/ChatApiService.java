package com.kgap.intel.api;

import com.kgap.intel.models.ChatMessageItem;
import java.util.List;
import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface ChatApiService {

    @GET("api/chat/conversation")
    Call<List<ChatMessageItem>> getConversation(
            @Query("user1") Long user1,
            @Query("user2") Long user2
    );

    @POST("api/chat/send")
    Call<ChatMessageItem> sendMessage(@Body ChatMessageItem message);
}
