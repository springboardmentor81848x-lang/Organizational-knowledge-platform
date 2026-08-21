package com.kgap.intel.api;

import okhttp3.OkHttpClient;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import java.util.concurrent.TimeUnit;

import com.kgap.intel.utils.SharedPrefManager;

public class ApiClient {
    private static final String BASE_URL = "http://10.0.2.2:8080/";
    private static Retrofit retrofit = null;

    private static Retrofit getRetrofit(android.content.Context context) {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(logging)
                    .addInterceptor(chain -> {
                        SharedPrefManager prefManager = SharedPrefManager.getInstance(context.getApplicationContext());
                        String token = prefManager.getToken();
                        okhttp3.Request original = chain.request();
                        
                        android.util.Log.d("API_CLIENT", "Request: " + original.url());
                        
                        if (token != null && !token.isEmpty()) {
                            okhttp3.Request.Builder requestBuilder = original.newBuilder()
                                    .header("Authorization", "Bearer " + token)
                                    .method(original.method(), original.body());
                            return chain.proceed(requestBuilder.build());
                        }
                        return chain.proceed(original);
                    })
                    .connectTimeout(10, TimeUnit.SECONDS)
                    .readTimeout(10, TimeUnit.SECONDS)
                    .writeTimeout(10, TimeUnit.SECONDS)
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }

    public static ApiService getApiService(android.content.Context context) {
        return getRetrofit(context).create(ApiService.class);
    }

    public static SkillApiService getSkillApiService(android.content.Context context) {
        return getRetrofit(context).create(SkillApiService.class);
    }

    public static GapApiService getGapApiService(android.content.Context context) {
        return getRetrofit(context).create(GapApiService.class);
    }

    public static EmployeeApiService getEmployeeApiService(android.content.Context context) {
        return getRetrofit(context).create(EmployeeApiService.class);
    }

    public static JobRoleApiService getJobRoleApiService(android.content.Context context) {
        return getRetrofit(context).create(JobRoleApiService.class);
    }

    public static AIRecommendationApiService getAIRecommendationApiService(android.content.Context context) {
        return getRetrofit(context).create(AIRecommendationApiService.class);
    }

    public static LearningPathApiService getLearningPathApiService(android.content.Context context) {
        return getRetrofit(context).create(LearningPathApiService.class);
    }

    public static OrgApiService getOrgApiService(android.content.Context context) {
        return getRetrofit(context).create(OrgApiService.class);
    }

    public static LDApiService getLDApiService(android.content.Context context) {
        return getRetrofit(context).create(LDApiService.class);
    }

    public static MentorApiService getMentorApiService(android.content.Context context) {
        return getRetrofit(context).create(MentorApiService.class);
    }

    public static AssessmentApiService getAssessmentApiService(android.content.Context context) {
        return getRetrofit(context).create(AssessmentApiService.class);
    }

    public static KnowledgeSessionApiService getKnowledgeSessionApiService(android.content.Context context) {
        return getRetrofit(context).create(KnowledgeSessionApiService.class);
    }

    public static MentorshipRequestApiService getMentorshipRequestApiService(android.content.Context context) {
        return getRetrofit(context).create(MentorshipRequestApiService.class);
    }

    public static TrainingApiService getTrainingApiService(android.content.Context context) {
        return getRetrofit(context).create(TrainingApiService.class);
    }
}
