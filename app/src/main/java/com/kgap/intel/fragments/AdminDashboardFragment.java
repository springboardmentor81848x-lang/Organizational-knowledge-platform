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
import com.kgap.intel.databinding.FragmentAdminDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HomeViewModel;

import java.util.ArrayList;
import java.util.List;

public class AdminDashboardFragment extends Fragment {
    private FragmentAdminDashboardBinding binding;
    private HomeViewModel viewModel;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAdminDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(HomeViewModel.class);

        setupUI();
        setupBanner();
        setupHub();
        setupQuickActions();
        observeViewModel();
    }

    private void setupUI() {
        SharedPrefManager prefManager = SharedPrefManager.getInstance(getContext());
        String name = prefManager.getUserName();
        String displayName = (name == null || name.isEmpty() || name.equals("User")) ? "System Admin" : name;
        binding.tvGreeting.setText("Welcome back, " + displayName + "! 👋");
        
        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new ProfileFragment()));
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("Admin Portal", "System Overview & Controls", R.drawable.slide_1));
        bannerItems.add(new BannerAdapter.BannerItem("Monitoring", "Real-time System Health", R.drawable.slide_2));
        bannerItems.add(new BannerAdapter.BannerItem("Security", "User Access & Audits", R.drawable.slide_3));

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

    private void setupHub() {
        // 1. Users - Blue Theme
        ItemHubButtonBinding users = ItemHubButtonBinding.bind(binding.hubUsers.getRoot());
        users.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        users.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        users.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        users.tvLabel.setText("Users");
        users.getRoot().setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));

        // 2. Access - Orange Theme
        ItemHubButtonBinding access = ItemHubButtonBinding.bind(binding.hubAccess.getRoot());
        access.ivIcon.setImageResource(android.R.drawable.ic_lock_lock);
        access.ivIcon.setColorFilter(Color.parseColor("#F57C00"));
        access.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        access.tvLabel.setText("Access");
        access.getRoot().setOnClickListener(v -> navigateToFragment(new AccessManagementFragment()));

        // 3. Monitoring - Red Theme
        ItemHubButtonBinding monitoring = ItemHubButtonBinding.bind(binding.hubMonitoring.getRoot());
        monitoring.ivIcon.setImageResource(android.R.drawable.ic_menu_sort_by_size);
        monitoring.ivIcon.setColorFilter(Color.parseColor("#D32F2F"));
        monitoring.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFEBEE"));
        monitoring.tvLabel.setText("Monitoring");
        monitoring.getRoot().setOnClickListener(v -> navigateToFragment(new MonitoringFragment()));

        // 4. More - Grey Theme
        ItemHubButtonBinding more = ItemHubButtonBinding.bind(binding.hubMore.getRoot());
        more.ivIcon.setImageResource(android.R.drawable.ic_menu_more);
        more.ivIcon.setColorFilter(Color.parseColor("#455A64"));
        more.cardIconContainer.setCardBackgroundColor(Color.parseColor("#ECEFF1"));
        more.tvLabel.setText("More");
        more.getRoot().setOnClickListener(v -> navigateToFragment(new MoreFragment()));

        // Card Listeners
        binding.cardTotalUsers.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
        binding.cardSystemStatus.setOnClickListener(v -> navigateToFragment(new MonitoringFragment()));
        binding.cardUserSummary.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
    }

    private void setupQuickActions() {
        binding.qaAddUser.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
        binding.qaAuditLogs.setOnClickListener(v -> navigateToFragment(new MonitoringFragment()));
        binding.qaSysSettings.setOnClickListener(v -> navigateToFragment(new MoreFragment()));
    }

    private void observeViewModel() {
        viewModel.getAdminName().observe(getViewLifecycleOwner(), name -> {
            if (name != null) binding.tvGreeting.setText("Welcome back, " + name + "! 👋");
        });

        viewModel.getTotalUsers().observe(getViewLifecycleOwner(), count -> binding.tvTotalUsers.setText(String.valueOf(count)));
        viewModel.getActiveUsers().observe(getViewLifecycleOwner(), count -> binding.tvActiveUsers.setText(String.valueOf(count)));
        viewModel.getInactiveUsers().observe(getViewLifecycleOwner(), count -> binding.tvInactiveUsers.setText(String.valueOf(count)));
        viewModel.getUsersByRole().observe(getViewLifecycleOwner(), map -> {
            if (map != null) binding.tvRoleCount.setText(String.valueOf(map.size()));
        });

        viewModel.getSystemStatus().observe(getViewLifecycleOwner(), status -> {
            binding.tvSystemStatus.setText(status);
            if ("Operational".equalsIgnoreCase(status)) {
                binding.tvSystemStatus.setTextColor(getResources().getColor(R.color.primary_emerald, null));
            } else {
                binding.tvSystemStatus.setTextColor(getResources().getColor(R.color.gap_critical, null));
            }
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
