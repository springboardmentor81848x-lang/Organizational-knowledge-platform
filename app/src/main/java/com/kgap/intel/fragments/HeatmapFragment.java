package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.kgap.intel.R;
import com.kgap.intel.adapters.HeatmapAdapter;
import com.kgap.intel.databinding.DialogGapDetailsBinding;
import com.kgap.intel.databinding.FragmentHeatmapBinding;
import com.kgap.intel.models.HeatmapResponse;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.GapViewModel;

import java.util.List;

public class HeatmapFragment extends Fragment {

    private FragmentHeatmapBinding binding;
    private GapViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHeatmapBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(GapViewModel.class);
        
        setupToolbar();
        setupLegend();
        observeViewModel();
        
        binding.btnRetry.setOnClickListener(v -> viewModel.loadHeatmap());
        
        viewModel.loadHeatmap();
    }

    private void setupToolbar() {
        binding.toolbar.setNavigationOnClickListener(v -> requireActivity().onBackPressed());
        
        String role = SharedPrefManager.getInstance(getContext()).getUserRole();
        String subtitle;
        switch (role != null ? role : "EMPLOYEE") {
            case "HR":
            case "ADMIN":
                subtitle = "Organization Skill Gap Overview";
                break;
            case "MANAGER":
                subtitle = "Team Skill Gap Overview";
                break;
            default:
                subtitle = "Your Skill Overview";
                break;
        }
        binding.tvHeatmapSubtitle.setText(subtitle);
    }

    private void setupLegend() {
        binding.legendCritical.tvLegendLabel.setText("CRITICAL");
        binding.legendCritical.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_critical));
        
        binding.legendHigh.tvLegendLabel.setText("HIGH GAP");
        binding.legendHigh.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_critical)); // Using same for High/Critical for now

        binding.legendMod.tvLegendLabel.setText("MEDIUM GAP");
        binding.legendMod.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_high));

        binding.legendLow.tvLegendLabel.setText("LOW GAP");
        binding.legendLow.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_low));
    }

    private void observeViewModel() {
        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            binding.pbLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                binding.tvError.setVisibility(View.VISIBLE);
                binding.tvError.setText(error);
                binding.btnRetry.setVisibility(View.VISIBLE);
                binding.layoutHeatmapContainer.setVisibility(View.GONE);
                binding.layoutSummary.setVisibility(View.GONE);
            } else {
                binding.tvError.setVisibility(View.GONE);
                binding.btnRetry.setVisibility(View.GONE);
            }
        });

        viewModel.getHeatmapRows().observe(getViewLifecycleOwner(), rows -> {
            if (rows != null && !rows.isEmpty()) {
                binding.layoutHeatmapContainer.setVisibility(View.VISIBLE);
                binding.layoutSummary.setVisibility(View.VISIBLE);
                binding.tvEmpty.setVisibility(View.GONE);
                
                binding.rvHeatmap.setLayoutManager(new LinearLayoutManager(getContext()));
                binding.rvHeatmap.setAdapter(new HeatmapAdapter(rows, this::showCellDetails));
                
                updateSummary(rows);
            } else if (rows != null) {
                binding.layoutHeatmapContainer.setVisibility(View.GONE);
                binding.layoutSummary.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(View.VISIBLE);
            }
        });
    }

    private void updateSummary(List<com.kgap.intel.models.HeatmapRow> rows) {
        int critical = 0;
        int moderate = 0;
        int low = 0;
        
        for (com.kgap.intel.models.HeatmapRow row : rows) {
            for (HeatmapResponse cell : row.getCells()) {
                String level = cell.getGapLevel() != null ? cell.getGapLevel() : "LOW";
                if ("HIGH".equals(level)) critical++;
                else if ("MEDIUM".equals(level)) moderate++;
                else low++;
            }
        }
        
        binding.tvSummaryCritical.setText(String.valueOf(critical));
        binding.tvSummaryModerate.setText(String.valueOf(moderate));
        binding.tvSummaryLow.setText(String.valueOf(low));
    }

    private void showCellDetails(HeatmapResponse cell) {
        BottomSheetDialog dialog = new BottomSheetDialog(requireContext());
        DialogGapDetailsBinding dialogBinding = DialogGapDetailsBinding.inflate(getLayoutInflater());
        dialog.setContentView(dialogBinding.getRoot());

        dialogBinding.tvTitle.setText(cell.getSkillName());
        dialogBinding.tvMembers.setText(cell.getEmployeeName() != null ? "Employee: " + cell.getEmployeeName() : "Individual Insight");
        dialogBinding.tvProfVal.setText("Gap Score: " + cell.getGapScore());
        dialogBinding.tvGapVal.setText(cell.getGapLevel());

        int color;
        String level = cell.getGapLevel() != null ? cell.getGapLevel() : "LOW";
        switch (level) {
            case "HIGH": color = ContextCompat.getColor(requireContext(), R.color.gap_critical); break;
            case "MEDIUM": color = ContextCompat.getColor(requireContext(), R.color.gap_high); break;
            default: color = ContextCompat.getColor(requireContext(), R.color.gap_low); break;
        }
        dialogBinding.tvGapVal.setTextColor(color);

        dialog.show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
