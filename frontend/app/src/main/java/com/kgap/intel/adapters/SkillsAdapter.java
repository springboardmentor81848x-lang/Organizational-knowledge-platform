package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ItemSkillCardBinding;
import com.kgap.intel.models.SkillImprovement;
import com.kgap.intel.models.SkillItem;
import java.util.Objects;

public class SkillsAdapter extends ListAdapter<SkillItem, SkillsAdapter.SkillViewHolder> {
    private OnSkillActionListener listener;

    public interface OnSkillActionListener {
        void onDelete(SkillItem item);
        void onTakeAssessment(SkillItem item);
    }

    public void setOnSkillActionListener(OnSkillActionListener listener) {
        this.listener = listener;
    }

    public SkillsAdapter() {
        super(new DiffUtil.ItemCallback<SkillItem>() {
            @Override
            public boolean areItemsTheSame(@NonNull SkillItem oldItem, @NonNull SkillItem newItem) {
                return Objects.equals(oldItem.getId(), newItem.getId());
            }

            @Override
            public boolean areContentsTheSame(@NonNull SkillItem oldItem, @NonNull SkillItem newItem) {
                return Objects.equals(oldItem.getName(), newItem.getName()) && 
                       oldItem.getProficiency() == newItem.getProficiency() &&
                       Objects.equals(oldItem.getLevel(), newItem.getLevel()) &&
                       Objects.equals(oldItem.getCategory(), newItem.getCategory()) &&
                       Objects.equals(oldItem.getImprovement(), newItem.getImprovement());
            }
        });
    }

    @NonNull
    @Override
    public SkillViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemSkillCardBinding binding = ItemSkillCardBinding.inflate(
            LayoutInflater.from(parent.getContext()), parent, false);
        return new SkillViewHolder(binding, listener);
    }

    @Override
    public void onBindViewHolder(@NonNull SkillViewHolder holder, int position) {
        SkillItem item = getItem(position);
        if (item != null) {
            holder.bind(item);
        }
    }

    static class SkillViewHolder extends RecyclerView.ViewHolder {
        private final ItemSkillCardBinding binding;
        private final OnSkillActionListener listener;

        public SkillViewHolder(ItemSkillCardBinding binding, OnSkillActionListener listener) {
            super(binding.getRoot());
            this.binding = binding;
            this.listener = listener;
        }

        public void bind(SkillItem item) {
            binding.tvSkillName.setText(item.getName() != null ? item.getName() : "Unknown Skill");
            binding.tvCategoryBadge.setText(item.getCategory() != null ? item.getCategory() : "N/A");
            binding.progressSkill.setProgress(item.getProficiency());
            binding.tvProficiencyText.setText(item.getProficiency() + "%");
            binding.tvSkillInfo.setText((item.getLevel() != null ? item.getLevel() : "N/A") + " • " + (item.getExperience() != null ? item.getExperience() : "0") + " Exp");
            binding.tvLastUpdated.setText("Updated: " + (item.getLastUpdated() != null ? item.getLastUpdated() : "Never"));

            SkillImprovement imp = item.getImprovement();
            if (imp != null && imp.getTrend() != null) {
                double pct = imp.getImprovementPercentage();
                binding.tvImprovementIndicator.setVisibility(View.VISIBLE);
                if (imp.getTrend() == SkillImprovement.Trend.IMPROVED) {
                    binding.tvImprovementIndicator.setText(String.format(java.util.Locale.US, "↑ +%.0f%%", pct));
                    binding.tvImprovementIndicator.setTextColor(ContextCompat.getColor(binding.getRoot().getContext(), R.color.primary_emerald));
                } else if (imp.getTrend() == SkillImprovement.Trend.DECLINED) {
                    binding.tvImprovementIndicator.setText(String.format(java.util.Locale.US, "↓ %.0f%%", pct));
                    binding.tvImprovementIndicator.setTextColor(ContextCompat.getColor(binding.getRoot().getContext(), android.R.color.holo_red_light));
                } else if (imp.getTrend() == SkillImprovement.Trend.NO_CHANGE) {
                    binding.tvImprovementIndicator.setText("0%");
                    binding.tvImprovementIndicator.setTextColor(ContextCompat.getColor(binding.getRoot().getContext(), R.color.gray_700));
                } else {
                    binding.tvImprovementIndicator.setVisibility(View.GONE);
                }
            } else {
                binding.tvImprovementIndicator.setVisibility(View.GONE);
            }

            // Visual feedback based on proficiency
            if (item.getProficiency() < 30) {
                binding.btnTakeAssessment.setText("Assess Now");
            } else {
                binding.btnTakeAssessment.setText("Retake Assessment");
            }

            binding.btnDelete.setOnClickListener(v -> {
                if (listener != null) listener.onDelete(item);
            });
            binding.btnTakeAssessment.setOnClickListener(v -> {
                if (listener != null) listener.onTakeAssessment(item);
            });
        }
    }
}
