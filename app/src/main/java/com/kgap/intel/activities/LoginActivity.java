package com.kgap.intel.activities;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.databinding.ActivityLoginBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.AuthViewModel;

public class LoginActivity extends AppCompatActivity {

    private ActivityLoginBinding binding;
    private AuthViewModel viewModel;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        viewModel = new ViewModelProvider(this).get(AuthViewModel.class);

        binding.btnSignIn.setOnClickListener(v -> {
            Toast.makeText(this, "Sign In process started...", Toast.LENGTH_SHORT).show();
            String email = binding.etEmail.getText().toString();
            String password = binding.etPassword.getText().toString();

            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            binding.btnSignIn.setEnabled(false);
            binding.pbLoading.setVisibility(View.VISIBLE);

            // Timeout fallback - Removed automatic demo mode trigger for "real data only" requirement
            final Handler handler = new Handler();
            final Runnable timeoutTask = () -> {
                if (binding.pbLoading.getVisibility() == View.VISIBLE) {
                    binding.pbLoading.setVisibility(View.GONE);
                    binding.btnSignIn.setEnabled(true);
                    Toast.makeText(LoginActivity.this, "Connection timeout. Please check your server.", Toast.LENGTH_LONG).show();
                }
            };
            handler.postDelayed(timeoutTask, 5000);

            viewModel.login(email, password).observe(this, response -> {
                handler.removeCallbacks(timeoutTask);
                binding.btnSignIn.setEnabled(true);
                binding.pbLoading.setVisibility(View.GONE);

                if (response != null && response.getToken() != null && response.getRole() != null) {
                    SharedPrefManager prefManager = SharedPrefManager.getInstance(this);
                    prefManager.saveToken(response.getToken());
                    
                    if (response.getId() != null) {
                        prefManager.saveUserId(response.getId());
                    }

                    String displayName = (response.getName() != null && !response.getName().isEmpty()) 
                                         ? response.getName() : email.split("@")[0];
                    prefManager.saveUserName(displayName);
                    prefManager.saveUserEmail(email);
                    prefManager.saveUserRole(response.getRole()); // Store canonical backend role
                    prefManager.setIsLoggedIn(true);

                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();
                } else {
                    String errorMsg = "Authentication failed. Please check your credentials.";
                    if (response != null && response.getToken() != null && response.getRole() == null) {
                        errorMsg = "Authentication error: Missing user role from server.";
                    }
                    Toast.makeText(this, errorMsg, Toast.LENGTH_LONG).show();
                }
            });
        });

        binding.tvSignUp.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });

        binding.btnBack.setOnClickListener(v -> finish());
    }
}
