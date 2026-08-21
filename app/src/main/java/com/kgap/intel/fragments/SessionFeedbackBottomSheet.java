package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.LayoutSessionFeedbackBottomSheetBinding;
import com.kgap.intel.repository.KnowledgeSessionRepository;
import com.kgap.intel.utils.SharedPrefManager;

public class SessionFeedbackBottomSheet extends BottomSheetDialogFragment {
    private static final String ARG_SESSION_ID = "arg_session_id";
    private LayoutSessionFeedbackBottomSheetBinding binding;
    private KnowledgeSessionRepository repository;
    private Long sessionId;
    private FeedbackListener listener;

    public interface FeedbackListener {
        void onFeedbackSubmitted();
    }

    public static SessionFeedbackBottomSheet newInstance(Long sessionId) {
        SessionFeedbackBottomSheet fragment = new SessionFeedbackBottomSheet();
        Bundle args = new Bundle();
        args.putLong(ARG_SESSION_ID, sessionId);
        fragment.setArguments(args);
        return fragment;
    }

    public void setFeedbackListener(FeedbackListener listener) {
        this.listener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = LayoutSessionFeedbackBottomSheetBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        repository = new KnowledgeSessionRepository(requireContext());

        if (getArguments() != null) {
            sessionId = getArguments().getLong(ARG_SESSION_ID);
        }

        binding.btnClose.setOnClickListener(v -> dismiss());
        binding.btnSubmitFeedback.setOnClickListener(v -> submitFeedback());
    }

    private void submitFeedback() {
        int rating = (int) binding.ratingBar.getRating();
        String comments = binding.etFeedbackComments.getText() != null ? 
                binding.etFeedbackComments.getText().toString().trim() : "";

        if (rating < 1) {
            Toast.makeText(getContext(), "Please select a rating (1 to 5 stars)", Toast.LENGTH_SHORT).show();
            return;
        }

        Long employeeId = SharedPrefManager.getInstance(requireContext()).getUserId();

        binding.btnSubmitFeedback.setEnabled(false);
        binding.progressBar.setVisibility(View.VISIBLE);

        repository.submitFeedback(sessionId, employeeId, rating, comments).observe(getViewLifecycleOwner(), feedback -> {
            binding.btnSubmitFeedback.setEnabled(true);
            binding.progressBar.setVisibility(View.GONE);

            if (feedback != null) {
                Toast.makeText(getContext(), "Thank you! Feedback submitted.", Toast.LENGTH_SHORT).show();
                if (listener != null) {
                    listener.onFeedbackSubmitted();
                }
                dismiss();
            } else {
                Toast.makeText(getContext(), "Failed to submit feedback. Please try again.", Toast.LENGTH_SHORT).show();
            }
        });
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
