package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ItemGapOverviewBinding;
import com.kgap.intel.models.SkillGapResponse;
import java.util.List;

public class GapOverviewAdapter extends RecyclerView.Adapter<GapOverviewAdapter.ViewHolder> {
    private final List<SkillGapResponse> items;

    public GapOverviewAdapter(List<SkillGapResponse> items) {
        this.items = items;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemGapOverviewBinding binding = ItemGapOverviewBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        SkillGapResponse item = items.get(position);
        holder.binding.tvSkillName.setText(item.getSkillName());
        
        if (item.getEmployeeName() != null) {
            holder.binding.tvEmployeeName.setVisibility(android.view.View.VISIBLE);
            holder.binding.tvEmployeeName.setText(item.getEmployeeName());
        } else {
            holder.binding.tvEmployeeName.setVisibility(android.view.View.GONE);
        }

        int currentVal = getLevelPercent(item.getCurrentProficiency());
        int requiredVal = getLevelPercent(item.getRequiredProficiency());
        int gapVal = Math.max(0, requiredVal - currentVal);

        holder.binding.tvGapLabel.setText("Gap: " + gapVal + "%");
        holder.binding.tvCurrentVal.setText(item.getCurrentProficiency());
        holder.binding.tvRequiredVal.setText(item.getRequiredProficiency());
        
        holder.binding.progressCurrent.setProgress(currentVal);
        holder.binding.progressRequired.setProgress(requiredVal);

        int color;
        String level = item.getGapLevel() != null ? item.getGapLevel() : "LOW";
        switch (level) {
            case "HIGH": color = ContextCompat.getColor(holder.itemView.getContext(), R.color.gap_critical); break;
            case "MEDIUM": color = ContextCompat.getColor(holder.itemView.getContext(), R.color.gap_high); break;
            default: color = ContextCompat.getColor(holder.itemView.getContext(), R.color.gap_low); break;
        }
        holder.binding.tvGapLabel.setTextColor(color);
    }

    private int getLevelPercent(String level) {
        if (level == null) return 0;
        switch (level.toLowerCase()) {
            case "beginner": return 25;
            case "intermediate": return 50;
            case "advanced": return 75;
            case "expert": return 100;
            default: return 0;
        }
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ItemGapOverviewBinding binding;
        ViewHolder(ItemGapOverviewBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
