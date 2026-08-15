package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
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
import java.util.ArrayList;
import java.util.List;

public class MyProgressFragment extends Fragment {
    private FragmentMyProgressBinding binding;

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

        setupSummary();
        setupGoals();
        setupTimeline();
    }

    private void setupSummary() {
        // 1. Hours
        LayoutSummaryCardCompactBinding hours = LayoutSummaryCardCompactBinding.bind(binding.metricHours.getRoot());
        hours.tvCardLabel.setText("Learning Hours");
        hours.tvCardValue.setText("42.5h");
        hours.ivCardIcon.setImageResource(android.R.drawable.ic_menu_recent_history);
        hours.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        hours.ivCardIcon.setColorFilter(Color.parseColor("#1565C0"));

        // 2. Streak
        LayoutSummaryCardCompactBinding streak = LayoutSummaryCardCompactBinding.bind(binding.metricStreak.getRoot());
        streak.tvCardLabel.setText("Learning Streak");
        streak.tvCardValue.setText("12 Days");
        streak.ivCardIcon.setImageResource(android.R.drawable.ic_menu_compass); 
        streak.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        streak.ivCardIcon.setColorFilter(Color.parseColor("#EF6C00"));

        // 3. Goals
        LayoutSummaryCardCompactBinding goals = LayoutSummaryCardCompactBinding.bind(binding.metricGoals.getRoot());
        goals.tvCardLabel.setText("Goals Met");
        goals.tvCardValue.setText("8/12");
        goals.ivCardIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        goals.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        goals.ivCardIcon.setColorFilter(Color.parseColor("#7B1FA2"));

        // 4. Courses
        LayoutSummaryCardCompactBinding courses = LayoutSummaryCardCompactBinding.bind(binding.metricCourses.getRoot());
        courses.tvCardLabel.setText("Certifications");
        courses.tvCardValue.setText("5");
        courses.ivCardIcon.setImageResource(android.R.drawable.ic_menu_view);
        courses.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        courses.ivCardIcon.setColorFilter(Color.parseColor("#2E7D32"));
    }

    private void setupGoals() {
        binding.rvActiveGoals.setLayoutManager(new LinearLayoutManager(getContext()));
        List<GoalMock> list = new ArrayList<>();
        list.add(new GoalMock("Master System Design", 65, "5 days left"));
        list.add(new GoalMock("AWS Solutions Architect", 40, "12 days left"));
        list.add(new GoalMock("Advanced React Patterns", 85, "2 days left"));

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
