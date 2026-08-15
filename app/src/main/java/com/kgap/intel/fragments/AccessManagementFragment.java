package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.databinding.FragmentAccessManagementBinding;
import com.kgap.intel.databinding.ViewProfileRowBinding;

public class AccessManagementFragment extends Fragment {
    private FragmentAccessManagementBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAccessManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupOptions();
    }

    private void setupOptions() {
        // Authentication
        ViewProfileRowBinding authStatus = ViewProfileRowBinding.bind(binding.optAuthStatus.getRoot());
        authStatus.tvLabel.setText("Authentication Status");
        authStatus.tvValue.setText("JWT Authentication Enabled");
        
        ViewProfileRowBinding loginSecurity = ViewProfileRowBinding.bind(binding.optLoginSecurity.getRoot());
        loginSecurity.tvLabel.setText("Login Security");
        loginSecurity.tvValue.setText("2FA Optional, Brute-force protection ON");

        // Roles & Permissions
        ViewProfileRowBinding roles = ViewProfileRowBinding.bind(binding.optRoles.getRoot());
        roles.tvLabel.setText("Role Management");
        roles.tvValue.setText("Admin, HR, Manager, Employee");
        roles.getRoot().setOnClickListener(v -> showFeatureComingSoon());

        ViewProfileRowBinding perms = ViewProfileRowBinding.bind(binding.optPermissions.getRoot());
        perms.tvLabel.setText("Permissions");
        perms.tvValue.setText("Manage granular access rights");

        // JWT / OAuth
        ViewProfileRowBinding jwt = ViewProfileRowBinding.bind(binding.optJwt.getRoot());
        jwt.tvLabel.setText("JWT Configuration");
        jwt.tvValue.setText("Token Expiry: 24h, RS256 Algorithm");
    }

    private void showFeatureComingSoon() {
        Toast.makeText(getContext(), "Feature coming soon", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
