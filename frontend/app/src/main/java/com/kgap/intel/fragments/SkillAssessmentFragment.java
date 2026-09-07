package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.RadioButton;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.R;
import com.kgap.intel.api.AssessmentApiService;
import com.kgap.intel.databinding.FragmentSkillAssessmentBinding;
import com.kgap.intel.models.AssessmentQuestion;
import com.kgap.intel.models.AssessmentSubmission;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.AssessmentViewModel;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class SkillAssessmentFragment extends Fragment {
    private static final String ARG_SKILL_ID = "skill_id";
    private static final String ARG_SKILL_NAME = "skill_name";
    private static final String ARG_TARGET_EMPLOYEE_ID = "target_employee_id";
    private static final String ARG_TARGET_EMPLOYEE_NAME = "target_employee_name";
    private static final String ARG_ASSESSMENT_TYPE = "assessment_type";

    private FragmentSkillAssessmentBinding binding;
    private AssessmentViewModel viewModel;
    private String skillId;
    private String skillName;
    private Long targetEmployeeId;
    private String targetEmployeeName;
    private String assessmentType = "SELF";
    
    private List<AssessmentQuestion> questionList;
    private int currentQuestionIndex = 0;
    private final Map<Long, String> selectedAnswers = new HashMap<>();

    public static SkillAssessmentFragment newInstance(String skillId, String skillName) {
        return newInstance(skillId, skillName, null, null, "SELF");
    }

    public static SkillAssessmentFragment newInstance(String skillId, String skillName, Long targetEmployeeId, String targetEmployeeName) {
        return newInstance(skillId, skillName, targetEmployeeId, targetEmployeeName, "PEER");
    }

    public static SkillAssessmentFragment newInstance(String skillId, String skillName, Long targetEmployeeId, String targetEmployeeName, String assessmentType) {
        SkillAssessmentFragment fragment = new SkillAssessmentFragment();
        Bundle args = new Bundle();
        args.putString(ARG_SKILL_ID, skillId);
        args.putString(ARG_SKILL_NAME, skillName);
        args.putString(ARG_ASSESSMENT_TYPE, assessmentType != null ? assessmentType : "SELF");
        if (targetEmployeeId != null) {
            args.putLong(ARG_TARGET_EMPLOYEE_ID, targetEmployeeId);
            args.putString(ARG_TARGET_EMPLOYEE_NAME, targetEmployeeName);
        }
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            skillId = getArguments().getString(ARG_SKILL_ID);
            skillName = getArguments().getString(ARG_SKILL_NAME);
            assessmentType = getArguments().getString(ARG_ASSESSMENT_TYPE, "SELF");
            if (getArguments().containsKey(ARG_TARGET_EMPLOYEE_ID)) {
                targetEmployeeId = getArguments().getLong(ARG_TARGET_EMPLOYEE_ID);
                targetEmployeeName = getArguments().getString(ARG_TARGET_EMPLOYEE_NAME);
            }
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSkillAssessmentBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(AssessmentViewModel.class);

        if ("MANAGER".equalsIgnoreCase(assessmentType) && targetEmployeeName != null) {
            binding.toolbar.setTitle("Manager Assessment: " + targetEmployeeName);
            binding.toolbar.setSubtitle("Skill: " + skillName);
        } else if ("PEER".equalsIgnoreCase(assessmentType) && targetEmployeeName != null) {
            binding.toolbar.setTitle("Peer Assessment: " + targetEmployeeName);
            binding.toolbar.setSubtitle("Skill: " + skillName);
        } else {
            binding.toolbar.setTitle("Self Assessment: " + skillName);
        }
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        observeViewModel();
        
        if (skillId != null) {
            viewModel.loadQuestions(skillId, assessmentType);
        }

        binding.btnNext.setOnClickListener(v -> handleNext());
        binding.btnPrevious.setOnClickListener(v -> handlePrevious());
    }

    private void observeViewModel() {
        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            binding.pbLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
            binding.cardQuestion.setVisibility(loading ? View.GONE : View.VISIBLE);
            binding.btnNext.setVisibility(loading ? View.GONE : View.VISIBLE);
        });

        viewModel.getQuestions().observe(getViewLifecycleOwner(), questions -> {
            if (questions != null && !questions.isEmpty()) {
                questionList = questions;
                showQuestion(0);
            } else if (questions != null) {
                Toast.makeText(getContext(), "No questions found for " + skillName, Toast.LENGTH_LONG).show();
                getParentFragmentManager().popBackStack();
            }
        });

        viewModel.getAssessmentResult().observe(getViewLifecycleOwner(), result -> {
            if (result != null) {
                navigateToResult(result);
            }
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                String displayError = error;
                if (error.contains("400")) {
                    displayError = "No assessment has been created for this skill yet. Please contact your L&D Admin.";
                }
                Toast.makeText(getContext(), displayError, Toast.LENGTH_LONG).show();
                getParentFragmentManager().popBackStack();
            }
        });
    }

    private void navigateToResult(AssessmentApiService.AssessmentResult result) {
        Long currentUserId = SharedPrefManager.getInstance(getContext()).getUserId();
        if (currentUserId == null || currentUserId <= 0) {
            currentUserId = 1L;
        }
        Long targetId = targetEmployeeId != null ? targetEmployeeId : currentUserId;
        com.kgap.intel.repository.NotificationRepository notifRepo = new com.kgap.intel.repository.NotificationRepository(requireContext());

        if ("PEER".equalsIgnoreCase(assessmentType)) {
            notifRepo.createNotification(
                    targetId,
                    "ASSESSMENT_REMINDER",
                    "🎉 Peer assessment completed for " + skillName + " (" + Math.round(result.getScore()) + "%). Combined proficiency updated to " + result.getLevel() + "!"
            );
            if (!currentUserId.equals(targetId)) {
                notifRepo.createNotification(
                        currentUserId,
                        "ACHIEVEMENT",
                        "✅ You successfully submitted a Peer Assessment for " + (targetEmployeeName != null ? targetEmployeeName : "peer") + " on " + skillName + " (" + Math.round(result.getScore()) + "%)."
                );
            }
        } else if ("MANAGER".equalsIgnoreCase(assessmentType)) {
            notifRepo.createNotification(
                    targetId,
                    "ASSESSMENT_REMINDER",
                    "📋 Manager assessment submitted for " + skillName + " (" + Math.round(result.getScore()) + "%). Combined proficiency updated to " + result.getLevel() + "!"
            );
            if (!currentUserId.equals(targetId)) {
                notifRepo.createNotification(
                        currentUserId,
                        "ACHIEVEMENT",
                        "✅ You successfully submitted a Manager Assessment for " + (targetEmployeeName != null ? targetEmployeeName : "employee") + " on " + skillName + " (" + Math.round(result.getScore()) + "%)."
                );
            }
        } else {
            notifRepo.createNotification(
                    currentUserId,
                    "ACHIEVEMENT",
                    "🎉 Self assessment completed for " + skillName + " (" + Math.round(result.getScore()) + "%). Proficiency level: " + result.getLevel() + "!"
            );
        }

        AssessmentResultFragment resultFragment = AssessmentResultFragment.newInstance(
                skillName,
                result.getScore(),
                result.getLevel(),
                result.getCorrectAnswers(),
                result.getTotalQuestions(),
                skillId,
                targetId
        );

        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, resultFragment)
                .commit();
    }

    private void showQuestion(int index) {
        currentQuestionIndex = index;
        AssessmentQuestion q = questionList.get(index);
        binding.tvQuestionNumber.setText("Question " + (index + 1) + " of " + questionList.size());
        binding.tvQuestionText.setText(q.getQuestionText());
        
        binding.rgOptions.removeAllViews();
        List<String> options = q.getOptions();
        for (int i = 0; i < options.size(); i++) {
            RadioButton rb = new RadioButton(getContext());
            String optionText = options.get(i);
            rb.setText(optionText);
            rb.setId(i);
            rb.setPadding(0, 16, 0, 16);
            binding.rgOptions.addView(rb);
            
            String selectedChoice = selectedAnswers.get(q.getId());
            char expectedChar = (char) ('A' + i);
            if (selectedChoice != null && selectedChoice.equalsIgnoreCase(String.valueOf(expectedChar))) {
                rb.setChecked(true);
            }
        }

        binding.btnPrevious.setVisibility(index > 0 ? View.VISIBLE : View.GONE);
        binding.btnNext.setText(index == questionList.size() - 1 ? "Submit" : "Next");
        
        int progress = (int) (((float) (index + 1) / questionList.size()) * 100);
        binding.progressIndicator.setProgress(progress);
    }

    private void handleNext() {
        int selectedId = binding.rgOptions.getCheckedRadioButtonId();
        if (selectedId == -1) {
            Toast.makeText(getContext(), "Please select an answer", Toast.LENGTH_SHORT).show();
            return;
        }

        AssessmentQuestion currentQ = questionList.get(currentQuestionIndex);
        char choiceLetter = (char) ('A' + selectedId);
        selectedAnswers.put(currentQ.getId(), String.valueOf(choiceLetter));

        if (currentQuestionIndex < questionList.size() - 1) {
            showQuestion(currentQuestionIndex + 1);
        } else {
            submitAssessment();
        }
    }

    private void handlePrevious() {
        if (currentQuestionIndex > 0) {
            showQuestion(currentQuestionIndex - 1);
        }
    }

    private void submitAssessment() {
        Long employeeId = targetEmployeeId != null ? targetEmployeeId : SharedPrefManager.getInstance(getContext()).getUserId();
        if (questionList == null || questionList.isEmpty()) return;

        Long assessmentId = questionList.get(0).getAssessmentId();
        
        List<AssessmentSubmission.Answer> answers = new ArrayList<>();
        for (Map.Entry<Long, String> entry : selectedAnswers.entrySet()) {
            answers.add(new AssessmentSubmission.Answer(entry.getKey(), entry.getValue()));
        }

        AssessmentSubmission submission = new AssessmentSubmission(employeeId, answers, assessmentType);
        viewModel.submitAssessment(assessmentId, submission);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
