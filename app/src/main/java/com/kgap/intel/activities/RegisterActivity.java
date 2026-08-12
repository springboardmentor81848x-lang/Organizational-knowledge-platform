package com.kgap.intel.activities;

import android.os.Bundle;
import android.os.Handler;
import android.view.View;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.adapters.RoleAdapter;
import com.kgap.intel.databinding.ActivityRegisterBinding;
import com.kgap.intel.models.Role;
import com.kgap.intel.utils.ValidationUtils;
import com.kgap.intel.viewmodel.AuthViewModel;

import java.util.ArrayList;
import java.util.List;

public class RegisterActivity extends AppCompatActivity {

    private ActivityRegisterBinding binding;
    private AuthViewModel viewModel;
    private String selectedRole = "Employee";
    private RoleAdapter roleAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityRegisterBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        viewModel = new ViewModelProvider(this).get(AuthViewModel.class);

        setupRoleSelection();

        binding.btnCreateAccount.setOnClickListener(v -> {
            Toast.makeText(this, "Registration process started...", Toast.LENGTH_SHORT).show();
            String name = binding.etName.getText().toString();
            String email = binding.etEmail.getText().toString();
            String password = binding.etPassword.getText().toString();

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
                return;
            }

            if (!ValidationUtils.isValidPassword(password)) {
                Toast.makeText(this, "Password must be at least 8 chars with a number and uppercase", Toast.LENGTH_SHORT).show();
                return;
            }

            binding.btnCreateAccount.setEnabled(false);
            binding.pbLoading.setVisibility(View.VISIBLE);

            String canonicalRole = "EMPLOYEE";
            switch (selectedRole) {
                case "Employee": canonicalRole = "EMPLOYEE"; break;
                case "Manager": canonicalRole = "MANAGER"; break;
                case "HR Specialist": canonicalRole = "HR"; break;
                case "System Administrator": canonicalRole = "ADMIN"; break;
            }

            // Timeout fallback
            final Handler handler = new Handler();
            final Runnable timeoutTask = () -> {
                if (binding.pbLoading.getVisibility() == View.VISIBLE) {
                    binding.pbLoading.setVisibility(View.GONE);
                    binding.btnCreateAccount.setEnabled(true);
                    showOfflineModeDialog(name);
                }
            };
            handler.postDelayed(timeoutTask, 3000);

            viewModel.register(name, email, password, canonicalRole).observe(this, response -> {
                handler.removeCallbacks(timeoutTask);
                binding.btnCreateAccount.setEnabled(true);
                binding.pbLoading.setVisibility(View.GONE);

                if (response != null && response.isSuccess()) {
                    showSuccessDialog();
                } else {
                    showOfflineModeDialog(name);
                }
            });
        });

        binding.tvSignIn.setOnClickListener(v -> finish());
        binding.btnBack.setOnClickListener(v -> finish());

        // Secret Shortcut: Long click logo to skip
        binding.ivLogo.setOnLongClickListener(v -> {
            showOfflineModeDialog("Demo User");
            return true;
        });
    }

    private void setupRoleSelection() {
        List<Role> roles = new ArrayList<>();
        int profileIcon = R.drawable.ic_user_profile_circle;
        roles.add(new Role("Employee", profileIcon));
        roles.add(new Role("Manager", profileIcon));
        roles.add(new Role("HR Specialist", profileIcon));
        roles.add(new Role("System Administrator", profileIcon));

        roleAdapter = new RoleAdapter(roles, roleTitle -> selectedRole = roleTitle);
        binding.rvRoles.setLayoutManager(new LinearLayoutManager(this, LinearLayoutManager.HORIZONTAL, false));
        binding.rvRoles.setAdapter(roleAdapter);
    }

    private void showSuccessDialog() {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Registration Successful")
                .setMessage("Your account has been created successfully. Please log in to continue.")
                .setPositiveButton("Login Now", (dialog, which) -> finish())
                .setCancelable(false)
                .show();
    }

    private void showOfflineModeDialog(String name) {
        new MaterialAlertDialogBuilder(this)
                .setTitle("Server Not Responding")
                .setMessage("We couldn't reach the backend. Would you like to proceed in Offline Demo Mode?")
                .setPositiveButton("Use Demo Mode", (dialog, which) -> {
                    Toast.makeText(this, "Registration Simulated!", Toast.LENGTH_SHORT).show();
                    finish();
                })
                .setNegativeButton("Retry", null)
                .show();
    }
}
