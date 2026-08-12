package com.kgap.intel.viewmodel;

import androidx.lifecycle.LiveData;
import androidx.annotation.NonNull;
import androidx.lifecycle.AndroidViewModel;
import android.app.Application;

import com.kgap.intel.models.LoginResponse;
import com.kgap.intel.models.RegisterResponse;
import com.kgap.intel.repository.AuthRepository;

public class AuthViewModel extends AndroidViewModel {
    private final AuthRepository repository;

    public AuthViewModel(@NonNull Application application) {
        super(application);
        repository = new AuthRepository(application);
    }

    public LiveData<LoginResponse> login(String email, String password) {
        return repository.login(email, password);
    }

    public LiveData<RegisterResponse> register(String name, String email, String password, String role) {
        return repository.register(name, email, password, role);
    }
}
