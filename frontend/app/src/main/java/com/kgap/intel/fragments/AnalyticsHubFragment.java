package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentAnalyticsHubBinding;
import com.kgap.intel.utils.SharedPrefManager;

public class AnalyticsHubFragment extends Fragment {
    private FragmentAnalyticsHubBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAnalyticsHubBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        setupRoleSpecificUI();
        
        binding.btnOpenGap.setOnClickListener(v -> switchFragment(new SkillGapFragment()));
        binding.btnOpenHeatmap.setOnClickListener(v -> switchFragment(new HeatmapFragment()));
        binding.btnOpenTrends.setOnClickListener(v -> switchFragment(new SkillGapFragment())); // Placeholder
    }

    private void setupRoleSpecificUI() {
        String role = SharedPrefManager.getInstance(getContext()).getUserRole();
        if ("HR".equals(role) || "ADMIN".equals(role)) {
            binding.tvHubSubtitle.setText("Organization Insights");
            binding.tvHeatmapTitle.setText("Organization Skill Heatmap");
        } else {
            binding.tvHubSubtitle.setText("Engineering Team Insights");
            binding.tvHeatmapTitle.setText("Team Skill Heatmap");
        }
    }

    private void switchFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .addToBackStack(null)
            .commit();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
