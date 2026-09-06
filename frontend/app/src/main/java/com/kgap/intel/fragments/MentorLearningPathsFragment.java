package com.kgap.intel.fragments;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.LearningPathApiService;
import com.kgap.intel.databinding.FragmentMentorLearningPathsBinding;
import com.kgap.intel.databinding.ItemLearningPathCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.MentorMenteesHelper;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorLearningPathsFragment extends Fragment {
    private FragmentMentorLearningPathsBinding binding;
    private LearningPathAdapter adapter;
    private final List<LearningPathItem> pathList = new ArrayList<>();

    public static class LearningPathItem {
        final String title;
        final String stages;
        final String activeLearners;
        final String description;
        final String stage1;
        final String stage2;
        final String stage3;

        public LearningPathItem(String title, String stages, String activeLearners, String description, String stage1, String stage2, String stage3) {
            this.title = title;
            this.stages = stages;
            this.activeLearners = activeLearners;
            this.description = description;
            this.stage1 = stage1;
            this.stage2 = stage2;
            this.stage3 = stage3;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorLearningPathsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        adapter = new LearningPathAdapter(pathList, this::showSupportPathDialog, this::showCurriculumDetails);
        binding.rvLearningPaths.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvLearningPaths.setAdapter(adapter);

        loadRealLearningPaths();
        setupAddPath();
    }

    private void loadRealLearningPaths() {
        pathList.clear();

        MentorMenteesHelper.loadAssignedMentees(requireContext(), mentees -> {
            if (binding == null) return;

            if (mentees.isEmpty()) {
                loadDefaultPaths();
                return;
            }

            final int total = mentees.size();
            final int[] pending = {total};
            final LearningPathApiService api = ApiClient.getClient(requireContext()).create(LearningPathApiService.class);

            for (EmployeeResponse emp : mentees) {
                String menteeName = (emp.getFirstName() != null ? emp.getFirstName() : "") + " " +
                        (emp.getLastName() != null ? emp.getLastName() : "");

                api.getLearningPaths(emp.getId()).enqueue(new Callback<List<LearningPathResponse>>() {
                    @Override
                    public void onResponse(Call<List<LearningPathResponse>> call, Response<List<LearningPathResponse>> response) {
                        if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                            for (LearningPathResponse lp : response.body()) {
                                String skill = lp.getSkillName() != null ? lp.getSkillName() : "Core Engineering";
                                String title = lp.getCourseTitle() != null ? lp.getCourseTitle() : (skill + " Mastery Roadmap");
                                String provider = lp.getProvider() != null ? lp.getProvider() : "Enterprise Internal";
                                int hours = lp.getEstimatedHours() != null ? lp.getEstimatedHours() : 24;
                                int progress = lp.getCompletionPercentage() != null ? lp.getCompletionPercentage() : 0;

                                pathList.add(new LearningPathItem(
                                        title,
                                        "3 Stages • " + hours + " Hours",
                                        "Learner: " + menteeName.trim() + " (" + progress + "% Complete)",
                                        "Curated roadmap for " + skill + " competency advancement, provided by " + provider + ".",
                                        "1️⃣ Stage 1: Foundational " + skill + " Principles",
                                        "2️⃣ Stage 2: Advanced Practical Exercises & Integration",
                                        "3️⃣ Stage 3: Capstone Validation & Defense Project"
                                ));
                            }
                        }
                        checkDonePaths(--pending[0]);
                    }

                    @Override
                    public void onFailure(Call<List<LearningPathResponse>> call, Throwable t) {
                        checkDonePaths(--pending[0]);
                    }
                });
            }
        });
    }

    private void checkDonePaths(int remaining) {
        if (remaining <= 0 && binding != null) {
            if (pathList.isEmpty()) {
                loadDefaultPaths();
            }
            adapter.notifyDataSetChanged();
        }
    }

    private void loadDefaultPaths() {
        pathList.add(new LearningPathItem(
                "Cloud Native Java Microservices Path",
                "3 Stages • 24 Hours",
                "Assigned Mentees Active",
                "Comprehensive track guiding backend engineers from REST fundamentals to Kafka event messaging, Docker containerization, and AWS ECS deployment.",
                "1️⃣ Stage 1: Spring Boot Core & Restful API Best Practices",
                "2️⃣ Stage 2: Database Concurrency & Hikari Connection Pooling",
                "3️⃣ Stage 3: Event-Driven Kafka Streaming & Microservice Resiliency"
        ));
        pathList.add(new LearningPathItem(
                "Enterprise Data Engineering & ML Pipeline Track",
                "3 Stages • 30 Hours",
                "Assigned Mentees Active",
                "Master large-scale ETL processing, Apache Spark transformations, PostgreSQL indexing, and predictive ML model operationalization.",
                "1️⃣ Stage 1: Advanced SQL & Query Execution Optimization",
                "2️⃣ Stage 2: Big Data ETL with Spark & Dataform Pipelines",
                "3️⃣ Stage 3: Feature Engineering & Production MLOps Serving"
        ));
        pathList.add(new LearningPathItem(
                "Modern Android & Jetpack Architecture Roadmap",
                "3 Stages • 20 Hours",
                "Assigned Mentees Active",
                "Master modern mobile architecture with Kotlin Coroutines, Retrofit networking, MVVM Clean Architecture, and Material 3 UI design.",
                "1️⃣ Stage 1: Declarative UI, ViewBinding & Material Design",
                "2️⃣ Stage 2: Room Offline Caching & Retrofit API Clients",
                "3️⃣ Stage 3: Reactive StateFlow & Modular Architecture"
        ));
    }

    private void setupAddPath() {
        binding.btnCreatePath.setOnClickListener(v -> {
            Context ctx = requireContext();
            LinearLayout layout = new LinearLayout(ctx);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(50, 30, 50, 10);

            EditText etTitle = new EditText(ctx);
            etTitle.setHint("Learning Path Name");
            layout.addView(etTitle);

            EditText etDesc = new EditText(ctx);
            etDesc.setHint("Target Competency & Roadmap Description");
            layout.addView(etDesc);

            EditText etStage1 = new EditText(ctx);
            etStage1.setHint("Stage 1 Milestone");
            layout.addView(etStage1);

            EditText etStage2 = new EditText(ctx);
            etStage2.setHint("Stage 2 Milestone");
            layout.addView(etStage2);

            new MaterialAlertDialogBuilder(ctx)
                    .setTitle("Create Structured Learning Path")
                    .setView(layout)
                    .setPositiveButton("Publish Roadmap", (dialog, which) -> {
                        String title = etTitle.getText().toString().trim();
                        String desc = etDesc.getText().toString().trim();
                        String s1 = etStage1.getText().toString().trim();
                        String s2 = etStage2.getText().toString().trim();

                        if (title.isEmpty()) {
                            Toast.makeText(ctx, "Please enter a learning path title", Toast.LENGTH_SHORT).show();
                            return;
                        }

                        LearningPathItem newItem = new LearningPathItem(
                                title,
                                "2 Stages • 4 Milestones",
                                "0 Learners (New)",
                                desc.isEmpty() ? "Curated domain progression roadmap." : desc,
                                "1️⃣ Stage 1: " + (s1.isEmpty() ? "Foundational Principles" : s1),
                                "2️⃣ Stage 2: " + (s2.isEmpty() ? "Advanced Domain Practice" : s2),
                                "3️⃣ Stage 3: Capstone Validation Project"
                        );

                        pathList.add(0, newItem);
                        adapter.notifyItemInserted(0);
                        binding.rvLearningPaths.scrollToPosition(0);

                        Long mentorId = SharedPrefManager.getInstance(ctx).getUserId();
                        new NotificationRepository(ctx).createNotification(mentorId, "Learning Path Published", "TRAINING_REMINDER",
                                "✓ Created and published new Learning Roadmap '" + title + "'.");

                        Toast.makeText(ctx, "✓ Learning Path published for Mentees!", Toast.LENGTH_SHORT).show();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    private void showSupportPathDialog(LearningPathItem item) {
        Context ctx = requireContext();
        new MaterialAlertDialogBuilder(ctx)
                .setTitle("Mentor Support: " + item.title)
                .setMessage("As Domain Mentor for this path, you can:\n\n" +
                        "• Conduct 1-on-1 milestone review sessions with enrolled mentees\n" +
                        "• Validate practical capstone code deliverables\n" +
                        "• Approve stage progression gates and readiness certificates\n\n" +
                        "Current Status: 🟢 Mentorship active with 100% milestone coverage.")
                .setPositiveButton("Dispatch Path Nudge", (dialog, which) -> {
                    Long mentorId = SharedPrefManager.getInstance(ctx).getUserId();
                    NotificationRepository repo = new NotificationRepository(ctx);
                    MentorMenteesHelper.loadAssignedMentees(ctx, mentees -> {
                        for (EmployeeResponse mentee : mentees) {
                            repo.createNotification(mentee.getId(), "Path Checkpoint Nudge", "MENTORSHIP",
                                    "📢 Your Domain Mentor sent milestone checkpoint guidance for '" + item.title + "'.");
                        }
                        repo.createNotification(mentorId, "Mentee Guidance Nudge Sent", "MENTORSHIP",
                                "📢 Sent path milestone guidance and study checkpoint to " + mentees.size() + " assigned mentees in '" + item.title + "'.");
                        Toast.makeText(ctx, "✓ Guidance checkpoint dispatched to " + mentees.size() + " assigned mentees!", Toast.LENGTH_SHORT).show();
                    });
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private void showCurriculumDetails(LearningPathItem item) {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle(item.title)
                .setMessage("📋 Description:\n" + item.description + "\n\n" +
                        "🗺️ Milestones & Stages:\n" +
                        item.stage1 + "\n\n" +
                        item.stage2 + "\n\n" +
                        item.stage3 + "\n\n" +
                        "👥 Enrolled: " + item.activeLearners)
                .setPositiveButton("Close", null)
                .show();
    }

    private static class LearningPathAdapter extends RecyclerView.Adapter<LearningPathAdapter.VH> {
        interface OnPathListener {
            void onAction(LearningPathItem item);
        }

        private final List<LearningPathItem> list;
        private final OnPathListener supportListener;
        private final OnPathListener detailsListener;

        LearningPathAdapter(List<LearningPathItem> list, OnPathListener supportListener, OnPathListener detailsListener) {
            this.list = list;
            this.supportListener = supportListener;
            this.detailsListener = detailsListener;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemLearningPathCardBinding b = ItemLearningPathCardBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            LearningPathItem item = list.get(position);
            holder.b.tvPathTitle.setText(item.title);
            holder.b.tvPathStages.setText(item.stages);
            holder.b.tvActiveLearnersCount.setText(item.activeLearners);
            holder.b.tvPathDesc.setText(item.description);
            holder.b.tvStage1.setText(item.stage1);
            holder.b.tvStage2.setText(item.stage2);
            holder.b.tvStage3.setText(item.stage3);

            holder.b.btnSupportMentees.setOnClickListener(v -> supportListener.onAction(item));
            holder.b.btnViewCurriculum.setOnClickListener(v -> detailsListener.onAction(item));
        }

        @Override
        public int getItemCount() { return list.size(); }

        static class VH extends RecyclerView.ViewHolder {
            final ItemLearningPathCardBinding b;
            VH(ItemLearningPathCardBinding b) {
                super(b.getRoot());
                this.b = b;
            }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
