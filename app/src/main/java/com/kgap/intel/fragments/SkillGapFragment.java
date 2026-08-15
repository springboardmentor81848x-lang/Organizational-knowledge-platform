package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.GapOverviewAdapter;
import com.kgap.intel.databinding.FragmentSkillGapBinding;
import com.kgap.intel.models.SkillGapResponse;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.GapViewModel;

import java.util.List;

public class SkillGapFragment extends Fragment {
    private FragmentSkillGapBinding binding;
    private GapViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSkillGapBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(GapViewModel.class);
        
        setupRoleSpecificUI();
        observeViewModel();
        
        binding.toolbar.setNavigationOnClickListener(v -> requireActivity().getOnBackPressedDispatcher().onBackPressed());
        
        binding.btnViewFull.setOnClickListener(v -> {
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, new HeatmapFragment())
                .addToBackStack(null)
                .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
                .commit();
        });

        viewModel.loadData();
    }

    private void setupRoleSpecificUI() {
        String role = SharedPrefManager.getInstance(getContext()).getUserRole();
        if ("EMPLOYEE".equals(role)) {
            binding.toolbar.setTitle("My Skill Gaps");
            binding.btnViewFull.setVisibility(View.GONE); 
        } else if ("MANAGER".equals(role)) {
            binding.toolbar.setTitle("Team Skill Gaps");
        } else {
            binding.toolbar.setTitle("Organization Skill Gaps");
        }
    }

    private void observeViewModel() {
        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            binding.pbLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                binding.tvError.setVisibility(View.VISIBLE);
                binding.tvError.setText(error);
                binding.btnRetry.setVisibility(View.VISIBLE);
                binding.rvGapOverview.setVisibility(View.GONE);
                binding.layoutSummary.setVisibility(View.GONE);
            } else {
                binding.tvError.setVisibility(View.GONE);
                binding.btnRetry.setVisibility(View.GONE);
            }
        });

        viewModel.getSkillGaps().observe(getViewLifecycleOwner(), gaps -> {
            if (gaps != null && !gaps.isEmpty()) {
                binding.rvGapOverview.setVisibility(View.VISIBLE);
                binding.layoutSummary.setVisibility(View.VISIBLE);
                binding.tvEmpty.setVisibility(View.GONE);
                
                binding.rvGapOverview.setLayoutManager(new LinearLayoutManager(getContext()));
                binding.rvGapOverview.setAdapter(new GapOverviewAdapter(gaps));
                
                updateSummary(gaps);
            } else if (gaps != null) {
                binding.rvGapOverview.setVisibility(View.GONE);
                binding.layoutSummary.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(View.VISIBLE);
            }
        });

        binding.btnRetry.setOnClickListener(v -> viewModel.loadData());
    }

    private void updateSummary(List<SkillGapResponse> gaps) {
        long high = gaps.stream().filter(g -> "HIGH".equals(g.getGapLevel())).count();
        long medium = gaps.stream().filter(g -> "MEDIUM".equals(g.getGapLevel())).count();
        long low = gaps.stream().filter(g -> "LOW".equals(g.getGapLevel())).count();
        
        binding.tvTotalCount.setText(String.valueOf(gaps.size()));
        
        binding.statCritical.tvLegendLabel.setText("High Gap");
        binding.statCritical.tvLegendCount.setText(String.valueOf(high));
        binding.statCritical.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_critical));

        binding.statHigh.tvLegendLabel.setText("Medium Gap"); 
        binding.statHigh.tvLegendCount.setText(String.valueOf(medium));
        binding.statHigh.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_high));

        binding.statMedium.tvLegendLabel.setText("Low Gap");
        binding.statMedium.tvLegendCount.setText(String.valueOf(low));
        binding.statMedium.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_medium));

        binding.statLow.tvLegendLabel.setText("Total Gaps");
        binding.statLow.tvLegendCount.setText(String.valueOf(gaps.size()));
        binding.statLow.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.primary_emerald));
        
        // Update Circular Chart if gaps exist
        if (!gaps.isEmpty()) {
            int progress = (int) (((double) (high + medium) / gaps.size()) * 100);
            binding.progressChart.setProgress(progress);
        } else {
            binding.progressChart.setProgress(0);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
