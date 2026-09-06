package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.chip.Chip;
import com.kgap.intel.R;
import com.kgap.intel.models.HighRiskGap;
import java.util.List;

public class HighRiskGapAdapter extends RecyclerView.Adapter<HighRiskGapAdapter.ViewHolder> {
    private List<HighRiskGap> items;
    private OnGapActionListener listener;

    public interface OnGapActionListener {
        void onRecommendTraining(HighRiskGap gap);
        void onAssignMentor(HighRiskGap gap);
    }

    public HighRiskGapAdapter(List<HighRiskGap> items) {
        this.items = items;
    }

    public HighRiskGapAdapter(List<HighRiskGap> items, OnGapActionListener listener) {
        this.items = items;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_high_risk_gap, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        HighRiskGap item = items.get(position);
        
        if (item.getEmployeeName() != null && !item.getEmployeeName().isEmpty()) {
            holder.tvEmployeeName.setText(item.getEmployeeName());
            holder.tvEmployeeName.setVisibility(View.VISIBLE);
        } else {
            holder.tvEmployeeName.setVisibility(View.GONE);
        }

        holder.tvSkillName.setText("Skill: " + item.getSkillName());
        holder.tvInfo.setText("Proficiency Gap: Score " + item.getGapScore() + " (" + item.getCurrentCoverage() + "% ➔ " + item.getRequiredCoverage() + "%)");
        holder.chipRisk.setText(item.getRiskLevel() != null ? item.getRiskLevel().toUpperCase() : "HIGH");

        holder.btnRecommend.setOnClickListener(v -> {
            if (listener != null) listener.onRecommendTraining(item);
        });

        holder.btnAssignMentor.setOnClickListener(v -> {
            if (listener != null) listener.onAssignMentor(item);
        });
    }

    @Override
    public int getItemCount() {
        return items != null ? items.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvEmployeeName, tvSkillName, tvInfo;
        Chip chipRisk;
        MaterialButton btnRecommend, btnAssignMentor;

        ViewHolder(View itemView) {
            super(itemView);
            tvEmployeeName = itemView.findViewById(R.id.tv_employee_name);
            tvSkillName = itemView.findViewById(R.id.tv_skill_name);
            tvInfo = itemView.findViewById(R.id.tv_coverage_info);
            chipRisk = itemView.findViewById(R.id.chip_risk);
            btnRecommend = itemView.findViewById(R.id.btn_recommend_training);
            btnAssignMentor = itemView.findViewById(R.id.btn_assign_mentor);
        }
    }
}
