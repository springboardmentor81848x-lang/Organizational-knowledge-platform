package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentLearningHubBinding;

public class LearningHubFragment extends Fragment {
    private FragmentLearningHubBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLearningHubBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        // Section 1: Discover
        binding.cardRecommended.setOnClickListener(v -> switchFragment(new StructuredLearningPathFragment()));
        binding.btnOpenPath.setOnClickListener(v -> switchFragment(new StructuredLearningPathFragment()));

        binding.cardBrowse.setOnClickListener(v -> switchFragment(new CourseCatalogFragment()));
        binding.btnOpenBrowse.setOnClickListener(v -> switchFragment(new CourseCatalogFragment()));

        // Section 2: Progress & Courses
        binding.cardMyProgress.setOnClickListener(v -> switchFragment(new MyProgressFragment()));
        binding.btnOpenMyProgress.setOnClickListener(v -> switchFragment(new MyProgressFragment()));

        binding.cardEnrolled.setOnClickListener(v -> switchFragment(LearningFragment.newInstance("ENROLLED")));
        binding.btnOpenEnrolled.setOnClickListener(v -> switchFragment(LearningFragment.newInstance("ENROLLED")));

        binding.cardCompleted.setOnClickListener(v -> switchFragment(LearningFragment.newInstance("COMPLETED")));
        binding.btnOpenCompleted.setOnClickListener(v -> switchFragment(LearningFragment.newInstance("COMPLETED")));

        // Section 3: Reports & Downloads
        binding.cardReports.setOnClickListener(v -> switchFragment(new ReportsFragment()));
        binding.btnOpenReports.setOnClickListener(v -> switchFragment(new ReportsFragment()));
    }

    private void switchFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .addToBackStack(null)
            .commit();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
