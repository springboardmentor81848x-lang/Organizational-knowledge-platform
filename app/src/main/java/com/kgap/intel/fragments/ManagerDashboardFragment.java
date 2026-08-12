package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.databinding.FragmentManagerDashboardBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.ManagerViewModel;

public class ManagerDashboardFragment extends Fragment {
    private FragmentManagerDashboardBinding binding;
    private ManagerViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentManagerDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(ManagerViewModel.class);

        setupUI();
        setupHubNavigation();
        observeViewModel();

        viewModel.loadTeamDashboard();
    }

    private void setupUI() {
        String name = SharedPrefManager.getInstance(getContext()).getUserName();
        if (name == null || name.isEmpty() || name.equals("User")) {
            name = "Manager";
        }
        binding.tvGreeting.setText("Welcome back, " + name + " 👋");

        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new ProfileFragment()));
    }

    private void setupHubNavigation() {
        binding.hubTeamSkills.setOnClickListener(v -> navigateToFragment(new ManagerSkillsHubFragment()));
        binding.hubTeamMembers.setOnClickListener(v -> navigateToFragment(new TeamDirectoryFragment()));
        binding.hubLearningTeam.setOnClickListener(v -> navigateToFragment(new ManagerLearningHubFragment()));
        binding.hubMoreManager.setOnClickListener(v -> navigateToFragment(new ReportsFragment()));
    }

    private void observeViewModel() {
        viewModel.getTeamCoverage().observe(getViewLifecycleOwner(), coverage -> {
            binding.tvTeamCoverage.setText(coverage + "%");
            binding.pbTeamCoverage.setProgress(coverage);
        });

        viewModel.getTotalMembers().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalMembers.setText(String.valueOf(count)));

        viewModel.getTotalGaps().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalGaps.setText(String.valueOf(count)));

        viewModel.getHighRiskGaps().observe(getViewLifecycleOwner(), count -> 
            binding.tvHighRisk.setText(String.valueOf(count)));

        viewModel.getTrainingAdoption().observe(getViewLifecycleOwner(), adoption -> 
            binding.tvAdoption.setText(adoption));

        viewModel.getLearningProgress().observe(getViewLifecycleOwner(), progress -> {
            binding.tvProgressLabel.setText(progress + "% Courses Completed");
            binding.pbLearningProgress.setProgress(progress);
        });
    }

    private void navigateToFragment(Fragment fragment) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).switchFragment(fragment);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
