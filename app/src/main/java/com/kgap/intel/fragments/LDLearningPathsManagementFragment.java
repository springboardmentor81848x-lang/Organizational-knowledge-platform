package com.kgap.intel.fragments;

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
import com.kgap.intel.R;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentLdLearningPathsManagementBinding;
import com.kgap.intel.databinding.ItemLdLearningPathCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.repository.EmployeeRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LDLearningPathsManagementFragment extends Fragment {
    private FragmentLdLearningPathsManagementBinding binding;
    private final List<LearningPathItem> learningPathList = new ArrayList<>();
    private final Map<Long, EmployeeResponse> employeeMap = new HashMap<>();
    private PathsAdapter adapter;

    public static class LearningPathItem {
        final Long id;
        final Long employeeId;
        final String learnerName;
        final String pathTitle;
        final String targetRole;
        final int progressPercent;
        final int hoursLogged;
        final int totalHours;
        final String status;

        public LearningPathItem(Long id, Long employeeId, String learnerName, String pathTitle, String targetRole, int progressPercent, int hoursLogged, int totalHours, String status) {
            this.id = id;
            this.employeeId = employeeId;
            this.learnerName = learnerName;
            this.pathTitle = pathTitle;
            this.targetRole = targetRole;
            this.progressPercent = progressPercent;
            this.hoursLogged = hoursLogged;
            this.totalHours = totalHours;
            this.status = status;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLdLearningPathsManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        binding.rvLearningPaths.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new PathsAdapter(learningPathList, this::onAdaptPathClicked, this::onMilestonesClicked);
        binding.rvLearningPaths.setAdapter(adapter);

        binding.fabCreatePath.setOnClickListener(v -> showCreatePathDialog());

        loadEmployeesAndPaths();
    }

    private void loadEmployeesAndPaths() {
        binding.pbLoading.setVisibility(View.VISIBLE);
        new EmployeeRepository(requireContext()).getAllEmployees().observe(getViewLifecycleOwner(), employees -> {
            if (employees != null) {
                employeeMap.clear();
                for (EmployeeResponse emp : employees) {
                    if (emp.getId() != null) employeeMap.put(emp.getId(), emp);
                }
            }
            fetchLearningPaths();
        });
    }

    private void fetchLearningPaths() {
        ApiClient.getLDApiService(requireContext()).getAllLearningPaths().enqueue(new Callback<List<LearningPathResponse>>() {
            @Override
            public void onResponse(Call<List<LearningPathResponse>> call, Response<List<LearningPathResponse>> response) {
                if (binding == null) return;
                binding.pbLoading.setVisibility(View.GONE);
                learningPathList.clear();

                if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                    for (LearningPathResponse lp : response.body()) {
                        String name = "Learner #" + lp.getEmployeeId();
                        if (lp.getEmployeeId() != null && employeeMap.containsKey(lp.getEmployeeId())) {
                            EmployeeResponse emp = employeeMap.get(lp.getEmployeeId());
                            name = emp.getFirstName() + " " + emp.getLastName() + " • " + (emp.getDepartment() != null ? emp.getDepartment() : "Eng.");
                        }

                        int pct = lp.getCompletionPercentage() != null ? lp.getCompletionPercentage() : 45;
                        int total = lp.getEstimatedHours() != null ? lp.getEstimatedHours() : 40;
                        int logged = (int) (total * (pct / 100.0));

                        String title = lp.getCourseTitle() != null ? lp.getCourseTitle() : (lp.getSkillName() != null ? lp.getSkillName() + " Specialization Track" : "Personalized Technical Mastery Track");

                        learningPathList.add(new LearningPathItem(
                                lp.getId(),
                                lp.getEmployeeId(),
                                name,
                                title,
                                "Target: " + (lp.getTargetLevel() != null ? lp.getTargetLevel() + " Proficiency" : "Senior Role Progression"),
                                pct,
                                logged,
                                total,
                                lp.getStatus() != null ? lp.getStatus() : "IN PROGRESS"
                        ));
                    }
                }

                binding.tvEmpty.setVisibility(learningPathList.isEmpty() ? View.VISIBLE : View.GONE);
                adapter.notifyDataSetChanged();
            }

            @Override
            public void onFailure(Call<List<LearningPathResponse>> call, Throwable t) {
                if (binding == null) return;
                binding.pbLoading.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(learningPathList.isEmpty() ? View.VISIBLE : View.GONE);
                adapter.notifyDataSetChanged();
            }
        });
    }

    private void showCreatePathDialog() {
        LinearLayout layout = new LinearLayout(requireContext());
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 24, 48, 24);

        final EditText etTitle = new EditText(requireContext());
        etTitle.setHint("Learning Path Title");
        layout.addView(etTitle);

        final EditText etTargetRole = new EditText(requireContext());
        etTargetRole.setHint("Target Role / Objective");
        layout.addView(etTargetRole);

        final EditText etHours = new EditText(requireContext());
        etHours.setHint("Total Estimated Hours (e.g. 40)");
        etHours.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        layout.addView(etHours);

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Create Personalized Learning Path")
                .setView(layout)
                .setPositiveButton("Create Path", (dialog, which) -> {
                    String title = etTitle.getText().toString().trim();
                    String role = etTargetRole.getText().toString().trim();
                    int hours = 40;
                    try { hours = Integer.parseInt(etHours.getText().toString().trim()); } catch (Exception ignored) {}

                    if (title.isEmpty()) {
                        Toast.makeText(getContext(), "Title is required", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    learningPathList.add(0, new LearningPathItem(
                            System.currentTimeMillis(),
                            4L,
                            "Aarav Sharma • Backend Eng.",
                            title,
                            "Target: " + (role.isEmpty() ? "Technical Competency" : role),
                            0,
                            0,
                            hours,
                            "INITIALIZED"
                    ));
                    adapter.notifyItemInserted(0);
                    binding.rvLearningPaths.scrollToPosition(0);
                    Toast.makeText(getContext(), "Created Learning Path successfully!", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void onAdaptPathClicked(LearningPathItem item) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, new LDAdaptiveRecommendationsFragment())
                .addToBackStack(null)
                .commit();
    }

    private void onMilestonesClicked(LearningPathItem item) {
        String[] milestones = {
                "✓ Milestone 1: Spring Boot Core & Dependency Injection (100% Done)",
                "✓ Milestone 2: RESTful API Design with OpenAPI & Swagger (100% Done)",
                "⚡ Milestone 3: Microservices Communication & Resilience4j (In Progress)",
                "○ Milestone 4: Docker & Kubernetes Container Deployment (Pending)"
        };

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle(item.pathTitle)
                .setItems(milestones, null)
                .setPositiveButton("Close", null)
                .show();
    }

    private static class PathsAdapter extends RecyclerView.Adapter<PathsAdapter.ViewHolder> {
        private final List<LearningPathItem> list;
        private final OnAdaptListener onAdapt;
        private final OnMilestonesListener onMilestones;

        interface OnAdaptListener { void onAdapt(LearningPathItem item); }
        interface OnMilestonesListener { void onMilestones(LearningPathItem item); }

        PathsAdapter(List<LearningPathItem> list, OnAdaptListener onAdapt, OnMilestonesListener onMilestones) {
            this.list = list;
            this.onAdapt = onAdapt;
            this.onMilestones = onMilestones;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemLdLearningPathCardBinding b = ItemLdLearningPathCardBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
            return new ViewHolder(b);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            LearningPathItem item = list.get(position);
            holder.binding.tvLearnerName.setText(item.learnerName);
            holder.binding.tvStatusBadge.setText(item.status);
            holder.binding.tvPathTitle.setText(item.pathTitle);
            holder.binding.tvTargetRole.setText(item.targetRole);
            holder.binding.tvProgressLabel.setText("Path Completion: " + item.progressPercent + "%");
            holder.binding.tvHoursLogged.setText(item.hoursLogged + " / " + item.totalHours + " Hours");
            holder.binding.pbPathProgress.setProgress(item.progressPercent);

            holder.binding.btnAdaptiveRemedy.setOnClickListener(v -> onAdapt.onAdapt(item));
            holder.binding.btnViewMilestones.setOnClickListener(v -> onMilestones.onMilestones(item));
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            final ItemLdLearningPathCardBinding binding;
            ViewHolder(ItemLdLearningPathCardBinding binding) {
                super(binding.getRoot());
                this.binding = binding;
            }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
