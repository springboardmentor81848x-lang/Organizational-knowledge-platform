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

    public DeptHeadEmployeesAdapter(List<EmployeeProgress> items) {
        this.items = items;
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
        holder.pbSkill.setProgress(item.getSkillProgress());
        holder.pbLearning.setProgress(item.getLearningProgress());
        holder.tvInfo.setText("Completed: " + item.getTrainingCompletion() + " programs");
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvInfo;
        LinearProgressIndicator pbSkill, pbLearning;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_employee_name);
            tvInfo = itemView.findViewById(R.id.tv_training_info);
            pbSkill = itemView.findViewById(R.id.pb_skill_progress);
            pbLearning = itemView.findViewById(R.id.pb_learning_progress);
        }
    }
}
