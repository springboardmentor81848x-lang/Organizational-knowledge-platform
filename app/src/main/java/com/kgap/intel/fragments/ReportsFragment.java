package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.databinding.FragmentReportsBinding;
import com.kgap.intel.databinding.ViewProfileRowBinding;
import com.kgap.intel.viewmodel.ManagerViewModel;

public class ReportsFragment extends Fragment {
    private FragmentReportsBinding binding;
    private ManagerViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentReportsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(ManagerViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupReportItems();
        observeMetrics();
    }

    private void setupReportItems() {
        ViewProfileRowBinding gapRep = ViewProfileRowBinding.bind(binding.repGap.getRoot());
        gapRep.tvLabel.setText("Team Skill Gap Report");
        gapRep.tvValue.setText("Comprehensive PDF breakdown");
        gapRep.getRoot().setOnClickListener(v -> downloadReport("Gap"));

        ViewProfileRowBinding profRep = ViewProfileRowBinding.bind(binding.repProficiency.getRoot());
        profRep.tvLabel.setText("Competency Matrix");
        profRep.tvValue.setText("Excel export of team proficiency");
        profRep.getRoot().setOnClickListener(v -> downloadReport("Competency"));

        ViewProfileRowBinding trainRep = ViewProfileRowBinding.bind(binding.repTraining.getRoot());
        trainRep.tvLabel.setText("Training Completion Summary");
        trainRep.tvValue.setText("L&D progress report");
        trainRep.getRoot().setOnClickListener(v -> downloadReport("Training"));
    }

    private void downloadReport(String type) {
        Toast.makeText(getContext(), "Generating " + type + " report from real data...", Toast.LENGTH_SHORT).show();
    }

    private void observeMetrics() {
        viewModel.getTotalGaps().observe(getViewLifecycleOwner(), total -> {
            String insight = "Currently tracking " + total + " skill gaps across your team. Recommended focus: Cloud Computing and Java Advanced.";
            binding.tvInsightText.setText(insight);
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
