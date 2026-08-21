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
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentMentorshipRequestsListBinding;
import com.kgap.intel.databinding.ItemMentorshipRequestBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.ExpertItem;
import com.kgap.intel.models.MentorshipRequest;
import com.kgap.intel.repository.EmployeeRepository;
import com.kgap.intel.repository.MentorshipRequestRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MentorshipRequestsListFragment extends Fragment {
    private static final String ARG_IS_INCOMING = "is_incoming";
    private FragmentMentorshipRequestsListBinding binding;
    private MentorshipRequestRepository repository;
    private EmployeeRepository employeeRepository;
    private final List<MentorshipRequest> requestsList = new ArrayList<>();
    private final Map<Long, EmployeeResponse> employeeMap = new HashMap<>();
    private RequestsAdapter adapter;
    private boolean isIncoming = true;

    public static MentorshipRequestsListFragment newInstance(boolean isIncoming) {
        MentorshipRequestsListFragment fragment = new MentorshipRequestsListFragment();
        Bundle args = new Bundle();
        args.putBoolean(ARG_IS_INCOMING, isIncoming);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorshipRequestsListBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        repository = new MentorshipRequestRepository(requireContext());
        employeeRepository = new EmployeeRepository(requireContext());

        if (getArguments() != null) {
            isIncoming = getArguments().getBoolean(ARG_IS_INCOMING);
        }

        binding.toolbar.setTitle(isIncoming ? "Incoming Requests" : "Sent Requests");
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvRequests.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new RequestsAdapter(requestsList);
        binding.rvRequests.setAdapter(adapter);

        loadEmployeesAndRequests();
    }

    private void loadEmployeesAndRequests() {
        // 1. Fetch employees map to resolve names and profiles
        employeeRepository.getAllEmployees().observe(getViewLifecycleOwner(), employees -> {
            if (employees != null) {
                employeeMap.clear();
                for (EmployeeResponse emp : employees) {
                    if (emp.getId() != null) {
                        employeeMap.put(emp.getId(), emp);
                    }
                }
                if (adapter != null) {
                    adapter.notifyDataSetChanged();
                }
            }
        });

        // 2. Fetch requests
        loadRequests();
    }

    private void loadRequests() {
        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (isIncoming) {
            repository.getRequestsForMentor(userId).observe(getViewLifecycleOwner(), this::updateList);
        } else {
            repository.getRequestsForMentee(userId).observe(getViewLifecycleOwner(), this::updateList);
        }
    }

    private void updateList(List<MentorshipRequest> requests) {
        if (requests != null) {
            requestsList.clear();
            requestsList.addAll(requests);
            adapter.notifyDataSetChanged();
            binding.tvEmpty.setVisibility(requests.isEmpty() ? View.VISIBLE : View.GONE);
        } else {
            Toast.makeText(getContext(), "Failed to load requests", Toast.LENGTH_SHORT).show();
        }
    }

    private class RequestsAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
        private final List<MentorshipRequest> list;
        RequestsAdapter(List<MentorshipRequest> list) { this.list = list; }

        @NonNull @Override public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new RecyclerView.ViewHolder(ItemMentorshipRequestBinding.inflate(LayoutInflater.from(p.getContext()), p, false).getRoot()) {};
        }

        @Override public void onBindViewHolder(@NonNull RecyclerView.ViewHolder h, int pos) {
            MentorshipRequest item = list.get(pos);
            ItemMentorshipRequestBinding b = ItemMentorshipRequestBinding.bind(h.itemView);
            
            Long otherPersonId = isIncoming ? item.getMenteeId() : item.getMentorId();
            EmployeeResponse otherPerson = otherPersonId != null ? employeeMap.get(otherPersonId) : null;

            String personName;
            if (otherPerson != null) {
                String first = otherPerson.getFirstName() != null ? otherPerson.getFirstName() : "";
                String last = otherPerson.getLastName() != null ? otherPerson.getLastName() : "";
                personName = (first + " " + last).trim();
                if (personName.isEmpty()) {
                    personName = otherPerson.getEmail() != null ? otherPerson.getEmail() : (isIncoming ? "Mentee #" + otherPersonId : "Mentor #" + otherPersonId);
                }
            } else {
                personName = isIncoming ? "Mentee #" + otherPersonId : "Mentor #" + otherPersonId;
            }

            b.tvMenteeName.setText((isIncoming ? "Mentee: " : "Mentor: ") + personName);

            if (otherPerson != null) {
                String role = otherPerson.getRole() != null ? otherPerson.getRole() : "";
                String dept = otherPerson.getDepartment() != null ? otherPerson.getDepartment() : "";
                String subtitle = role + (!role.isEmpty() && !dept.isEmpty() ? " • " : "") + dept;
                if (!subtitle.trim().isEmpty()) {
                    b.tvPersonRole.setVisibility(View.VISIBLE);
                    b.tvPersonRole.setText(subtitle);
                } else {
                    b.tvPersonRole.setVisibility(View.GONE);
                }
            } else {
                b.tvPersonRole.setVisibility(View.GONE);
            }

            b.tvGoal.setText("Goal: " + (item.getLearningGoal() != null ? item.getLearningGoal() : "Skill Development"));
            b.tvMessage.setText("Message: " + (item.getMessage() != null ? item.getMessage() : "No message provided."));

            // View Profile click listener
            final String finalPersonName = personName;
            final Long finalOtherId = otherPersonId;
            b.btnViewProfile.setOnClickListener(v -> {
                if (otherPerson != null) {
                    ExpertItem expertItem = new ExpertItem(
                            otherPerson.getId(),
                            finalPersonName,
                            item.getLearningGoal() != null ? item.getLearningGoal() : "Mentorship",
                            "PROFICIENT",
                            otherPerson.getDepartment() != null ? otherPerson.getDepartment() : "Engineering",
                            otherPerson.getRole() != null ? otherPerson.getRole() : (isIncoming ? "Mentee" : "Mentor"),
                            otherPerson.getBio() != null ? otherPerson.getBio() : ""
                    );
                    ExpertProfileBottomSheet.newInstance(expertItem)
                            .show(getParentFragmentManager(), "ProfileDetails");
                } else if (finalOtherId != null) {
                    getParentFragmentManager().beginTransaction()
                            .replace(R.id.fragment_container, MentorProfileFragment.newInstance(finalPersonName, finalOtherId))
                            .addToBackStack(null)
                            .commit();
                } else {
                    Toast.makeText(getContext(), "Profile details not available", Toast.LENGTH_SHORT).show();
                }
            });
            
            if (isIncoming && "PENDING".equalsIgnoreCase(item.getStatus())) {
                b.layoutActions.setVisibility(View.VISIBLE);
                b.tvStatus.setVisibility(View.GONE);
                b.btnAccept.setOnClickListener(v -> handleRequest(item.getId(), "ACCEPT"));
                b.btnReject.setOnClickListener(v -> handleRequest(item.getId(), "REJECT"));
            } else if (!isIncoming && "PENDING".equalsIgnoreCase(item.getStatus())) {
                b.layoutActions.setVisibility(View.VISIBLE);
                b.btnAccept.setVisibility(View.GONE);
                b.btnReject.setText("Cancel");
                b.tvStatus.setVisibility(View.GONE);
                b.btnReject.setOnClickListener(v -> handleRequest(item.getId(), "CANCEL"));
            } else {
                b.layoutActions.setVisibility(View.GONE);
                b.tvStatus.setVisibility(View.VISIBLE);
                b.tvStatus.setText("Status: " + item.getStatus());
            }
        }

        @Override
        public int getItemCount() { return list.size(); }
    }

    private void handleRequest(Long requestId, String action) {
        if ("ACCEPT".equals(action)) {
            repository.acceptRequest(requestId).observe(getViewLifecycleOwner(), r -> loadRequests());
        } else if ("REJECT".equals(action)) {
            repository.rejectRequest(requestId).observe(getViewLifecycleOwner(), r -> loadRequests());
        } else if ("CANCEL".equals(action)) {
            repository.cancelRequest(requestId).observe(getViewLifecycleOwner(), r -> loadRequests());
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
