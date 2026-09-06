package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.google.android.material.chip.Chip;
import com.kgap.intel.R;
import com.kgap.intel.databinding.LayoutMentorshipRequestBottomSheetBinding;
import com.kgap.intel.models.MentorshipRequest;
import com.kgap.intel.repository.MentorshipRequestRepository;
import com.kgap.intel.utils.SharedPrefManager;

public class MentorshipRequestBottomSheet extends BottomSheetDialogFragment {
    private static final String ARG_MENTOR_NAME = "mentor_name";
    private static final String ARG_MENTOR_ID = "mentor_id";
    private LayoutMentorshipRequestBottomSheetBinding binding;
    private MentorshipRequestRepository repository;
    private Long mentorId;

    public static MentorshipRequestBottomSheet newInstance(String mentorName, Long mentorId) {
        MentorshipRequestBottomSheet fragment = new MentorshipRequestBottomSheet();
        Bundle args = new Bundle();
        args.putString(ARG_MENTOR_NAME, mentorName);
        args.putLong(ARG_MENTOR_ID, mentorId);
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
        repository = new MentorshipRequestRepository(requireContext());

        String mentorName = "Michael Chen";
        if (getArguments() != null) {
            mentorName = getArguments().getString(ARG_MENTOR_NAME);
            mentorId = getArguments().getLong(ARG_MENTOR_ID);
        }
        binding.tvMentorHeader.setText("with " + mentorName);

        setupForm();

        binding.btnSend.setOnClickListener(v -> sendRequest());

        binding.btnClose.setOnClickListener(v -> dismiss());
    }

    private void sendRequest() {
        String reason = binding.actReason.getText().toString();
        String goal = binding.etGoal.getText() != null ? binding.etGoal.getText().toString().trim() : "";
        String message = binding.etMessage.getText() != null ? binding.etMessage.getText().toString().trim() : "";

        if (reason.isEmpty() || goal.isEmpty()) {
            Toast.makeText(getContext(), "Please select a reason and enter your goal", Toast.LENGTH_SHORT).show();
            return;
        }

        Long menteeId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (menteeId == -1L) {
            Toast.makeText(getContext(), "User not logged in", Toast.LENGTH_SHORT).show();
            return;
        }

        MentorshipRequest request = new MentorshipRequest();
        request.setMenteeId(menteeId);
        request.setMentorId(mentorId);
        request.setLearningGoal(goal);
        request.setMessage(message);
        // skillId could be derived from selected chips if needed, but for now we focus on basic request

        binding.btnSend.setEnabled(false);
        repository.sendRequestWithCallback(request, new MentorshipRequestRepository.RequestCallback<MentorshipRequest>() {
            @Override
            public void onSuccess(MentorshipRequest response) {
                if (!isAdded()) return;
                binding.btnSend.setEnabled(true);
                binding.layoutRequestForm.setVisibility(View.GONE);
                binding.layoutSuccess.setVisibility(View.VISIBLE);
                String mentorName = getArguments() != null ? getArguments().getString(ARG_MENTOR_NAME) : "Peer Employee";
                binding.tvSuccessMsg.setText("Your mentorship request has been sent to " + mentorName + ". You will be notified once they accept.");
            }

            @Override
            public void onError(String errorMessage) {
                if (!isAdded()) return;
                binding.btnSend.setEnabled(true);
                Toast.makeText(getContext(), errorMessage, Toast.LENGTH_LONG).show();
            }
        });
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
