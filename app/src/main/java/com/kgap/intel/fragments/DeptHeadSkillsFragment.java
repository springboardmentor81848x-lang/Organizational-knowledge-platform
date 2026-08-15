package com.kgap.intel.fragments;

import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TableRow;
import android.widget.TextView;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.DeptSkillCoverageAdapter;
import com.kgap.intel.adapters.HighRiskGapAdapter;
import com.kgap.intel.databinding.FragmentDeptHeadSkillsBinding;
import com.kgap.intel.databinding.ViewLegendItemBinding;
import com.kgap.intel.models.SkillGap;
import com.kgap.intel.viewmodel.DepartmentHeadViewModel;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class DeptHeadSkillsFragment extends Fragment {
    private FragmentDeptHeadSkillsBinding binding;
    private DepartmentHeadViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDeptHeadSkillsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(DepartmentHeadViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        setupLegend();
        setupRecyclerViews();
        observeViewModel();
    }

    private void setupLegend() {
        ViewLegendItemBinding low = ViewLegendItemBinding.bind(binding.legendLow.getRoot());
        low.viewDot.setBackgroundColor(Color.parseColor("#C8E6C9"));
        low.tvLegendLabel.setText("Low Gap");

        ViewLegendItemBinding med = ViewLegendItemBinding.bind(binding.legendMed.getRoot());
        med.viewDot.setBackgroundColor(Color.parseColor("#FFF9C4"));
        med.tvLegendLabel.setText("Medium Gap");

        ViewLegendItemBinding high = ViewLegendItemBinding.bind(binding.legendHigh.getRoot());
        high.viewDot.setBackgroundColor(Color.parseColor("#FFCDD2"));
        high.tvLegendLabel.setText("High Gap");
    }

    private void setupRecyclerViews() {
        binding.rvSkillCoverage.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvHighRiskGaps.setLayoutManager(new LinearLayoutManager(getContext()));
    }

    private void observeViewModel() {
        viewModel.getHeatmap().observe(getViewLifecycleOwner(), this::populateHeatmap);
        
        viewModel.getSkillCoverage().observe(getViewLifecycleOwner(), skills -> {
            if (skills != null) {
                binding.rvSkillCoverage.setAdapter(new DeptSkillCoverageAdapter(skills));
            }
        });

        viewModel.getHighRiskGaps().observe(getViewLifecycleOwner(), gaps -> {
            if (gaps != null) {
                binding.rvHighRiskGaps.setAdapter(new HighRiskGapAdapter(gaps));
            }
        });
    }

    private void populateHeatmap(List<SkillGap> gaps) {
        if (gaps == null || gaps.isEmpty()) return;

        binding.tableHeatmap.removeAllViews();

        Set<String> skills = new HashSet<>();
        Set<String> teams = new HashSet<>();
        for (SkillGap gap : gaps) {
            skills.add(gap.getSkillName());
            teams.add(gap.getTeamName());
        }

        List<String> skillList = new ArrayList<>(skills);
        List<String> teamList = new ArrayList<>(teams);

        // Header Row
        TableRow headerRow = new TableRow(getContext());
        headerRow.addView(createHeaderCell(""));
        for (String team : teamList) {
            headerRow.addView(createHeaderCell(team));
        }
        binding.tableHeatmap.addView(headerRow);

        // Data Rows
        for (String skill : skillList) {
            TableRow row = new TableRow(getContext());
            row.addView(createHeaderCell(skill));
            for (String team : teamList) {
                SkillGap match = null;
                for (SkillGap g : gaps) {
                    if (g.getSkillName().equals(skill) && g.getTeamName().equals(team)) {
                        match = g;
                        break;
                    }
                }
                row.addView(createDataCell(match));
            }
            binding.tableHeatmap.addView(row);
        }
    }

    private TextView createHeaderCell(String text) {
        TextView tv = new TextView(getContext());
        tv.setText(text);
        tv.setPadding(24, 16, 24, 16);
        tv.setGravity(Gravity.CENTER);
        tv.setTypeface(null, Typeface.BOLD);
        return tv;
    }

    private View createDataCell(SkillGap gap) {
        View view = new View(getContext());
        TableRow.LayoutParams params = new TableRow.LayoutParams(100, 100);
        params.setMargins(4, 4, 4, 4);
        view.setLayoutParams(params);
        
        if (gap != null) {
            int color;
            switch (gap.getGapLevel()) {
                case "High": color = Color.parseColor("#FFCDD2"); break;
                case "Medium": color = Color.parseColor("#FFF9C4"); break;
                default: color = Color.parseColor("#C8E6C9"); break;
            }
            view.setBackgroundColor(color);
            view.setOnClickListener(v -> Toast.makeText(getContext(), gap.getSkillName() + " in " + gap.getTeamName() + ": " + gap.getGapValue() + "%", Toast.LENGTH_SHORT).show());
        } else {
            view.setBackgroundColor(Color.LTGRAY);
        }
        return view;
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
