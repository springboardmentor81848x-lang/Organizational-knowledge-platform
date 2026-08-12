package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentHrDashboardBinding;
import com.kgap.intel.databinding.ItemGapOverviewBinding;

import com.kgap.intel.utils.SharedPrefManager;

public class HRDashboardFragment extends Fragment {
    private FragmentHrDashboardBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHrDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String name = SharedPrefManager.getInstance(getContext()).getUserName();
        binding.tvGreeting.setText("Welcome, " + (name != null ? name : "HR Specialist") + " 👋");

        setupDepts();

        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new ProfileFragment()));
        binding.btnViewOrgHeatmap.setOnClickListener(v -> navigateToFragment(new HeatmapFragment()));

        binding.btnActionEmployees.setOnClickListener(v -> navigateToFragment(new SkillsFragment()));
        binding.btnActionGaps.setOnClickListener(v -> navigateToFragment(new SkillGapFragment()));
        binding.btnActionRecommend.setOnClickListener(v -> navigateToFragment(new AIRecommendationFragment()));
        binding.btnActionReports.setOnClickListener(v -> navigateToFragment(new ReportsFragment()));
    }

    private void navigateToFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .addToBackStack(null)
                .commit();
    }

    private void setupDepts() {
        // Engineering
        ItemGapOverviewBinding eng = ItemGapOverviewBinding.bind(binding.deptEng.getRoot());
        eng.tvSkillName.setText("Engineering");
        eng.tvGapLabel.setText("Critical Gaps: 18");
        eng.tvGapLabel.setTextColor(ContextCompat.getColor(requireContext(), R.color.gap_critical));
        eng.tvCurrentVal.setText("61%");
        eng.progressCurrent.setProgress(61);
        
        // Data Science
        ItemGapOverviewBinding ds = ItemGapOverviewBinding.bind(binding.deptDs.getRoot());
        ds.tvSkillName.setText("Data Science");
        ds.tvGapLabel.setText("Critical Gaps: 12");
        ds.tvGapLabel.setTextColor(ContextCompat.getColor(requireContext(), R.color.gap_high));
        ds.tvCurrentVal.setText("68%");
        ds.progressCurrent.setProgress(68);

        // Marketing
        ItemGapOverviewBinding mkt = ItemGapOverviewBinding.bind(binding.deptMkt.getRoot());
        mkt.tvSkillName.setText("Marketing");
        mkt.tvGapLabel.setText("Critical Gaps: 7");
        mkt.tvGapLabel.setTextColor(ContextCompat.getColor(requireContext(), R.color.gap_medium));
        mkt.tvCurrentVal.setText("74%");
        mkt.progressCurrent.setProgress(74);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
