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
import com.kgap.intel.models.LearningPathResponse;
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
            CharSequence[] options;
            if (item.getCourseLink() != null && !item.getCourseLink().isEmpty()) {
                options = new CharSequence[]{"Update Learning Progress", "Open Course Link"};
            } else {
                options = new CharSequence[]{"Update Learning Progress"};
            }

            new AlertDialog.Builder(v.getContext())
                    .setTitle(title)
                    .setItems(options, (dialog, which) -> {
                        if (which == 0) {
                            showProgressUpdateDialog(v, item);
                        } else if (which == 1 && item.getCourseLink() != null) {
                            try {
                                Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(item.getCourseLink()));
                                v.getContext().startActivity(intent);
                            } catch (Exception ignored) {
                            }
                        }
                    })
                    .show();
        });
    }

    private void showProgressUpdateDialog(View view, LearningPathResponse item) {
        String[] progressOptions = {"0% - Not Started", "25% - In Progress", "50% - In Progress", "75% - In Progress", "100% - Completed"};
        int[] progressValues = {0, 25, 50, 75, 100};
        String[] statusValues = {"NOT_STARTED", "IN_PROGRESS", "IN_PROGRESS", "IN_PROGRESS", "COMPLETED"};

        int currentPercent = item.getCompletionPercentage() != null ? item.getCompletionPercentage() : 0;
        int defaultSelection = 0;
        for (int i = 0; i < progressValues.length; i++) {
            if (currentPercent >= progressValues[i]) {
                defaultSelection = i;
            }
        }

        new AlertDialog.Builder(view.getContext())
                .setTitle("Update Progress: " + item.getSkillName())
                .setSingleChoiceItems(progressOptions, defaultSelection, (dialog, which) -> {
                    if (progressUpdateListener != null && item.getId() != null) {
                        progressUpdateListener.onUpdateProgress(item, progressValues[which], statusValues[which]);
                    }
                    dialog.dismiss();
                })
                .setNegativeButton("Cancel", null)
                .show();
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
