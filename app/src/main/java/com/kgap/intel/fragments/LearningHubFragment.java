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

        binding.cardRecommended.setOnClickListener(v -> switchFragment(new StructuredLearningPathFragment()));
        binding.btnOpenPath.setOnClickListener(v -> switchFragment(new StructuredLearningPathFragment()));

        binding.cardBrowse.setOnClickListener(v -> switchFragment(new AIRecommendationFragment()));
        binding.btnOpenBrowse.setOnClickListener(v -> switchFragment(new AIRecommendationFragment()));

        binding.cardEnrolled.setOnClickListener(v -> switchFragment(new LearningFragment()));
        binding.btnOpenEnrolled.setOnClickListener(v -> switchFragment(new LearningFragment()));

        binding.cardCompleted.setOnClickListener(v -> switchFragment(new LearningFragment()));
        binding.btnOpenCompleted.setOnClickListener(v -> switchFragment(new LearningFragment()));
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
