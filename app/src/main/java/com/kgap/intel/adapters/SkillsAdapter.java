package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.ItemSkillCardBinding;
import com.kgap.intel.models.SkillItem;

public class SkillsAdapter extends ListAdapter<SkillItem, SkillsAdapter.SkillViewHolder> {

    public SkillsAdapter() {
        super(new DiffUtil.ItemCallback<SkillItem>() {
            @Override
            public boolean areItemsTheSame(@NonNull SkillItem oldItem, @NonNull SkillItem newItem) {
                return oldItem.getId().equals(newItem.getId());
            }

            @Override
            public boolean areContentsTheSame(@NonNull SkillItem oldItem, @NonNull SkillItem newItem) {
                return oldItem.getName().equals(newItem.getName()) && 
                       oldItem.getProficiency() == newItem.getProficiency() &&
                       oldItem.getLevel().equals(newItem.getLevel());
            }
        });
    }

    @NonNull
    @Override
    public SkillViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemSkillCardBinding binding = ItemSkillCardBinding.inflate(
            LayoutInflater.from(parent.getContext()), parent, false);
        return new SkillViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull SkillViewHolder holder, int position) {
        SkillItem item = getItem(position);
        holder.bind(item);
    }

    static class SkillViewHolder extends RecyclerView.ViewHolder {
        private final ItemSkillCardBinding binding;

        public SkillViewHolder(ItemSkillCardBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }

        public void bind(SkillItem item) {
            binding.tvSkillName.setText(item.getName());
            binding.tvCategoryBadge.setText(item.getCategory());
            binding.progressSkill.setProgress(item.getProficiency());
            binding.tvProficiencyText.setText(item.getProficiency() + "%");
            binding.tvSkillInfo.setText(item.getLevel() + " • " + item.getExperience() + " Exp");
            binding.tvLastUpdated.setText("Updated: " + item.getLastUpdated());
        }
    }
}
