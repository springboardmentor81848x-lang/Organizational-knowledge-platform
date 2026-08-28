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

import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.formatter.ValueFormatter;
import android.graphics.Color;
import java.util.ArrayList;

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
            case "SYSTEM_ADMIN":
            case "LEARNING_DEVELOPMENT_ADMIN":
            case "LD_ADMIN":
                subtitle = "Organization Skill Gap Overview";
                break;
            case "MANAGER":
                subtitle = "Team Skill Gap Overview";
                break;
            case "DEPARTMENT_HEAD":
            case "DEPT_HEAD":
                subtitle = "Department Skill Gap Overview";
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
                setupGapChart(rows);
            } else if (rows != null) {
                binding.layoutHeatmapContainer.setVisibility(View.GONE);
                binding.layoutSummary.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(View.VISIBLE);
            }
        });
    }

    private void setupGapChart(List<com.kgap.intel.models.HeatmapRow> rows) {
        java.util.Map<String, Float> skillGaps = new java.util.HashMap<>();
        for (com.kgap.intel.models.HeatmapRow row : rows) {
            for (HeatmapResponse cell : row.getCells()) {
                String skillName = cell.getSkillName();
                if (skillName != null) {
                    float currentGap = cell.getGapScore() != null ? cell.getGapScore().floatValue() : 0f;
                    skillGaps.put(skillName, skillGaps.getOrDefault(skillName, 0f) + currentGap);
                }
            }
        }

        List<BarEntry> entries = new ArrayList<>();
        final List<String> labels = new ArrayList<>();
        int i = 0;
        for (java.util.Map.Entry<String, Float> entry : skillGaps.entrySet()) {
            if (entry.getValue() > 0) {
                entries.add(new BarEntry(i, entry.getValue()));
                labels.add(entry.getKey());
                i++;
            }
        }

        if (entries.isEmpty()) {
            binding.chartSkillGaps.setVisibility(View.GONE);
            return;
        } else {
            binding.chartSkillGaps.setVisibility(View.VISIBLE);
        }

        BarDataSet dataSet = new BarDataSet(entries, "Total Gap Score");
        dataSet.setColor(Color.parseColor("#FF5722"));
        dataSet.setValueTextColor(Color.parseColor("#333333"));
        dataSet.setValueTextSize(9f);

        BarData barData = new BarData(dataSet);
        binding.chartSkillGaps.setData(barData);
        binding.chartSkillGaps.getDescription().setEnabled(false);
        binding.chartSkillGaps.getLegend().setEnabled(false);

        XAxis xAxis = binding.chartSkillGaps.getXAxis();
        xAxis.setValueFormatter(new ValueFormatter() {
            @Override
            public String getFormattedValue(float value) {
                int idx = (int) value;
                if (idx >= 0 && idx < labels.size()) {
                    return labels.get(idx);
                }
                return "";
            }
        });
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        xAxis.setDrawGridLines(false);
        xAxis.setGranularity(1f);
        xAxis.setTextColor(Color.parseColor("#666666"));

        binding.chartSkillGaps.getAxisLeft().setAxisMinimum(0f);
        binding.chartSkillGaps.getAxisRight().setEnabled(false);
        binding.chartSkillGaps.animateY(1000);
        binding.chartSkillGaps.invalidate();
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
