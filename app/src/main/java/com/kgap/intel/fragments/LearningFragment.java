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
import com.kgap.intel.adapters.CourseAdapter;
import com.kgap.intel.databinding.FragmentLearningBinding;
import com.kgap.intel.viewmodel.LearningViewModel;

public class LearningFragment extends Fragment {
    private FragmentLearningBinding binding;
    private LearningViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLearningBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(LearningViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> requireActivity().onBackPressed());
        binding.rvCourses.setLayoutManager(new LinearLayoutManager(getContext()));
        
        viewModel.getLearningPaths().observe(getViewLifecycleOwner(), paths -> {
            if (paths != null && !paths.isEmpty()) {
                CourseAdapter adapter = new CourseAdapter(paths, (item, newProgress, newStatus) -> {
                    viewModel.updateCourseProgress(item.getId(), newStatus, newProgress);
                });
                binding.rvCourses.setAdapter(adapter);
                binding.rvCourses.setVisibility(View.VISIBLE);
                binding.tvEmpty.setVisibility(View.GONE);
                binding.layoutError.setVisibility(View.GONE);

                int count = paths.size();
                int totalH = 0;
                int completed = 0;
                int inProgress = 0;

                for (com.kgap.intel.models.LearningPathResponse p : paths) {
                    if (p.getEstimatedHours() != null) totalH += p.getEstimatedHours();
                    if ("COMPLETED".equalsIgnoreCase(p.getStatus()) || (p.getCompletionPercentage() != null && p.getCompletionPercentage() >= 100)) {
                        completed++;
                    } else if (p.getCompletionPercentage() != null && p.getCompletionPercentage() > 0) {
                        inProgress++;
                    }
                }

                String summary = count + (count == 1 ? " Course Path (" : " Course Paths (") + totalH + " Hours • " +
                        completed + " Completed, " + inProgress + " In Progress)";
                binding.tvHours.setText(summary);
            } else if (paths != null && paths.isEmpty()) {
                binding.rvCourses.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(View.VISIBLE);
                binding.layoutError.setVisibility(View.GONE);
                binding.tvHours.setText("0 Enrolled Courses");
            }
        });

        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            binding.pbLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
            if (loading) {
                binding.tvEmpty.setVisibility(View.GONE);
                binding.layoutError.setVisibility(View.GONE);
            }
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                binding.rvCourses.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(View.GONE);
                binding.layoutError.setVisibility(View.VISIBLE);
                binding.tvError.setText(error);
                binding.tvHours.setText("Learning Path Error");
            } else {
                binding.layoutError.setVisibility(View.GONE);
            }
        });

        binding.btnRetry.setOnClickListener(v -> viewModel.generateLearningPaths());

        viewModel.loadLearningPaths();
    }

    @Override
    public void onResume() {
        super.onResume();
        if (viewModel != null) {
            viewModel.loadLearningPaths();
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
