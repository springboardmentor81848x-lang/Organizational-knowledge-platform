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
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentAdminDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HomeViewModel;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

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
        loadRealSystemStats();
    }

    private void setupUI() {
        SharedPrefManager prefManager = SharedPrefManager.getInstance(getContext());
        String name = prefManager.getUserName();
        String displayName = (name == null || name.isEmpty() || name.equals("User")) ? "System Admin" : name;
        binding.tvGreeting.setText("Welcome back, " + displayName + "! 👋");
        
        binding.btnSearch.setOnClickListener(v -> new QuickServiceSearchBottomSheet().show(getParentFragmentManager(), "quick_service_search"));
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnProfile.setOnClickListener(v -> navigateToFragment(new MoreFragment()));
        binding.tvViewAuditLogs.setOnClickListener(v -> navigateToFragment(new SecurityAuditFragment()));
        binding.cardSecurityBanner.setOnClickListener(v -> navigateToFragment(new SecurityAuditFragment()));
        setupNotificationBadge();
    }

    private void setupNotificationBadge() {
        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
        com.kgap.intel.repository.NotificationRepository notifRepo = new com.kgap.intel.repository.NotificationRepository(requireContext());
        notifRepo.getUnreadCount(userId).observe(getViewLifecycleOwner(), unreadCount -> {
            if (unreadCount != null && unreadCount > 0) {
                binding.tvNotifBadge.setVisibility(View.VISIBLE);
                binding.tvNotifBadge.setText(unreadCount > 9 ? "9+" : String.valueOf(unreadCount));
            } else {
                binding.tvNotifBadge.setVisibility(View.GONE);
            }
        });
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("Admin Command Center", "Access, Security & Identity Governance", R.drawable.slide_1));
        bannerItems.add(new BannerAdapter.BannerItem("System Telemetry", "Real-Time Health & Database Metrics", R.drawable.slide_2));
        bannerItems.add(new BannerAdapter.BannerItem("Security Center", "Zero-Trust & Audit Trail Logs", R.drawable.slide_3));

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
        // 1. User Management - Blue
        ItemHubButtonBinding users = ItemHubButtonBinding.bind(binding.hubUsers.getRoot());
        users.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        users.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        users.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        users.tvLabel.setText("Users");
        users.getRoot().setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));

        // 2. Role Management - Purple
        ItemHubButtonBinding roles = ItemHubButtonBinding.bind(binding.hubRoles.getRoot());
        roles.ivIcon.setImageResource(android.R.drawable.ic_menu_compass);
        roles.ivIcon.setColorFilter(Color.parseColor("#7B1FA2"));
        roles.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        roles.tvLabel.setText("Roles");
        roles.getRoot().setOnClickListener(v -> navigateToFragment(new RoleManagementFragment()));

        // 3. Access Control - Orange
        ItemHubButtonBinding access = ItemHubButtonBinding.bind(binding.hubAccess.getRoot());
        access.ivIcon.setImageResource(android.R.drawable.ic_lock_lock);
        access.ivIcon.setColorFilter(Color.parseColor("#E65100"));
        access.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        access.tvLabel.setText("Access Control");
        access.getRoot().setOnClickListener(v -> navigateToFragment(new AccessManagementFragment()));

        // 4. JWT & Auth Engine - Emerald
        ItemHubButtonBinding auth = ItemHubButtonBinding.bind(binding.hubAuth.getRoot());
        auth.ivIcon.setImageResource(android.R.drawable.ic_menu_manage);
        auth.ivIcon.setColorFilter(Color.parseColor("#00897B"));
        auth.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E0F2F1"));
        auth.tvLabel.setText("Auth & JWT");
        auth.getRoot().setOnClickListener(v -> navigateToFragment(new AuthConfigFragment()));

        // 5. System Monitoring - Red
        ItemHubButtonBinding monitoring = ItemHubButtonBinding.bind(binding.hubMonitoring.getRoot());
        monitoring.ivIcon.setImageResource(android.R.drawable.ic_menu_sort_by_size);
        monitoring.ivIcon.setColorFilter(Color.parseColor("#D32F2F"));
        monitoring.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFEBEE"));
        monitoring.tvLabel.setText("Monitoring");
        monitoring.getRoot().setOnClickListener(v -> navigateToFragment(new MonitoringFragment()));

        // 6. Security & Audits - Slate
        ItemHubButtonBinding security = ItemHubButtonBinding.bind(binding.hubSecurity.getRoot());
        security.ivIcon.setImageResource(android.R.drawable.ic_lock_idle_lock);
        security.ivIcon.setColorFilter(Color.parseColor("#455A64"));
        security.cardIconContainer.setCardBackgroundColor(Color.parseColor("#ECEFF1"));
        security.tvLabel.setText("Audit Logs");
        security.getRoot().setOnClickListener(v -> navigateToFragment(new SecurityAuditFragment()));

        // Card Listeners
        binding.cardTotalUsers.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
        binding.cardSystemStatus.setOnClickListener(v -> navigateToFragment(new MonitoringFragment()));
        binding.cardUserSummary.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
    }

    private void setupQuickActions() {
        binding.qaAddUser.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
        binding.qaAuditLogs.setOnClickListener(v -> navigateToFragment(new SecurityAuditFragment()));
        binding.qaSysSettings.setOnClickListener(v -> navigateToFragment(new AuthConfigFragment()));
    }

    private void loadRealSystemStats() {
        ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null && binding != null) {
                    List<EmployeeResponse> list = response.body();
                    int total = list.size();
                    binding.tvTotalUsers.setText(String.valueOf(total));
                    binding.tvActiveUsers.setText(String.valueOf(total));
                    binding.tvInactiveUsers.setText("0");
                    binding.tvRoleCount.setText("7");
                    binding.tvSystemStatus.setText("Operational");
                    binding.tvSystemStatus.setTextColor(Color.parseColor("#2E7D32"));
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                if (binding != null) {
                    binding.tvSystemStatus.setText("Degraded");
                    binding.tvSystemStatus.setTextColor(Color.parseColor("#D32F2F"));
                }
            }
        });
    }

    private void navigateToFragment(Fragment fragment) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).switchFragment(fragment);
        } else {
            getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, fragment)
                    .addToBackStack(null)
                    .commit();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        sliderHandler.removeCallbacksAndMessages(null);
        binding = null;
    }
}
