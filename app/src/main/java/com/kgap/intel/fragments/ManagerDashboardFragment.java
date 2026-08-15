package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.BannerAdapter;
import com.kgap.intel.databinding.FragmentManagerDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.ManagerViewModel;

import java.util.ArrayList;
import java.util.List;

public class ManagerDashboardFragment extends Fragment {
    private FragmentManagerDashboardBinding binding;
    private ManagerViewModel viewModel;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());

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
        setupBanner();
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
        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new MoreFragment()));
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("Team Insights", "Analyze performance and gaps", R.drawable.slide_1));
        bannerItems.add(new BannerAdapter.BannerItem("Skill Growth", "Empower your direct reports", R.drawable.slide_2));
        bannerItems.add(new BannerAdapter.BannerItem("Resource Planning", "Align talent with objectives", R.drawable.slide_3));

        BannerAdapter adapter = new BannerAdapter(bannerItems);
        binding.viewPagerBanner.setAdapter(adapter);

        Runnable sliderRunnable = new Runnable() {
            @Override
            public void run() {
                if (binding != null) {
                    int nextItem = (binding.viewPagerBanner.getCurrentItem() + 1) % bannerItems.size();
                    binding.viewPagerBanner.setCurrentItem(nextItem, true);
                    sliderHandler.postDelayed(this, 3500);
                }
            }
        };
        sliderHandler.postDelayed(sliderRunnable, 3500);
    }

    private void setupHubNavigation() {
        // 1. Team Skills - Emerald Theme
        ItemHubButtonBinding skills = ItemHubButtonBinding.bind(binding.hubTeamSkills.getRoot());
        skills.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        skills.ivIcon.setColorFilter(Color.parseColor("#00C853"));
        skills.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        skills.tvLabel.setText("Team Skills");
        skills.getRoot().setOnClickListener(v -> navigateToFragment(new ManagerSkillsHubFragment()));

        // 2. My Team - Blue Theme
        ItemHubButtonBinding team = ItemHubButtonBinding.bind(binding.hubTeamMembers.getRoot());
        team.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        team.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        team.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        team.tvLabel.setText("My Team");
        team.getRoot().setOnClickListener(v -> navigateToFragment(new TeamDirectoryFragment()));

        // 3. Learning - Indigo Theme
        ItemHubButtonBinding learning = ItemHubButtonBinding.bind(binding.hubLearningTeam.getRoot());
        learning.ivIcon.setImageResource(android.R.drawable.ic_menu_slideshow);
        learning.ivIcon.setColorFilter(Color.parseColor("#3F51B5"));
        learning.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8EAF6"));
        learning.tvLabel.setText("Team Learning");
        learning.getRoot().setOnClickListener(v -> navigateToFragment(new ManagerLearningHubFragment()));

        // 4. Reports - Orange Theme
        ItemHubButtonBinding reports = ItemHubButtonBinding.bind(binding.hubMoreManager.getRoot());
        reports.ivIcon.setImageResource(android.R.drawable.ic_menu_more);
        reports.ivIcon.setColorFilter(Color.parseColor("#F57C00"));
        reports.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        reports.tvLabel.setText("Reports");
        reports.getRoot().setOnClickListener(v -> navigateToFragment(new ReportsFragment()));

        // Card Listeners for Stats
        binding.cardDirectReports.setOnClickListener(v -> navigateToFragment(new TeamDirectoryFragment()));
        binding.cardTeamGaps.setOnClickListener(v -> navigateToFragment(new ManagerSkillsHubFragment()));
        binding.cardHighRisk.setOnClickListener(v -> navigateToFragment(new ManagerSkillsHubFragment()));
        binding.cardTrainingAdoption.setOnClickListener(v -> navigateToFragment(new ManagerLearningHubFragment()));
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
        sliderHandler.removeCallbacksAndMessages(null);
        binding = null;
    }
}
