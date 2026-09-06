package com.kgap.intel.adapters;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.ItemOrgSkillGapBinding;
import com.kgap.intel.models.OrgSkillGapItem;
import java.util.List;

public class OrgSkillGapAdapter extends RecyclerView.Adapter<OrgSkillGapAdapter.ViewHolder> {
    public interface OnOrgGapClickListener {
        void onOrgGapClick(OrgSkillGapItem item);
    }

    private final List<OrgSkillGapItem> items;
    private final OnOrgGapClickListener listener;

    public OrgSkillGapAdapter(List<OrgSkillGapItem> items, OnOrgGapClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemOrgSkillGapBinding binding = ItemOrgSkillGapBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        OrgSkillGapItem item = items.get(position);
        holder.binding.tvSkillName.setText(item.getSkillName());
        holder.binding.tvDepartments.setText(item.getDepartmentsSummary());
        
        holder.binding.tvImpactCount.setText(item.getImpactedCount() + (item.getImpactedCount() == 1 ? " Employee" : " Employees") + " Impacted");
        holder.binding.tvBenchmarkTarget.setText("Target: " + (item.getRequiredProficiency() != null ? item.getRequiredProficiency() : "EXPERT"));

        int progress = Math.max(25, Math.min(100, item.getAverageGapPercent()));
        holder.binding.progressGapSeverity.setProgress(progress);

        String severity = item.getHighestSeverity() != null ? item.getHighestSeverity().toUpperCase() : "LOW";
        String badgeText = "LOW GAP";
        String badgeBg = "#E8F5E9";
        String badgeTextColor = "#2E7D32";
        String iconBg = "#E8F5E9";
        String iconTint = "#2E7D32";

        if ("HIGH".equals(severity)) {
            badgeText = "CRITICAL GAP";
            badgeBg = "#FFEBEE";
            badgeTextColor = "#E53935";
            iconBg = "#FFEBEE";
            iconTint = "#E53935";
            holder.binding.progressGapSeverity.setIndicatorColor(Color.parseColor("#E53935"));
        } else if ("MEDIUM".equals(severity)) {
            badgeText = "MODERATE GAP";
            badgeBg = "#FFF3E0";
            badgeTextColor = "#F57C00";
            iconBg = "#FFF3E0";
            iconTint = "#F57C00";
            holder.binding.progressGapSeverity.setIndicatorColor(Color.parseColor("#F57C00"));
        } else {
            holder.binding.progressGapSeverity.setIndicatorColor(Color.parseColor("#2E7D32"));
        }

        holder.binding.tvGapSeverityBadge.setText(badgeText);
        holder.binding.tvGapSeverityBadge.setTextColor(Color.parseColor(badgeTextColor));
        holder.binding.tvGapSeverityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor(badgeBg)));
        holder.binding.cardIcon.setCardBackgroundColor(Color.parseColor(iconBg));
        holder.binding.ivGapIcon.setColorFilter(Color.parseColor(iconTint));

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onOrgGapClick(item);
            }
        });
    }

    @Override
    public int getItemCount() {
        return items != null ? items.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ItemOrgSkillGapBinding binding;
        ViewHolder(ItemOrgSkillGapBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
