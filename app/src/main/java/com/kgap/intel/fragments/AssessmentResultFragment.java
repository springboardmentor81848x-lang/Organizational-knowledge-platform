package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.fragments.AssessmentComparisonFragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentAssessmentResultBinding;

public class AssessmentResultFragment extends Fragment {
    private static final String ARG_SKILL_NAME = "skill_name";
    private static final String ARG_SCORE = "score";
    private static final String ARG_LEVEL = "level";
    private static final String ARG_CORRECT = "correct";
    private static final String ARG_TOTAL = "total";
    private static final String ARG_SKILL_ID = "skill_id";
    private static final String ARG_EMPLOYEE_ID = "employee_id";

    private FragmentAssessmentResultBinding binding;

    // Backward compatible overload
    public static AssessmentResultFragment newInstance(String skillName, int score, String level, int correct, int total) {
        return newInstance(skillName, score, level, correct, total, null, null);
    }

    // Full overload with IDs for comparison view
    public static AssessmentResultFragment newInstance(String skillName, int score, String level, int correct, int total, String skillId, Long employeeId) {
        AssessmentResultFragment fragment = new AssessmentResultFragment();
        Bundle args = new Bundle();
        args.putString(ARG_SKILL_NAME, skillName);
        args.putInt(ARG_SCORE, score);
        args.putString(ARG_LEVEL, level);
        args.putInt(ARG_CORRECT, correct);
        args.putInt(ARG_TOTAL, total);
        if (skillId != null) args.putString(ARG_SKILL_ID, skillId);
        if (employeeId != null) args.putLong(ARG_EMPLOYEE_ID, employeeId);
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

            // Hide or show comparison button
            if (getArguments().containsKey(ARG_SKILL_ID) && getArguments().containsKey(ARG_EMPLOYEE_ID)) {
                binding.btnViewComparison.setVisibility(View.VISIBLE);
            } else {
                binding.btnViewComparison.setVisibility(View.GONE);
            }
        }

        // View Comparison button – only visible when IDs are supplied
        binding.btnViewComparison.setOnClickListener(v -> {
            if (getArguments() != null && getArguments().containsKey(ARG_SKILL_ID) && getArguments().containsKey(ARG_EMPLOYEE_ID)) {
                String skillIdStr = getArguments().getString(ARG_SKILL_ID);
                Long employeeId = getArguments().getLong(ARG_EMPLOYEE_ID);
                try {
                    Long skillId = Long.parseLong(skillIdStr);
                    AssessmentComparisonFragment comparisonFragment = AssessmentComparisonFragment.newInstance(employeeId, skillId);
                    getParentFragmentManager().beginTransaction()
                            .replace(R.id.fragment_container, comparisonFragment)
                            .addToBackStack(null)
                            .commit();
                } catch (NumberFormatException e) {
                    Toast.makeText(getContext(), "Invalid skill ID", Toast.LENGTH_SHORT).show();
                }
            }
        });

        binding.btnFinish.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Syncing inventory...", Toast.LENGTH_SHORT).show();
            getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, new SkillsFragment())
                    .commit();
        });

        binding.btnBackHome.setOnClickListener(v -> {
            if (getActivity() instanceof com.kgap.intel.activities.MainActivity) {
                ((com.kgap.intel.activities.MainActivity) getActivity()).switchFragment(new HomeFragment());
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
