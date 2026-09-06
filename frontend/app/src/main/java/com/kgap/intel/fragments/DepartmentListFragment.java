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
import com.kgap.intel.adapters.DepartmentAdapter;
import com.kgap.intel.databinding.FragmentDepartmentListBinding;
import com.kgap.intel.viewmodel.HRViewModel;

public class DepartmentListFragment extends Fragment {
    private FragmentDepartmentListBinding binding;
    private HRViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDepartmentListBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(HRViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvDepartments.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel.getDepartments().observe(getViewLifecycleOwner(), departments -> {
            if (departments != null) {
                binding.rvDepartments.setAdapter(new DepartmentAdapter(departments, dept -> {
                    getParentFragmentManager().beginTransaction()
                        .replace(R.id.fragment_container, DepartmentDetailFragment.newInstance(dept.getName()))
                        .addToBackStack(null)
                        .commit();
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
