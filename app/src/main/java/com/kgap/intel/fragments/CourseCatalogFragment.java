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
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.CourseCatalogAdapter;
import com.kgap.intel.databinding.FragmentCourseCatalogBinding;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.repository.TrainingRepository;
import com.kgap.intel.utils.SharedPrefManager;

public class CourseCatalogFragment extends Fragment {

    private FragmentCourseCatalogBinding binding;
    private TrainingRepository trainingRepository;
    private CourseCatalogAdapter adapter;
    private Long loggedInEmployeeId;
    private String selectedLevel = "All";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentCourseCatalogBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        trainingRepository = new TrainingRepository(requireContext());
        loggedInEmployeeId = SharedPrefManager.getInstance(requireContext()).getUserId();

        setupToolbar();
        setupRecyclerView();
        setupSearchAndFilters();

        binding.btnRetry.setOnClickListener(v -> loadData());

        loadData();
    }

    private void setupToolbar() {
        binding.toolbar.setNavigationOnClickListener(v -> {
            if (getParentFragmentManager() != null) {
                getParentFragmentManager().popBackStack();
            }
        });
    }

    private void setupRecyclerView() {
        adapter = new CourseCatalogAdapter(this::onEnrollClick);
        binding.rvCourses.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvCourses.setAdapter(adapter);
    }

    private void setupSearchAndFilters() {
        binding.etSearchCourses.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                adapter.filter(s != null ? s.toString() : "", selectedLevel);
                updateEmptyStateVisibility();
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });

        binding.cgLevelFilters.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty() || checkedIds.contains(R.id.chip_all)) {
                selectedLevel = "All";
            } else if (checkedIds.contains(R.id.chip_beginner)) {
                selectedLevel = "BEGINNER";
            } else if (checkedIds.contains(R.id.chip_intermediate)) {
                selectedLevel = "INTERMEDIATE";
            } else if (checkedIds.contains(R.id.chip_advanced)) {
                selectedLevel = "ADVANCED";
            }
            String query = binding.etSearchCourses.getText() != null ? binding.etSearchCourses.getText().toString() : "";
            adapter.filter(query, selectedLevel);
            updateEmptyStateVisibility();
        });
    }

    private void loadData() {
        binding.pbLoading.setVisibility(View.VISIBLE);
        binding.layoutError.setVisibility(View.GONE);
        binding.layoutEmpty.setVisibility(View.GONE);
        binding.rvCourses.setVisibility(View.GONE);

        trainingRepository.getCourses().observe(getViewLifecycleOwner(), courses -> {
            binding.pbLoading.setVisibility(View.GONE);

            if (courses != null) {
                if (courses.isEmpty()) {
                    binding.layoutEmpty.setVisibility(View.VISIBLE);
                    binding.rvCourses.setVisibility(View.GONE);
                } else {
                    binding.layoutEmpty.setVisibility(View.GONE);
                    binding.rvCourses.setVisibility(View.VISIBLE);
                    adapter.setCourses(courses);

                    // Fetch existing enrollments to reflect active states
                    loadUserEnrollments();
                }
            } else {
                binding.layoutError.setVisibility(View.VISIBLE);
                binding.rvCourses.setVisibility(View.GONE);
            }
        });
    }

    private void loadUserEnrollments() {
        if (loggedInEmployeeId != null && loggedInEmployeeId > 0) {
            trainingRepository.getEmployeeEnrollments(loggedInEmployeeId).observe(getViewLifecycleOwner(), enrollments -> {
                if (enrollments != null) {
                    adapter.setEnrollments(enrollments);
                }
            });
        }
    }

    private void onEnrollClick(ExternalCourse course) {
        if (course == null || course.getId() == null) {
            Toast.makeText(getContext(), "Invalid course selected", Toast.LENGTH_SHORT).show();
            return;
        }

        if (loggedInEmployeeId == null || loggedInEmployeeId <= 0) {
            Toast.makeText(getContext(), "Employee profile not found. Please re-login.", Toast.LENGTH_SHORT).show();
            return;
        }

        Long trainingId = course.getId();
        adapter.setEnrollmentInFlight(trainingId, true);

        trainingRepository.enrollInTraining(trainingId, loggedInEmployeeId).observe(getViewLifecycleOwner(), result -> {
            adapter.setEnrollmentInFlight(trainingId, false);

            if (result != null && result.isSuccess()) {
                Toast.makeText(getContext(), "Enrolled in " + course.getTitle() + " successfully!", Toast.LENGTH_SHORT).show();
                loadUserEnrollments();
            } else {
                String errorMsg = result != null ? result.getErrorMessage() : "Enrollment failed";
                Toast.makeText(getContext(), errorMsg, Toast.LENGTH_LONG).show();
                loadUserEnrollments();
            }
        });
    }

    private void updateEmptyStateVisibility() {
        if (adapter.getItemCount() == 0 && binding.pbLoading.getVisibility() != View.VISIBLE && binding.layoutError.getVisibility() != View.VISIBLE) {
            binding.layoutEmpty.setVisibility(View.VISIBLE);
        } else {
            binding.layoutEmpty.setVisibility(View.GONE);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
