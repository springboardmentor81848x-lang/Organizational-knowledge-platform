package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentMyProgressBinding;
import com.kgap.intel.databinding.ItemActiveGoalBinding;
import com.kgap.intel.databinding.ItemActivityTimelineBinding;
import com.kgap.intel.databinding.LayoutSummaryCardCompactBinding;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.TrainingEnrollment;
import com.kgap.intel.repository.TrainingRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MyProgressFragment extends Fragment {
    private FragmentMyProgressBinding binding;
    private TrainingRepository trainingRepository;
    private Long userId;
    private final Map<Long, ExternalCourse> courseMap = new HashMap<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMyProgressBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        trainingRepository = new TrainingRepository(requireContext());
        userId = SharedPrefManager.getInstance(requireContext()).getUserId();

        loadData();
    }

    @Override
    public void onResume() {
        super.onResume();
        loadData();
    }

    private void loadData() {
        // First fetch course catalog to get real course titles
        trainingRepository.getCourses().observe(getViewLifecycleOwner(), courses -> {
            if (courses != null) {
                courseMap.clear();
                for (ExternalCourse c : courses) {
                    if (c.getId() != null) {
                        courseMap.put(c.getId(), c);
                    }
                }
            }
            // Then load user enrollments
            loadEnrollments();
        });
    }

    private void loadEnrollments() {
        trainingRepository.getEmployeeEnrollments(userId).observe(getViewLifecycleOwner(), enrollments -> {
            if (enrollments != null && !enrollments.isEmpty()) {
                setupSummaryWithEnrollments(enrollments);
                setupGoalsWithEnrollments(enrollments);
            } else {
                setupFallbackSummary();
                setupFallbackGoals();
            }
            setupTimeline();
        });
    }

    private void setupSummaryWithEnrollments(List<TrainingEnrollment> enrollments) {
        int total = enrollments.size();
        int completed = 0;
        int sumProgress = 0;

        for (TrainingEnrollment e : enrollments) {
            int p = e.getProgressPercentage() != null ? e.getProgressPercentage() : 0;
            sumProgress += p;
            if ("COMPLETED".equalsIgnoreCase(e.getStatus()) || p >= 100) {
                completed++;
            }
        }

        int avgProgress = total > 0 ? (sumProgress / total) : 0;
        binding.progressOverall.setProgress(avgProgress);
        binding.tvOverallPercentage.setText(avgProgress + "%");

        // 1. Learning Hours
        LayoutSummaryCardCompactBinding hours = LayoutSummaryCardCompactBinding.bind(binding.metricHours.getRoot());
        hours.tvCardLabel.setText("Learning Hours");
        hours.tvCardValue.setText((total * 8) + "h");
        hours.ivCardIcon.setImageResource(android.R.drawable.ic_menu_recent_history);
        hours.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        hours.ivCardIcon.setColorFilter(Color.parseColor("#1565C0"));

        // 2. Enrolled Paths
        LayoutSummaryCardCompactBinding streak = LayoutSummaryCardCompactBinding.bind(binding.metricStreak.getRoot());
        streak.tvCardLabel.setText("Enrolled Paths");
        streak.tvCardValue.setText(String.valueOf(total));
        streak.ivCardIcon.setImageResource(android.R.drawable.ic_menu_compass);
        streak.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        streak.ivCardIcon.setColorFilter(Color.parseColor("#EF6C00"));

        // 3. Completed Goals
        LayoutSummaryCardCompactBinding goals = LayoutSummaryCardCompactBinding.bind(binding.metricGoals.getRoot());
        goals.tvCardLabel.setText("Completed");
        goals.tvCardValue.setText(completed + "/" + total);
        goals.ivCardIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        goals.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        goals.ivCardIcon.setColorFilter(Color.parseColor("#7B1FA2"));

        // 4. Certifications
        LayoutSummaryCardCompactBinding courses = LayoutSummaryCardCompactBinding.bind(binding.metricCourses.getRoot());
        courses.tvCardLabel.setText("Certifications");
        courses.tvCardValue.setText(String.valueOf(completed));
        courses.ivCardIcon.setImageResource(android.R.drawable.ic_menu_view);
        courses.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        courses.ivCardIcon.setColorFilter(Color.parseColor("#2E7D32"));
    }

    private void setupFallbackSummary() {
        binding.progressOverall.setProgress(0);
        binding.tvOverallPercentage.setText("0%");

        LayoutSummaryCardCompactBinding hours = LayoutSummaryCardCompactBinding.bind(binding.metricHours.getRoot());
        hours.tvCardLabel.setText("Learning Hours");
        hours.tvCardValue.setText("0h");
        hours.ivCardIcon.setImageResource(android.R.drawable.ic_menu_recent_history);
        hours.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        hours.ivCardIcon.setColorFilter(Color.parseColor("#1565C0"));

        LayoutSummaryCardCompactBinding streak = LayoutSummaryCardCompactBinding.bind(binding.metricStreak.getRoot());
        streak.tvCardLabel.setText("Enrolled Paths");
        streak.tvCardValue.setText("0");
        streak.ivCardIcon.setImageResource(android.R.drawable.ic_menu_compass);
        streak.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        streak.ivCardIcon.setColorFilter(Color.parseColor("#EF6C00"));

        LayoutSummaryCardCompactBinding goals = LayoutSummaryCardCompactBinding.bind(binding.metricGoals.getRoot());
        goals.tvCardLabel.setText("Completed");
        goals.tvCardValue.setText("0/0");
        goals.ivCardIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        goals.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        goals.ivCardIcon.setColorFilter(Color.parseColor("#7B1FA2"));

        LayoutSummaryCardCompactBinding courses = LayoutSummaryCardCompactBinding.bind(binding.metricCourses.getRoot());
        courses.tvCardLabel.setText("Certifications");
        courses.tvCardValue.setText("0");
        courses.ivCardIcon.setImageResource(android.R.drawable.ic_menu_view);
        courses.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        courses.ivCardIcon.setColorFilter(Color.parseColor("#2E7D32"));
    }

    private void setupGoalsWithEnrollments(List<TrainingEnrollment> enrollments) {
        binding.rvActiveGoals.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvActiveGoals.setAdapter(new EnrollmentGoalAdapter(enrollments, courseMap, (enrollment, title, desc) -> {
            getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, TrainingDetailsFragment.newInstance(enrollment, title, desc))
                    .addToBackStack(null)
                    .commit();
        }));
    }

    private void setupFallbackGoals() {
        binding.rvActiveGoals.setLayoutManager(new LinearLayoutManager(getContext()));
        List<GoalMock> list = new ArrayList<>();
        list.add(new GoalMock("Master System Design", 65, "In Progress"));
        list.add(new GoalMock("AWS Solutions Architect", 40, "In Progress"));
        list.add(new GoalMock("Advanced React Patterns", 85, "In Progress"));
        binding.rvActiveGoals.setAdapter(new GoalAdapter(list));
    }

    private void setupTimeline() {
        binding.rvActivityTimeline.setLayoutManager(new LinearLayoutManager(getContext()));
        List<ActivityMock> list = new ArrayList<>();
        list.add(new ActivityMock("Completed Java Assessment", "2 hours ago", "Scored 92% in Advanced Microservices"));
        list.add(new ActivityMock("Enrolled in Cloud Security", "Yesterday", "Mentor Dr. Sarah recommended this path"));
        list.add(new ActivityMock("Knowledge Shared", "2 days ago", "Shared 'CI/CD Pipeline Best Practices' article"));
        list.add(new ActivityMock("Session Completed", "3 days ago", "System Design review with Michael Chen"));
        binding.rvActivityTimeline.setAdapter(new TimelineAdapter(list));
    }

    private static class GoalMock {
        String title, deadline; int progress;
        GoalMock(String t, int p, String d) { title = t; progress = p; deadline = d; }
    }

    private static class ActivityMock {
        String title, time, detail;
        ActivityMock(String t, String tm, String d) { title = t; time = tm; detail = d; }
    }

    private static class EnrollmentGoalAdapter extends RecyclerView.Adapter<EnrollmentGoalAdapter.ViewHolder> {
        private final List<TrainingEnrollment> list;
        private final Map<Long, ExternalCourse> courseMap;
        private final OnEnrollmentClickListener listener;

        interface OnEnrollmentClickListener {
            void onEnrollmentClick(TrainingEnrollment enrollment, String title, String description);
        }

        EnrollmentGoalAdapter(List<TrainingEnrollment> list, Map<Long, ExternalCourse> courseMap, OnEnrollmentClickListener listener) {
            this.list = list;
            this.courseMap = courseMap;
            this.listener = listener;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemActiveGoalBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            TrainingEnrollment item = list.get(pos);
            ExternalCourse course = (item.getTrainingId() != null && courseMap != null) ? courseMap.get(item.getTrainingId()) : null;

            String title = (course != null && course.getTitle() != null) ? course.getTitle() : item.getTrainingTitle();
            String desc = course != null && course.getDescription() != null ? course.getDescription() : "Course duration: " + (course != null && course.getDurationHours() != null ? course.getDurationHours() + " hours" : "Self-paced");

            h.b.tvGoalTitle.setText(title);

            String status = item.getStatus() != null ? item.getStatus().replace("_", " ") : "In Progress";
            h.b.tvGoalDeadline.setText(status);

            int progress = item.getProgressPercentage() != null ? item.getProgressPercentage() : 0;
            h.b.progressGoal.setProgress(progress);
            h.b.tvGoalPercentage.setText(progress + "%");

            View.OnClickListener clickListener = v -> {
                if (listener != null) {
                    listener.onEnrollmentClick(item, title, desc);
                }
            };

            h.b.getRoot().setOnClickListener(clickListener);
            h.itemView.setOnClickListener(clickListener);
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            final ItemActiveGoalBinding b;
            ViewHolder(ItemActiveGoalBinding b) {
                super(b.getRoot());
                this.b = b;
            }
        }
    }

    private static class GoalAdapter extends RecyclerView.Adapter<GoalAdapter.ViewHolder> {
        private final List<GoalMock> list;
        GoalAdapter(List<GoalMock> list) { this.list = list; }
        @NonNull @Override public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemActiveGoalBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }
        @Override public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            GoalMock item = list.get(pos);
            h.b.tvGoalTitle.setText(item.title);
            h.b.tvGoalDeadline.setText(item.deadline);
            h.b.progressGoal.setProgress(item.progress);
            h.b.tvGoalPercentage.setText(item.progress + "%");
        }
        @Override public int getItemCount() { return list.size(); }
        static class ViewHolder extends RecyclerView.ViewHolder {
            final ItemActiveGoalBinding b;
            ViewHolder(ItemActiveGoalBinding b) { super(b.getRoot()); this.b = b; }
        }
    }

    private static class TimelineAdapter extends RecyclerView.Adapter<TimelineAdapter.ViewHolder> {
        private final List<ActivityMock> list;
        TimelineAdapter(List<ActivityMock> list) { this.list = list; }
        @NonNull @Override public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemActivityTimelineBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }
        @Override public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            ActivityMock item = list.get(pos);
            h.b.tvActivityTitle.setText(item.title);
            h.b.tvActivityTime.setText(item.time);
            h.b.tvActivityDetail.setText(item.detail);
            if (pos == list.size() - 1) h.b.timelineLine.setVisibility(View.GONE);
        }
        @Override public int getItemCount() { return list.size(); }
        static class ViewHolder extends RecyclerView.ViewHolder {
            final ItemActivityTimelineBinding b;
            ViewHolder(ItemActivityTimelineBinding b) { super(b.getRoot()); this.b = b; }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
