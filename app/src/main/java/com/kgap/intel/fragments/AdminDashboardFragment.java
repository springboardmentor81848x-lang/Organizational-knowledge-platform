package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.databinding.FragmentAdminDashboardBinding;
import com.kgap.intel.databinding.ItemStatusBinding;

import com.kgap.intel.R;
import com.kgap.intel.utils.SharedPrefManager;

public class AdminDashboardFragment extends Fragment {
    private FragmentAdminDashboardBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAdminDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String name = SharedPrefManager.getInstance(getContext()).getUserName();
        binding.tvGreeting.setText("Hello, " + (name != null ? name : "System Admin") + " 👋");

        setupStatus();

        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new ProfileFragment()));

        binding.btnActionUsers.setOnClickListener(v -> navigateToFragment(new SkillsFragment()));
        binding.btnActionAnalytics.setOnClickListener(v -> navigateToFragment(new AnalyticsHubFragment()));
        binding.btnActionReports.setOnClickListener(v -> navigateToFragment(new ReportsFragment()));
        binding.btnActionHeatmap.setOnClickListener(v -> navigateToFragment(new HeatmapFragment()));
    }

    private void navigateToFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .addToBackStack(null)
                .commit();
    }

    private void setupStatus() {
        ItemStatusBinding auth = ItemStatusBinding.bind(binding.statusAuth.getRoot());
        auth.tvStatusName.setText("Authentication");
        
        ItemStatusBinding db = ItemStatusBinding.bind(binding.statusDb.getRoot());
        db.tvStatusName.setText("Database");
        
        ItemStatusBinding api = ItemStatusBinding.bind(binding.statusApi.getRoot());
        api.tvStatusName.setText("API Services");
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
