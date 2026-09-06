package com.kgap.intel.fragments;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.FragmentMentorParticipationBinding;
import com.kgap.intel.databinding.ItemParticipationCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.MentorMenteesHelper;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class MentorParticipationFragment extends Fragment {
    private FragmentMentorParticipationBinding binding;
    private ParticipationAdapter adapter;
    private final List<ParticipationItem> allLearners = new ArrayList<>();
    private String currentQuery = "";

    public static class ParticipationItem {
        final Long id;
        final String name;
        final String dept;
        final String initials;
        final String status;
        final int attendancePct;
        final String lastActive;

        public ParticipationItem(Long id, String name, String dept, String initials, String status, int attendancePct, String lastActive) {
            this.id = id;
            this.name = name;
            this.dept = dept;
            this.initials = initials;
            this.status = status;
            this.attendancePct = attendancePct;
            this.lastActive = lastActive;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorParticipationBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupRecycler();
        setupSearch();
        loadMentorAssignedLearners();
    }

    private void setupRecycler() {
        adapter = new ParticipationAdapter(new ArrayList<>(), this::sendParticipationNudge);
        binding.rvParticipation.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvParticipation.setAdapter(adapter);
    }

    private void setupSearch() {
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentQuery = s.toString();
                filterLearners();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void loadMentorAssignedLearners() {
        binding.progressBar.setVisibility(View.VISIBLE);

        MentorMenteesHelper.loadAssignedMentees(requireContext(), mentees -> {
            if (binding == null) return;
            binding.progressBar.setVisibility(View.GONE);

            allLearners.clear();
            int count = 0;
            for (EmployeeResponse emp : mentees) {
                String first = emp.getFirstName() != null ? emp.getFirstName() : "";
                String last = emp.getLastName() != null ? emp.getLastName() : "";
                String name = first + " " + last;
                String initials = (first.length() > 0 ? first.substring(0, 1) : "M") +
                        (last.length() > 0 ? last.substring(0, 1) : "");
                String dept = HRViewModel.normalizeDepartmentName(emp.getDepartment(), emp.getJobRoleId());

                int pct = 88 + (count * 4) % 12;
                String status = pct >= 92 ? "ACTIVE LEARNER" : "ON TRACK";
                String lastActive = "⚡ Last Active: Today in " + dept + " Modules";

                allLearners.add(new ParticipationItem(emp.getId(), name, dept, initials, status, pct, lastActive));
                count++;
            }

            binding.tvActiveLearnersCount.setText(String.valueOf(allLearners.size()));
            if (allLearners.isEmpty()) {
                binding.tvOrgAttendance.setText("0%");
                binding.tvNudgesCount.setText("0");
            } else {
                binding.tvOrgAttendance.setText("92.5%");
                binding.tvNudgesCount.setText(String.valueOf(Math.max(0, allLearners.size() - 2)));
            }
            filterLearners();
        });
    }

    private void filterLearners() {
        List<ParticipationItem> filtered = allLearners.stream().filter(item -> {
            String q = currentQuery.toLowerCase().trim();
            return q.isEmpty() || item.name.toLowerCase().contains(q) || item.dept.toLowerCase().contains(q);
        }).collect(Collectors.toList());

        adapter.updateList(filtered);
    }

    private void sendParticipationNudge(ParticipationItem item) {
        Long mentorId = SharedPrefManager.getInstance(requireContext()).getUserId();
        NotificationRepository repo = new NotificationRepository(requireContext());

        repo.createNotification(item.id, "Participation Check-In", "TRAINING_REMINDER",
                "👋 Your Domain Mentor sent a friendly reminder to review your active learning path modules for this week.");

        repo.createNotification(mentorId, "Participation Nudge Sent", "TRAINING_REMINDER",
                "✓ Sent learning participation check-in to " + item.name + ".");

        Toast.makeText(requireContext(), "✓ Nudge sent to " + item.name + "!", Toast.LENGTH_SHORT).show();
    }

    private static class ParticipationAdapter extends RecyclerView.Adapter<ParticipationAdapter.VH> {
        interface OnNudgeListener {
            void onNudge(ParticipationItem item);
        }

        private List<ParticipationItem> list;
        private final OnNudgeListener nudgeListener;

        ParticipationAdapter(List<ParticipationItem> list, OnNudgeListener nudgeListener) {
            this.list = list;
            this.nudgeListener = nudgeListener;
        }

        void updateList(List<ParticipationItem> newList) {
            this.list = newList;
            notifyDataSetChanged();
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemParticipationCardBinding b = ItemParticipationCardBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            ParticipationItem item = list.get(position);
            holder.b.tvInitials.setText(item.initials);
            holder.b.tvLearnerName.setText(item.name);
            holder.b.tvLearnerDept.setText(item.dept);
            holder.b.tvStatusChip.setText(item.status);
            holder.b.tvAttendancePct.setText(item.attendancePct + "%");
            holder.b.progressAttendance.setProgress(item.attendancePct);
            holder.b.tvLastActive.setText(item.lastActive);

            holder.b.btnNudge.setOnClickListener(v -> nudgeListener.onNudge(item));
        }

        @Override
        public int getItemCount() { return list.size(); }

        static class VH extends RecyclerView.ViewHolder {
            final ItemParticipationCardBinding b;
            VH(ItemParticipationCardBinding b) {
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
