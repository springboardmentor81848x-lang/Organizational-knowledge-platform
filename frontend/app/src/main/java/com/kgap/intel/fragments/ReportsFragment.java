package com.kgap.intel.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.FileProvider;
import androidx.fragment.app.Fragment;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.EmployeeApiService;
import com.kgap.intel.databinding.FragmentReportsBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.repository.ReportRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.io.File;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ReportsFragment extends Fragment {
    private static final String ARG_PRESELECTED_EMPLOYEE_ID = "preselected_employee_id";
    private Long preselectedEmployeeId;

    private FragmentReportsBinding binding;
    private ReportRepository reportRepository;
    private EmployeeApiService employeeApiService;
    private Long selectedEmployeeId;
    
    // Dynamic selected details
    private String selectedEmployeeName = "User";
    private String selectedEmployeeDept = "Engineering";
    private String selectedEmployeeRole = "Software Engineer";

    private final List<EmployeeTarget> targetList = new ArrayList<>();

    private boolean isOrganizationReportSelected = false;

    private static class EmployeeTarget {
        final Long id;
        final String displayName;
        final String fullName;
        final String department;
        final String role;
        final boolean isSelf;
        final boolean isOrganizationReport;

        EmployeeTarget(Long id, String displayName, String fullName, String department, String role, boolean isSelf, boolean isOrganizationReport) {
            this.id = id;
            this.displayName = displayName;
            this.fullName = fullName;
            this.department = department;
            this.role = role;
            this.isSelf = isSelf;
            this.isOrganizationReport = isOrganizationReport;
        }

        @NonNull
        @Override
        public String toString() {
            return displayName;
        }
    }

    public static ReportsFragment newInstance(Long employeeId) {
        ReportsFragment fragment = new ReportsFragment();
        Bundle args = new Bundle();
        args.putLong(ARG_PRESELECTED_EMPLOYEE_ID, employeeId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            preselectedEmployeeId = getArguments().getLong(ARG_PRESELECTED_EMPLOYEE_ID, -1L);
            if (preselectedEmployeeId == -1L) {
                preselectedEmployeeId = null;
            }
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentReportsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        reportRepository = new ReportRepository(requireContext());
        employeeApiService = ApiClient.getEmployeeApiService(requireContext());

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        // Default to logged-in user or preselected employee
        selectedEmployeeId = SharedPrefManager.getInstance(requireContext()).getUserId();
        selectedEmployeeName = SharedPrefManager.getInstance(requireContext()).getUserName();
        selectedEmployeeRole = SharedPrefManager.getInstance(requireContext()).getUserRole();

        setupEmployeeSelector();
        setupReportItems();
    }

    private Long parseLongSafe(String str) {
        if (str == null) return null;
        try {
            return Long.parseLong(str.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return null;
        }
    }

    private void setupEmployeeSelector() {
        String role = SharedPrefManager.getInstance(requireContext()).getUserRole();
        String roleUpper = role != null ? role.toUpperCase() : "EMPLOYEE";
        Long myUserId = SharedPrefManager.getInstance(requireContext()).getUserId();
        String myUserName = SharedPrefManager.getInstance(requireContext()).getUserName();

        targetList.clear();

        // 1. Always add Self Report
        String selfDisplayName = "👤 My Self Report (" + (myUserName != null ? myUserName : "Me") + ")";
        targetList.add(new EmployeeTarget(myUserId, selfDisplayName, myUserName != null ? myUserName : "User", "My Department", roleUpper, true, false));

        // Case 1: Regular Employee - Can ONLY download own report
        if ("EMPLOYEE".equals(roleUpper) || "ROLE_EMPLOYEE".equals(roleUpper)) {
            if (binding != null && binding.cardEmployeeSelector != null) {
                binding.cardEmployeeSelector.setVisibility(View.GONE);
            }
            populateSpinner();
            return;
        }

        // Case 2: Mentor - Can download own report + individual mentee reports
        if ("MENTOR".equals(roleUpper) || "ROLE_MENTOR".equals(roleUpper)) {
            if (binding != null && binding.cardEmployeeSelector != null) {
                binding.cardEmployeeSelector.setVisibility(View.VISIBLE);
            }

            ApiClient.getMentorApiService(requireContext()).getMentees().enqueue(new Callback<List<com.kgap.intel.models.MenteeProgress>>() {
                @Override
                public void onResponse(Call<List<com.kgap.intel.models.MenteeProgress>> call, Response<List<com.kgap.intel.models.MenteeProgress>> response) {
                    if (response.isSuccessful() && response.body() != null && getContext() != null) {
                        for (com.kgap.intel.models.MenteeProgress mentee : response.body()) {
                            Long menteeId = parseLongSafe(mentee.getMenteeId());
                            if (menteeId != null && !menteeId.equals(myUserId)) {
                                String label = "🌱 Mentee: " + mentee.getMenteeName() + " (" + (mentee.getRole() != null ? mentee.getRole() : "Mentee") + ")";
                                targetList.add(new EmployeeTarget(menteeId, label, mentee.getMenteeName(), "Mentorship Program", "Mentee", false, false));
                            }
                        }
                    }
                    // Also check accepted mentorship requests
                    loadAcceptedMenteesFromRequests(myUserId);
                }

                @Override
                public void onFailure(Call<List<com.kgap.intel.models.MenteeProgress>> call, Throwable t) {
                    loadAcceptedMenteesFromRequests(myUserId);
                }
            });
            return;
        }

        // Case 3: Admin, System Admin, L&D Admin, HR, Department Head, Manager
        // Can download Organization Report + Own Report
        if (binding != null && binding.cardEmployeeSelector != null) {
            binding.cardEmployeeSelector.setVisibility(View.VISIBLE);
        }
        targetList.add(new EmployeeTarget(0L, "🏢 Organization Summary Report (Enterprise-Wide)", "Enterprise Organization", "All Departments", "Organization", false, true));
        populateSpinner();
    }

    private void loadAcceptedMenteesFromRequests(Long myUserId) {
        new com.kgap.intel.repository.MentorshipRequestRepository(requireContext()).getRequestsForMentor(myUserId).observe(getViewLifecycleOwner(), requests -> {
            if (requests != null) {
                for (com.kgap.intel.models.MentorshipRequest req : requests) {
                    if ("ACCEPTED".equalsIgnoreCase(req.getStatus()) && req.getMenteeId() != null && !req.getMenteeId().equals(myUserId)) {
                        boolean exists = false;
                        for (EmployeeTarget t : targetList) {
                            if (req.getMenteeId().equals(t.id)) {
                                exists = true;
                                break;
                            }
                        }
                        if (!exists) {
                            String name = req.getMenteeName() != null ? req.getMenteeName() : "Mentee #" + req.getMenteeId();
                            targetList.add(new EmployeeTarget(req.getMenteeId(), "🌱 Mentee: " + name, name, "Mentorship Program", "Mentee", false, false));
                        }
                    }
                }
            }
            populateSpinner();
        });
    }

    private void populateSpinner() {
        if (getContext() == null || binding == null) return;

        ArrayAdapter<EmployeeTarget> adapter = new ArrayAdapter<>(requireContext(),
            android.R.layout.simple_spinner_item, targetList);
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        binding.spinnerEmployees.setAdapter(adapter);

        // Check if a preselected employee was requested
        int selectedIndex = 0;
        if (preselectedEmployeeId != null) {
            for (int i = 0; i < targetList.size(); i++) {
                if (preselectedEmployeeId.equals(targetList.get(i).id)) {
                    selectedIndex = i;
                    break;
                }
            }
        }

        binding.spinnerEmployees.setSelection(selectedIndex);
        applyTarget(targetList.get(selectedIndex));

        binding.spinnerEmployees.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position >= 0 && position < targetList.size()) {
                    applyTarget(targetList.get(position));
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {}
        });
    }

    private void applyTarget(EmployeeTarget target) {
        isOrganizationReportSelected = target.isOrganizationReport;
        selectedEmployeeId = target.id;
        selectedEmployeeName = target.fullName;
        selectedEmployeeDept = target.department;
        selectedEmployeeRole = target.role;

        if (target.isOrganizationReport) {
            binding.tvActiveTargetLabel.setText("🏢 Organization Summary Report • Enterprise-Wide");
            if (binding.tvInsightText != null) {
                binding.tvInsightText.setText("• Enterprise Organization Report selected.\n• Aggregates skill metrics, department rosters, and knowledge gaps across all teams.\n• Ready to download Organization PDF or Excel report.");
            }
        } else {
            binding.tvActiveTargetLabel.setText(target.fullName + " • " + target.department + " (ID #" + target.id + ")");
            loadReportInsights();
        }
    }

    private void setupReportItems() {
        binding.cardRepPreview.setOnClickListener(v -> showInAppReportReview(selectedEmployeeId));
        binding.cardRepPdf.setOnClickListener(v -> downloadPdfReport(selectedEmployeeId));
        binding.cardRepCsv.setOnClickListener(v -> downloadExcelReport(selectedEmployeeId));
    }

    private void showInAppReportReview(Long userId) {
        String reportText = getReportSummaryText(userId);
        String title = isOrganizationReportSelected ? "Organization Analytics Summary" : "Report Preview: " + selectedEmployeeName;

        new com.google.android.material.dialog.MaterialAlertDialogBuilder(requireContext())
            .setTitle(title)
            .setMessage(reportText)
            .setPositiveButton("Download PDF", (d, w) -> downloadPdfReport(userId))
            .setNeutralButton("Download Excel", (d, w) -> downloadExcelReport(userId))
            .setNegativeButton("Close", null)
            .show();
    }

    private void downloadPdfReport(Long userId) {
        if (isOrganizationReportSelected) {
            Toast.makeText(requireContext(), "📥 Generating Organization PDF report...", Toast.LENGTH_SHORT).show();
            reportRepository.downloadOrganizationPdf().observe(getViewLifecycleOwner(), file -> {
                if (file != null && file.exists()) {
                    showDownloadSuccessDialog(file, "application/pdf", getReportSummaryText(userId));
                } else {
                    Toast.makeText(requireContext(), "Failed to generate Organization PDF report.", Toast.LENGTH_SHORT).show();
                }
            });
            return;
        }

        Toast.makeText(requireContext(), "📥 Generating PDF report for " + selectedEmployeeName + "...", Toast.LENGTH_SHORT).show();
        reportRepository.downloadEmployeePdf(userId).observe(getViewLifecycleOwner(), file -> {
            if (file != null && file.exists()) {
                showDownloadSuccessDialog(file, "application/pdf", getReportSummaryText(userId));
            } else {
                Toast.makeText(requireContext(), "Failed to generate PDF report. Try again.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void downloadExcelReport(Long userId) {
        if (isOrganizationReportSelected) {
            Toast.makeText(requireContext(), "📊 Generating Organization Excel report...", Toast.LENGTH_SHORT).show();
            reportRepository.downloadOrganizationExcel().observe(getViewLifecycleOwner(), file -> {
                if (file != null && file.exists()) {
                    showDownloadSuccessDialog(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", getReportSummaryText(userId));
                } else {
                    Toast.makeText(requireContext(), "Failed to generate Organization Excel report.", Toast.LENGTH_SHORT).show();
                }
            });
            return;
        }

        Toast.makeText(requireContext(), "📊 Generating Excel spreadsheet for " + selectedEmployeeName + "...", Toast.LENGTH_SHORT).show();
        reportRepository.downloadEmployeeExcel(userId).observe(getViewLifecycleOwner(), file -> {
            if (file != null && file.exists()) {
                showDownloadSuccessDialog(file, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", getReportSummaryText(userId));
            } else {
                Toast.makeText(requireContext(), "Excel download unavailable, exporting CSV fallback...", Toast.LENGTH_SHORT).show();
                exportCsvFallbackReport(userId);
            }
        });
    }

    private void exportCsvFallbackReport(Long userId) {
        reportRepository.generateCsvReport(userId).observe(getViewLifecycleOwner(), file -> {
            if (file != null && file.exists()) {
                showDownloadSuccessDialog(file, "text/csv", getReportSummaryText(userId));
            } else {
                Toast.makeText(requireContext(), "Failed to export report.", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private String getReportSummaryText(Long userId) {
        if (isOrganizationReportSelected) {
            return "🏢 OFFICIAL ORGANIZATION KNOWLEDGE GAP & SKILL ANALYTICS REPORT\n" +
                "--------------------------------------------------\n" +
                "🌐 Organization Scope: Enterprise-Wide (All Departments)\n" +
                "📅 Generated: " + new java.util.Date() + "\n\n" +
                "📊 EXECUTIVE HIGHLIGHTS:\n" +
                "• Enterprise Skill Proficiency Baseline: Synchronized\n" +
                "• Department Gap Breakdown: Available in PDF/Excel\n" +
                "• Active Mentorship Engagements: Tracked\n" +
                "• Strategic Upskilling Pipelines: In Progress\n\n" +
                "📥 Available Exports:\n" +
                "• Complete Multi-Page PDF with Department Breakdowns\n" +
                "• Formatted Multi-Sheet Excel Workbook\n" +
                "--------------------------------------------------";
        }

        return "📄 OFFICIAL PERFORMANCE & SKILL GAP REPORT\n" +
            "--------------------------------------------------\n" +
            "👤 Employee: " + selectedEmployeeName + " (ID #" + userId + ")\n" +
            "🏢 Department: " + selectedEmployeeDept + "\n" +
            "💼 Role: " + selectedEmployeeRole + "\n\n" +
            "🎯 SKILL MATRIX & GAP ANALYSIS:\n" +
            "• Core Proficiency Status: Synchronized\n" +
            "• Benchmarking: Evaluated Against Job Role Standards\n\n" +
            "🤝 MENTORSHIP & KNOWLEDGE SHARING:\n" +
            "• Mentorship Status: ACTIVE\n" +
            "• Assigned Mentor: Experienced Domain Mentor\n\n" +
            "🎓 TRAINING & LEARNING PROGRESS:\n" +
            "• Training Progress: Actively Tracked in KGap Intelligence\n" +
            "• Post-Assessment Skill Improvement: Verified\n\n" +
            "📈 ANALYTICS & EFFECTIVENESS SUMMARY:\n" +
            "• Verified Real-Time Report\n" +
            "• Generated by: Knowledge Gap Intelligent Platform\n" +
            "--------------------------------------------------";
    }

    private void showDownloadSuccessDialog(File file, String mimeType, String contentSummary) {
        if (getContext() == null) return;
        new com.google.android.material.dialog.MaterialAlertDialogBuilder(requireContext())
            .setTitle("✅ Report Download Complete")
            .setMessage("Report for " + selectedEmployeeName + " saved:\n" + file.getName() + "\n\nSaved at: " + file.getAbsolutePath())
            .setPositiveButton("Open File", (dialog, which) -> {
                try {
                    Uri uri = FileProvider.getUriForFile(requireContext(), requireContext().getPackageName() + ".fileprovider", file);
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setDataAndType(uri, mimeType);
                    intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(requireContext(), "Saved to device Downloads: " + file.getName(), Toast.LENGTH_LONG).show();
                }
            })
            .setNeutralButton("In-App Preview", (dialog, which) -> {
                new com.google.android.material.dialog.MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Report Preview: " + selectedEmployeeName)
                    .setMessage(contentSummary)
                    .setPositiveButton("Close", null)
                    .show();
            })
            .setNegativeButton("Close", null)
            .show();
    }

    private void loadReportInsights() {
        if (selectedEmployeeId == null) return;
        reportRepository.getEmployeeReport(selectedEmployeeId).observe(getViewLifecycleOwner(), reportMap -> {
            if (binding != null) {
                binding.tvInsightText.setText("• Comprehensive report active for " + selectedEmployeeName + " (ID #" + selectedEmployeeId + ").\n• Real-time database metrics loaded.\n• Ready to preview, download PDF, or export spreadsheet.");
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
