package com.kgap.intel.adapters;

import android.content.Context;
import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ItemMilestoneCardBinding;
import com.kgap.intel.models.MilestoneItem;
import java.util.ArrayList;
import java.util.List;

public class MilestoneAdapter extends RecyclerView.Adapter<MilestoneAdapter.ViewHolder> {

    private final List<MilestoneItem> items = new ArrayList<>();

    public MilestoneAdapter() {
    }

    public void setItems(List<MilestoneItem> newItems) {
        items.clear();
        if (newItems != null) {
            items.addAll(newItems);
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemMilestoneCardBinding binding = ItemMilestoneCardBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        MilestoneItem item = items.get(position);
        Context context = holder.itemView.getContext();

        holder.binding.tvMilestoneTitle.setText(item.getTitle() != null ? item.getTitle() : "Learning Milestone");
        
        if (item.getDescription() != null && !item.getDescription().trim().isEmpty()) {
            holder.binding.tvMilestoneDesc.setVisibility(View.VISIBLE);
            holder.binding.tvMilestoneDesc.setText(item.getDescription());
        } else {
            holder.binding.tvMilestoneDesc.setVisibility(View.GONE);
        }

        if (item.isCompleted()) {
            holder.binding.ivMilestoneIcon.setImageResource(android.R.drawable.checkbox_on_background);
            holder.binding.ivMilestoneIcon.setBackgroundColor(Color.parseColor("#E8F5E9"));
            holder.binding.ivMilestoneIcon.setColorFilter(ContextCompat.getColor(context, R.color.primary_emerald));
            holder.binding.pbMilestoneProgress.setVisibility(View.GONE);
            
            String meta = "Completed";
            if (item.getDate() != null && !item.getDate().isEmpty()) {
                meta += " • " + item.getDate();
            }
            holder.binding.tvMilestoneMeta.setText(meta);
            holder.binding.tvMilestoneMeta.setTextColor(ContextCompat.getColor(context, R.color.gray_700));
        } else if ("IN_PROGRESS".equalsIgnoreCase(item.getStatus()) || (item.getProgressPercentage() != null && item.getProgressPercentage() > 0)) {
            holder.binding.ivMilestoneIcon.setImageResource(android.R.drawable.ic_menu_rotate);
            holder.binding.ivMilestoneIcon.setBackgroundColor(Color.parseColor("#F3E5F5"));
            holder.binding.ivMilestoneIcon.setColorFilter(ContextCompat.getColor(context, R.color.primary_purple));
            
            int progress = item.getProgressPercentage() != null ? item.getProgressPercentage() : 0;
            holder.binding.pbMilestoneProgress.setVisibility(View.VISIBLE);
            holder.binding.pbMilestoneProgress.setProgress(progress);
            
            String meta = "In Progress (" + progress + "%)";
            if (item.getDate() != null && !item.getDate().isEmpty()) {
                meta += " • " + item.getDate();
            }
            holder.binding.tvMilestoneMeta.setText(meta);
            holder.binding.tvMilestoneMeta.setTextColor(ContextCompat.getColor(context, R.color.primary_purple));
        } else {
            holder.binding.ivMilestoneIcon.setImageResource(android.R.drawable.ic_menu_agenda);
            holder.binding.ivMilestoneIcon.setBackgroundColor(Color.parseColor("#E3F2FD"));
            holder.binding.ivMilestoneIcon.setColorFilter(ContextCompat.getColor(context, R.color.secondary_teal));
            holder.binding.pbMilestoneProgress.setVisibility(View.GONE);
            
            String meta = "Started / Enrolled";
            if (item.getDate() != null && !item.getDate().isEmpty()) {
                meta += " • " + item.getDate();
            }
            holder.binding.tvMilestoneMeta.setText(meta);
            holder.binding.tvMilestoneMeta.setTextColor(ContextCompat.getColor(context, R.color.gray_500));
        }
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final ItemMilestoneCardBinding binding;

        ViewHolder(ItemMilestoneCardBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
