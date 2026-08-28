package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.adapters.GapOverviewAdapter;
import com.kgap.intel.adapters.OrgSkillGapAdapter;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentSkillGapBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.OrgSkillGapItem;
import com.kgap.intel.models.SkillGapResponse;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.GapViewModel;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SkillGapFragment extends Fragment {
    private FragmentSkillGapBinding binding;
    private GapViewModel viewModel;

    private static final String ARG_EMPLOYEE_ID = "employee_id";
    private Long targetEmployeeId;
    private final Map<Long, String> employeeDeptMap = new HashMap<>();
    private final List<EmployeeResponse> allDeptHeads = new ArrayList<>();

    public static SkillGapFragment newInstance(Long employeeId) {
        SkillGapFragment fragment = new SkillGapFragment();
        Bundle args = new Bundle();
        args.putLong(ARG_EMPLOYEE_ID, employeeId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            targetEmployeeId = getArguments().getLong(ARG_EMPLOYEE_ID, -1L);
            if (targetEmployeeId == -1L) {
                targetEmployeeId = null;
            }
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSkillGapBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(GapViewModel.class);
        
        setupRoleSpecificUI();
        loadEmployeeDeptMapping();
        observeViewModel();
        
        binding.toolbar.setNavigationOnClickListener(v -> requireActivity().getOnBackPressedDispatcher().onBackPressed());
        
        binding.btnViewFull.setOnClickListener(v -> {
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, new HeatmapFragment())
                .addToBackStack(null)
                .setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out)
                .commit();
        });

        if (targetEmployeeId != null) {
            viewModel.loadEmployeeGapsDirect(targetEmployeeId);
        } else {
            viewModel.loadData();
        }
    }

    private void setupRoleSpecificUI() {
        if (targetEmployeeId != null) {
            binding.toolbar.setTitle("Employee Skill Gaps");
            binding.btnViewFull.setVisibility(View.GONE);
            return;
        }
        String role = SharedPrefManager.getInstance(getContext()).getUserRole();
        if ("EMPLOYEE".equalsIgnoreCase(role)) {
            binding.toolbar.setTitle("My Skill Gaps");
            binding.btnViewFull.setVisibility(View.GONE); 
        } else if ("MANAGER".equalsIgnoreCase(role)) {
            binding.toolbar.setTitle("Team Skill Gaps");
        } else {
            binding.toolbar.setTitle("Organization Gap Intelligence");
        }
    }

    private void loadEmployeeDeptMapping() {
        ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    allDeptHeads.clear();
                    for (EmployeeResponse emp : response.body()) {
                        if (emp.getId() != null) {
                            String dept = HRViewModel.normalizeDepartmentName(emp.getDepartment(), emp.getJobRoleId());
                            employeeDeptMap.put(emp.getId(), dept);

                            boolean isHead = (emp.getRole() != null && emp.getRole().toUpperCase().contains("HEAD")) ||
                                             (emp.getEmail() != null && emp.getEmail().toLowerCase().contains("depthead"));
                            if (isHead) {
                                allDeptHeads.add(emp);
                            }
                        }
                    }
                    if (viewModel.getSkillGaps().getValue() != null) {
                        renderGaps(viewModel.getSkillGaps().getValue());
                    }
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
        });
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
                binding.rvGapOverview.setVisibility(View.GONE);
                binding.layoutSummary.setVisibility(View.GONE);
            } else {
                binding.tvError.setVisibility(View.GONE);
                binding.btnRetry.setVisibility(View.GONE);
            }
        });

        viewModel.getSkillGaps().observe(getViewLifecycleOwner(), gaps -> {
            if (gaps != null && !gaps.isEmpty()) {
                renderGaps(gaps);
            } else if (gaps != null) {
                binding.rvGapOverview.setVisibility(View.GONE);
                binding.layoutSummary.setVisibility(View.GONE);
                binding.tvEmpty.setVisibility(View.VISIBLE);
            }
        });

        binding.btnRetry.setOnClickListener(v -> viewModel.loadData());
    }

    private void renderGaps(List<SkillGapResponse> gaps) {
        binding.rvGapOverview.setVisibility(View.VISIBLE);
        binding.layoutSummary.setVisibility(View.VISIBLE);
        binding.tvEmpty.setVisibility(View.GONE);
        binding.rvGapOverview.setLayoutManager(new LinearLayoutManager(getContext()));

        String role = SharedPrefManager.getInstance(getContext()).getUserRole();
        boolean isHR = "HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role);

        if (isHR && targetEmployeeId == null) {
            // Organization-Wide Aggregated Gap Intelligence
            List<OrgSkillGapItem> orgGaps = aggregateOrganizationGaps(gaps);
            binding.rvGapOverview.setAdapter(new OrgSkillGapAdapter(orgGaps, this::showOrgGapDetailsDialog));
            updateOrgSummary(orgGaps);
        } else {
            // Individual / Manager view
            binding.rvGapOverview.setAdapter(new GapOverviewAdapter(gaps, this::showIndividualGapDetailsDialog));
            updateSummary(gaps);
        }
    }

    private List<OrgSkillGapItem> aggregateOrganizationGaps(List<SkillGapResponse> gaps) {
        Map<String, List<SkillGapResponse>> grouped = new LinkedHashMap<>();
        for (SkillGapResponse g : gaps) {
            if (g.getSkillName() != null) {
                grouped.computeIfAbsent(g.getSkillName(), k -> new ArrayList<>()).add(g);
            }
        }

        List<OrgSkillGapItem> list = new ArrayList<>();
        for (Map.Entry<String, List<SkillGapResponse>> entry : grouped.entrySet()) {
            String skillName = entry.getKey();
            List<SkillGapResponse> skillGapsList = entry.getValue();

            Set<String> depts = new HashSet<>();
            List<String> employeeNames = new ArrayList<>();
            int totalPercent = 0;
            boolean hasHigh = false;
            boolean hasMedium = false;
            String requiredLevel = "EXPERT";

            for (SkillGapResponse g : skillGapsList) {
                if (g.getEmployeeName() != null) employeeNames.add(g.getEmployeeName());
                if (g.getRequiredProficiency() != null) requiredLevel = g.getRequiredProficiency();

                String dept = employeeDeptMap.get(g.getEmployeeId());
                if (dept != null) depts.add(dept);

                if ("HIGH".equalsIgnoreCase(g.getGapLevel())) hasHigh = true;
                else if ("MEDIUM".equalsIgnoreCase(g.getGapLevel())) hasMedium = true;

                int curVal = getLevelPercent(g.getCurrentProficiency());
                int reqVal = getLevelPercent(g.getRequiredProficiency());
                totalPercent += Math.max(0, reqVal - curVal);
            }

            String severity = hasHigh ? "HIGH" : (hasMedium ? "MEDIUM" : "LOW");
            String deptSummary = depts.isEmpty() ? "Organization-Wide" : String.join(" • ", depts);
            int avgGap = skillGapsList.size() > 0 ? (totalPercent / skillGapsList.size()) : 50;

            OrgSkillGapItem item = new OrgSkillGapItem(
                    skillName,
                    deptSummary,
                    skillGapsList.size(),
                    skillGapsList.size() + 2,
                    severity,
                    requiredLevel,
                    avgGap
            );
            item.setImpactedEmployees(employeeNames);
            list.add(item);
        }

        list.sort((a, b) -> {
            int scoreA = "HIGH".equals(a.getHighestSeverity()) ? 3 : ("MEDIUM".equals(a.getHighestSeverity()) ? 2 : 1);
            int scoreB = "HIGH".equals(b.getHighestSeverity()) ? 3 : ("MEDIUM".equals(b.getHighestSeverity()) ? 2 : 1);
            return Integer.compare(scoreB, scoreA);
        });

        return list;
    }

    private void showOrgGapDetailsDialog(OrgSkillGapItem item) {
        if (getContext() == null) return;

        String employeesList = item.getImpactedEmployees().isEmpty() ? "Multiple staff" : String.join(", ", item.getImpactedEmployees());

        String message = "🎯 Target Competency: " + item.getSkillName() +
                "\n\n🏢 Impacted Departments:\n" + item.getDepartmentsSummary() +
                "\n\n👥 Total Impacted Workforce: " + item.getImpactedCount() + " Personnel" +
                "\n(" + employeesList + ")" +
                "\n\n📊 Required Benchmark Level: " + item.getRequiredProficiency() +
                "\n⚠️ Organization Deficit Risk: " + item.getHighestSeverity() + " SEVERITY (" + item.getAverageGapPercent() + "% avg deficit)" +
                "\n\n💡 Strategic Action:\nNotify Department Head to initiate team upskilling & curriculum adjustments.";

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Organization Gap Insight")
                .setMessage(message)
                .setPositiveButton("Contact Dept Head", (dialog, which) -> {
                    contactDepartmentHeadsForGap(item);
                })
                .setNegativeButton("Close", null)
                .show();
    }

    private void contactDepartmentHeadsForGap(OrgSkillGapItem item) {
        if (getContext() == null) return;
        String hrName = SharedPrefManager.getInstance(getContext()).getUserName();
        String sender = (hrName != null && !hrName.isEmpty()) ? hrName : "HR Leadership";

        List<EmployeeResponse> notifiedHeads = new ArrayList<>();
        String deptsSummary = item.getDepartmentsSummary().toLowerCase();

        for (EmployeeResponse head : allDeptHeads) {
            String headDept = HRViewModel.normalizeDepartmentName(head.getDepartment(), head.getJobRoleId()).toLowerCase();
            if (deptsSummary.contains(headDept) || deptsSummary.contains("organization")) {
                notifiedHeads.add(head);
            }
        }

        if (notifiedHeads.isEmpty() && !allDeptHeads.isEmpty()) {
            notifiedHeads.add(allDeptHeads.get(0));
        }

        if (notifiedHeads.isEmpty()) {
            Toast.makeText(getContext(), "No Department Head assigned for " + item.getDepartmentsSummary(), Toast.LENGTH_SHORT).show();
            return;
        }

        NotificationRepository notifRepo = new NotificationRepository(requireContext());
        for (EmployeeResponse head : notifiedHeads) {
            String notifMsg = "📢 HR Alert from " + sender + ": High organizational skill gap identified in '" + 
                    item.getSkillName() + "' for " + item.getDepartmentsSummary() + ". Please coordinate team training and competency interventions.";
            notifRepo.createNotification(head.getId(), "Organizational Gap Alert", "GAP_ALERT", notifMsg);
        }

        String names = notifiedHeads.stream().map(h -> h.getFirstName() + " " + h.getLastName()).collect(Collectors.joining(", "));
        
        // Log in HR's own feed
        Long hrUserId = SharedPrefManager.getInstance(getContext()).getUserId();
        if (hrUserId != null) {
            String hrLog = "✓ Dispatched organizational gap alert for '" + item.getSkillName() + 
                    "' to Department Head(s): " + names + " (" + item.getDepartmentsSummary() + ").";
            notifRepo.createNotification(hrUserId, "Gap Alert Dispatched", "GAP_ALERT", hrLog);
        }

        Toast.makeText(getContext(), "✓ Sent gap alert notification to Department Head(s): " + names, Toast.LENGTH_LONG).show();
    }

    private void showIndividualGapDetailsDialog(SkillGapResponse gap) {
        if (getContext() == null) return;

        String employeeInfo = gap.getEmployeeName() != null ? "\n👤 Employee: " + gap.getEmployeeName() : "";
        String gapText = "🎯 Skill: " + gap.getSkillName() +
                employeeInfo +
                "\n📊 Current Level: " + gap.getCurrentProficiency() +
                "\n📈 Required Level: " + gap.getRequiredProficiency() +
                "\n⚠️ Gap Severity: " + (gap.getGapLevel() != null ? gap.getGapLevel() : "LOW");

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Skill Gap Details")
                .setMessage(gapText)
                .setPositiveButton("Close", null)
                .show();
    }

    private void updateOrgSummary(List<OrgSkillGapItem> gaps) {
        long high = gaps.stream().filter(g -> "HIGH".equals(g.getHighestSeverity())).count();
        long medium = gaps.stream().filter(g -> "MEDIUM".equals(g.getHighestSeverity())).count();
        long low = gaps.stream().filter(g -> "LOW".equals(g.getHighestSeverity())).count();
        
        binding.tvTotalCount.setText(String.valueOf(gaps.size()));
        
        binding.statCritical.tvLegendLabel.setText("High Risk Skills");
        binding.statCritical.tvLegendCount.setText(String.valueOf(high));
        binding.statCritical.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_critical));

        binding.statHigh.tvLegendLabel.setText("Medium Risk"); 
        binding.statHigh.tvLegendCount.setText(String.valueOf(medium));
        binding.statHigh.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_high));

        binding.statMedium.tvLegendLabel.setText("Low Deficit");
        binding.statMedium.tvLegendCount.setText(String.valueOf(low));
        binding.statMedium.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_medium));

        binding.statLow.tvLegendLabel.setText("Total Org Skills");
        binding.statLow.tvLegendCount.setText(String.valueOf(gaps.size()));
        binding.statLow.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.primary_emerald));
        
        if (!gaps.isEmpty()) {
            int progress = (int) (((double) (high + medium) / gaps.size()) * 100);
            binding.progressChart.setProgress(progress);
        } else {
            binding.progressChart.setProgress(0);
        }
    }

    private void updateSummary(List<SkillGapResponse> gaps) {
        long high = gaps.stream().filter(g -> "HIGH".equals(g.getGapLevel())).count();
        long medium = gaps.stream().filter(g -> "MEDIUM".equals(g.getGapLevel())).count();
        long low = gaps.stream().filter(g -> "LOW".equals(g.getGapLevel())).count();
        
        binding.tvTotalCount.setText(String.valueOf(gaps.size()));
        
        binding.statCritical.tvLegendLabel.setText("High Gap");
        binding.statCritical.tvLegendCount.setText(String.valueOf(high));
        binding.statCritical.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_critical));

        binding.statHigh.tvLegendLabel.setText("Medium Gap"); 
        binding.statHigh.tvLegendCount.setText(String.valueOf(medium));
        binding.statHigh.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_high));

        binding.statMedium.tvLegendLabel.setText("Low Gap");
        binding.statMedium.tvLegendCount.setText(String.valueOf(low));
        binding.statMedium.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_medium));

        binding.statLow.tvLegendLabel.setText("Total Gaps");
        binding.statLow.tvLegendCount.setText(String.valueOf(gaps.size()));
        binding.statLow.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.primary_emerald));
        
        if (!gaps.isEmpty()) {
            int progress = (int) (((double) (high + medium) / gaps.size()) * 100);
            binding.progressChart.setProgress(progress);
        } else {
            binding.progressChart.setProgress(0);
        }
    }

    private int getLevelPercent(String level) {
        if (level == null) return 0;
        switch (level.toLowerCase()) {
            case "beginner": return 25;
            case "intermediate": return 50;
            case "advanced": return 75;
            case "expert": return 100;
            default: return 0;
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
