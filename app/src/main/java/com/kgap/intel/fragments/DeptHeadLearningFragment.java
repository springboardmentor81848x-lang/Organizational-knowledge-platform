package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.databinding.FragmentDeptHeadLearningBinding;
import com.kgap.intel.models.EmployeeProgress;
import com.kgap.intel.viewmodel.DepartmentHeadViewModel;

public class DeptHeadLearningFragment extends Fragment {
    private FragmentDeptHeadLearningBinding binding;
    private DepartmentHeadViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDeptHeadLearningBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(DepartmentHeadViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        observeViewModel();
    }

    private void observeViewModel() {
        viewModel.getAdoptionRates().observe(getViewLifecycleOwner(), adoption -> {
            if (adoption != null) {
                binding.tvParticipation.setText(String.valueOf(adoption.getParticipation()));
                binding.tvCompletion.setText(String.valueOf(adoption.getCompletion()));
                binding.tvInProgress.setText(String.valueOf(adoption.getInProgress()));
                binding.pbAdoption.setProgress((int) adoption.getAdoptionRate());
                binding.tvAdoptionPercent.setText(adoption.getAdoptionRate() + "%");
            }
        });

        viewModel.getEmployeeProgress().observe(getViewLifecycleOwner(), progressList -> {
            if (progressList != null) {
                binding.layoutLearningList.removeAllViews();
                for (EmployeeProgress p : progressList) {
                    TextView tv = new TextView(getContext());
                    tv.setText(p.getEmployeeName() + ": " + p.getLearningProgress() + "% Progress");
                    tv.setPadding(0, 8, 0, 8);
                    binding.layoutLearningList.addView(tv);
                }
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
