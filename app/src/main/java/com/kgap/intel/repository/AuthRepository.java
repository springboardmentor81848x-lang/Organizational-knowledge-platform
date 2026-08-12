package com.kgap.intel.repository;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.ApiService;
import com.kgap.intel.models.LoginRequest;
import com.kgap.intel.models.LoginResponse;
import com.kgap.intel.models.RegisterRequest;
import com.kgap.intel.models.RegisterResponse;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class AuthRepository {
    private final ApiService apiService;

    public AuthRepository(android.content.Context context) {
        apiService = ApiClient.getApiService(context);
    }

    public LiveData<LoginResponse> login(String email, String password) {
        MutableLiveData<LoginResponse> loginData = new MutableLiveData<>();
        apiService.login(new LoginRequest(email, password)).enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                if (response.isSuccessful()) {
                    loginData.setValue(response.body());
                } else {
                    loginData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                loginData.setValue(null);
            }
        });
        return loginData;
    }

    public LiveData<RegisterResponse> register(String fullName, String email, String password, String role) {
        MutableLiveData<RegisterResponse> registerData = new MutableLiveData<>();
        apiService.register(new RegisterRequest(fullName, email, password, role)).enqueue(new Callback<RegisterResponse>() {
            @Override
            public void onResponse(Call<RegisterResponse> call, Response<RegisterResponse> response) {
                if (response.isSuccessful()) {
                    registerData.setValue(response.body());
                } else {
                    registerData.setValue(null);
                }
            }

            @Override
            public void onFailure(Call<RegisterResponse> call, Throwable t) {
                registerData.setValue(null);
            }
        });
        return registerData;
    }
}
