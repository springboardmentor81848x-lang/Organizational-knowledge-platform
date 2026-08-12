package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.databinding.FragmentManagerLearningHubBinding;
import com.kgap.intel.viewmodel.ManagerViewModel;

public class ManagerLearningHubFragment extends Fragment {
    private FragmentManagerLearningHubBinding binding;
    private ManagerViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentManagerLearningHubBinding.inflate(inflater, container, false);
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
        binding.cardOverdue.setOnClickListener(v -> 
            Toast.makeText(getContext(), "Listing members with overdue training...", Toast.LENGTH_SHORT).show());
            
        binding.cardInterventions.setOnClickListener(v -> {
            // Navigate to AI Recommendation but with manager context or just show general recommendations
            navigateToFragment(new AIRecommendationFragment());
        });
    }

    private void observeViewModel() {
        viewModel.getTrainingAdoption().observe(getViewLifecycleOwner(), rate -> {
            binding.tvAdoptionRate.setText(rate);
            try {
                int progress = Integer.parseInt(rate.replace("%", ""));
                binding.pbAdoption.setProgress(progress);
            } catch (Exception ignored) {}
        });

        // Placeholder logic for enrolled/completed based on dashboard metrics
        viewModel.getTotalMembers().observe(getViewLifecycleOwner(), total -> {
            binding.tvEnrolledCount.setText(String.valueOf(total * 2)); // Mock multiplier
            binding.tvCompletedCount.setText(String.valueOf(total));
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
