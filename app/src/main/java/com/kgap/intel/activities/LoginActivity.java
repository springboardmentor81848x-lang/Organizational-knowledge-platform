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

            // Timeout fallback
            final Handler handler = new Handler();
            final Runnable timeoutTask = () -> {
                if (binding.pbLoading.getVisibility() == View.VISIBLE) {
                    binding.pbLoading.setVisibility(View.GONE);
                    binding.btnSignIn.setEnabled(true);
                    showOfflineModeDialog(email);
                }
            };
            handler.postDelayed(timeoutTask, 3000);

            viewModel.login(email, password).observe(this, response -> {
                handler.removeCallbacks(timeoutTask);
                binding.btnSignIn.setEnabled(true);
                binding.pbLoading.setVisibility(View.GONE);

                if (response != null && response.getToken() != null && response.getRole() != null) {
                    SharedPrefManager prefManager = SharedPrefManager.getInstance(this);
                    prefManager.saveToken(response.getToken());
                    
                    String displayName = (response.getName() != null && !response.getName().isEmpty()) 
                                         ? response.getName() : email.split("@")[0];
                    prefManager.saveUserName(displayName);
                    prefManager.saveUserEmail(email);
                    prefManager.saveUserRole(response.getRole()); // Store canonical backend role
                    prefManager.setIsLoggedIn(true);

                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();
                } else {
                    if (response != null && response.getToken() != null && response.getRole() == null) {
                        Toast.makeText(this, "Authentication error: Missing user role", Toast.LENGTH_LONG).show();
                    } else {
                        showOfflineModeDialog(email);
                    }
                }
            });
        });

        binding.tvSignUp.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, RegisterActivity.class));
        });

        binding.btnBack.setOnClickListener(v -> finish());

        // Secret Demo Trigger: Long click logo if stuck
        binding.ivLogo.setOnLongClickListener(v -> {
            showOfflineModeDialog("demo@kgap.com");
            return true;
        });
    }

    private void showOfflineModeDialog(String email) {
        String[] demoRoles = {"Employee", "Manager", "HR Specialist", "System Administrator"};
        new MaterialAlertDialogBuilder(this)
                .setTitle("Demo Mode")
                .setMessage("Unable to reach the server. Select a role to test the application:")
                .setSingleChoiceItems(demoRoles, 0, (dialog, which) -> {
                    String selectedRoleText = demoRoles[which];
                    String demoName = "User";
                    String demoEmail = "user@kgap.com";
                    String canonicalRole = "EMPLOYEE";
                    
                    switch (selectedRoleText) {
                        case "Employee": 
                            demoName = "Sarah Johnson"; 
                            demoEmail = "employee2@kgap.com";
                            canonicalRole = "EMPLOYEE";
                            break;
                        case "Manager": 
                            demoName = "Riya Mehta"; 
                            demoEmail = "manager@kgap.com";
                            canonicalRole = "MANAGER";
                            break;
                        case "HR Specialist": 
                            demoName = "Neha Patil"; 
                            demoEmail = "hr@kgap.com";
                            canonicalRole = "HR";
                            break;
                        case "System Administrator": 
                            demoName = "Admin User"; 
                            demoEmail = "admin@kgap.com";
                            canonicalRole = "ADMIN";
                            break;
                    }
                    
                    SharedPrefManager prefManager = SharedPrefManager.getInstance(this);
                    prefManager.saveToken("demo_token");
                    prefManager.saveUserName(demoName);
                    prefManager.saveUserEmail(demoEmail);
                    prefManager.saveUserRole(canonicalRole);
                    prefManager.setIsLoggedIn(true);
                    
                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }
}
