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
import com.kgap.intel.adapters.PathStepAdapter;
import com.kgap.intel.databinding.FragmentStructuredLearningPathBinding;
import com.kgap.intel.viewmodel.LearningViewModel;
import java.util.Collections;

public class StructuredLearningPathFragment extends Fragment {
    private FragmentStructuredLearningPathBinding binding;
    private LearningViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentStructuredLearningPathBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(LearningViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvPathSteps.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel.getLearningPaths().observe(getViewLifecycleOwner(), paths -> {
            binding.pbLoading.setVisibility(View.GONE);
            if (paths != null && !paths.isEmpty()) {
                // Sort by sequence order
                Collections.sort(paths, (o1, o2) -> {
                    Integer s1 = o1.getSequenceOrder() != null ? o1.getSequenceOrder() : 999;
                    Integer s2 = o2.getSequenceOrder() != null ? o2.getSequenceOrder() : 999;
                    return s1.compareTo(s2);
                });
                
                binding.rvPathSteps.setAdapter(new PathStepAdapter(paths));
                binding.rvPathSteps.setVisibility(View.VISIBLE);
                binding.tvEmpty.setVisibility(View.GONE);
            } else {
                binding.rvPathSteps.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(View.VISIBLE);
            }
        });

        binding.pbLoading.setVisibility(View.VISIBLE);
        viewModel.loadLearningPaths();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
