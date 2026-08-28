package com.kgap.intel.adapters;

import android.graphics.Color;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.card.MaterialCardView;
import com.google.android.material.progressindicator.LinearProgressIndicator;
import com.kgap.intel.R;
import com.kgap.intel.models.DepartmentResponse;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

public class DepartmentHealthAdapter extends RecyclerView.Adapter<DepartmentHealthAdapter.ViewHolder> {
    private List<DepartmentResponse> departments;
    private Map<String, Integer> gapCounts = new HashMap<>();
    private Map<String, Integer> employeeCounts = new HashMap<>();
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

    public void setEmployeeCounts(Map<String, Integer> counts) {
        this.employeeCounts = counts != null ? counts : new HashMap<>();
        notifyDataSetChanged();
    }

    public void setDepartments(List<DepartmentResponse> departments) {
        this.departments = departments;
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_department_health, parent, false);
        return new ViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        DepartmentResponse item = departments.get(position);
        String name = item.getName() != null ? item.getName() : "Engineering";
        holder.tvName.setText(name);

        int gaps = gapCounts.getOrDefault(name, 0);
        int emps = employeeCounts.getOrDefault(name, 2);

        holder.tvMeta.setText(emps + (emps == 1 ? " Member" : " Members") + " • " + gaps + (gaps == 1 ? " Active Gap" : " Active Gaps"));

        // Calculate dynamic competency health percentage: 100 - (gaps * 100 / (emps * 7))
        int health = Math.max(35, Math.min(100, 100 - (int) ((gaps * 100.0) / Math.max(1, emps * 7))));
        holder.tvScore.setText(health + "% Health");
        holder.progressHealth.setProgress(health);

        // Styling based on department theme
        String colorHex = "#00897B";
        String bgHex = "#E0F2F1";
        if (name.contains("Frontend")) {
            colorHex = "#0288D1"; bgHex = "#E1F5FE";
        } else if (name.contains("Data")) {
            colorHex = "#7B1FA2"; bgHex = "#F3E5F5";
        } else if (name.contains("Cloud") || name.contains("DevOps")) {
            colorHex = "#3949AB"; bgHex = "#E8EAF6";
        } else if (name.contains("Cyber") || name.contains("Security")) {
            colorHex = "#D84315"; bgHex = "#FBE9E7";
        } else if (name.contains("Product") || name.contains("Operations")) {
            colorHex = "#F57C00"; bgHex = "#FFF3E0";
        }

        holder.ivIcon.setColorFilter(Color.parseColor(colorHex));
        holder.cardIcon.setCardBackgroundColor(Color.parseColor(bgHex));
        holder.progressHealth.setIndicatorColor(Color.parseColor(colorHex));

        holder.itemView.setOnClickListener(v -> listener.onDepartmentClick(item));
    }

    @Override
    public int getItemCount() {
        return departments != null ? departments.size() : 0;
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvName, tvMeta, tvScore;
        ImageView ivIcon;
        MaterialCardView cardIcon;
        LinearProgressIndicator progressHealth;

        ViewHolder(View itemView) {
            super(itemView);
            tvName = itemView.findViewById(R.id.tv_dept_name);
            tvMeta = itemView.findViewById(R.id.tv_dept_meta);
            tvScore = itemView.findViewById(R.id.tv_dept_score);
            ivIcon = itemView.findViewById(R.id.iv_dept_icon);
            cardIcon = itemView.findViewById(R.id.card_dept_icon);
            progressHealth = itemView.findViewById(R.id.progress_dept_health);
        }
    }
}
