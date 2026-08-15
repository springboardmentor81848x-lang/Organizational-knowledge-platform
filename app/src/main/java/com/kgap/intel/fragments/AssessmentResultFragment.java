package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentAssessmentResultBinding;

public class AssessmentResultFragment extends Fragment {
    private static final String ARG_SKILL_NAME = "skill_name";
    private static final String ARG_SCORE = "score";
    private static final String ARG_LEVEL = "level";
    private static final String ARG_CORRECT = "correct";
    private static final String ARG_TOTAL = "total";

    private FragmentAssessmentResultBinding binding;

    public static AssessmentResultFragment newInstance(String skillName, int score, String level, int correct, int total) {
        AssessmentResultFragment fragment = new AssessmentResultFragment();
        Bundle args = new Bundle();
        args.putString(ARG_SKILL_NAME, skillName);
        args.putInt(ARG_SCORE, score);
        args.putString(ARG_LEVEL, level);
        args.putInt(ARG_CORRECT, correct);
        args.putInt(ARG_TOTAL, total);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAssessmentResultBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        if (getArguments() != null) {
            String skillName = getArguments().getString(ARG_SKILL_NAME);
            int score = getArguments().getInt(ARG_SCORE);
            String level = getArguments().getString(ARG_LEVEL);
            int correct = getArguments().getInt(ARG_CORRECT);
            int total = getArguments().getInt(ARG_TOTAL);

            binding.tvSkillName.setText(skillName);
            binding.tvScorePercent.setText(score + "%");
            binding.tvProficiencyLevel.setText("Level: " + level);
            binding.tvCorrectCount.setText(String.valueOf(correct));
            binding.tvIncorrectCount.setText(String.valueOf(total - correct));
        }

        binding.btnFinish.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Syncing inventory...", Toast.LENGTH_SHORT).show();
            // Navigate back to Skills Inventory explicitly
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, new SkillsFragment())
                .commit();
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
