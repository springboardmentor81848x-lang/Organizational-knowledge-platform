package com.kgap.intel.fragments;

import android.os.Bundle;
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
import com.kgap.intel.databinding.FragmentDepartmentDetailBinding;
import com.kgap.intel.databinding.ItemTeamMemberBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.viewmodel.ManagerViewModel;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DepartmentDetailFragment extends Fragment {
    private static final String ARG_DEPT_NAME = "dept_name";
    private FragmentDepartmentDetailBinding binding;
    private ManagerViewModel viewModel;
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
        viewModel = new ViewModelProvider(requireActivity()).get(ManagerViewModel.class);

        binding.toolbar.setTitle(departmentName);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        binding.rvDeptEmployees.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel.getTeamMembers().observe(getViewLifecycleOwner(), allEmployees -> {
            if (allEmployees != null && departmentName != null) {
                List<EmployeeResponse> deptEmployees = allEmployees.stream()
                    .filter(e -> e.getDepartment() != null && departmentName.equalsIgnoreCase(e.getDepartment()))
                    .collect(Collectors.toList());

                updateUI(deptEmployees);
            }
        });

        viewModel.loadTeamDashboard();
    }

    private void updateUI(List<EmployeeResponse> employees) {
        if (employees.isEmpty()) {
            binding.tvNoEmployees.setVisibility(View.VISIBLE);
            binding.rvDeptEmployees.setVisibility(View.GONE);
            binding.cardDeptHead.setVisibility(View.GONE);
            binding.tvNoHead.setVisibility(View.VISIBLE);
            return;
        }

        binding.tvNoEmployees.setVisibility(View.GONE);
        binding.rvDeptEmployees.setVisibility(View.VISIBLE);

        // Find Dept Head
        EmployeeResponse head = null;
        for (EmployeeResponse e : employees) {
            if ("ROLE_DEPARTMENT_HEAD".equalsIgnoreCase(e.getRole()) || "DEPARTMENT_HEAD".equalsIgnoreCase(e.getRole())) {
                head = e;
                break;
            }
        }

        if (head != null) {
            binding.cardDeptHead.setVisibility(View.VISIBLE);
            binding.tvNoHead.setVisibility(View.GONE);
            setupHeadItem(head);
            
            // Remove head from employees list for the recycler view
            final EmployeeResponse finalHead = head;
            List<EmployeeResponse> staff = employees.stream()
                .filter(e -> !e.getId().equals(finalHead.getId()))
                .collect(Collectors.toList());
            
            binding.rvDeptEmployees.setAdapter(new TeamMemberAdapter(staff, e -> {
                // Navigate to profile
                getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, UserDetailsFragment.newInstance(e.getId()))
                    .addToBackStack(null)
                    .commit();
            }));
        } else {
            binding.cardDeptHead.setVisibility(View.GONE);
            binding.tvNoHead.setVisibility(View.VISIBLE);
            binding.rvDeptEmployees.setAdapter(new TeamMemberAdapter(employees, e -> {
                getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, UserDetailsFragment.newInstance(e.getId()))
                    .addToBackStack(null)
                    .commit();
            }));
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
