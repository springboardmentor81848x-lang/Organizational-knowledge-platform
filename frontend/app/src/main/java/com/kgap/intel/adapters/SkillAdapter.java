package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.ItemSkillBinding;
import com.kgap.intel.models.Skill;
import java.util.List;

public class SkillAdapter extends RecyclerView.Adapter<SkillAdapter.SkillViewHolder> {
    private List<Skill> skills;

    public SkillAdapter(List<Skill> skills) {
        this.skills = skills;
    }

    @NonNull
    @Override
    public SkillViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemSkillBinding binding = ItemSkillBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new SkillViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull SkillViewHolder holder, int position) {
        Skill skill = skills.get(position);
        holder.binding.tvSkillName.setText(skill.getName());
        holder.binding.progressSkill.setProgress(skill.getLevel());
    }

    @Override
    public int getItemCount() {
        return skills.size();
    }

    static class SkillViewHolder extends RecyclerView.ViewHolder {
        ItemSkillBinding binding;
        SkillViewHolder(ItemSkillBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
