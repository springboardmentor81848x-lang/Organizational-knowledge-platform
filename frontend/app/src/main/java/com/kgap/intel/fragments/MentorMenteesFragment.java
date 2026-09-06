package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.adapters.MentorMenteesAdapter;
import com.kgap.intel.databinding.FragmentMentorMenteesBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.MenteeProgress;
import com.kgap.intel.utils.MentorMenteesHelper;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.List;

public class MentorMenteesFragment extends Fragment {
    private FragmentMentorMenteesBinding binding;
    private final List<MenteeProgress> menteeList = new ArrayList<>();
    private MentorMenteesAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorMenteesBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvMentees.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new MentorMenteesAdapter(menteeList, this::onMenteeClicked);
        binding.rvMentees.setAdapter(adapter);

        loadAssignedMentees();
    }

    private void onMenteeClicked(MenteeProgress mentee) {
        Long menteeId = null;
        try {
            menteeId = Long.parseLong(mentee.getMenteeId());
        } catch (Exception ignored) {}

        if (getActivity() instanceof com.kgap.intel.activities.MainActivity) {
            ((com.kgap.intel.activities.MainActivity) getActivity()).switchFragment(
                    ChatFragment.newInstance(mentee.getMenteeName(), menteeId));
        }
    }

    private void loadAssignedMentees() {
        MentorMenteesHelper.loadAssignedMentees(requireContext(), mentees -> {
            if (binding == null) return;
            menteeList.clear();

            int index = 0;
            for (EmployeeResponse emp : mentees) {
                String name = (emp.getFirstName() != null ? emp.getFirstName() : "") + " " +
                        (emp.getLastName() != null ? emp.getLastName() : "");
                String dept = HRViewModel.normalizeDepartmentName(emp.getDepartment(), emp.getJobRoleId());
                String role = (emp.getRole() != null ? emp.getRole() : "Software Engineer") + " • " + dept;

                int progress = 65 + (index * 7) % 35;
                String path = dept.contains("Backend") ? "Spring Microservices Roadmap" :
                        dept.contains("Data") ? "Enterprise Data Pipelines Track" :
                        dept.contains("Cloud") || dept.contains("DevOps") ? "Cloud Native & Kubernetes Path" :
                        "Modern Android & Jetpack Architecture";

                MenteeProgress mp = new MenteeProgress(
                        String.valueOf(emp.getId()),
                        name.trim(),
                        role,
                        progress,
                        new ArrayList<>(),
                        new ArrayList<>(),
                        path
                );
                menteeList.add(mp);
                index++;
            }

            adapter.notifyDataSetChanged();
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
