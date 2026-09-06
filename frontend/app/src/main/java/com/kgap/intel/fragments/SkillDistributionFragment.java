package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.github.mikephil.charting.components.XAxis;
import com.github.mikephil.charting.data.BarData;
import com.github.mikephil.charting.data.BarDataSet;
import com.github.mikephil.charting.data.BarEntry;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;
import com.github.mikephil.charting.formatter.ValueFormatter;
import com.github.mikephil.charting.utils.ColorTemplate;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.EmployeeApiService;
import com.kgap.intel.api.SkillApiService;
import com.kgap.intel.databinding.FragmentSkillDistributionBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.EmployeeSkillResponse;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class SkillDistributionFragment extends Fragment {
    private FragmentSkillDistributionBinding binding;
    private EmployeeApiService employeeApiService;
    private SkillApiService skillApiService;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSkillDistributionBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        employeeApiService = ApiClient.getEmployeeApiService(requireContext());
        skillApiService = ApiClient.getSkillApiService(requireContext());

        String role = SharedPrefManager.getInstance(getContext()).getUserRole();
        if ("HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role)) {
            binding.toolbar.setTitle("Workforce Skill Inventory");
        } else {
            binding.toolbar.setTitle("Team Skill Distribution");
        }

        binding.toolbar.setNavigationOnClickListener(v -> requireActivity().getOnBackPressedDispatcher().onBackPressed());

        loadDistributionData();
    }

    private void loadDistributionData() {
        binding.pbLoading.setVisibility(View.VISIBLE);
        String userEmail = SharedPrefManager.getInstance(getContext()).getUserEmail();
        String role = SharedPrefManager.getInstance(getContext()).getUserRole();

        employeeApiService.getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    final Set<Long> memberIds = new HashSet<>();

                    if ("HR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "LD_ADMIN".equalsIgnoreCase(role)) {
                        // Entire organization workforce (filter out System Admin)
                        for (EmployeeResponse emp : response.body()) {
                            if (emp.getId() != null && emp.getId() != 1L) {
                                String name = (emp.getFirstName() + " " + emp.getLastName()).toLowerCase();
                                if (!name.contains("admin")) {
                                    memberIds.add(emp.getId());
                                }
                            }
                        }
                    } else {
                        // Manager / Dept Head scope
                        String managerDept = null;
                        for (EmployeeResponse emp : response.body()) {
                            if (userEmail != null && userEmail.equalsIgnoreCase(emp.getEmail())) {
                                managerDept = emp.getDepartment();
                                break;
                            }
                        }

                        final String dept = managerDept;
                        for (EmployeeResponse emp : response.body()) {
                            if (dept != null && dept.equalsIgnoreCase(emp.getDepartment()) && "EMPLOYEE".equalsIgnoreCase(emp.getRole())) {
                                memberIds.add(emp.getId());
                            }
                        }
                    }

                    fetchAndProcessSkills(memberIds);
                } else {
                    binding.pbLoading.setVisibility(View.GONE);
                    Toast.makeText(getContext(), "Failed to load workforce data", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                binding.pbLoading.setVisibility(View.GONE);
                Toast.makeText(getContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void fetchAndProcessSkills(Set<Long> teamMemberIds) {
        skillApiService.getAllSkills().enqueue(new Callback<List<SkillItem>>() {
            @Override
            public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> skillResponse) {
                final Map<Long, String> skillCategoryMap = new HashMap<>();
                if (skillResponse.isSuccessful() && skillResponse.body() != null) {
                    for (SkillItem s : skillResponse.body()) {
                        try {
                            skillCategoryMap.put(Long.parseLong(s.getId()), s.getCategory());
                        } catch (Exception ignored) {}
                    }
                }

                skillApiService.getAllEmployeeSkills().enqueue(new Callback<List<EmployeeSkillResponse>>() {
                    @Override
                    public void onResponse(Call<List<EmployeeSkillResponse>> call, Response<List<EmployeeSkillResponse>> response) {
                        binding.pbLoading.setVisibility(View.GONE);
                        if (response.isSuccessful() && response.body() != null) {
                            List<EmployeeSkillResponse> teamSkills = new ArrayList<>();
                            for (EmployeeSkillResponse es : response.body()) {
                                if (teamMemberIds.contains(es.getEmployeeId())) {
                                    teamSkills.add(es);
                                }
                            }

                            updateUI(teamSkills, skillCategoryMap);
                        } else {
                            Toast.makeText(getContext(), "Failed to load skills", Toast.LENGTH_SHORT).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<List<EmployeeSkillResponse>> call, Throwable t) {
                        binding.pbLoading.setVisibility(View.GONE);
                        Toast.makeText(getContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                });
            }

            @Override
            public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                binding.pbLoading.setVisibility(View.GONE);
                Toast.makeText(getContext(), "Error loading skill categories", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void updateUI(List<EmployeeSkillResponse> skills, Map<Long, String> categoryMap) {
        int beginner = 0, intermediate = 0, advanced = 0, expert = 0;
        Map<String, Integer> categoryCount = new HashMap<>();

        for (EmployeeSkillResponse s : skills) {
            String level = s.getProficiencyLevel() != null ? s.getProficiencyLevel().toUpperCase() : "BEGINNER";
            switch (level) {
                case "EXPERT":
                    expert++;
                    break;
                case "ADVANCED":
                    advanced++;
                    break;
                case "INTERMEDIATE":
                    intermediate++;
                    break;
                case "BEGINNER":
                default:
                    beginner++;
                    break;
            }

            String cat = categoryMap.getOrDefault(s.getSkillId(), "Technical");
            categoryCount.put(cat, categoryCount.getOrDefault(cat, 0) + 1);
        }

        binding.tvStatExpert.setText(String.valueOf(expert));
        binding.tvStatAdvanced.setText(String.valueOf(advanced));
        binding.tvStatIntermediate.setText(String.valueOf(intermediate));
        binding.tvStatBeginner.setText(String.valueOf(beginner));

        setupPieChart(beginner, intermediate, advanced, expert);
        setupBarChart(categoryCount);
    }

    private void setupPieChart(int b, int i, int a, int e) {
        List<PieEntry> entries = new ArrayList<>();
        if (e > 0) entries.add(new PieEntry(e, "Expert"));
        if (a > 0) entries.add(new PieEntry(a, "Advanced"));
        if (i > 0) entries.add(new PieEntry(i, "Intermediate"));
        if (b > 0) entries.add(new PieEntry(b, "Beginner"));

        if (entries.isEmpty()) {
            entries.add(new PieEntry(1, "No Skills Recorded"));
        }

        PieDataSet dataSet = new PieDataSet(entries, "");
        List<Integer> colors = new ArrayList<>();
        colors.add(Color.parseColor("#00C853")); // Expert Green
        colors.add(Color.parseColor("#3F51B5")); // Advanced Blue
        colors.add(Color.parseColor("#FF9800")); // Intermediate Orange
        colors.add(Color.parseColor("#F44336")); // Beginner Red
        dataSet.setColors(colors);
        dataSet.setValueTextColor(Color.WHITE);
        dataSet.setValueTextSize(11f);

        PieData data = new PieData(dataSet);
        binding.pieChartLevels.setData(data);
        binding.pieChartLevels.setDescription(null);
        binding.pieChartLevels.setUsePercentValues(true);
        binding.pieChartLevels.setHoleRadius(50f);
        binding.pieChartLevels.setTransparentCircleRadius(55f);
        binding.pieChartLevels.setDrawEntryLabels(false);
        binding.pieChartLevels.animateY(800);
        binding.pieChartLevels.invalidate();
    }

    private void setupBarChart(Map<String, Integer> categories) {
        List<BarEntry> entries = new ArrayList<>();
        List<String> labels = new ArrayList<>();

        int index = 0;
        for (Map.Entry<String, Integer> entry : categories.entrySet()) {
            entries.add(new BarEntry(index, entry.getValue()));
            labels.add(entry.getKey());
            index++;
        }

        if (entries.isEmpty()) {
            entries.add(new BarEntry(0, 0));
            labels.add("None");
        }

        BarDataSet dataSet = new BarDataSet(entries, "Skills by Category");
        dataSet.setColors(ColorTemplate.MATERIAL_COLORS);
        dataSet.setValueTextSize(10f);

        BarData data = new BarData(dataSet);
        binding.barChartCategories.setData(data);
        binding.barChartCategories.setDescription(null);
        
        XAxis xAxis = binding.barChartCategories.getXAxis();
        xAxis.setValueFormatter(new ValueFormatter() {
            @Override
            public String getFormattedValue(float value) {
                int i = (int) value;
                return (i >= 0 && i < labels.size()) ? labels.get(i) : "";
            }
        });
        xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
        xAxis.setGranularity(1f);
        xAxis.setDrawGridLines(false);

        binding.barChartCategories.getAxisRight().setEnabled(false);
        binding.barChartCategories.animateY(800);
        binding.barChartCategories.invalidate();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
