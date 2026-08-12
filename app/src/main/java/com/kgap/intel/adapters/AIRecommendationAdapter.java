package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.ItemAiRecommendationBinding;
import com.kgap.intel.models.AIRecommendationResponse;
import java.util.List;

public class AIRecommendationAdapter extends RecyclerView.Adapter<AIRecommendationAdapter.ViewHolder> {
    private final List<AIRecommendationResponse> items;

    public AIRecommendationAdapter(List<AIRecommendationResponse> items) {
        this.items = items;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemAiRecommendationBinding binding = ItemAiRecommendationBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        AIRecommendationResponse item = items.get(position);
        holder.binding.tvSkillName.setText("Skill: " + item.getSkillName());
        holder.binding.tvLevels.setText("Current: " + item.getCurrentLevel() + " | Required: " + item.getRequiredLevel());
        holder.binding.tvGapLevel.setText("Gap: " + item.getGapLevel());
        holder.binding.tvPriority.setText("Priority " + item.getPriority());
        holder.binding.tvRecommendation.setText("Recommendation: " + item.getRecommendation());
        holder.binding.tvReason.setText("Reason: " + item.getReason());
    }

    @Override
    public int getItemCount() {
        return items != null ? items.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ItemAiRecommendationBinding binding;
        ViewHolder(ItemAiRecommendationBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
