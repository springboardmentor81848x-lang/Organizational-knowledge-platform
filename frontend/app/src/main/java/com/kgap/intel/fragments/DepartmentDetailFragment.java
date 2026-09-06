package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.TeamMemberAdapter;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentDepartmentDetailBinding;
import com.kgap.intel.databinding.ItemTeamMemberBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DepartmentDetailFragment extends Fragment {
    private static final String ARG_DEPT_NAME = "dept_name";
    private FragmentDepartmentDetailBinding binding;
    private String departmentName;

    public static DepartmentDetailFragment newInstance(String deptName) {
        DepartmentDetailFragment fragment = new DepartmentDetailFragment();
        Bundle args = new Bundle();
        args.putString(ARG_DEPT_NAME, deptName);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            departmentName = getArguments().getString(ARG_DEPT_NAME);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDepartmentDetailBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String canonicalDept = HRViewModel.normalizeDepartmentName(departmentName, null);
        binding.toolbar.setTitle(canonicalDept);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        binding.rvDeptEmployees.setLayoutManager(new LinearLayoutManager(getContext()));

        loadDepartmentPersonnel(canonicalDept);
    }

    private void loadDepartmentPersonnel(String canonicalDept) {
        ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null && binding != null) {
                    List<EmployeeResponse> all = response.body();
                    List<EmployeeResponse> deptStaff = new ArrayList<>();
                    EmployeeResponse deptHead = null;

                    for (EmployeeResponse emp : all) {
                        if (emp.getId() == null || emp.getId() == 1L) continue; // Exclude admin
                        String empName = ((emp.getFirstName() != null ? emp.getFirstName() : "") + " " +
                                          (emp.getLastName() != null ? emp.getLastName() : "")).toLowerCase();
                        if (empName.contains("admin")) continue;

                        String empDept = resolveEmployeeDepartment(emp);
                        if (canonicalDept.equalsIgnoreCase(empDept)) {
                            boolean isHead = isDepartmentHead(emp, canonicalDept);
                            if (isHead) {
                                deptHead = emp;
                            } else if (emp.getRole() != null && "EMPLOYEE".equalsIgnoreCase(emp.getRole())) {
                                // Only show actual employees working under this department
                                deptStaff.add(emp);
                            }
                        }
                    }

                    updateUI(deptHead, deptStaff);
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                if (binding != null) {
                    binding.tvNoEmployees.setVisibility(View.VISIBLE);
                    binding.tvNoHead.setVisibility(View.VISIBLE);
                }
            }
        });
    }

    private String resolveEmployeeDepartment(EmployeeResponse emp) {
        String email = emp.getEmail() != null ? emp.getEmail().toLowerCase() : "";
        if (email.contains("backend")) return "Backend Engineering";
        if (email.contains("frontend")) return "Frontend Engineering";
        if (email.contains("data")) return "Data Science & AI";
        if (email.contains("devops") || email.contains("cloud")) return "Cloud & DevOps";
        if (email.contains("security") || email.contains("cyber")) return "Cybersecurity";
        if (email.contains("product")) return "Product & Operations";

        return HRViewModel.normalizeDepartmentName(emp.getDepartment(), emp.getJobRoleId());
    }

    private boolean isDepartmentHead(EmployeeResponse emp, String canonicalDept) {
        String email = emp.getEmail() != null ? emp.getEmail().toLowerCase() : "";
        String role = emp.getRole() != null ? emp.getRole().toUpperCase() : "";

        if (role.contains("HEAD")) return true;
        if (email.contains("depthead")) {
            return true;
        }
        return false;
    }

    private void updateUI(EmployeeResponse head, List<EmployeeResponse> staff) {
        if (head != null) {
            binding.cardDeptHead.setVisibility(View.VISIBLE);
            binding.tvNoHead.setVisibility(View.GONE);
            setupHeadItem(head);
        } else {
            binding.cardDeptHead.setVisibility(View.GONE);
            binding.tvNoHead.setVisibility(View.VISIBLE);
        }

        if (staff != null && !staff.isEmpty()) {
            binding.tvNoEmployees.setVisibility(View.GONE);
            binding.rvDeptEmployees.setVisibility(View.VISIBLE);
            binding.rvDeptEmployees.setAdapter(new TeamMemberAdapter(staff, e -> {
                getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, UserDetailsFragment.newInstance(e.getId()))
                    .addToBackStack(null)
                    .commit();
            }));
        } else {
            binding.tvNoEmployees.setVisibility(View.VISIBLE);
            binding.rvDeptEmployees.setVisibility(View.GONE);
        }
    }

    private void setupHeadItem(EmployeeResponse head) {
        ItemTeamMemberBinding headBinding = ItemTeamMemberBinding.bind(binding.itemHead.getRoot());
        String firstName = head.getFirstName() != null ? head.getFirstName() : "";
        String lastName = head.getLastName() != null ? head.getLastName() : "";
        headBinding.tvMemberName.setText(firstName + " " + lastName);
        headBinding.tvMemberRole.setText("Department Head");
        headBinding.pbMemberProgress.setVisibility(View.GONE);
        headBinding.getRoot().setOnClickListener(v -> {
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, UserDetailsFragment.newInstance(head.getId()))
                .addToBackStack(null)
                .commit();
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
