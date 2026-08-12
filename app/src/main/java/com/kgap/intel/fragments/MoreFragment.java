package com.kgap.intel.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
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
        ViewProfileRowBinding certs = ViewProfileRowBinding.bind(binding.optCerts.getRoot());
        certs.tvLabel.setText("Manage Certifications");
        certs.tvValue.setText("View and add professional certificates");
        certs.getRoot().setOnClickListener(v -> switchFragment(new CertificationsFragment()));

        ViewProfileRowBinding ach = ViewProfileRowBinding.bind(binding.optAchievements.getRoot());
        ach.tvLabel.setText("My Achievements");
        ach.tvValue.setText("Track your badges and rewards");
        ach.getRoot().setOnClickListener(v -> switchFragment(new AchievementsFragment()));

        ViewProfileRowBinding notif = ViewProfileRowBinding.bind(binding.optNotifs.getRoot());
        notif.tvLabel.setText("Notifications");
        notif.tvValue.setText("View recent app alerts");
        notif.getRoot().setOnClickListener(v -> switchFragment(new NotificationsFragment()));

        ViewProfileRowBinding set = ViewProfileRowBinding.bind(binding.optSettings.getRoot());
        set.tvLabel.setText("Settings");
        set.tvValue.setText("App preferences and security");

        ViewProfileRowBinding help = ViewProfileRowBinding.bind(binding.optHelp.getRoot());
        help.tvLabel.setText("Help & About");
        help.tvValue.setText("Contact support and app info");
    }

    private void switchFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, fragment)
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
