package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.kgap.intel.R;
import com.kgap.intel.models.LearningPathResponse;
import java.util.List;

public class PathStepAdapter extends RecyclerView.Adapter<PathStepAdapter.StepViewHolder> {

    private final List<LearningPathResponse> steps;

    public PathStepAdapter(List<LearningPathResponse> steps) {
        this.steps = steps;
    }

    @NonNull
    @Override
    public StepViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_path_step, parent, false);
        return new StepViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull StepViewHolder holder, int position) {
        LearningPathResponse item = steps.get(position);
        
        holder.tvStepNumber.setText(String.valueOf(position + 1));
        holder.tvSkill.setText(item.getSkillName());
        holder.tvCourse.setText(item.getCourseTitle());
        
        String meta = "Estimated: " + item.getEstimatedHours() + " Hours • Level: " + item.getCourseLevel();
        holder.tvMeta.setText(meta);
        
        int progress = item.getCompletionPercentage() != null ? item.getCompletionPercentage() : 0;
        holder.progressIndicator.setProgress(progress);
        
        String status = item.getStatus() != null ? item.getStatus().replace("_", " ") : "NOT STARTED";
        holder.tvStatus.setText(status.toUpperCase());
        
        // Hide line for last item
        holder.viewLine.setVisibility(position == steps.size() - 1 ? View.GONE : View.VISIBLE);
    }

    @Override
    public int getItemCount() {
        return steps.size();
    }

    static class StepViewHolder extends RecyclerView.ViewHolder {
        TextView tvStepNumber, tvSkill, tvCourse, tvMeta, tvStatus;
        LinearProgressIndicator progressIndicator;
        View viewLine;

        public StepViewHolder(@NonNull View itemView) {
            super(itemView);
            tvStepNumber = itemView.findViewById(R.id.tv_step_number);
            tvSkill = itemView.findViewById(R.id.tv_step_skill);
            tvCourse = itemView.findViewById(R.id.tv_step_course);
            tvMeta = itemView.findViewById(R.id.tv_step_meta);
            tvStatus = itemView.findViewById(R.id.tv_status_badge);
            progressIndicator = itemView.findViewById(R.id.pb_step_progress);
            viewLine = itemView.findViewById(R.id.view_line);
        }
    }
}
