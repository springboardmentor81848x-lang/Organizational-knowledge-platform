package com.kgap.intel.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.activities.LoginActivity;
import com.kgap.intel.databinding.FragmentMoreBinding;
import com.kgap.intel.databinding.ViewProfileRowBinding;
import com.kgap.intel.utils.SharedPrefManager;

public class MoreFragment extends Fragment {
    private FragmentMoreBinding binding;
    private SharedPrefManager prefManager;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMoreBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        prefManager = SharedPrefManager.getInstance(getContext());
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupUserInfo();
        setupOptions();
        
        binding.btnLogout.setOnClickListener(v -> logout());
    }

    private void setupUserInfo() {
        binding.tvName.setText(prefManager.getUserName());
        binding.tvEmail.setText(prefManager.getUserEmail());
        binding.cardProfile.setOnClickListener(v -> switchFragment(new ProfileFragment()));
    }

    private void setupOptions() {
        // 1. Reports & Analytics Section (Available to Employees and All Users)
        ViewProfileRowBinding reports = ViewProfileRowBinding.bind(binding.optReports.getRoot());
        reports.tvLabel.setText("Reports & Performance Analytics");
        reports.tvValue.setText("Generate & download official PDF performance reports");
        reports.getRoot().setOnClickListener(v -> switchFragment(new ReportsFragment()));

        // 2. Service Shortcuts Finder
        ViewProfileRowBinding shortcuts = ViewProfileRowBinding.bind(binding.optShortcuts.getRoot());
        shortcuts.tvLabel.setText("⚡ Service Shortcuts & Search");
        shortcuts.tvValue.setText("Quickly launch any feature or platform service");
        shortcuts.getRoot().setOnClickListener(v -> {
            QuickServiceSearchBottomSheet sheet = new QuickServiceSearchBottomSheet();
            sheet.show(getParentFragmentManager(), "QuickServiceSearch");
        });

        // 3. Settings & Platform
        ViewProfileRowBinding settings = ViewProfileRowBinding.bind(binding.optSettings.getRoot());
        settings.tvLabel.setText("System Settings");
        settings.tvValue.setText("General platform configuration");

        ViewProfileRowBinding notif = ViewProfileRowBinding.bind(binding.optNotifs.getRoot());
        notif.tvLabel.setText("Notifications");
        notif.tvValue.setText("Manage notification preferences & history");
        notif.getRoot().setOnClickListener(v -> switchFragment(new NotificationsFragment()));

        // 4. Support & About
        ViewProfileRowBinding help = ViewProfileRowBinding.bind(binding.optHelp.getRoot());
        help.tvLabel.setText("Help & Support");
        help.tvValue.setText("Contact technical support & documentation");

        ViewProfileRowBinding about = ViewProfileRowBinding.bind(binding.optAbout.getRoot());
        about.tvLabel.setText("About KGap");
        about.tvValue.setText("Version 2.1.0 (Enterprise Intelligence)");
    }

    private void switchFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
            .replace(com.kgap.intel.R.id.fragment_container, fragment)
            .addToBackStack(null)
            .commit();
    }

    private void logout() {
        prefManager.clear();
        Intent intent = new Intent(getActivity(), LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        if (getActivity() != null) {
            getActivity().finish();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
