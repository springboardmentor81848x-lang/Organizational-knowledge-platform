package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.kgap.intel.R;
import com.kgap.intel.models.EmployeeResponse;
import java.util.List;

public class TeamMemberAdapter extends RecyclerView.Adapter<TeamMemberAdapter.MemberViewHolder> {

    public interface OnMemberClickListener {
        void onMemberClick(EmployeeResponse employee);
    }

    private final List<EmployeeResponse> members;
    private final OnMemberClickListener listener;

    public TeamMemberAdapter(List<EmployeeResponse> members, OnMemberClickListener listener) {
        this.members = members;
        this.listener = listener;
    }

    public void updateList(List<EmployeeResponse> newList) {
        this.members.clear();
        this.members.addAll(newList);
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public MemberViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_team_member, parent, false);
        return new MemberViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull MemberViewHolder holder, int position) {
        EmployeeResponse member = members.get(position);
        String name = member.getFirstName() + " " + member.getLastName();
        holder.tvName.setText(name);
        holder.tvRole.setText(member.getRole() != null ? member.getRole() : "Member");
        
        // Use placeholder progress for now
        holder.pbProgress.setProgress(60 + (position * 5) % 40);

        holder.itemView.setOnClickListener(v -> listener.onMemberClick(member));
    }

    @Override
    public int getItemCount() {
        return members.size();
    }

    static class MemberViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvRole;
        LinearProgressIndicator pbProgress;

        public MemberViewHolder(@NonNull View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_member_name);
            tvRole = itemView.findViewById(R.id.tv_member_role);
            pbProgress = itemView.findViewById(R.id.pb_member_progress);
        }
    }
}
