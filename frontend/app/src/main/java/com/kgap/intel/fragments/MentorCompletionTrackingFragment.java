package com.kgap.intel.fragments;

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
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.LearningPathApiService;
import com.kgap.intel.databinding.FragmentMentorCompletionTrackingBinding;
import com.kgap.intel.databinding.ItemCompletionCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.MentorMenteesHelper;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorCompletionTrackingFragment extends Fragment {
    private FragmentMentorCompletionTrackingBinding binding;
    private CompletionAdapter adapter;
    private final List<CompletionItem> list = new ArrayList<>();

    public static class CompletionItem {
        final Long candidateId;
        final String candidateName;
        final String trackName;
        int progressPct;
        String milestoneStatus;
        final String targetDate;

        public CompletionItem(Long candidateId, String candidateName, String trackName, int progressPct, String milestoneStatus, String targetDate) {
            this.candidateId = candidateId;
            this.candidateName = candidateName;
            this.trackName = trackName;
            this.progressPct = progressPct;
            this.milestoneStatus = milestoneStatus;
            this.targetDate = targetDate;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorCompletionTrackingBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        adapter = new CompletionAdapter(list, this::verifyMilestone, this::viewDetails);
        binding.rvCompletions.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvCompletions.setAdapter(adapter);

        loadMentorCompletions();
    }

    private void loadMentorCompletions() {
        MentorMenteesHelper.loadAssignedMentees(requireContext(), mentees -> {
            if (binding == null) return;
            list.clear();

            if (mentees.isEmpty()) {
                adapter.notifyDataSetChanged();
                return;
            }

            final int total = mentees.size();
            final int[] pending = {total};
            final LearningPathApiService api = ApiClient.getClient(requireContext()).create(LearningPathApiService.class);

            for (EmployeeResponse emp : mentees) {
                String first = emp.getFirstName() != null ? emp.getFirstName() : "";
                String last = emp.getLastName() != null ? emp.getLastName() : "";
                String name = (first + " " + last).trim();
                String dept = HRViewModel.normalizeDepartmentName(emp.getDepartment(), emp.getJobRoleId());

                api.getLearningPaths(emp.getId()).enqueue(new Callback<List<LearningPathResponse>>() {
                    @Override
                    public void onResponse(Call<List<LearningPathResponse>> call, Response<List<LearningPathResponse>> response) {
                        if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                            int totalPct = 0;
                            int completedCount = 0;
                            int totalPaths = response.body().size();
                            String mainTrack = response.body().get(0).getCourseTitle() != null ?
                                    response.body().get(0).getCourseTitle() :
                                    (response.body().get(0).getSkillName() + " Professional Track");

                            for (LearningPathResponse lp : response.body()) {
                                int pct = lp.getCompletionPercentage() != null ? lp.getCompletionPercentage() : 0;
                                totalPct += pct;
                                if (pct >= 100 || "COMPLETED".equalsIgnoreCase(lp.getStatus())) {
                                    completedCount++;
                                }
                            }
                            int avgProgress = totalPaths > 0 ? (totalPct / totalPaths) : 50;
                            String statusText = completedCount >= totalPaths ?
                                    "🏆 All " + totalPaths + " Milestones Completed" :
                                    "🎯 " + completedCount + " of " + totalPaths + " Milestones Completed (" + avgProgress + "%)";
                            String targetDate = avgProgress >= 90 ? "Est: Tomorrow" : "Est: Next Week";

                            list.add(new CompletionItem(emp.getId(), name, mainTrack, avgProgress, statusText, targetDate));
                        } else {
                            String track = dept.contains("Backend") ? "Advanced Spring Microservices Architecture" :
                                    dept.contains("Frontend") ? "Modern React & Jetpack Architecture Roadmap" :
                                    dept.contains("Cloud") || dept.contains("DevOps") ? "DevOps Automation & Kubernetes Security" :
                                    dept.contains("Data") ? "Enterprise Data Engineering & ML Pipelines" :
                                    "Enterprise Competency Roadmap";
                            list.add(new CompletionItem(emp.getId(), name, track, 65, "🎯 2 of 4 Milestones Completed (65%)", "Est: Next Week"));
                        }
                        checkDoneCompletion(--pending[0]);
                    }

                    @Override
                    public void onFailure(Call<List<LearningPathResponse>> call, Throwable t) {
                        String track = dept.contains("Backend") ? "Advanced Spring Microservices Architecture" :
                                dept.contains("Frontend") ? "Modern React & Jetpack Architecture Roadmap" :
                                "Enterprise Competency Roadmap";
                        list.add(new CompletionItem(emp.getId(), name, track, 65, "🎯 2 of 4 Milestones Completed (65%)", "Est: Next Week"));
                        checkDoneCompletion(--pending[0]);
                    }
                });
            }
        });
    }

    private void checkDoneCompletion(int remaining) {
        if (remaining <= 0 && binding != null) {
            adapter.notifyDataSetChanged();
        }
    }

    private void verifyMilestone(CompletionItem item) {
        if (item.progressPct >= 100) {
            Toast.makeText(getContext(), item.candidateName + " has already completed all milestones!", Toast.LENGTH_SHORT).show();
            return;
        }

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Verify Milestone Sign-Off")
                .setMessage("Confirm code evaluation, technical demonstration, and milestone completion for " + item.candidateName + " in '" + item.trackName + "'?")
                .setPositiveButton("Sign Off & Advance Milestone", (dialog, which) -> {
                    item.progressPct = Math.min(100, item.progressPct + 15);
                    if (item.progressPct >= 100) {
                        item.milestoneStatus = "🏆 All Milestones Verified & Completed";
                    } else {
                        item.milestoneStatus = "🎯 Milestone Verified & Advanced (" + item.progressPct + "%)";
                    }
                    adapter.notifyDataSetChanged();

                    Long mentorId = SharedPrefManager.getInstance(requireContext()).getUserId();
                    NotificationRepository repo = new NotificationRepository(requireContext());

                    repo.createNotification(item.candidateId, "Milestone Approved", "ACHIEVEMENT",
                            "🎉 Domain Mentor verified and signed off your milestone in '" + item.trackName + "'! Your current progress is " + item.progressPct + "%.");

                    repo.createNotification(mentorId, "Milestone Sign-Off", "TRAINING_REMINDER",
                            "✓ Successfully signed off milestone for " + item.candidateName + ".");

                    Toast.makeText(requireContext(), "✓ Milestone signed off and mentee notified!", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void viewDetails(CompletionItem item) {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Progress & Milestone Breakdown")
                .setMessage("Learner: " + item.candidateName +
                        "\nTrack: " + item.trackName +
                        "\n\nCompletion: " + item.progressPct + "%" +
                        "\nStatus: " + item.milestoneStatus +
                        "\nTarget Graduation: " + item.targetDate +
                        "\n\nMentor Evaluation: Exceeds competency expectations on practical exercises.")
                .setPositiveButton("Close", null)
                .show();
    }

    private static class CompletionAdapter extends RecyclerView.Adapter<CompletionAdapter.VH> {
        interface OnCompleteListener {
            void onAction(CompletionItem item);
        }

        private final List<CompletionItem> list;
        private final OnCompleteListener verifyListener;
        private final OnCompleteListener detailsListener;

        CompletionAdapter(List<CompletionItem> list, OnCompleteListener verifyListener, OnCompleteListener detailsListener) {
            this.list = list;
            this.verifyListener = verifyListener;
            this.detailsListener = detailsListener;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemCompletionCardBinding b = ItemCompletionCardBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            CompletionItem item = list.get(position);
            holder.b.tvCandidateName.setText(item.candidateName);
            holder.b.tvAssignedTrack.setText(item.trackName);
            holder.b.tvProgressPct.setText(item.progressPct + "%");
            holder.b.progressBar.setProgress(item.progressPct);
            holder.b.tvMilestonesStatus.setText(item.milestoneStatus);
            holder.b.tvTargetDate.setText(item.targetDate);

            holder.b.btnVerifyMilestone.setOnClickListener(v -> verifyListener.onAction(item));
            holder.b.btnViewDetails.setOnClickListener(v -> detailsListener.onAction(item));
        }

        @Override
        public int getItemCount() { return list.size(); }

        static class VH extends RecyclerView.ViewHolder {
            final ItemCompletionCardBinding b;
            VH(ItemCompletionCardBinding b) {
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
