package com.kgap.intel.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
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
        ViewProfileRowBinding settings = ViewProfileRowBinding.bind(binding.optSettings.getRoot());
        settings.tvLabel.setText("System Settings");
        settings.tvValue.setText("General platform configuration");

        ViewProfileRowBinding backup = ViewProfileRowBinding.bind(binding.optBackup.getRoot());
        backup.tvLabel.setText("Backup & Restore");
        backup.tvValue.setText("Manage database backups");
        backup.getRoot().setOnClickListener(v -> Toast.makeText(getContext(), "Backup service active", Toast.LENGTH_SHORT).show());

        ViewProfileRowBinding notif = ViewProfileRowBinding.bind(binding.optNotifs.getRoot());
        notif.tvLabel.setText("Notifications");
        notif.tvValue.setText("Manage admin alerts");
        notif.getRoot().setOnClickListener(v -> switchFragment(new NotificationsFragment()));

        ViewProfileRowBinding help = ViewProfileRowBinding.bind(binding.optHelp.getRoot());
        help.tvLabel.setText("Help & Support");
        help.tvValue.setText("Contact technical support");

        ViewProfileRowBinding about = ViewProfileRowBinding.bind(binding.optAbout.getRoot());
        about.tvLabel.setText("About KGap");
        about.tvValue.setText("Version 2.1.0 (Enterprise)");
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
