package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentAssessmentComparisonBinding;
import com.kgap.intel.models.AssessmentComparisonResponse;
import com.kgap.intel.viewmodel.AssessmentComparisonViewModel;

public class AssessmentComparisonFragment extends Fragment {
    private static final String ARG_EMPLOYEE_ID = "employee_id";
    private static final String ARG_SKILL_ID = "skill_id";
    private static final String ARG_SKILL_NAME = "skill_name";

    private FragmentAssessmentComparisonBinding binding;
    private AssessmentComparisonViewModel viewModel;
    private String skillName;

    public static AssessmentComparisonFragment newInstance(Long employeeId, Long skillId) {
        return newInstance(employeeId, skillId, null);
    }

    public static AssessmentComparisonFragment newInstance(Long employeeId, Long skillId, String skillName) {
        AssessmentComparisonFragment fragment = new AssessmentComparisonFragment();
        Bundle args = new Bundle();
        args.putLong(ARG_EMPLOYEE_ID, employeeId);
        args.putLong(ARG_SKILL_ID, skillId);
        if (skillName != null) {
            args.putString(ARG_SKILL_NAME, skillName);
        }
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAssessmentComparisonBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(AssessmentComparisonViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        final Long employeeId = getArguments() != null ? getArguments().getLong(ARG_EMPLOYEE_ID) : null;
        final Long skillId = getArguments() != null ? getArguments().getLong(ARG_SKILL_ID) : null;
        skillName = getArguments() != null ? getArguments().getString(ARG_SKILL_NAME, "Skill #" + skillId) : "Skill";

        if (skillName != null && !skillName.isEmpty()) {
            binding.toolbar.setSubtitle(skillName);
        }

        if (employeeId != null && skillId != null) {
            viewModel.loadComparison(employeeId, skillId);
        } else {
            showError("Missing employee or skill ID");
            return;
        }

        binding.btnRetry.setOnClickListener(v -> {
            if (employeeId != null && skillId != null) {
                viewModel.loadComparison(employeeId, skillId);
            }
        });

        // 1. Self Assessment button
        binding.btnAssessSelf.setOnClickListener(v -> {
            if (skillId != null) {
                launchAssessment(String.valueOf(skillId), skillName, employeeId, "Employee", "SELF");
            }
        });

        // 2. Peer Assessment button
        binding.btnAssessPeer.setOnClickListener(v -> {
            if (skillId != null) {
                launchAssessment(String.valueOf(skillId), skillName, employeeId, "Peer", "PEER");
            }
        });

        // 3. Manager Assessment button
        binding.btnAssessManager.setOnClickListener(v -> {
            if (skillId != null) {
                launchAssessment(String.valueOf(skillId), skillName, employeeId, "Manager", "MANAGER");
            }
        });

        // 4. Back to Home Screen button
        binding.btnBackHome.setOnClickListener(v -> {
            if (getActivity() instanceof com.kgap.intel.activities.MainActivity) {
                ((com.kgap.intel.activities.MainActivity) getActivity()).switchFragment(new HomeFragment());
            }
        });

        viewModel.getIsLoading().observe(getViewLifecycleOwner(), isLoading -> {
            if (isLoading != null && isLoading) {
                binding.pbLoading.setVisibility(View.VISIBLE);
                binding.contentContainer.setVisibility(View.GONE);
                binding.layoutEmptyError.setVisibility(View.GONE);
            }
        });

        viewModel.getComparison().observe(getViewLifecycleOwner(), response -> {
            binding.pbLoading.setVisibility(View.GONE);
            if (response != null) {
                binding.contentContainer.setVisibility(View.VISIBLE);
                binding.layoutEmptyError.setVisibility(View.GONE);

                binding.tvSelfScore.setText(formatScore(response.getSelfScore()));
                binding.progressSelf.setProgress(response.getSelfScore() != null ? response.getSelfScore().intValue() : 0);
                binding.btnAssessSelf.setText(response.getSelfScore() == null ? "Assess Now (Self)" : "Re-Take Self Assessment");

                binding.tvPeerScore.setText(formatScore(response.getPeerScore()));
                binding.progressPeer.setProgress(response.getPeerScore() != null ? response.getPeerScore().intValue() : 0);
                binding.btnAssessPeer.setText(response.getPeerScore() == null ? "Assess Now (Peer)" : "Re-Take Peer Assessment");

                binding.tvManagerScore.setText(formatScore(response.getManagerScore()));
                binding.progressManager.setProgress(response.getManagerScore() != null ? response.getManagerScore().intValue() : 0);
                binding.btnAssessManager.setText(response.getManagerScore() == null ? "Assess Now (Manager)" : "Re-Take Manager Assessment");

                binding.tvCombinedScore.setText(formatScore(response.getCombinedScore()));
                binding.progressCombined.setProgress(response.getCombinedScore() != null ? response.getCombinedScore().intValue() : 0);

                String level = response.getCombinedProficiencyLevel() != null ? response.getCombinedProficiencyLevel() : "Unaware";
                binding.tvCombinedLevel.setText("Proficiency Level: " + level);
            } else {
                showError("No comparison data available");
            }
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), err -> {
            if (err != null) {
                binding.pbLoading.setVisibility(View.GONE);
                showError(err);
            }
        });
    }

    private void launchAssessment(String skillIdStr, String skillName, Long targetEmpId, String targetEmpName, String type) {
        SkillAssessmentFragment fragment = SkillAssessmentFragment.newInstance(
                skillIdStr,
                skillName,
                targetEmpId,
                targetEmpName,
                type
        );
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .addToBackStack(null)
                .commit();
    }

    private void showError(String msg) {
        binding.contentContainer.setVisibility(View.GONE);
        binding.layoutEmptyError.setVisibility(View.VISIBLE);
        binding.tvErrorMessage.setText(msg);
    }

    private String formatScore(Double score) {
        if (score == null) return "Not Assessed";
        return String.format(java.util.Locale.US, "%.0f%%", score);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
