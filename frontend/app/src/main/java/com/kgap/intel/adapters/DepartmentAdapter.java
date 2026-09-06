package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.models.DepartmentResponse;
import java.util.List;

public class DepartmentAdapter extends RecyclerView.Adapter<DepartmentAdapter.ViewHolder> {
    private final List<DepartmentResponse> departments;
    private final OnDepartmentClickListener listener;

    public interface OnDepartmentClickListener {
        void onDepartmentClick(DepartmentResponse department);
    }

    public DepartmentAdapter(List<DepartmentResponse> departments, OnDepartmentClickListener listener) {
        this.departments = departments;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_department, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DepartmentResponse dept = departments.get(position);
        holder.tvName.setText(dept.getName() != null ? dept.getName() : "Unknown Department");
        holder.itemView.setOnClickListener(v -> listener.onDepartmentClick(dept));
    }

    @Override
    public int getItemCount() {
        return departments != null ? departments.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_dept_name);
        }
    }
}
