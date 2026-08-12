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
import com.kgap.intel.databinding.FragmentManagerSkillsHubBinding;
import com.kgap.intel.viewmodel.ManagerViewModel;

public class ManagerSkillsHubFragment extends Fragment {
    private FragmentManagerSkillsHubBinding binding;
    private ManagerViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentManagerSkillsHubBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(ManagerViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupListeners();
        observeViewModel();
    }

    private void setupListeners() {
        binding.cardHeatmap.setOnClickListener(v -> navigateToFragment(new HeatmapFragment()));
        binding.cardGapAnalysis.setOnClickListener(v -> navigateToFragment(new SkillGapFragment()));
        binding.cardDistribution.setOnClickListener(v -> navigateToFragment(new SkillGapFragment())); // Sharing for now
    }

    private void observeViewModel() {
        viewModel.getTeamCoverage().observe(getViewLifecycleOwner(), coverage -> 
            binding.tvAvgCoverage.setText(coverage + "%"));

        viewModel.getHighRiskGaps().observe(getViewLifecycleOwner(), count -> 
            binding.tvCriticalCount.setText(String.valueOf(count)));
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
