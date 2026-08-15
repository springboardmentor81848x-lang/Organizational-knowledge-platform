package com.kgap.intel.fragments;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.TeamMemberAdapter;
import com.kgap.intel.databinding.FragmentUserManagementBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.viewmodel.ManagerViewModel;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class UserManagementFragment extends Fragment {
    private FragmentUserManagementBinding binding;
    private ManagerViewModel viewModel;
    private TeamMemberAdapter adapter;
    private List<EmployeeResponse> allUsers = new ArrayList<>();
    private String currentRoleFilter = "All";
    private String currentSearchQuery = "";

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentUserManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(ManagerViewModel.class);

        setupToolbar();
        setupRecyclerView();
        setupFilters();
        observeViewModel();
        
        viewModel.loadTeamDashboard(); // Reusing this to get all employees for now
    }

    private void setupToolbar() {
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
    }

    private void setupRecyclerView() {
        adapter = new TeamMemberAdapter(new ArrayList<>(), member -> {
            // Navigate to User Details
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, UserDetailsFragment.newInstance(member.getId()))
                .addToBackStack(null)
                .commit();
        });
        binding.rvUsers.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvUsers.setAdapter(adapter);
    }

    private void setupFilters() {
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearchQuery = s.toString();
                applyFilters();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        binding.chipGroupRoles.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) {
                currentRoleFilter = "All";
            } else {
                int id = checkedIds.get(0);
                if (id == R.id.chip_all) currentRoleFilter = "All";
                else if (id == R.id.chip_employee) currentRoleFilter = "EMPLOYEE";
                else if (id == R.id.chip_manager) currentRoleFilter = "MANAGER";
                else if (id == R.id.chip_dept_head) currentRoleFilter = "DEPARTMENT_HEAD";
                else if (id == R.id.chip_hr) currentRoleFilter = "HR";
                else if (id == R.id.chip_admin) currentRoleFilter = "ADMIN";
                else if (id == R.id.chip_mentor) currentRoleFilter = "MENTOR";
                else if (id == R.id.chip_ld_admin) currentRoleFilter = "LEARNING_DEVELOPMENT_ADMIN";
            }
            applyFilters();
        });
    }

    private void observeViewModel() {
        viewModel.getTeamMembers().observe(getViewLifecycleOwner(), members -> {
            if (members != null) {
                allUsers = members;
                applyFilters();
            }
        });
    }

    private void applyFilters() {
        List<EmployeeResponse> filteredList = allUsers.stream()
            .filter(java.util.Objects::nonNull)
            .filter(u -> currentRoleFilter.equals("All") || (u.getRole() != null && u.getRole().equalsIgnoreCase(currentRoleFilter)))
            .filter(u -> {
                if (currentSearchQuery.isEmpty()) return true;
                
                String fullName = (u.getFirstName() != null ? u.getFirstName() : "") + " " + 
                                  (u.getLastName() != null ? u.getLastName() : "");
                String email = u.getEmail() != null ? u.getEmail() : "";
                
                return fullName.toLowerCase().contains(currentSearchQuery.toLowerCase()) ||
                       email.toLowerCase().contains(currentSearchQuery.toLowerCase());
            })
            .collect(Collectors.toList());
        
        adapter.updateList(filteredList);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
