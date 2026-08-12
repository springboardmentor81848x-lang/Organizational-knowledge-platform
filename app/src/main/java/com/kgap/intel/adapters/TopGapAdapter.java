package com.kgap.intel.adapters;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ItemTopGapBinding;
import com.kgap.intel.models.GapSkill;
import java.util.List;

public class TopGapAdapter extends RecyclerView.Adapter<TopGapAdapter.ViewHolder> {
    private List<GapSkill> items;
    private OnItemClickListener listener;

    public interface OnItemClickListener {
        void onItemClick(GapSkill skill);
    }

    public TopGapAdapter(List<GapSkill> items, OnItemClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemTopGapBinding binding = ItemTopGapBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        GapSkill item = items.get(position);
        holder.binding.tvSkillName.setText(item.getName());
        holder.binding.tvAffectedMembers.setText(item.getMembersAffected() + " members affected");
        holder.binding.tvCurrentVal.setText(item.getCurrentProficiency() + "%");
        holder.binding.tvRequiredVal.setText(item.getRequiredProficiency() + "%");
        holder.binding.tvGapVal.setText(item.getGap() + "%");
        holder.binding.progressComparison.setProgress(item.getCurrentProficiency());

        int color;
        String label;
        switch (item.getSeverity()) {
            case CRITICAL:
                color = ContextCompat.getColor(holder.itemView.getContext(), R.color.gap_critical);
                label = "CRITICAL";
                break;
            case HIGH:
                color = ContextCompat.getColor(holder.itemView.getContext(), R.color.gap_high);
                label = "HIGH";
                break;
            case MEDIUM:
                color = ContextCompat.getColor(holder.itemView.getContext(), R.color.gap_medium);
                label = "MEDIUM";
                break;
            default:
                color = ContextCompat.getColor(holder.itemView.getContext(), R.color.gap_low);
                label = "LOW";
                break;
        }

        holder.binding.tvStatusBadge.setText(label);
        holder.binding.tvStatusBadge.setTextColor(color);
        holder.binding.cardStatusBadge.setCardBackgroundColor(Color.argb(30, Color.red(color), Color.green(color), Color.blue(color)));
        holder.binding.progressComparison.setIndicatorColor(color);
        holder.binding.ivSkillIcon.setColorFilter(color);

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) listener.onItemClick(item);
        });
    }

    @Override
    public int getItemCount() { return items.size(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ItemTopGapBinding binding;
        ViewHolder(ItemTopGapBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
