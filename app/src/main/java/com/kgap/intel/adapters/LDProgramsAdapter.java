package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.models.TrainingProgram;
import java.util.List;

public class LDProgramsAdapter extends RecyclerView.Adapter<LDProgramsAdapter.ViewHolder> {
    private List<TrainingProgram> programs;

    public LDProgramsAdapter(List<TrainingProgram> programs) {
        this.programs = programs;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_training_program, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        TrainingProgram program = programs.get(position);
        holder.tvTitle.setText(program.getTitle());
        holder.tvPlatform.setText(program.getPlatform());
        holder.tvDuration.setText(program.getDuration() + " • " + program.getDifficulty());
    }

    @Override
    public int getItemCount() {
        return programs.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvTitle, tvPlatform, tvDuration;

        ViewHolder(View itemView) {
            super(itemView);
            tvTitle = itemView.findViewById(R.id.tv_program_title);
            tvPlatform = itemView.findViewById(R.id.tv_program_platform);
            tvDuration = itemView.findViewById(R.id.tv_program_duration);
        }
    }
}
