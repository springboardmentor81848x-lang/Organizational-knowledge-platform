package com.kgap.intel.adapters;

import android.content.Context;
import android.content.Intent;
import android.content.res.ColorStateList;
import android.net.Uri;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ItemCourseCatalogBinding;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.TrainingEnrollment;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class CourseCatalogAdapter extends RecyclerView.Adapter<CourseCatalogAdapter.ViewHolder> {

    public interface OnEnrollClickListener {
        void onEnrollClick(ExternalCourse course);
    }

    private final List<ExternalCourse> allCourses = new ArrayList<>();
    private final List<ExternalCourse> displayedCourses = new ArrayList<>();
    private final Map<Long, TrainingEnrollment> enrollmentMap = new HashMap<>();
    private final Set<Long> inFlightTrainingIds = new HashSet<>();
    private final OnEnrollClickListener enrollListener;

    private String currentQuery = "";
    private String currentLevelFilter = "All";

    public CourseCatalogAdapter(OnEnrollClickListener enrollListener) {
        this.enrollListener = enrollListener;
    }

    public void setCourses(List<ExternalCourse> courses) {
        allCourses.clear();
        if (courses != null) {
            allCourses.addAll(courses);
        }
        applyFilter();
    }

    public void setEnrollments(List<TrainingEnrollment> enrollments) {
        enrollmentMap.clear();
        if (enrollments != null) {
            for (TrainingEnrollment enrollment : enrollments) {
                if (enrollment.getTrainingId() != null) {
                    TrainingEnrollment existing = enrollmentMap.get(enrollment.getTrainingId());
                    // Keep active (non-cancelled) enrollment if exists
                    if (existing == null || !"CANCELLED".equalsIgnoreCase(enrollment.getStatus())) {
                        enrollmentMap.put(enrollment.getTrainingId(), enrollment);
                    }
                }
            }
        }
        notifyDataSetChanged();
    }

    public void setEnrollmentInFlight(Long trainingId, boolean inFlight) {
        if (inFlight) {
            inFlightTrainingIds.add(trainingId);
        } else {
            inFlightTrainingIds.remove(trainingId);
        }
        notifyDataSetChanged();
    }

    public void filter(String query, String level) {
        this.currentQuery = query != null ? query.trim().toLowerCase() : "";
        this.currentLevelFilter = level != null ? level : "All";
        applyFilter();
    }

    private void applyFilter() {
        displayedCourses.clear();
        for (ExternalCourse course : allCourses) {
            boolean matchesQuery = true;
            if (!currentQuery.isEmpty()) {
                String title = course.getTitle() != null ? course.getTitle().toLowerCase() : "";
                String skill = course.getSkillName() != null ? course.getSkillName().toLowerCase() : "";
                String provider = course.getProvider() != null ? course.getProvider().toLowerCase() : "";
                matchesQuery = title.contains(currentQuery) || skill.contains(currentQuery) || provider.contains(currentQuery);
            }

            boolean matchesLevel = true;
            if (!"All".equalsIgnoreCase(currentLevelFilter)) {
                matchesLevel = course.getLevel() != null && course.getLevel().equalsIgnoreCase(currentLevelFilter);
            }

            if (matchesQuery && matchesLevel) {
                displayedCourses.add(course);
            }
        }
        notifyDataSetChanged();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemCourseCatalogBinding binding = ItemCourseCatalogBinding.inflate(
                LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        ExternalCourse course = displayedCourses.get(position);
        Context context = holder.itemView.getContext();

        holder.binding.tvCourseTitle.setText(course.getTitle() != null ? course.getTitle() : "Untitled Course");
        holder.binding.tvCourseProvider.setText(course.getProvider() != null ? course.getProvider() : "KGAP Learning");
        holder.binding.tvCourseLevel.setText(course.getLevel() != null ? course.getLevel().toUpperCase() : "ALL LEVELS");

        if (course.getDescription() != null && !course.getDescription().trim().isEmpty()) {
            holder.binding.tvCourseDescription.setVisibility(View.VISIBLE);
            holder.binding.tvCourseDescription.setText(course.getDescription());
        } else {
            holder.binding.tvCourseDescription.setVisibility(View.GONE);
        }

        String skillText = "Skill: " + (course.getSkillName() != null ? course.getSkillName() : "General");
        holder.binding.tvCourseSkill.setText(skillText);

        int hours = course.getDurationHours() != null ? course.getDurationHours() : 10;
        holder.binding.tvCourseDuration.setText(hours + " Hours");

        // Course Link Button
        if (course.getCourseLink() != null && !course.getCourseLink().trim().isEmpty()) {
            holder.binding.btnCourseLink.setVisibility(View.VISIBLE);
            holder.binding.btnCourseLink.setOnClickListener(v -> {
                try {
                    String url = course.getCourseLink().trim();
                    if (!url.startsWith("http://") && !url.startsWith("https://")) {
                        url = "https://" + url;
                    }
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    context.startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(context, "Cannot open link: " + course.getCourseLink(), Toast.LENGTH_SHORT).show();
                }
            });
        } else {
            holder.binding.btnCourseLink.setVisibility(View.GONE);
        }

        // Enrollment state
        Long trainingId = course.getId();
        boolean isInFlight = trainingId != null && inFlightTrainingIds.contains(trainingId);

        if (isInFlight) {
            holder.binding.btnEnroll.setVisibility(View.INVISIBLE);
            holder.binding.pbEnroll.setVisibility(View.VISIBLE);
        } else {
            holder.binding.btnEnroll.setVisibility(View.VISIBLE);
            holder.binding.pbEnroll.setVisibility(View.GONE);

            TrainingEnrollment enrollment = trainingId != null ? enrollmentMap.get(trainingId) : null;
            String status = enrollment != null ? enrollment.getStatus() : null;

            if (status != null && !"CANCELLED".equalsIgnoreCase(status)) {
                if ("COMPLETED".equalsIgnoreCase(status)) {
                    holder.binding.btnEnroll.setText("✓ Completed");
                    holder.binding.btnEnroll.setEnabled(false);
                    holder.binding.btnEnroll.setBackgroundTintList(ColorStateList.valueOf(ContextCompat.getColor(context, R.color.overlay_emerald)));
                    holder.binding.btnEnroll.setTextColor(ContextCompat.getColor(context, R.color.gap_low));
                } else if ("IN_PROGRESS".equalsIgnoreCase(status)) {
                    int percent = enrollment.getProgressPercentage() != null ? enrollment.getProgressPercentage() : 0;
                    holder.binding.btnEnroll.setText("In Progress (" + percent + "%)");
                    holder.binding.btnEnroll.setEnabled(false);
                    holder.binding.btnEnroll.setBackgroundTintList(ColorStateList.valueOf(ContextCompat.getColor(context, R.color.surface_variant)));
                    holder.binding.btnEnroll.setTextColor(ContextCompat.getColor(context, R.color.primary_purple));
                } else { // ENROLLED
                    holder.binding.btnEnroll.setText("✓ Enrolled");
                    holder.binding.btnEnroll.setEnabled(false);
                    holder.binding.btnEnroll.setBackgroundTintList(ColorStateList.valueOf(ContextCompat.getColor(context, R.color.overlay_emerald)));
                    holder.binding.btnEnroll.setTextColor(ContextCompat.getColor(context, R.color.primary_emerald));
                }
            } else {
                // Not enrolled or cancelled
                holder.binding.btnEnroll.setText("Enroll");
                holder.binding.btnEnroll.setEnabled(true);
                holder.binding.btnEnroll.setBackgroundTintList(ColorStateList.valueOf(ContextCompat.getColor(context, R.color.primary_emerald)));
                holder.binding.btnEnroll.setTextColor(ContextCompat.getColor(context, R.color.white));
                holder.binding.btnEnroll.setOnClickListener(v -> {
                    if (enrollListener != null) {
                        enrollListener.onEnrollClick(course);
                    }
                });
            }
        }
    }

    @Override
    public int getItemCount() {
        return displayedCourses.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final ItemCourseCatalogBinding binding;

        ViewHolder(ItemCourseCatalogBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
