package com.kgap.intel.api;

import com.kgap.intel.models.LoginRequest;
import com.kgap.intel.models.LoginResponse;
import com.kgap.intel.models.RegisterRequest;
import com.kgap.intel.models.RegisterResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;

public interface ApiService {
    @POST("auth/login")
    Call<LoginResponse> login(@Body LoginRequest request);

    @POST("auth/register")
    Call<RegisterResponse> register(@Body RegisterRequest request);


}
