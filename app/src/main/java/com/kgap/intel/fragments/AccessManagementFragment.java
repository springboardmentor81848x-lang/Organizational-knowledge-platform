package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
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
        // 1. Authentication Status
        ViewProfileRowBinding authStatus = ViewProfileRowBinding.bind(binding.optAuthStatus.getRoot());
        authStatus.tvLabel.setText("Authentication Status");
        authStatus.tvValue.setText("JWT RS256 Active");
        authStatus.getRoot().setOnClickListener(v -> navigateToFragment(new AuthConfigFragment()));

        // 2. Login Security
        ViewProfileRowBinding loginSecurity = ViewProfileRowBinding.bind(binding.optLoginSecurity.getRoot());
        loginSecurity.tvLabel.setText("Login Security & 2FA");
        loginSecurity.tvValue.setText("Brute-Force Guard ON (5 Attempts)");
        loginSecurity.getRoot().setOnClickListener(v -> showSecurityPolicyDialog());

        // 3. Password Policy
        ViewProfileRowBinding passPolicy = ViewProfileRowBinding.bind(binding.optPassPolicy.getRoot());
        passPolicy.tvLabel.setText("Password Complexity Policy");
        passPolicy.tvValue.setText("Min 8 chars, 1 uppercase, 1 special");
        passPolicy.getRoot().setOnClickListener(v -> showPasswordPolicyDialog());

        // 4. Role Management
        ViewProfileRowBinding roles = ViewProfileRowBinding.bind(binding.optRoles.getRoot());
        roles.tvLabel.setText("Role Management");
        roles.tvValue.setText("7 Platform Roles Configured");
        roles.getRoot().setOnClickListener(v -> navigateToFragment(new RoleManagementFragment()));

        // 5. Permissions Matrix
        ViewProfileRowBinding perms = ViewProfileRowBinding.bind(binding.optPermissions.getRoot());
        perms.tvLabel.setText("Granular Access Permissions");
        perms.tvValue.setText("Spring Security @PreAuthorize Active");
        perms.getRoot().setOnClickListener(v -> showPermissionsDialog());

        // 6. Access Control Policies
        ViewProfileRowBinding accessControl = ViewProfileRowBinding.bind(binding.optAccessControl.getRoot());
        accessControl.tvLabel.setText("Endpoint Access Control");
        accessControl.tvValue.setText("Strict RBAC Route Enforcement");
        accessControl.getRoot().setOnClickListener(v -> showAccessControlDialog());

        // 7. JWT Configuration
        ViewProfileRowBinding jwt = ViewProfileRowBinding.bind(binding.optJwt.getRoot());
        jwt.tvLabel.setText("JWT Token Engine");
        jwt.tvValue.setText("Token Expiry: 24h, RS256 Signature");
        jwt.getRoot().setOnClickListener(v -> navigateToFragment(new AuthConfigFragment()));

        // 8. OAuth2 / SSO
        ViewProfileRowBinding oauth = ViewProfileRowBinding.bind(binding.optOauth.getRoot());
        oauth.tvLabel.setText("OAuth2 & SSO Federation");
        oauth.tvValue.setText("Google & Microsoft Entra Enabled");
        oauth.getRoot().setOnClickListener(v -> navigateToFragment(new AuthConfigFragment()));
    }

    private void showSecurityPolicyDialog() {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Login Security & Rate Limiting")
                .setMessage("🛡️ Protection Mechanisms Active:\n\n" +
                        "• Max Failed Login Attempts: 5\n" +
                        "• Temporary Lockout Duration: 15 minutes\n" +
                        "• Session Inactivity Timeout: 30 minutes\n" +
                        "• IP-based Rate Limiter: 100 req/sec/IP\n\n" +
                        "All brute-force intrusion vectors are filtered automatically.")
                .setPositiveButton("OK", null)
                .show();
    }

    private void showPasswordPolicyDialog() {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Enterprise Password Policy")
                .setMessage("🔒 Minimum Password Standards:\n\n" +
                        "• Minimum length: 8 characters\n" +
                        "• Requires uppercase and lowercase letters\n" +
                        "• Requires numeric characters (0-9)\n" +
                        "• Requires symbol characters (@, #, $, %, etc.)\n" +
                        "• Password expiration cycle: 90 days")
                .setPositiveButton("Save Policy", (dialog, which) -> {
                    Toast.makeText(getContext(), "Password policy updated and enforced.", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void showPermissionsDialog() {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Access Permissions Matrix")
                .setMessage("🔐 Active Authority Scopes:\n\n" +
                        "• SYSTEM_ADMIN: [ALL_SYSTEM_RESOURCES, USER_MANAGEMENT, AUDIT_READ, TOKEN_REVOKE]\n" +
                        "• HR: [ORG_GAPS_READ, TALENT_INVENTORY, REPORTS_GENERATE]\n" +
                        "• DEPT_HEAD: [DEPT_GAPS_READ, TRAINING_RECOMMEND, MENTOR_ASSIGN]\n" +
                        "• MANAGER: [TEAM_MEMBERS_READ, TEAM_GAPS_READ, TRAINING_NUDGE]\n" +
                        "• EMPLOYEE: [PROFILE_READ_WRITE, ASSESSMENTS_SUBMIT, COURSES_ENROLL]")
                .setPositiveButton("Manage Roles", (dialog, which) -> navigateToFragment(new RoleManagementFragment()))
                .setNegativeButton("Close", null)
                .show();
    }

    private void showAccessControlDialog() {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Endpoint Access Control")
                .setMessage("🌐 Route Authorization Rules:\n\n" +
                        "• /api/auth/** ➔ Public (PermitAll)\n" +
                        "• /api/admin/** ➔ HasRole('SYSTEM_ADMIN')\n" +
                        "• /api/gaps/all ➔ HasAnyRole('SYSTEM_ADMIN', 'HR')\n" +
                        "• /api/training/** ➔ Authenticated users\n" +
                        "• /api/departments/** ➔ Authenticated users")
                .setPositiveButton("OK", null)
                .show();
    }

    private void navigateToFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .addToBackStack(null)
                .commit();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
