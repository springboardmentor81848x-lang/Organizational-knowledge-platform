package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentSkillsHubBinding;

public class SkillsHubFragment extends Fragment {
    private FragmentSkillsHubBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSkillsHubBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        binding.cardInventory.setOnClickListener(v -> switchFragment(new SkillsFragment()));
        binding.btnOpenInventory.setOnClickListener(v -> switchFragment(new SkillsFragment()));

        binding.cardPeer.setOnClickListener(v -> switchFragment(new PeerAssessmentFragment()));
        binding.btnOpenPeer.setOnClickListener(v -> switchFragment(new PeerAssessmentFragment()));

        binding.cardExpertDirectory.setOnClickListener(v -> switchFragment(new ExpertDirectoryFragment()));
        binding.btnOpenExpertDirectory.setOnClickListener(v -> switchFragment(new ExpertDirectoryFragment()));

        binding.cardGaps.setOnClickListener(v -> switchFragment(new SkillGapFragment()));
        binding.btnOpenGaps.setOnClickListener(v -> switchFragment(new SkillGapFragment()));

        // Heatmap / History
        binding.cardHistory.setOnClickListener(v -> switchFragment(new HeatmapFragment()));
        binding.btnOpenHistory.setOnClickListener(v -> switchFragment(new HeatmapFragment()));
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
