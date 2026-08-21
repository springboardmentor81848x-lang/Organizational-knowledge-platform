package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.LayoutExpertProfileBottomSheetBinding;
import com.kgap.intel.models.ExpertItem;

public class ExpertProfileBottomSheet extends BottomSheetDialogFragment {
    private static final String ARG_EXPERT = "arg_expert";
    private LayoutExpertProfileBottomSheetBinding binding;
    private ExpertItem expertItem;

    public static ExpertProfileBottomSheet newInstance(ExpertItem expert) {
        ExpertProfileBottomSheet fragment = new ExpertProfileBottomSheet();
        Bundle args = new Bundle();
        args.putSerializable(ARG_EXPERT, expert);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = LayoutExpertProfileBottomSheetBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        if (getArguments() != null) {
            expertItem = (ExpertItem) getArguments().getSerializable(ARG_EXPERT);
        }

        if (expertItem != null) {
            binding.tvExpertName.setText(expertItem.getExpertName());
            binding.tvExpertRole.setText(expertItem.getRole());
            binding.tvExpertDepartment.setText("Department: " + expertItem.getDepartment());
            binding.tvExpertSkill.setText(expertItem.getSkillName());
            binding.tvProficiency.setText(expertItem.getProficiency());
            binding.tvExpertBio.setText(expertItem.getBio().isEmpty() ? 
                    "Subject matter expert available for internal technical consultations and domain guidance." : 
                    expertItem.getBio());

            String role = expertItem.getRole();
            boolean isMentorEligible = "EMPLOYEE".equalsIgnoreCase(role) || "MENTOR".equalsIgnoreCase(role);
            if (isMentorEligible) {
                binding.btnRequestMentorship.setVisibility(View.VISIBLE);
                binding.btnRequestMentorship.setOnClickListener(v -> {
                    dismiss();
                    MentorshipRequestBottomSheet bottomSheet = MentorshipRequestBottomSheet.newInstance(expertItem.getExpertName(), expertItem.getEmployeeId());
                    bottomSheet.show(getParentFragmentManager(), "MentorshipRequest");
                });
            } else {
                binding.btnRequestMentorship.setVisibility(View.GONE);
            }
        }

        binding.btnClose.setOnClickListener(v -> dismiss());
    }

    @Override
    public int getTheme() {
        return R.style.Theme_KGapIntel;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
