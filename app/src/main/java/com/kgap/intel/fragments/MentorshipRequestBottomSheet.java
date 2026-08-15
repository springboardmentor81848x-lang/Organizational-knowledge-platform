package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.google.android.material.chip.Chip;
import com.kgap.intel.R;
import com.kgap.intel.databinding.LayoutMentorshipRequestBottomSheetBinding;

public class MentorshipRequestBottomSheet extends BottomSheetDialogFragment {
    private static final String ARG_MENTOR_NAME = "mentor_name";
    private LayoutMentorshipRequestBottomSheetBinding binding;

    public static MentorshipRequestBottomSheet newInstance(String mentorName) {
        MentorshipRequestBottomSheet fragment = new MentorshipRequestBottomSheet();
        Bundle args = new Bundle();
        args.putString(ARG_MENTOR_NAME, mentorName);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = LayoutMentorshipRequestBottomSheetBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String mentorName = getArguments() != null ? getArguments().getString(ARG_MENTOR_NAME) : "Michael Chen";
        binding.tvMentorHeader.setText("with " + mentorName);

        setupForm();

        binding.btnSend.setOnClickListener(v -> {
            binding.layoutRequestForm.setVisibility(View.GONE);
            binding.layoutSuccess.setVisibility(View.VISIBLE);
            binding.tvSuccessMsg.setText("Your request has been sent to " + mentorName + ". You will be notified once they respond.");
        });

        binding.btnClose.setOnClickListener(v -> dismiss());
    }

    private void setupForm() {
        // Reasons dropdown
        String[] reasons = {"Career Guidance", "Technical Skills", "Project Review", "Leadership Coaching"};
        ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, reasons);
        binding.actReason.setAdapter(adapter);

        // Skills chips
        String[] skills = {"Python", "System Design", "Microservices", "Cloud", "Java"};
        for (String skill : skills) {
            Chip chip = new Chip(requireContext());
            chip.setText(skill);
            chip.setCheckable(true);
            binding.cgSkills.addView(chip);
        }
    }

    @Override
    public int getTheme() {
        return R.style.Theme_KGapIntel; // Ensure standard theme is used or a custom BS theme
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
