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
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.DeptHeadEmployeesAdapter;
import com.kgap.intel.databinding.FragmentDeptHeadEmployeesBinding;
import com.kgap.intel.viewmodel.DepartmentHeadViewModel;

public class DeptHeadEmployeesFragment extends Fragment {
    private FragmentDeptHeadEmployeesBinding binding;
    private DepartmentHeadViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDeptHeadEmployeesBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(DepartmentHeadViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvEmployees.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel.getEmployeeProgress().observe(getViewLifecycleOwner(), progress -> {
            if (progress != null) {
                binding.rvEmployees.setAdapter(new DeptHeadEmployeesAdapter(progress, employee -> {
                    if (employee.getEmployeeId() != null && getActivity() instanceof MainActivity) {
                        ((MainActivity) getActivity()).switchFragment(UserDetailsFragment.newInstance(employee.getEmployeeId()));
                    }
                }));
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
