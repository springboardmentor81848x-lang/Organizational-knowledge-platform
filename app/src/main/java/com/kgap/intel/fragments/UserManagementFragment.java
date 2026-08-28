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
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.adapters.TeamMemberAdapter;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentUserManagementBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserManagementFragment extends Fragment {
    private FragmentUserManagementBinding binding;
    private TeamMemberAdapter adapter;
    private List<EmployeeResponse> allWorkforce = new ArrayList<>();
    private String currentSearchQuery = "";
    private String selectedRoleFilter = "ALL";
    private int currentSortOption = 0; // 0: Role Hierarchy, 1: Name A-Z, 2: Name Z-A, 3: Department
    private boolean isSystemAdmin = false;

    private static final String[] SORT_OPTIONS = {
            "Role Hierarchy (Heads & Leads first)",
            "Name (A → Z)",
            "Name (Z → A)",
            "Department Name"
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentUserManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String userRole = SharedPrefManager.getInstance(getContext()).getUserRole();
        isSystemAdmin = userRole != null && ("ADMIN".equalsIgnoreCase(userRole) || "SYSTEM_ADMIN".equalsIgnoreCase(userRole));

        if (isSystemAdmin) {
            binding.chipAdmin.setVisibility(View.VISIBLE);
        } else {
            binding.chipAdmin.setVisibility(View.GONE);
        }

        setupToolbar();
        setupRecyclerView();
        setupSearch();
        setupRoleChips();
        setupSortButton();
        loadWorkforce();
    }

    private void setupToolbar() {
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
    }

    private void setupRecyclerView() {
        adapter = new TeamMemberAdapter(new ArrayList<>(), member -> {
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, UserDetailsFragment.newInstance(member.getId()))
                .addToBackStack(null)
                .commit();
        });
        binding.rvUsers.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvUsers.setAdapter(adapter);
    }

    private void setupSearch() {
        binding.etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                currentSearchQuery = s.toString();
                applyFilterAndSort();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void setupRoleChips() {
        binding.chipGroupRoles.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) return;
            int id = checkedIds.get(0);

            if (id == R.id.chip_all_roles) {
                selectedRoleFilter = "ALL";
            } else if (id == R.id.chip_dept_heads) {
                selectedRoleFilter = "DEPARTMENT_HEAD";
            } else if (id == R.id.chip_employees) {
                selectedRoleFilter = "EMPLOYEE";
            } else if (id == R.id.chip_managers) {
                selectedRoleFilter = "MANAGER";
            } else if (id == R.id.chip_mentors) {
                selectedRoleFilter = "MENTOR";
            } else if (id == R.id.chip_ld_admin) {
                selectedRoleFilter = "LD_ADMIN";
            } else if (id == R.id.chip_hr) {
                selectedRoleFilter = "HR";
            } else if (id == R.id.chip_admin) {
                selectedRoleFilter = "ADMIN";
            }
            applyFilterAndSort();
        });
    }

    private void setupSortButton() {
        binding.btnSortOptions.setOnClickListener(v -> {
            new MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Sort Workforce By")
                    .setSingleChoiceItems(SORT_OPTIONS, currentSortOption, (dialog, which) -> {
                        currentSortOption = which;
                        binding.btnSortOptions.setText("Sort: " + (which == 0 ? "By Role ⇅" : which == 1 ? "Name A-Z ⇅" : which == 2 ? "Name Z-A ⇅" : "Dept ⇅"));
                        applyFilterAndSort();
                        dialog.dismiss();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    private void loadWorkforce() {
        ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null && binding != null) {
                    List<EmployeeResponse> cleanList = new ArrayList<>();
                    for (EmployeeResponse emp : response.body()) {
                        String name = ((emp.getFirstName() != null ? emp.getFirstName() : "") + " " +
                                       (emp.getLastName() != null ? emp.getLastName() : "")).toLowerCase();
                        String email = emp.getEmail() != null ? emp.getEmail().toLowerCase() : "";

                        // Exclude admin if not logged in as System Admin
                        if (!isSystemAdmin) {
                            if (emp.getId() == null || emp.getId() == 1L || name.contains("admin") || email.contains("admin@kgap.com")) {
                                continue;
                            }
                        }
                        cleanList.add(emp);
                    }

                    allWorkforce = cleanList;
                    applyFilterAndSort();
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
        });
    }

    private void applyFilterAndSort() {
        List<EmployeeResponse> list = new ArrayList<>(allWorkforce);

        // 1. Role Filtering
        if (!"ALL".equalsIgnoreCase(selectedRoleFilter)) {
            list = list.stream().filter(u -> matchRole(u, selectedRoleFilter)).collect(Collectors.toList());
        }

        // 2. Search Query Filtering
        if (!currentSearchQuery.isEmpty()) {
            String q = currentSearchQuery.toLowerCase().trim();
            list = list.stream().filter(u -> {
                String fullName = ((u.getFirstName() != null ? u.getFirstName() : "") + " " + 
                                  (u.getLastName() != null ? u.getLastName() : "")).toLowerCase();
                String email = (u.getEmail() != null ? u.getEmail() : "").toLowerCase();
                String dept = HRViewModel.normalizeDepartmentName(u.getDepartment(), u.getJobRoleId()).toLowerCase();
                String role = (u.getRole() != null ? u.getRole() : "").toLowerCase();
                return fullName.contains(q) || email.contains(q) || dept.contains(q) || role.contains(q);
            }).collect(Collectors.toList());
        }

        // 3. Sorting
        list.sort((a, b) -> {
            switch (currentSortOption) {
                case 1: // Name A-Z
                    return (a.getFirstName() != null ? a.getFirstName() : "").compareToIgnoreCase(b.getFirstName() != null ? b.getFirstName() : "");
                case 2: // Name Z-A
                    return (b.getFirstName() != null ? b.getFirstName() : "").compareToIgnoreCase(a.getFirstName() != null ? a.getFirstName() : "");
                case 3: // Department
                    String deptA = HRViewModel.normalizeDepartmentName(a.getDepartment(), a.getJobRoleId());
                    String deptB = HRViewModel.normalizeDepartmentName(b.getDepartment(), b.getJobRoleId());
                    return deptA.compareToIgnoreCase(deptB);
                case 0: // Role Hierarchy
                default:
                    int rankA = getRoleRank(a);
                    int rankB = getRoleRank(b);
                    if (rankA != rankB) return Integer.compare(rankA, rankB);
                    return (a.getFirstName() != null ? a.getFirstName() : "").compareToIgnoreCase(b.getFirstName() != null ? b.getFirstName() : "");
            }
        });

        if (binding != null) {
            binding.tvActiveCount.setText(list.size() + " Members");
        }
        adapter.updateList(list);
    }

    private boolean matchRole(EmployeeResponse emp, String roleKey) {
        String role = emp.getRole() != null ? emp.getRole().toUpperCase() : "";
        String email = emp.getEmail() != null ? emp.getEmail().toLowerCase() : "";

        switch (roleKey) {
            case "DEPARTMENT_HEAD":
                return role.contains("HEAD") || email.contains("depthead");
            case "EMPLOYEE":
                return "EMPLOYEE".equalsIgnoreCase(role) && !email.contains("depthead");
            case "MANAGER":
                return role.contains("MANAGER") || email.contains("manager");
            case "MENTOR":
                return role.contains("MENTOR") || email.contains("mentor");
            case "LD_ADMIN":
                return role.contains("LEARNING") || role.contains("LD") || email.contains("ld");
            case "HR":
                return role.contains("HR") || email.contains("hr");
            case "ADMIN":
                return role.contains("ADMIN") || email.contains("admin");
            default:
                return true;
        }
    }

    private int getRoleRank(EmployeeResponse emp) {
        String role = emp.getRole() != null ? emp.getRole().toUpperCase() : "";
        String email = emp.getEmail() != null ? emp.getEmail().toLowerCase() : "";

        if (role.contains("ADMIN") || email.contains("admin")) return 1;
        if (role.contains("HR") || email.contains("hr")) return 2;
        if (role.contains("HEAD") || email.contains("depthead")) return 3;
        if (role.contains("MANAGER") || email.contains("manager")) return 4;
        if (role.contains("LEARNING") || role.contains("LD") || email.contains("ld")) return 5;
        if (role.contains("MENTOR") || email.contains("mentor")) return 6;
        return 7; // Employees
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
