package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.adapters.AIRecommendationAdapter;
import com.kgap.intel.databinding.FragmentAiRecommendationsBinding;
import com.kgap.intel.viewmodel.AIRecommendationViewModel;

public class AIRecommendationFragment extends Fragment {
    private FragmentAiRecommendationsBinding binding;
    private AIRecommendationViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAiRecommendationsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(AIRecommendationViewModel.class);

        String role = com.kgap.intel.utils.SharedPrefManager.getInstance(getContext()).getUserRole();
        if ("HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            binding.toolbar.setTitle("Strategic Skill Forecasting");
        }

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvRecommendations.setLayoutManager(new LinearLayoutManager(getContext()));
        
        viewModel.getRecommendations().observe(getViewLifecycleOwner(), recs -> {
            if (recs != null && !recs.isEmpty()) {
                binding.rvRecommendations.setAdapter(new AIRecommendationAdapter(recs));
                binding.layoutEmpty.setVisibility(View.GONE);
                binding.tvError.setVisibility(View.GONE);
            } else if (recs != null && recs.isEmpty()) {
                binding.layoutEmpty.setVisibility(View.VISIBLE);
                binding.tvError.setVisibility(View.GONE);
            } else {
                binding.layoutEmpty.setVisibility(View.GONE);
                binding.tvError.setVisibility(View.VISIBLE);
            }
        });

        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            binding.pbLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
            if (loading) {
                binding.layoutEmpty.setVisibility(View.GONE);
                binding.tvError.setVisibility(View.GONE);
            }
        });

        binding.btnGenerate.setOnClickListener(v -> viewModel.generateRecommendations());

        viewModel.loadRecommendations();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
