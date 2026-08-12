package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.databinding.FragmentHomeBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HomeViewModel;

public class HomeFragment extends Fragment {
    private FragmentHomeBinding binding;
    private HomeViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(HomeViewModel.class);

        setupUI();
        setupNavigation();
        observeViewModel();
    }

    private void setupUI() {
        SharedPrefManager prefManager = SharedPrefManager.getInstance(getContext());
        String name = prefManager.getUserName();
        updateGreeting(name);

        // Tool Bar Actions
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new ProfileFragment()));
    }

    private void updateGreeting(String name) {
        if (name == null || name.isEmpty() || name.equals("User")) {
            name = "System User";
        }
        binding.tvGreeting.setText("Welcome back, " + name + "! 👋");
    }

    private void setupNavigation() {
        binding.hubHome.setOnClickListener(v -> {
            // Already on home, maybe just refresh or scroll to top
        });
        binding.hubUsers.setOnClickListener(v -> navigateToFragment(new SkillsFragment()));
        binding.hubAccess.setOnClickListener(v -> navigateToFragment(new ProfileFragment()));
        binding.hubMonitoring.setOnClickListener(v -> navigateToFragment(new AnalyticsHubFragment()));
        binding.hubMore.setOnClickListener(v -> navigateToFragment(new MoreFragment()));
    }

    private void navigateToFragment(Fragment fragment) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).switchFragment(fragment);
        }
    }

    private void observeViewModel() {
        viewModel.getEmployeeName().observe(getViewLifecycleOwner(), name -> {
            if (name != null) updateGreeting(name);
        });

        // Mocking some system stats for the new dashboard requirement
        binding.tvActiveUsers.setText("158");
        binding.tvSystemStatus.setText("Operational");
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
