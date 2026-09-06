package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.databinding.FragmentKnowledgeSessionDetailsBinding;
import com.kgap.intel.models.KnowledgeSession;
import com.kgap.intel.models.KnowledgeSessionRegistration;
import com.kgap.intel.repository.KnowledgeSessionRepository;
import com.kgap.intel.utils.SharedPrefManager;

public class KnowledgeSessionDetailsFragment extends Fragment {
    private static final String ARG_SESSION = "session";
    private FragmentKnowledgeSessionDetailsBinding binding;
    private KnowledgeSessionRepository repository;
    private KnowledgeSession session;
    private KnowledgeSessionRegistration currentRegistration;
    private Long loggedInEmployeeId;

    public static KnowledgeSessionDetailsFragment newInstance(KnowledgeSession session) {
        KnowledgeSessionDetailsFragment fragment = new KnowledgeSessionDetailsFragment();
        Bundle args = new Bundle();
        args.putSerializable(ARG_SESSION, session);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentKnowledgeSessionDetailsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        repository = new KnowledgeSessionRepository(requireContext());
        loggedInEmployeeId = SharedPrefManager.getInstance(requireContext()).getUserId();

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        if (getArguments() != null) {
            session = (KnowledgeSession) getArguments().getSerializable(ARG_SESSION);
            if (session != null) {
                displaySession(session);
                checkRegistrationState();
            }
        }
    }

    private void displaySession(KnowledgeSession session) {
        binding.tvSessionTitle.setText(session.getTitle());
        binding.tvSessionTopic.setText(session.getTopic());
        binding.tvSessionDescription.setText(session.getDescription());
        binding.tvSessionStatus.setText(session.getStatus());
        
        String scheduledAt = session.getScheduledAt();
        if (scheduledAt != null && scheduledAt.contains("T")) {
            String[] parts = scheduledAt.split("T");
            binding.tvSessionDate.setText(parts[0]);
            binding.tvSessionTime.setText(parts[1].length() >= 5 ? parts[1].substring(0, 5) : parts[1]);
        }

        binding.tvSessionLink.setText(session.getMeetingLink() != null ? session.getMeetingLink() : "N/A");
        binding.tvSessionCapacity.setText(session.getMaxParticipants() != null ? String.valueOf(session.getMaxParticipants()) : "No Limit");
        binding.tvSessionCreator.setText("Employee ID: " + session.getCreatedByEmployeeId());
    }

    private void checkRegistrationState() {
        if (session == null || session.getId() == null) return;

        hideAllActionControls();
        binding.progressBar.setVisibility(View.VISIBLE);

        repository.getUserRegistrations(loggedInEmployeeId).observe(getViewLifecycleOwner(), registrations -> {
            binding.progressBar.setVisibility(View.GONE);

            currentRegistration = null;
            if (registrations != null) {
                for (KnowledgeSessionRegistration reg : registrations) {
                    if (session.getId().equals(reg.getSessionId())) {
                        currentRegistration = reg;
                        // Prefer active (REGISTERED / Attended) over CANCELLED
                        if (!"CANCELLED".equalsIgnoreCase(reg.getStatus())) {
                            break;
                        }
                    }
                }
            }

            updateUiForRegistrationState();
        });
    }

    private void updateUiForRegistrationState() {
        hideAllActionControls();

        if (currentRegistration == null || "CANCELLED".equalsIgnoreCase(currentRegistration.getStatus())) {
            // State 1: Not Registered (or Cancelled) -> Show Register button
            binding.btnRegister.setVisibility(View.VISIBLE);
            binding.btnRegister.setEnabled(true);
            binding.btnRegister.setOnClickListener(v -> performRegistration());
        } else if (currentRegistration.getAttended()) {
            // State 3: Attended -> Show Attended Badge & Submit Feedback
            binding.layoutAttendedActions.setVisibility(View.VISIBLE);
            binding.btnSubmitFeedback.setOnClickListener(v -> openFeedbackSheet());
        } else {
            // State 2: Registered (Not Attended yet) -> Show Join/Attend & Cancel buttons
            binding.layoutRegisteredActions.setVisibility(View.VISIBLE);
            binding.btnJoinSession.setEnabled(true);
            binding.btnCancelRegistration.setEnabled(true);

            binding.btnJoinSession.setOnClickListener(v -> performMarkAttendance());
            binding.btnCancelRegistration.setOnClickListener(v -> performCancelRegistration());
        }
    }

    private void performRegistration() {
        if (session == null || session.getId() == null) return;

        binding.btnRegister.setEnabled(false);
        binding.progressBar.setVisibility(View.VISIBLE);

        repository.registerForSession(session.getId(), loggedInEmployeeId).observe(getViewLifecycleOwner(), reg -> {
            binding.progressBar.setVisibility(View.GONE);
            if (reg != null) {
                Toast.makeText(getContext(), "Registered for session successfully!", Toast.LENGTH_SHORT).show();
                checkRegistrationState();
            } else {
                binding.btnRegister.setEnabled(true);
                Toast.makeText(getContext(), "Registration failed. Check backend connection.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void performCancelRegistration() {
        if (currentRegistration == null || currentRegistration.getId() == null) return;

        binding.btnCancelRegistration.setEnabled(false);
        binding.btnJoinSession.setEnabled(false);
        binding.progressBar.setVisibility(View.VISIBLE);

        repository.cancelRegistration(currentRegistration.getId()).observe(getViewLifecycleOwner(), reg -> {
            binding.progressBar.setVisibility(View.GONE);
            if (reg != null) {
                Toast.makeText(getContext(), "Registration cancelled.", Toast.LENGTH_SHORT).show();
                checkRegistrationState();
            } else {
                binding.btnCancelRegistration.setEnabled(true);
                binding.btnJoinSession.setEnabled(true);
                Toast.makeText(getContext(), "Failed to cancel registration.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void performMarkAttendance() {
        if (currentRegistration == null || currentRegistration.getId() == null) return;

        binding.btnJoinSession.setEnabled(false);
        binding.btnCancelRegistration.setEnabled(false);
        binding.progressBar.setVisibility(View.VISIBLE);

        repository.markAttendance(currentRegistration.getId()).observe(getViewLifecycleOwner(), reg -> {
            binding.progressBar.setVisibility(View.GONE);
            if (reg != null && reg.getAttended()) {
                Toast.makeText(getContext(), "Attendance recorded! Welcome to the session.", Toast.LENGTH_SHORT).show();
                checkRegistrationState();
            } else {
                binding.btnJoinSession.setEnabled(true);
                binding.btnCancelRegistration.setEnabled(true);
                Toast.makeText(getContext(), "Failed to record attendance.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void openFeedbackSheet() {
        if (session == null || session.getId() == null) return;
        SessionFeedbackBottomSheet sheet = SessionFeedbackBottomSheet.newInstance(session.getId());
        sheet.setFeedbackListener(this::checkRegistrationState);
        sheet.show(getChildFragmentManager(), "SessionFeedback");
    }

    private void hideAllActionControls() {
        binding.btnRegister.setVisibility(View.GONE);
        binding.layoutRegisteredActions.setVisibility(View.GONE);
        binding.layoutAttendedActions.setVisibility(View.GONE);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
