package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.kgap.intel.R;
import com.kgap.intel.models.MenteeProgress;
import java.util.List;

public class MentorMenteesAdapter extends RecyclerView.Adapter<MentorMenteesAdapter.ViewHolder> {
    public interface OnMenteeClickListener {
        void onMenteeClick(MenteeProgress mentee);
    }

    private List<MenteeProgress> mentees;
    private final OnMenteeClickListener clickListener;

    public MentorMenteesAdapter(List<MenteeProgress> mentees, OnMenteeClickListener clickListener) {
        this.mentees = mentees;
        this.clickListener = clickListener;
    }

    public MentorMenteesAdapter(List<MenteeProgress> mentees) {
        this(mentees, null);
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_mentee_summary, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        MenteeProgress mentee = mentees.get(position);
        holder.tvName.setText(mentee.getMenteeName());
        holder.tvRole.setText(mentee.getRole());
        holder.tvPath.setText(mentee.getCurrentLearningPath());
        holder.progressIndicator.setProgress(mentee.getOverallProgress());
        holder.tvProgressText.setText(mentee.getOverallProgress() + "%");

        holder.itemView.setOnClickListener(v -> {
            if (clickListener != null) {
                clickListener.onMenteeClick(mentee);
            }
        });
    }

    @Override
    public int getItemCount() {
        return mentees.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvRole, tvPath, tvProgressText;
        LinearProgressIndicator progressIndicator;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_mentee_name);
            tvRole = itemView.findViewById(R.id.tv_mentee_role);
            tvPath = itemView.findViewById(R.id.tv_mentee_path);
            tvProgressText = itemView.findViewById(R.id.tv_mentee_progress_text);
            progressIndicator = itemView.findViewById(R.id.pb_mentee_progress);
        }
    }
}
