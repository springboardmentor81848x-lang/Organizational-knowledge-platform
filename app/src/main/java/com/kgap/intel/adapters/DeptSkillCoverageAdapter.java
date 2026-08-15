package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.kgap.intel.R;
import com.kgap.intel.models.DepartmentSkill;
import java.util.List;

public class DeptSkillCoverageAdapter extends RecyclerView.Adapter<DeptSkillCoverageAdapter.ViewHolder> {
    private List<DepartmentSkill> items;

    public DeptSkillCoverageAdapter(List<DepartmentSkill> items) {
        this.items = items;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_dept_skill_coverage, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DepartmentSkill item = items.get(position);
        holder.tvName.setText(item.getSkillName());
        holder.pbCoverage.setProgress(item.getCurrentCoverage());
        holder.tvCoverage.setText(item.getCurrentCoverage() + "/" + item.getRequiredCoverage() + "%");
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvCoverage;
        LinearProgressIndicator pbCoverage;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_skill_name);
            tvCoverage = itemView.findViewById(R.id.tv_coverage_text);
            pbCoverage = itemView.findViewById(R.id.pb_coverage);
        }
    }
}
