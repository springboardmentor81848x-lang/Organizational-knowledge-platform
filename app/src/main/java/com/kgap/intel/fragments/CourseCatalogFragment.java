package com.kgap.intel.fragments;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.kgap.intel.adapters.CourseCatalogAdapter;
import com.kgap.intel.databinding.FragmentCourseCatalogBinding;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.viewmodel.LearningViewModel;
import com.google.android.material.chip.Chip;

public class CourseCatalogFragment extends Fragment implements CourseCatalogAdapter.OnEnrollClickListener {

    private FragmentCourseCatalogBinding binding;
    private LearningViewModel viewModel;
    private CourseCatalogAdapter adapter;
    private String currentLevel = "All";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentCourseCatalogBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        // Toolbar back navigation
        binding.toolbar.setNavigationOnClickListener(v -> requireActivity().onBackPressed());

        // Setup RecyclerView
        adapter = new CourseCatalogAdapter(this);
        binding.rvCourses.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvCourses.setAdapter(adapter);

        // Initialise ViewModel
        viewModel = new ViewModelProvider(requireActivity()).get(LearningViewModel.class);

        // Observe LiveData
        viewModel.getExternalCourses().observe(getViewLifecycleOwner(), courses -> {
            adapter.setCourses(courses);
            if (courses != null && courses.isEmpty()) {
                binding.layoutEmpty.setVisibility(View.VISIBLE);
            } else {
                binding.layoutEmpty.setVisibility(View.GONE);
            }
        });

        viewModel.getEmployeeEnrollments().observe(getViewLifecycleOwner(), enrollments -> {
            adapter.setEnrollments(enrollments);
        });

        viewModel.getEnrollmentError().observe(getViewLifecycleOwner(), error -> {
            if (error != null && !error.isEmpty()) {
                Toast.makeText(requireContext(), error, Toast.LENGTH_SHORT).show();
            }
        });

        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            binding.pbLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), err -> {
            if (err != null) {
                binding.tvError.setText(err);
                binding.layoutError.setVisibility(View.VISIBLE);
            } else {
                binding.layoutError.setVisibility(View.GONE);
            }
        });

        // Retry button
        binding.btnRetry.setOnClickListener(v -> {
            binding.layoutError.setVisibility(View.GONE);
            loadData();
        });

        // Search listener
        binding.etSearchCourses.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                adapter.filter(s != null ? s.toString() : "", currentLevel);
            }
            @Override public void afterTextChanged(Editable s) {}
        });

        // Level filter chips
        binding.cgLevelFilters.setOnCheckedChangeListener((group, checkedId) -> {
            Chip chip = group.findViewById(checkedId);
            if (chip != null) {
                currentLevel = chip.getText().toString();
                adapter.filter(binding.etSearchCourses.getText() != null ? binding.etSearchCourses.getText().toString() : "", currentLevel);
            }
        });

        loadData();
    }

    private void loadData() {
        viewModel.loadExternalCourses();
        viewModel.loadEmployeeEnrollments();
    }

    @Override
    public void onEnrollClick(ExternalCourse course) {
        if (course != null && course.getId() != null) {
            adapter.setEnrollmentInFlight(course.getId(), true);
            viewModel.enrollInCourse(course.getId());
            // Clear in‑flight after enrollments refresh
            viewModel.getEmployeeEnrollments().observe(getViewLifecycleOwner(), enrollments -> {
                adapter.setEnrollmentInFlight(course.getId(), false);
            });
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
