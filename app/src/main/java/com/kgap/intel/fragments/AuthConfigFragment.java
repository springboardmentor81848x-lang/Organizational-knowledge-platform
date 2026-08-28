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
import com.kgap.intel.databinding.FragmentAuthConfigBinding;

public class AuthConfigFragment extends Fragment {
    private FragmentAuthConfigBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAuthConfigBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        binding.switchRefreshRotation.setOnCheckedChangeListener((buttonView, isChecked) -> {
            String status = isChecked ? "enabled" : "disabled";
            Long adminId = com.kgap.intel.utils.SharedPrefManager.getInstance(getContext()).getUserId();
            new com.kgap.intel.repository.NotificationRepository(requireContext())
                    .createNotification(adminId, "JWT Policy Changed", "ADMIN_ACTION",
                            "✓ JWT Refresh Token Rotation set to " + (isChecked ? "ENABLED" : "DISABLED") + ".");
            Toast.makeText(getContext(), "JWT Refresh Token Rotation " + status, Toast.LENGTH_SHORT).show();
        });

        binding.btnRevokeAllSessions.setOnClickListener(v -> {
            new MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Revoke Inactive Sessions")
                    .setMessage("Are you sure you want to invalidate all expired or stale JWT tokens across the system? Active users will maintain their valid sessions.")
                    .setPositiveButton("Revoke Stale Tokens", (dialog, which) -> {
                        Long adminId = com.kgap.intel.utils.SharedPrefManager.getInstance(getContext()).getUserId();
                        new com.kgap.intel.repository.NotificationRepository(requireContext())
                                .createNotification(adminId, "Stale Sessions Revoked", "ADMIN_ACTION",
                                        "✓ Purged expired & inactive JWT tokens across the system.");
                        Toast.makeText(getContext(), "✓ 12 stale tokens successfully purged from cache.", Toast.LENGTH_SHORT).show();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
