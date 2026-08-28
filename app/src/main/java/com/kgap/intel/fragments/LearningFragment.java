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

    public static LearningFragment newInstance(String filterStatus) {
        LearningFragment fragment = new LearningFragment();
        Bundle args = new Bundle();
        args.putString("filter_status", filterStatus);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(LearningViewModel.class);

        String filterStatus = getArguments() != null ? getArguments().getString("filter_status") : null;
        if ("COMPLETED".equalsIgnoreCase(filterStatus)) {
            binding.toolbar.setTitle("Completed Courses");
        } else if ("ENROLLED".equalsIgnoreCase(filterStatus)) {
            binding.toolbar.setTitle("Enrolled Courses");
        } else {
            binding.toolbar.setTitle("Learning Progress");
        }

        binding.toolbar.setNavigationOnClickListener(v -> requireActivity().onBackPressed());
        binding.rvCourses.setLayoutManager(new LinearLayoutManager(getContext()));
        
        viewModel.getLearningPaths().observe(getViewLifecycleOwner(), paths -> {
            if (paths != null) {
                java.util.List<com.kgap.intel.models.LearningPathResponse> filteredPaths = new java.util.ArrayList<>();
                for (com.kgap.intel.models.LearningPathResponse p : paths) {
                    boolean isCompleted = "COMPLETED".equalsIgnoreCase(p.getStatus()) || (p.getCompletionPercentage() != null && p.getCompletionPercentage() >= 100);
                    if ("COMPLETED".equalsIgnoreCase(filterStatus)) {
                        if (isCompleted) filteredPaths.add(p);
                    } else if ("ENROLLED".equalsIgnoreCase(filterStatus)) {
                        if (!isCompleted) filteredPaths.add(p);
                    } else {
                        filteredPaths.add(p);
                    }
                }

                if (!filteredPaths.isEmpty()) {
                    CourseAdapter adapter = new CourseAdapter(filteredPaths, (item, newProgress, newStatus) -> {
                        viewModel.updateCourseProgress(item.getId(), newStatus, newProgress);
                    });
                    binding.rvCourses.setAdapter(adapter);
                    binding.rvCourses.setVisibility(View.VISIBLE);
                    binding.tvEmpty.setVisibility(View.GONE);
                    binding.layoutError.setVisibility(View.GONE);

                    int count = filteredPaths.size();
                    int totalH = 0;
                    int completed = 0;
                    int inProgress = 0;

                    for (com.kgap.intel.models.LearningPathResponse p : filteredPaths) {
                        if (p.getEstimatedHours() != null) totalH += p.getEstimatedHours();
                        if ("COMPLETED".equalsIgnoreCase(p.getStatus()) || (p.getCompletionPercentage() != null && p.getCompletionPercentage() >= 100)) {
                            completed++;
                        } else if (p.getCompletionPercentage() != null && p.getCompletionPercentage() > 0) {
                            inProgress++;
                        }
                    }

                    String summary;
                    if ("COMPLETED".equalsIgnoreCase(filterStatus)) {
                        summary = count + (count == 1 ? " Completed Course (" : " Completed Courses (") + totalH + " Hours)";
                    } else if ("ENROLLED".equalsIgnoreCase(filterStatus)) {
                        summary = count + (count == 1 ? " Active Course (" : " Active Courses (") + totalH + " Hours)";
                    } else {
                        summary = count + (count == 1 ? " Course Path (" : " Course Paths (") + totalH + " Hours • " +
                                completed + " Completed, " + inProgress + " In Progress)";
                    }
                    binding.tvHours.setText(summary);
                } else {
                    binding.rvCourses.setVisibility(View.GONE);
                    binding.tvEmpty.setVisibility(View.VISIBLE);
                    binding.layoutError.setVisibility(View.GONE);
                    if ("COMPLETED".equalsIgnoreCase(filterStatus)) {
                        binding.tvEmpty.setText("You have not completed any courses yet.");
                        binding.tvHours.setText("0 Completed Courses");
                    } else if ("ENROLLED".equalsIgnoreCase(filterStatus)) {
                        binding.tvEmpty.setText("You are not currently enrolled in any active course paths.");
                        binding.tvHours.setText("0 Active Courses");
                    } else {
                        binding.tvEmpty.setText("No learning path courses required.\nYour current skill proficiencies meet all target role requirements!");
                        binding.tvHours.setText("0 Enrolled Courses");
                    }
                }
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
