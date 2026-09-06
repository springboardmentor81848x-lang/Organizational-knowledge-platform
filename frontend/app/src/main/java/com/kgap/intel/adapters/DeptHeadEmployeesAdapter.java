package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.kgap.intel.R;
import com.kgap.intel.models.EmployeeProgress;
import java.util.List;

public class DeptHeadEmployeesAdapter extends RecyclerView.Adapter<DeptHeadEmployeesAdapter.ViewHolder> {
    private List<EmployeeProgress> items;
    private OnEmployeeClickListener listener;

    public interface OnEmployeeClickListener {
        void onEmployeeClick(EmployeeProgress employee);
    }

    public DeptHeadEmployeesAdapter(List<EmployeeProgress> items) {
        this.items = items;
    }

    public DeptHeadEmployeesAdapter(List<EmployeeProgress> items, OnEmployeeClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_dept_employee, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        EmployeeProgress item = items.get(position);
        holder.tvName.setText(item.getEmployeeName());
        
        String roleText = item.getRole() != null ? item.getRole() : "Technical Team Member";
        if (item.getDepartment() != null && !item.getDepartment().isEmpty()) {
            roleText += " • " + item.getDepartment();
        }
        holder.tvRole.setText(roleText);

        holder.pbLearning.setProgress(item.getLearningProgress());
        holder.tvProgressPercent.setText(item.getLearningProgress() + "%");
        holder.tvInfo.setText("✓ " + item.getTrainingCompletion() + " Courses Completed");

        if (item.getActiveGapsCount() > 0) {
            holder.tvActiveGaps.setVisibility(View.VISIBLE);
            holder.tvActiveGaps.setText(item.getActiveGapsCount() + (item.getActiveGapsCount() == 1 ? " Gap" : " Gaps"));
        } else {
            holder.tvActiveGaps.setVisibility(View.GONE);
        }

        holder.itemView.setOnClickListener(v -> {
            if (listener != null) {
                listener.onEmployeeClick(item);
            }
        });
    }

    @Override
    public int getItemCount() {
        return items != null ? items.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvRole, tvInfo, tvProgressPercent, tvActiveGaps;
        LinearProgressIndicator pbLearning;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_employee_name);
            tvRole = itemView.findViewById(R.id.tv_employee_role);
            tvInfo = itemView.findViewById(R.id.tv_training_info);
            tvProgressPercent = itemView.findViewById(R.id.tv_progress_percent);
            tvActiveGaps = itemView.findViewById(R.id.tv_active_gaps);
            pbLearning = itemView.findViewById(R.id.pb_learning_progress);
        }
    }
}
