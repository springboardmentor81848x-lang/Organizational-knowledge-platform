package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.kgap.intel.R;
import com.kgap.intel.models.DepartmentResponse;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class DepartmentHealthAdapter extends RecyclerView.Adapter<DepartmentHealthAdapter.ViewHolder> {
    private List<DepartmentResponse> departments;
    private Map<String, Integer> gapCounts = new HashMap<>();
    private final OnDepartmentClickListener listener;

    public interface OnDepartmentClickListener {
        void onDepartmentClick(DepartmentResponse department);
    }

    public DepartmentHealthAdapter(List<DepartmentResponse> departments, OnDepartmentClickListener listener) {
        this.departments = departments;
        this.listener = listener;
    }

    public void setGapCounts(Map<String, Integer> counts) {
        this.gapCounts = counts != null ? counts : new HashMap<>();
        notifyDataSetChanged();
    }

    public void setDepartments(List<DepartmentResponse> departments) {
        this.departments = departments;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_gap_overview, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DepartmentResponse item = departments.get(position);
        String name = item.getName() != null ? item.getName() : "Unknown";
        holder.tvName.setText(name);
        
        int gaps = gapCounts.getOrDefault(name, 0);
        holder.tvGapLabel.setText("Total Gaps: " + gaps);
        
        // Mock health percentage as (100 - gaps*2) clamped
        int health = Math.max(30, Math.min(100, 100 - (gaps * 5)));
        holder.tvCurrentVal.setText(health + "%");
        holder.progressCurrent.setProgress(health);
        
        holder.itemView.setOnClickListener(v -> listener.onDepartmentClick(item));
    }

    @Override
    public int getItemCount() {
        return departments != null ? departments.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvGapLabel, tvCurrentVal;
        LinearProgressIndicator progressCurrent;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_skill_name);
            tvGapLabel = itemView.findViewById(R.id.tv_gap_label);
            tvCurrentVal = itemView.findViewById(R.id.tv_current_val);
            progressCurrent = itemView.findViewById(R.id.progress_current);
            
            View rv = itemView.findViewById(R.id.tv_required_val);
            if (rv != null) rv.setVisibility(View.GONE);
            View pr = itemView.findViewById(R.id.progress_required);
            if (pr != null) pr.setVisibility(View.GONE);
        }
    }
}
