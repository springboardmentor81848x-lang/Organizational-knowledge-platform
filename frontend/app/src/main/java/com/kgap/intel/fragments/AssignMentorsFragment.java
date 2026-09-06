package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AlertDialog;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentAssignMentorsBinding;
import com.kgap.intel.databinding.ItemAssignMentorBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.MentorAssignmentRequest;
import com.kgap.intel.models.MentorProfileResponse;
import com.kgap.intel.repository.EmployeeRepository;
import com.kgap.intel.repository.MentorAssignmentRepository;
import com.kgap.intel.repository.RealMentorRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class AssignMentorsFragment extends Fragment {
    private FragmentAssignMentorsBinding binding;
    private EmployeeRepository employeeRepository;
    private RealMentorRepository mentorRepository;
    private MentorAssignmentRepository assignmentRepository;
    private final List<EmployeeResponse> employeesList = new ArrayList<>();
    private final List<MentorProfileResponse> mentorsList = new ArrayList<>();
    private final Map<Long, String> assignedMentorsMap = new HashMap<>();
    private AssignmentAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentAssignMentorsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        employeeRepository = new EmployeeRepository(requireContext());
        mentorRepository = new RealMentorRepository(requireContext());
        assignmentRepository = new MentorAssignmentRepository(requireContext());

        binding.rvAssignments.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new AssignmentAdapter();
        binding.rvAssignments.setAdapter(adapter);

        loadData();
    }

    private final Map<Long, EmployeeResponse> allEmployeesMap = new HashMap<>();

    private void loadData() {
        binding.progressBar.setVisibility(View.VISIBLE);

        // Load all employees first
        employeeRepository.getAllEmployees().observe(getViewLifecycleOwner(), employees -> {
            if (employees != null) {
                allEmployeesMap.clear();
                employeesList.clear();
                for (EmployeeResponse emp : employees) {
                    if (emp.getId() != null) {
                        allEmployeesMap.put(emp.getId(), emp);
                        if ("EMPLOYEE".equalsIgnoreCase(emp.getRole())) {
                            employeesList.add(emp);
                        }
                    }
                }
                adapter.notifyDataSetChanged();

                // Load mentors list
                mentorRepository.getMentors().observe(getViewLifecycleOwner(), mentors -> {
                    binding.progressBar.setVisibility(View.GONE);
                    if (mentors != null) {
                        mentorsList.clear();
                        mentorsList.addAll(mentors);
                    }
                    // Fetch assignments for each employee to display them
                    for (EmployeeResponse emp : employeesList) {
                        fetchAssignmentForEmployee(emp.getId());
                    }
                });
            } else {
                binding.progressBar.setVisibility(View.GONE);
                Toast.makeText(getContext(), "Failed to load employees", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchAssignmentForEmployee(Long employeeId) {
        assignmentRepository.getCurrentAssignmentForEmployee(employeeId).observe(getViewLifecycleOwner(), assignment -> {
            if (assignment != null && "ACTIVE".equalsIgnoreCase(assignment.getStatus())) {
                Long mentorId = assignment.getMentorId();
                String mentorName = "Mentor #" + mentorId;
                EmployeeResponse mentorEmp = allEmployeesMap.get(mentorId);
                if (mentorEmp != null) {
                    mentorName = mentorEmp.getFirstName() + " " + mentorEmp.getLastName();
                } else {
                    for (MentorProfileResponse mentor : mentorsList) {
                        if (mentor.getEffectiveMentorId() != null && mentor.getEffectiveMentorId().equals(mentorId)) {
                            mentorName = mentor.getDisplayName();
                            break;
                        }
                    }
                }
                assignedMentorsMap.put(employeeId, mentorName);
            } else {
                assignedMentorsMap.put(employeeId, "None Assigned");
            }
            adapter.notifyDataSetChanged();
        });
    }

    private void showMentorSelectionDialog(EmployeeResponse employee) {
        if (mentorsList.isEmpty()) {
            Toast.makeText(getContext(), "No mentors available", Toast.LENGTH_SHORT).show();
            return;
        }

        View dialogView = LayoutInflater.from(requireContext()).inflate(R.layout.dialog_search_mentor, null);
        com.kgap.intel.databinding.DialogSearchMentorBinding db = com.kgap.intel.databinding.DialogSearchMentorBinding.bind(dialogView);

        String empName = employee.getFirstName() + " " + employee.getLastName();
        db.tvDialogTitle.setText("Select Mentor for " + empName);

        List<MentorProfileResponse> filteredMentors = new ArrayList<>(mentorsList);
        db.rvMentorCandidates.setLayoutManager(new LinearLayoutManager(requireContext()));

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .create();

        MentorPickerAdapter pickerAdapter = new MentorPickerAdapter(filteredMentors, selectedMentor -> {
            dialog.dismiss();
            assignMentor(employee.getId(), selectedMentor.getEffectiveMentorId());
        });
        db.rvMentorCandidates.setAdapter(pickerAdapter);

        db.etSearchMentor.addTextChangedListener(new android.text.TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                String query = s.toString().toLowerCase().trim();
                filteredMentors.clear();
                if (query.isEmpty()) {
                    filteredMentors.addAll(mentorsList);
                } else {
                    for (MentorProfileResponse m : mentorsList) {
                        String name = m.getDisplayName() != null ? m.getDisplayName().toLowerCase() : "";
                        String expertise = m.getExpertise() != null ? m.getExpertise().toLowerCase() : "";
                        if (name.contains(query) || expertise.contains(query)) {
                            filteredMentors.add(m);
                        }
                    }
                }
                db.tvNoMentorsFound.setVisibility(filteredMentors.isEmpty() ? View.VISIBLE : View.GONE);
                pickerAdapter.notifyDataSetChanged();
            }
            @Override public void afterTextChanged(android.text.Editable s) {}
        });

        db.btnCancel.setOnClickListener(v -> dialog.dismiss());
        dialog.show();
    }

    private static class MentorPickerAdapter extends RecyclerView.Adapter<MentorPickerAdapter.ViewHolder> {
        private final List<MentorProfileResponse> list;
        private final OnMentorSelectedListener onSelected;

        interface OnMentorSelectedListener { void onSelected(MentorProfileResponse mentor); }

        MentorPickerAdapter(List<MentorProfileResponse> list, OnMentorSelectedListener onSelected) {
            this.list = list;
            this.onSelected = onSelected;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            com.kgap.intel.databinding.ItemMentorPickerRowBinding b = 
                    com.kgap.intel.databinding.ItemMentorPickerRowBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
            return new ViewHolder(b);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            MentorProfileResponse item = list.get(position);
            holder.binding.tvMentorName.setText(item.getDisplayName());
            holder.binding.tvMentorExpertise.setText(item.getExpertise() != null ? item.getExpertise() : "Domain Mentor");
            holder.binding.tvAvailabilityBadge.setText(item.getAvailability() != null ? item.getAvailability() : "Available");
            holder.itemView.setOnClickListener(v -> onSelected.onSelected(item));
        }

        @Override
        public int getItemCount() { return list.size(); }

        static class ViewHolder extends RecyclerView.ViewHolder {
            final com.kgap.intel.databinding.ItemMentorPickerRowBinding binding;
            ViewHolder(com.kgap.intel.databinding.ItemMentorPickerRowBinding binding) {
                super(binding.getRoot());
                this.binding = binding;
            }
        }
    }

    private void assignMentor(Long employeeId, Long mentorId) {
        binding.progressBar.setVisibility(View.VISIBLE);
        MentorAssignmentRequest request = new MentorAssignmentRequest(employeeId, mentorId);
        assignmentRepository.createAssignment(request).observe(getViewLifecycleOwner(), assignment -> {
            binding.progressBar.setVisibility(View.GONE);
            if (assignment != null) {
                Toast.makeText(getContext(), "Mentor assigned successfully", Toast.LENGTH_SHORT).show();
                fetchAssignmentForEmployee(employeeId);
            } else {
                Toast.makeText(getContext(), "Failed to assign mentor", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private class AssignmentAdapter extends RecyclerView.Adapter<AssignmentAdapter.ViewHolder> {

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemAssignMentorBinding b = ItemAssignMentorBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
            return new ViewHolder(b);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            EmployeeResponse emp = employeesList.get(position);
            holder.binding.tvEmployeeName.setText(emp.getFirstName() + " " + emp.getLastName());
            holder.binding.tvEmployeeRole.setText(emp.getRole() + " • " + emp.getDepartment());

            String mentorName = assignedMentorsMap.getOrDefault(emp.getId(), "Loading...");
            holder.binding.tvMentorName.setText(mentorName);

            holder.binding.btnAssign.setOnClickListener(v -> showMentorSelectionDialog(emp));
        }

        @Override
        public int getItemCount() {
            return employeesList.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            final ItemAssignMentorBinding binding;
            ViewHolder(ItemAssignMentorBinding binding) {
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
