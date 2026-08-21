package com.kgap.intel.fragments;

import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.MilestoneAdapter;
import com.kgap.intel.databinding.FragmentAchievementsBinding;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.models.MilestoneItem;
import com.kgap.intel.models.TrainingEnrollment;
import com.kgap.intel.repository.LearningPathRepository;
import com.kgap.intel.repository.TrainingRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class AchievementsFragment extends Fragment {

    private FragmentAchievementsBinding binding;
    private LearningPathRepository learningPathRepository;
    private TrainingRepository trainingRepository;
    private MilestoneAdapter milestoneAdapter;
    private Long loggedInEmployeeId;

    private List<LearningPathResponse> loadedPaths = null;
    private List<TrainingEnrollment> loadedEnrollments = null;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAchievementsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Context context = requireContext();
        learningPathRepository = new LearningPathRepository(context);
        trainingRepository = new TrainingRepository(context);
        loggedInEmployeeId = SharedPrefManager.getInstance(context).getUserId();

        binding.toolbar.setNavigationOnClickListener(v -> {
            if (getParentFragmentManager() != null) {
                getParentFragmentManager().popBackStack();
            }
        });

        setupRecyclerView();
        loadRealData();
    }

    private void setupRecyclerView() {
        milestoneAdapter = new MilestoneAdapter();
        binding.rvMilestones.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvMilestones.setAdapter(milestoneAdapter);
    }

    private void loadRealData() {
        if (loggedInEmployeeId == null || loggedInEmployeeId <= 0) {
            showError("User session not found. Please log in again.");
            return;
        }

        binding.pbLoadingMilestones.setVisibility(View.VISIBLE);
        binding.tvErrorMilestones.setVisibility(View.GONE);
        binding.layoutEmptyMilestones.setVisibility(View.GONE);
        binding.rvMilestones.setVisibility(View.GONE);

        // 1. Load learning paths from backend
        learningPathRepository.getLearningPaths(loggedInEmployeeId).observe(getViewLifecycleOwner(), paths -> {
            loadedPaths = paths != null ? paths : new ArrayList<>();
            checkAndAggregateData();
        });

        // 2. Load training enrollments from backend
        trainingRepository.getEmployeeEnrollments(loggedInEmployeeId).observe(getViewLifecycleOwner(), enrollments -> {
            loadedEnrollments = enrollments != null ? enrollments : new ArrayList<>();
            checkAndAggregateData();
        });
    }

    private void checkAndAggregateData() {
        if (loadedPaths == null || loadedEnrollments == null) {
            // Still waiting for one of the asynchronous calls
            return;
        }

        binding.pbLoadingMilestones.setVisibility(View.GONE);

        int startedCount = 0;
        int completedCount = 0;
        int inProgressCount = 0;
        int totalHours = 0;

        List<MilestoneItem> milestoneItems = new ArrayList<>();

        // Process Learning Paths
        for (LearningPathResponse path : loadedPaths) {
            int progress = path.getCompletionPercentage() != null ? path.getCompletionPercentage() : 0;
            String status = path.getStatus() != null ? path.getStatus().toUpperCase() : "NOT_STARTED";
            int hours = path.getEstimatedHours() != null ? path.getEstimatedHours() : 10;

            if ("COMPLETED".equals(status) || progress >= 100) {
                completedCount++;
                startedCount++;
                totalHours += hours;

                String title = "Completed " + (path.getCourseTitle() != null ? path.getCourseTitle() : (path.getSkillName() + " Course"));
                String desc = "Skill: " + (path.getSkillName() != null ? path.getSkillName() : "General") + " • " + hours + " Hours";
                milestoneItems.add(new MilestoneItem(title, desc, "COMPLETED", 100, null, true));
            } else if ("IN_PROGRESS".equals(status) || progress > 0) {
                inProgressCount++;
                startedCount++;
                totalHours += (int) (hours * (progress / 100.0));

                String title = path.getCourseTitle() != null ? path.getCourseTitle() : (path.getSkillName() + " Course");
                String desc = "Skill: " + (path.getSkillName() != null ? path.getSkillName() : "General") + " • Target: " + (path.getTargetLevel() != null ? path.getTargetLevel() : "Mastery");
                milestoneItems.add(new MilestoneItem(title, desc, "IN_PROGRESS", progress, null, false));
            }
        }

        // Process Training Enrollments
        for (TrainingEnrollment enrollment : loadedEnrollments) {
            String status = enrollment.getStatus() != null ? enrollment.getStatus().toUpperCase() : "ENROLLED";
            if ("CANCELLED".equals(status)) {
                continue;
            }

            int progress = enrollment.getProgressPercentage() != null ? enrollment.getProgressPercentage() : 0;
            String dateFormatted = formatDateString(enrollment.getCompletedAt() != null ? enrollment.getCompletedAt() : enrollment.getEnrolledAt());

            if ("COMPLETED".equals(status) || progress >= 100) {
                // Avoid double counting if already present in paths
                boolean alreadyInPaths = false;
                for (LearningPathResponse p : loadedPaths) {
                    if (p.getCourseTitle() != null && p.getCourseTitle().contains(String.valueOf(enrollment.getTrainingId()))) {
                        alreadyInPaths = true;
                        break;
                    }
                }
                if (!alreadyInPaths) {
                    completedCount++;
                    startedCount++;
                    String title = "Training Course #" + enrollment.getTrainingId() + " Completed";
                    milestoneItems.add(new MilestoneItem(title, "Enrolled Training Course", "COMPLETED", 100, dateFormatted, true));
                }
            } else if ("IN_PROGRESS".equals(status) || progress > 0) {
                String title = "Training Course #" + enrollment.getTrainingId();
                milestoneItems.add(new MilestoneItem(title, "Enrolled Training Course", "IN_PROGRESS", progress, dateFormatted, false));
            }
        }

        // 1. Update Hero Level & Rank
        updateHeroCard(completedCount, inProgressCount, totalHours);

        // 2. Update Badges
        updateBadges(startedCount, completedCount);

        // 3. Update Milestones List
        if (milestoneItems.isEmpty()) {
            binding.layoutEmptyMilestones.setVisibility(View.VISIBLE);
            binding.rvMilestones.setVisibility(View.GONE);
        } else {
            binding.layoutEmptyMilestones.setVisibility(View.GONE);
            binding.rvMilestones.setVisibility(View.VISIBLE);
            // Sort so completed items are prioritized
            Collections.sort(milestoneItems, (a, b) -> Boolean.compare(b.isCompleted(), a.isCompleted()));
            milestoneAdapter.setItems(milestoneItems);
        }
    }

    private void updateHeroCard(int completedCount, int inProgressCount, int totalHours) {
        int level;
        String rankLabel;

        if (completedCount >= 10) {
            level = 5;
            rankLabel = "Knowledge Guru";
        } else if (completedCount >= 5) {
            level = 4;
            rankLabel = "Advanced Learner";
        } else if (completedCount >= 3) {
            level = 3;
            rankLabel = "Skilled Learner";
        } else if (completedCount >= 1) {
            level = 2;
            rankLabel = "Learner";
        } else {
            level = 1;
            rankLabel = "Getting Started";
        }

        binding.tvHeroRank.setText(rankLabel);
        String levelDetail = "Level " + level + " • " + completedCount + " Completed • " + inProgressCount + " In Progress";
        if (totalHours > 0) {
            levelDetail += " • " + totalHours + "h";
        }
        binding.tvHeroLevel.setText(levelDetail);
    }

    private void updateBadges(int startedCount, int completedCount) {
        Context context = getContext();
        if (context == null) return;

        int emeraldColor = ContextCompat.getColor(context, R.color.primary_emerald);
        int grayColor = ContextCompat.getColor(context, R.color.gray_500);

        // Badge 1: First Step (Start 1 Course)
        boolean badge1Unlocked = startedCount >= 1;
        binding.ivBadge1.setAlpha(badge1Unlocked ? 1.0f : 0.35f);
        binding.tvBadge1Status.setText(badge1Unlocked ? "✓ Unlocked" : "Start 1 Course");
        binding.tvBadge1Status.setTextColor(badge1Unlocked ? emeraldColor : grayColor);

        // Badge 2: Skill Master (Complete 1 Course)
        boolean badge2Unlocked = completedCount >= 1;
        binding.ivBadge2.setAlpha(badge2Unlocked ? 1.0f : 0.35f);
        binding.tvBadge2Status.setText(badge2Unlocked ? "✓ Unlocked" : "Complete 1 Course");
        binding.tvBadge2Status.setTextColor(badge2Unlocked ? emeraldColor : grayColor);

        // Badge 3: Learning Explorer (Start 3 Courses)
        boolean badge3Unlocked = startedCount >= 3;
        binding.ivBadge3.setAlpha(badge3Unlocked ? 1.0f : 0.35f);
        binding.tvBadge3Status.setText(badge3Unlocked ? "✓ Unlocked" : "(" + startedCount + "/3 Started)");
        binding.tvBadge3Status.setTextColor(badge3Unlocked ? emeraldColor : grayColor);

        // Badge 4: Completion Champion (Complete 3 Courses)
        boolean badge4Unlocked = completedCount >= 3;
        binding.ivBadge4.setAlpha(badge4Unlocked ? 1.0f : 0.35f);
        binding.tvBadge4Status.setText(badge4Unlocked ? "✓ Unlocked" : "(" + completedCount + "/3 Completed)");
        binding.tvBadge4Status.setTextColor(badge4Unlocked ? emeraldColor : grayColor);
    }

    private String formatDateString(String isoDate) {
        if (isoDate == null || isoDate.trim().isEmpty()) {
            return null;
        }
        try {
            if (isoDate.contains("T")) {
                return isoDate.split("T")[0];
            }
            return isoDate;
        } catch (Exception e) {
            return null;
        }
    }

    private void showError(String message) {
        binding.pbLoadingMilestones.setVisibility(View.GONE);
        binding.tvErrorMilestones.setVisibility(View.VISIBLE);
        binding.tvErrorMilestones.setText(message);
        binding.rvMilestones.setVisibility(View.GONE);
        binding.layoutEmptyMilestones.setVisibility(View.GONE);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
