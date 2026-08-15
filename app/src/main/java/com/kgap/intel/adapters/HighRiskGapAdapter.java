package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.chip.Chip;
import com.kgap.intel.R;
import com.kgap.intel.models.HighRiskGap;
import java.util.List;

public class HighRiskGapAdapter extends RecyclerView.Adapter<HighRiskGapAdapter.ViewHolder> {
    private List<HighRiskGap> items;

    public HighRiskGapAdapter(List<HighRiskGap> items) {
        this.items = items;
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
        holder.tvName.setText(item.getSkillName());
        holder.tvInfo.setText("Coverage: " + item.getCurrentCoverage() + "/" + item.getRequiredCoverage() + "%");
        holder.chipRisk.setText(item.getRiskLevel().toUpperCase());
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvInfo;
        Chip chipRisk;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_skill_name);
            tvInfo = itemView.findViewById(R.id.tv_coverage_info);
            chipRisk = itemView.findViewById(R.id.chip_risk);
        }
    }
}
