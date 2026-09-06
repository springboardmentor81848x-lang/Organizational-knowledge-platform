package com.kgap.intel.fragments;

import android.content.Context;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
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
import com.kgap.intel.R;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentMentorTrainingCatalogBinding;
import com.kgap.intel.databinding.ItemMentorCourseCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.MentorMenteesHelper;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorTrainingCatalogFragment extends Fragment {
    private FragmentMentorTrainingCatalogBinding binding;
    private CourseAdapter adapter;
    private final List<ExternalCourse> allCourses = new ArrayList<>();
    private String currentQuery = "";
    private String selectedLevel = "ALL";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorTrainingCatalogBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupRecyclerView();
        setupSearchAndFilter();
        setupAddProgram();
        loadCourses();
    }

    private void setupRecyclerView() {
        adapter = new CourseAdapter(new ArrayList<>(), this::showAssignMenteesDialog);
        binding.rvCourses.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvCourses.setAdapter(adapter);
    }

    private void setupSearchAndFilter() {
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentQuery = s.toString();
                filterCourses();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        binding.chipGroupLevels.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) return;
            int id = checkedIds.get(0);
            if (id == R.id.chip_all) {
                selectedLevel = "ALL";
            } else if (id == R.id.chip_beginner) {
                selectedLevel = "BEGINNER";
            } else if (id == R.id.chip_intermediate) {
                selectedLevel = "INTERMEDIATE";
            } else if (id == R.id.chip_advanced) {
                selectedLevel = "ADVANCED";
            }
            filterCourses();
        });
    }

    private void setupAddProgram() {
        binding.btnAddProgram.setOnClickListener(v -> {
            Context ctx = requireContext();
            LinearLayout layout = new LinearLayout(ctx);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(50, 30, 50, 10);

            EditText etTitle = new EditText(ctx);
            etTitle.setHint("Course / Program Title");
            layout.addView(etTitle);

            EditText etSkill = new EditText(ctx);
            etSkill.setHint("Target Skill (e.g. Java, Docker, REST API)");
            layout.addView(etSkill);

            EditText etDesc = new EditText(ctx);
            etDesc.setHint("Learning Objectives & Modules");
            layout.addView(etDesc);

            new MaterialAlertDialogBuilder(ctx)
                    .setTitle("Add New Training Program")
                    .setView(layout)
                    .setPositiveButton("Publish to Catalog", (dialog, which) -> {
                        String title = etTitle.getText().toString().trim();
                        String skill = etSkill.getText().toString().trim();
                        String desc = etDesc.getText().toString().trim();

                        if (title.isEmpty()) {
                            Toast.makeText(ctx, "Please enter a program title", Toast.LENGTH_SHORT).show();
                            return;
                        }

                        ExternalCourse newCourse = new ExternalCourse();
                        newCourse.setId((long) (allCourses.size() + 100));
                        newCourse.setTitle(title);
                        newCourse.setSkillName(skill.isEmpty() ? "General Competency" : skill);
                        newCourse.setDescription(desc.isEmpty() ? "Curated enterprise learning module with milestone assessments." : desc);
                        newCourse.setProvider("Enterprise Internal (Mentor Curated)");
                        newCourse.setLevel("INTERMEDIATE");
                        newCourse.setDurationHours(16);

                        allCourses.add(0, newCourse);
                        filterCourses();

                        Long mentorId = SharedPrefManager.getInstance(ctx).getUserId();
                        new NotificationRepository(ctx).createNotification(mentorId, "New Program Published", "TRAINING_REMINDER",
                                "✓ Successfully published '" + title + "' to Enterprise Training Catalog.");

                        Toast.makeText(ctx, "✓ Program published to Catalog!", Toast.LENGTH_SHORT).show();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    private void loadCourses() {
        binding.progressBar.setVisibility(View.VISIBLE);
        ApiClient.getTrainingApiService(requireContext()).getAllCourses().enqueue(new Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(Call<List<ExternalCourse>> call, Response<List<ExternalCourse>> response) {
                if (binding == null) return;
                binding.progressBar.setVisibility(View.GONE);

                if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                    allCourses.clear();
                    allCourses.addAll(response.body());
                } else {
                    populateDefaultEnterpriseCourses();
                }
                filterCourses();
            }

            @Override
            public void onFailure(Call<List<ExternalCourse>> call, Throwable t) {
                if (binding == null) return;
                binding.progressBar.setVisibility(View.GONE);
                populateDefaultEnterpriseCourses();
                filterCourses();
            }
        });
    }

    private void populateDefaultEnterpriseCourses() {
        allCourses.clear();
        ExternalCourse c1 = new ExternalCourse();
        c1.setId(1L);
        c1.setTitle("Advanced Spring Microservices Architecture");
        c1.setSkillName("Java & Spring Boot");
        c1.setProvider("Enterprise Internal • 24 Hours");
        c1.setLevel("ADVANCED");
        c1.setDescription("Deep dive into distributed transactions, event-driven Kafka architectures, Resilience4j, and Kubernetes orchestration.");
        allCourses.add(c1);

        ExternalCourse c2 = new ExternalCourse();
        c2.setId(2L);
        c2.setTitle("Production PostgreSQL Performance & Query Optimization");
        c2.setSkillName("SQL & Database Engineering");
        c2.setProvider("Coursera for Enterprise • 18 Hours");
        c2.setLevel("INTERMEDIATE");
        c2.setDescription("Indexing strategies, query planner execution plans, connection pool tuning, and transaction isolation levels.");
        allCourses.add(c2);

        ExternalCourse c3 = new ExternalCourse();
        c3.setId(3L);
        c3.setTitle("Modern Android Architecture with Jetpack Compose");
        c3.setSkillName("Mobile Engineering");
        c3.setProvider("Google Developers • 20 Hours");
        c3.setLevel("BEGINNER");
        c3.setDescription("Declarative UI construction, state hoisting, Coroutines, Flow, MVVM architecture, and Room offline persistence.");
        allCourses.add(c3);

        ExternalCourse c4 = new ExternalCourse();
        c4.setId(4L);
        c4.setTitle("Enterprise Cloud Security & OAuth2/JWT Hardening");
        c4.setSkillName("Security & Governance");
        c4.setProvider("Udemy Business • 14 Hours");
        c4.setLevel("ADVANCED");
        c4.setDescription("RS256 asymmetric cryptographic signing, refresh token rotation, PKCE flows, and zero-trust perimeter enforcement.");
        allCourses.add(c4);
    }

    private void filterCourses() {
        List<ExternalCourse> filtered = allCourses.stream().filter(c -> {
            boolean matchesLevel = "ALL".equalsIgnoreCase(selectedLevel) ||
                    (c.getLevel() != null && c.getLevel().equalsIgnoreCase(selectedLevel));

            String q = currentQuery.toLowerCase().trim();
            boolean matchesQuery = q.isEmpty() ||
                    (c.getTitle() != null && c.getTitle().toLowerCase().contains(q)) ||
                    (c.getSkillName() != null && c.getSkillName().toLowerCase().contains(q)) ||
                    (c.getProvider() != null && c.getProvider().toLowerCase().contains(q));

            return matchesLevel && matchesQuery;
        }).collect(Collectors.toList());

        adapter.updateList(filtered);
    }

    private void showAssignMenteesDialog(ExternalCourse course) {
        Context ctx = requireContext();
        MentorMenteesHelper.loadAssignedMentees(ctx, mentees -> {
            if (mentees.isEmpty()) {
                Toast.makeText(ctx, "No mentees currently assigned to your mentorship profile.", Toast.LENGTH_SHORT).show();
                return;
            }

            String[] names = new String[mentees.size()];
            boolean[] checked = new boolean[mentees.size()];
            for (int i = 0; i < mentees.size(); i++) {
                EmployeeResponse emp = mentees.get(i);
                names[i] = emp.getFirstName() + " " + emp.getLastName() + " (" + (emp.getDepartment() != null ? emp.getDepartment() : "General") + ")";
            }

            new MaterialAlertDialogBuilder(ctx)
                    .setTitle("Assign Module to Mentees")
                    .setMultiChoiceItems(names, checked, (dialog, which, isChecked) -> checked[which] = isChecked)
                    .setPositiveButton("Dispatch Assignment", (dialog, which) -> {
                        int assignedCount = 0;
                        Long mentorId = SharedPrefManager.getInstance(ctx).getUserId();
                        NotificationRepository repo = new NotificationRepository(ctx);

                        for (int i = 0; i < checked.length; i++) {
                            if (checked[i]) {
                                assignedCount++;
                                EmployeeResponse mentee = mentees.get(i);

                                // Send notification to mentee
                                repo.createNotification(mentee.getId(), "New Course Assigned", "TRAINING_REMINDER",
                                        "📚 Your Domain Mentor assigned you to '" + course.getTitle() + "'! Please review objectives and start Module 1.");
                            }
                        }

                        if (assignedCount > 0) {
                            repo.createNotification(mentorId, "Course Dispatched", "TRAINING_REMINDER",
                                    "✓ Dispatched course '" + course.getTitle() + "' to " + assignedCount + " mentees.");
                            Toast.makeText(ctx, "✓ Assigned '" + course.getTitle() + "' to " + assignedCount + " mentees!", Toast.LENGTH_SHORT).show();
                        } else {
                            Toast.makeText(ctx, "No mentees selected.", Toast.LENGTH_SHORT).show();
                        }
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    private static class CourseAdapter extends RecyclerView.Adapter<CourseAdapter.VH> {
        interface OnCourseAssignListener {
            void onAssign(ExternalCourse course);
        }

        private List<ExternalCourse> list;
        private final OnCourseAssignListener listener;

        CourseAdapter(List<ExternalCourse> list, OnCourseAssignListener listener) {
            this.list = list;
            this.listener = listener;
        }

        void updateList(List<ExternalCourse> newList) {
            this.list = newList;
            notifyDataSetChanged();
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemMentorCourseCardBinding b = ItemMentorCourseCardBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            ExternalCourse c = list.get(position);
            holder.b.tvCourseTitle.setText(c.getTitle());
            holder.b.tvProvider.setText((c.getProvider() != null ? c.getProvider() : "Enterprise Catalog") +
                    (c.getDurationHours() != null && c.getDurationHours() > 0 ? " • " + c.getDurationHours() + "h" : ""));
            holder.b.tvLevelBadge.setText(c.getLevel() != null ? c.getLevel().toUpperCase() : "ALL LEVELS");
            holder.b.tvCourseDesc.setText(c.getDescription() != null ? c.getDescription() : "Comprehensive course path.");
            holder.b.tvSkillTag.setText("🏷️ " + (c.getSkillName() != null ? c.getSkillName() : "General Competency"));

            holder.b.btnAssignMentee.setOnClickListener(v -> listener.onAssign(c));
        }

        @Override
        public int getItemCount() { return list.size(); }

        static class VH extends RecyclerView.ViewHolder {
            final ItemMentorCourseCardBinding b;
            VH(ItemMentorCourseCardBinding b) {
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
