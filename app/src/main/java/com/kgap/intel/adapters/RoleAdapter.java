package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ItemRoleCardBinding;
import com.kgap.intel.models.Role;
import java.util.List;

public class RoleAdapter extends RecyclerView.Adapter<RoleAdapter.RoleViewHolder> {

    private final List<Role> roles;
    private int selectedPosition = 0;
    private OnRoleSelectedListener listener;

    public interface OnRoleSelectedListener {
        void onRoleSelected(String roleTitle);
    }

    public RoleAdapter(List<Role> roles, OnRoleSelectedListener listener) {
        this.roles = roles;
        this.listener = listener;
        if (!roles.isEmpty()) {
            roles.get(0).setSelected(true);
        }
    }

    @NonNull
    @Override
    public RoleViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemRoleCardBinding binding = ItemRoleCardBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new RoleViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull RoleViewHolder holder, int position) {
        Role role = roles.get(position);
        holder.binding.tvRoleTitle.setText(role.getTitle());
        holder.binding.ivRoleIcon.setImageResource(role.getIconRes());

        if (role.isSelected()) {
            holder.binding.cardRole.setStrokeColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.primary_emerald));
            holder.binding.tvRoleTitle.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.primary_emerald));
            holder.binding.cardIconBg.setCardBackgroundColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.overlay_emerald));
            holder.binding.ivRoleIcon.setColorFilter(ContextCompat.getColor(holder.itemView.getContext(), R.color.primary_emerald));
        } else {
            holder.binding.cardRole.setStrokeColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.gray_200));
            holder.binding.tvRoleTitle.setTextColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.text_dark));
            holder.binding.cardIconBg.setCardBackgroundColor(ContextCompat.getColor(holder.itemView.getContext(), R.color.gray_200));
            holder.binding.ivRoleIcon.setColorFilter(ContextCompat.getColor(holder.itemView.getContext(), R.color.gray_700));
        }

        holder.itemView.setOnClickListener(v -> {
            Toast.makeText(holder.itemView.getContext(), "Selected: " + role.getTitle(), Toast.LENGTH_SHORT).show();
            int previousSelected = selectedPosition;
            selectedPosition = holder.getAdapterPosition();
            
            roles.get(previousSelected).setSelected(false);
            roles.get(selectedPosition).setSelected(true);
            
            notifyItemChanged(previousSelected);
            notifyItemChanged(selectedPosition);
            
            if (listener != null) {
                listener.onRoleSelected(role.getTitle());
            }
        });
    }

    @Override
    public int getItemCount() {
        return roles.size();
    }

    static class RoleViewHolder extends RecyclerView.ViewHolder {
        ItemRoleCardBinding binding;
        RoleViewHolder(ItemRoleCardBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
