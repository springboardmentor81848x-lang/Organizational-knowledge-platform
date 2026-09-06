package com.kgap.intel.adapters;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.ItemCourseBinding;
import com.kgap.intel.fragments.TrainingDetailsFragment;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.models.TrainingEnrollment;
import java.util.ArrayList;
import java.util.List;

public class CourseAdapter extends RecyclerView.Adapter<CourseAdapter.ViewHolder> {

    public interface OnProgressUpdateListener {
        void onUpdateProgress(LearningPathResponse item, int newProgress, String newStatus);
    }

    private List<LearningPathResponse> learningPaths;
    private OnProgressUpdateListener progressUpdateListener;

    public CourseAdapter(List<LearningPathResponse> learningPaths) {
        this(learningPaths, null);
    }

    public CourseAdapter(List<LearningPathResponse> learningPaths, OnProgressUpdateListener listener) {
        this.learningPaths = learningPaths != null ? learningPaths : new ArrayList<>();
        this.progressUpdateListener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemCourseBinding binding = ItemCourseBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        LearningPathResponse item = learningPaths.get(position);

        String title = item.getCourseTitle() != null ? item.getCourseTitle() : "Learning Path #" + item.getId();
        holder.binding.tvCourseTitle.setText(title);

        String skillInfo = (item.getSkillName() != null ? item.getSkillName() : "Skill Gap") +
                " (" + formatLevel(item.getCurrentLevel()) + " → " + formatLevel(item.getTargetLevel()) + ")";
        if (item.getProvider() != null && !item.getProvider().isEmpty()) {
            skillInfo += " • " + item.getProvider();
        }
        holder.binding.tvInstructor.setText(skillInfo);

        int hours = item.getEstimatedHours() != null ? item.getEstimatedHours() : 10;
        int progressPercent = item.getCompletionPercentage() != null ? item.getCompletionPercentage() : 0;
        String status = item.getStatus() != null ? formatStatus(item.getStatus()) : "Not Started";

        holder.binding.courseProgress.setProgress(progressPercent);

        String detailText = progressPercent + "% Complete (" + status + ") • " + hours + " Hours • Level: " +
                formatLevel(item.getCourseLevel() != null ? item.getCourseLevel() : item.getTargetLevel());
        holder.binding.tvProgressPercent.setText(detailText);

        holder.itemView.setOnClickListener(v -> {
            if (v.getContext() instanceof androidx.fragment.app.FragmentActivity) {
                androidx.fragment.app.FragmentActivity activity = (androidx.fragment.app.FragmentActivity) v.getContext();
                
                TrainingEnrollment enrollment = new TrainingEnrollment();
                enrollment.setId(item.getId());
                enrollment.setTrainingId(item.getSkillId());
                enrollment.setEmployeeId(item.getEmployeeId());
                enrollment.setStatus(item.getStatus());
                enrollment.setProgressPercentage(item.getCompletionPercentage());
                enrollment.setEnrolledAt(item.getCreatedAt());
                
                activity.getSupportFragmentManager().beginTransaction()
                        .replace(com.kgap.intel.R.id.fragment_container, 
                                TrainingDetailsFragment.newInstance(enrollment, item.getCourseTitle(), item.getSkillName() + " Training Course"))
                        .addToBackStack(null)
                        .commit();
            }
        });
    }

    @Override
    public int getItemCount() {
        return learningPaths.size();
    }

    private String formatLevel(String level) {
        if (level == null || level.isEmpty()) return "N/A";
        return level.substring(0, 1).toUpperCase() + level.substring(1).toLowerCase();
    }

    private String formatStatus(String status) {
        if (status == null || status.isEmpty()) return "Not Started";
        switch (status.toUpperCase()) {
            case "COMPLETED": return "Completed";
            case "IN_PROGRESS": return "In Progress";
            case "NOT_STARTED": return "Not Started";
            default: return status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase();
        }
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ItemCourseBinding binding;
        ViewHolder(ItemCourseBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
