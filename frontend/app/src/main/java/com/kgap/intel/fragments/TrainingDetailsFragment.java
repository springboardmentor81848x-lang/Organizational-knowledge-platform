package com.kgap.intel.fragments;

import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentTrainingDetailsBinding;
import com.kgap.intel.databinding.ItemMilestoneDetailBinding;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.MilestoneItem;
import com.kgap.intel.models.TrainingEnrollment;
import com.kgap.intel.repository.TrainingRepository;
import java.util.ArrayList;
import java.util.List;

public class TrainingDetailsFragment extends Fragment {

    private static final String ARG_ENROLLMENT = "enrollment";
    private static final String ARG_TITLE = "title";
    private static final String ARG_DESCRIPTION = "description";

    private FragmentTrainingDetailsBinding binding;
    private TrainingRepository repository;
    private TrainingEnrollment enrollment;
    private String customTitle;
    private String customDescription;
    private ExternalCourse matchedCourse;

    public static TrainingDetailsFragment newInstance(TrainingEnrollment enrollment) {
        return newInstance(enrollment, null, null);
    }

    public static TrainingDetailsFragment newInstance(TrainingEnrollment enrollment, String title, String description) {
        TrainingDetailsFragment fragment = new TrainingDetailsFragment();
        Bundle args = new Bundle();
        args.putSerializable(ARG_ENROLLMENT, enrollment);
        if (title != null) args.putString(ARG_TITLE, title);
        if (description != null) args.putString(ARG_DESCRIPTION, description);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        binding = FragmentTrainingDetailsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        repository = new TrainingRepository(requireContext());
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        if (getArguments() != null) {
            enrollment = (TrainingEnrollment) getArguments().getSerializable(ARG_ENROLLMENT);
            customTitle = getArguments().getString(ARG_TITLE);
            customDescription = getArguments().getString(ARG_DESCRIPTION);
        }

        if (enrollment == null) {
            Toast.makeText(requireContext(), "Training details not available", Toast.LENGTH_SHORT).show();
            getParentFragmentManager().popBackStack();
            return;
        }

        populateUI();
        loadCourseMetadata();
        setupMilestones();
        setupActions();
    }

    private void loadCourseMetadata() {
        repository.getCourses().observe(getViewLifecycleOwner(), courses -> {
            if (courses != null && enrollment != null && enrollment.getTrainingId() != null) {
                for (ExternalCourse c : courses) {
                    if (enrollment.getTrainingId().equals(c.getId())) {
                        matchedCourse = c;
                        if (c.getTitle() != null && (customTitle == null || customTitle.startsWith("Training Program #"))) {
                            binding.tvTrainingTitle.setText(c.getTitle());
                        }
                        if (c.getDescription() != null && customDescription == null) {
                            binding.tvTrainingDescription.setText(c.getDescription());
                        }
                        if (c.getProvider() != null) {
                            binding.tvTopic.setText("Provider: " + c.getProvider() + " • Enrollment #" + enrollment.getId());
                        }
                        break;
                    }
                }
            }
        });
    }

    private void populateUI() {
        String title = customTitle != null ? customTitle : "Training Program #" + (enrollment.getTrainingId() != null ? enrollment.getTrainingId() : enrollment.getId());
        binding.tvTrainingTitle.setText(title);
        binding.tvTopic.setText("Enrollment ID: #" + enrollment.getId());

        String desc = customDescription != null ? customDescription : "Master essential domain competencies and track your learning milestones for this enrolled training.";
        binding.tvTrainingDescription.setText(desc);

        String status = enrollment.getStatus() != null ? enrollment.getStatus() : "IN_PROGRESS";
        binding.chipStatus.setText(status.replace("_", " "));
        int statusBg;
        int statusTxt;
        switch (status.toUpperCase()) {
            case "COMPLETED":
                statusBg = Color.parseColor("#E8F5E9");
                statusTxt = Color.parseColor("#00B894");
                break;
            case "NOT_STARTED":
            case "ENROLLED":
                statusBg = Color.parseColor("#FFF3E0");
                statusTxt = Color.parseColor("#EF6C00");
                break;
            default: // IN_PROGRESS
                statusBg = Color.parseColor("#E3F2FD");
                statusTxt = Color.parseColor("#1976D2");
                break;
        }
        binding.chipStatus.setBackgroundColor(statusBg);
        binding.chipStatus.setTextColor(statusTxt);

        String enrolledDate = enrollment.getEnrolledAt();
        binding.tvEnrolledDate.setText("Enrolled: " + (enrolledDate != null ? formatDate(enrolledDate) : "Active"));
        String completedDate = enrollment.getCompletedAt();
        binding.tvCompleteDate.setText("Completed: " + (completedDate != null ? formatDate(completedDate) : ("COMPLETED".equalsIgnoreCase(status) ? "Yes" : "Pending")));

        int progress = enrollment.getProgressPercentage() != null ? enrollment.getProgressPercentage() : 0;
        binding.tvProgressPercent.setText(progress + "%");
        binding.pbOverall.setProgress(progress);
        binding.tvProgressEnrolled.setText("Enrolled: " + (enrolledDate != null ? formatDate(enrolledDate) : "Active"));
        binding.tvProgressExpected.setText("COMPLETED".equalsIgnoreCase(status) ? "Status: Complete" : "Status: In Progress");

        if ("COMPLETED".equalsIgnoreCase(status) || progress >= 100) {
            binding.btnTakeAssessment.setText("Retake Assessment (Practice)");
        } else {
            binding.btnTakeAssessment.setText("Take Skill Assessment to Progress");
        }
    }

    private void setupMilestones() {
        int progress = enrollment.getProgressPercentage() != null ? enrollment.getProgressPercentage() : 0;
        List<MilestoneItem> milestones = new ArrayList<>();

        milestones.add(new MilestoneItem(
                "Module 1: Foundations & Architecture",
                "Core syntax, basic concepts, and architectural overview",
                getMilestoneStatus(progress, 0, 25),
                Math.min(progress * 4, 100),
                null,
                progress >= 25
        ));

        milestones.add(new MilestoneItem(
                "Module 2: Practical Implementation",
                "Hands-on coding, exercises, and service building",
                getMilestoneStatus(progress, 25, 50),
                progress >= 25 ? Math.min((progress - 25) * 4, 100) : 0,
                null,
                progress >= 50
        ));

        milestones.add(new MilestoneItem(
                "Module 3: Advanced Optimization & Testing",
                "Performance tuning, caching, and comprehensive test suites",
                getMilestoneStatus(progress, 50, 75),
                progress >= 50 ? Math.min((progress - 50) * 4, 100) : 0,
                null,
                progress >= 75
        ));

        milestones.add(new MilestoneItem(
                "Module 4: Final Capstone & Skill Assessment",
                "Production deployment, peer review, and skill gap closure",
                getMilestoneStatus(progress, 75, 100),
                progress >= 75 ? Math.min((progress - 75) * 4, 100) : 0,
                null,
                progress >= 100
        ));

        MilestoneAdapter adapter = new MilestoneAdapter(milestones);
        binding.rvMilestones.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvMilestones.setNestedScrollingEnabled(false);
        binding.rvMilestones.setAdapter(adapter);
    }

    private String getMilestoneStatus(int progress, int start, int end) {
        if (progress >= end) return "COMPLETED";
        if (progress > start) return "IN_PROGRESS";
        return "NOT_STARTED";
    }

    private void setupActions() {
        // 1. Access Course Content
        binding.btnAccessCourse.setOnClickListener(v -> {
            if (matchedCourse != null && matchedCourse.getCourseLink() != null && !matchedCourse.getCourseLink().isEmpty()) {
                try {
                    Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse(matchedCourse.getCourseLink()));
                    startActivity(browserIntent);
                } catch (Exception e) {
                    showContentDialog();
                }
            } else {
                showContentDialog();
            }
        });

        // 2. Take Assessment to advance progress
        binding.btnTakeAssessment.setOnClickListener(v -> {
            String skillId = matchedCourse != null && matchedCourse.getSkillName() != null ? getSkillIdByName(matchedCourse.getSkillName()) : "1";
            String skillName = matchedCourse != null && matchedCourse.getSkillName() != null ? matchedCourse.getSkillName() : "Java & Spring Boot";

            getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, SkillAssessmentFragment.newInstance(skillId, skillName))
                    .addToBackStack(null)
                    .commit();
        });
    }

    private String getSkillIdByName(String skillName) {
        if (skillName == null) return "1";
        switch (skillName.toLowerCase()) {
            case "java":
            case "spring boot": return "1";
            case "postgresql":
            case "database": return "2";
            case "react":
            case "frontend": return "3";
            case "ai":
            case "ml": return "4";
            case "docker": return "5";
            case "kubernetes": return "6";
            case "rest api": return "7";
            case "documentation": return "8";
            case "product": return "9";
            case "cyber risk":
            case "security": return "10";
            case "data pipelines":
            case "bigquery": return "11";
            case "ui/ux": return "12";
            default: return "1";
        }
    }

    private void showContentDialog() {
        String title = binding.tvTrainingTitle.getText().toString();
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Course Syllabus & Material")
                .setMessage("📖 " + title + "\n\n"
                        + "• Module 1: Core Fundamentals & Syntax\n"
                        + "• Module 2: Design Patterns & Best Practices\n"
                        + "• Module 3: Hands-on Projects & Lab Exercises\n"
                        + "• Module 4: Production Readiness & Deployment\n\n"
                        + "To advance your progress and close your skill gap, tap 'Take Skill Assessment' below.")
                .setPositiveButton("Take Assessment", (d, w) -> binding.btnTakeAssessment.performClick())
                .setNegativeButton("Close", null)
                .show();
    }

    private String formatDate(String isoDate) {
        if (isoDate == null) return "—";
        try {
            if (isoDate.contains("T")) return isoDate.split("T")[0];
            return isoDate;
        } catch (Exception e) {
            return isoDate;
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    // ──────────────────────── Milestone Adapter ──────────────────────────────────

    private static class MilestoneAdapter extends RecyclerView.Adapter<MilestoneAdapter.VH> {
        private final List<MilestoneItem> items;

        MilestoneAdapter(List<MilestoneItem> items) {
            this.items = items;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemMilestoneDetailBinding b = ItemMilestoneDetailBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            holder.bind(items.get(position), position + 1);
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class VH extends RecyclerView.ViewHolder {
            final ItemMilestoneDetailBinding b;

            VH(ItemMilestoneDetailBinding b) {
                super(b.getRoot());
                this.b = b;
            }

            void bind(MilestoneItem item, int number) {
                b.tvMilestoneNum.setText(String.valueOf(number));
                b.tvMilestoneTitle.setText(item.getTitle());

                String status = item.getStatus() != null ? item.getStatus() : "NOT_STARTED";

                int statusBg, statusTxt, numBg;
                switch (status) {
                    case "COMPLETED":
                        statusBg = Color.parseColor("#E8F5E9");
                        statusTxt = Color.parseColor("#00B894");
                        numBg = Color.parseColor("#00B894");
                        b.pbMilestone.setVisibility(View.GONE);
                        break;
                    case "IN_PROGRESS":
                        statusBg = Color.parseColor("#E3F2FD");
                        statusTxt = Color.parseColor("#1976D2");
                        numBg = Color.parseColor("#1976D2");
                        b.pbMilestone.setVisibility(View.VISIBLE);
                        int prog = item.getProgressPercentage() != null ? item.getProgressPercentage() : 0;
                        b.pbMilestone.setProgress(prog);
                        break;
                    default: // NOT_STARTED
                        statusBg = Color.parseColor("#F5F5F5");
                        statusTxt = Color.parseColor("#757575");
                        numBg = Color.parseColor("#BDBDBD");
                        b.pbMilestone.setVisibility(View.GONE);
                        break;
                }
                b.chipMilestoneStatus.setText(status.replace("_", " "));
                b.chipMilestoneStatus.setBackgroundColor(statusBg);
                b.chipMilestoneStatus.setTextColor(statusTxt);
                if (b.tvMilestoneNum.getBackground() != null) {
                    b.tvMilestoneNum.getBackground().setTint(numBg);
                }
            }
        }
    }
}
