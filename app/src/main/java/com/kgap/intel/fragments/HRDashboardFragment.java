package com.kgap.intel.fragments;

import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.text.SpannableString;
import android.text.style.RelativeSizeSpan;
import android.text.style.StyleSpan;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.github.mikephil.charting.components.Legend;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;
import com.github.mikephil.charting.formatter.PercentFormatter;
import com.kgap.intel.R;
import com.kgap.intel.adapters.BannerAdapter;
import com.kgap.intel.adapters.DepartmentHealthAdapter;
import com.kgap.intel.databinding.FragmentHrDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class HRDashboardFragment extends Fragment {
    private FragmentHrDashboardBinding binding;
    private HRViewModel viewModel;
    private DepartmentHealthAdapter deptAdapter;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHrDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(HRViewModel.class);

        String name = SharedPrefManager.getInstance(getContext()).getUserName();
        String displayName = (name != null && !name.isEmpty() && !name.equals("User")) ? name : "HR Leader";
        binding.tvGreeting.setText("Welcome, " + displayName + " 👋");

        setupToolbar();
        setupBanner();
        setupControlHub();
        setupRecyclerView();
        setupNavigation();
        observeViewModel();
    }

    private void setupToolbar() {
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnSearch.setOnClickListener(v -> new QuickServiceSearchBottomSheet().show(getParentFragmentManager(), "quick_service_search"));
        binding.btnProfile.setOnClickListener(v -> navigateToFragment(new MoreFragment()));
        setupNotificationBadge();
    }

    private void setupNotificationBadge() {
        Long userId = com.kgap.intel.utils.SharedPrefManager.getInstance(requireContext()).getUserId();
        com.kgap.intel.repository.NotificationRepository notifRepo = new com.kgap.intel.repository.NotificationRepository(requireContext());
        notifRepo.getUnreadCount(userId).observe(getViewLifecycleOwner(), unreadCount -> {
            if (unreadCount != null && unreadCount > 0) {
                binding.tvNotifBadge.setVisibility(View.VISIBLE);
                binding.tvNotifBadge.setText(unreadCount > 9 ? "9+" : String.valueOf(unreadCount));
            } else {
                binding.tvNotifBadge.setVisibility(View.GONE);
            }
        });
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("HR Strategic Hub", "Enterprise Talent Planning & Gap Intelligence", R.drawable.slide_3));
        bannerItems.add(new BannerAdapter.BannerItem("Workforce Inventory", "Deep Competency & Skill Health Benchmarks", R.drawable.slide_4));
        bannerItems.add(new BannerAdapter.BannerItem("Predictive Talent Radar", "Forecasting Skill Gaps & Training Interventions", R.drawable.slide_5));

        BannerAdapter adapter = new BannerAdapter(bannerItems);
        binding.viewPagerBanner.setAdapter(adapter);

        Runnable sliderRunnable = new Runnable() {
            @Override
            public void run() {
                if (binding != null) {
                    int nextItem = (binding.viewPagerBanner.getCurrentItem() + 1) % bannerItems.size();
                    binding.viewPagerBanner.setCurrentItem(nextItem, true);
                    sliderHandler.postDelayed(this, 3500);
                }
            }
        };
        sliderHandler.postDelayed(sliderRunnable, 3500);
    }

    private void setupControlHub() {
        // 1. Gap Intelligence (Teal/Emerald)
        ItemHubButtonBinding gapIntel = ItemHubButtonBinding.bind(binding.hubGapIntelligence.getRoot());
        gapIntel.ivIcon.setImageResource(android.R.drawable.ic_menu_compass);
        gapIntel.ivIcon.setColorFilter(Color.parseColor("#00897B"));
        gapIntel.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E0F2F1"));
        gapIntel.tvLabel.setText("Gap Intelligence");
        gapIntel.getRoot().setOnClickListener(v -> navigateToFragment(new SkillGapFragment()));

        // 2. Skill Inventory (Blue)
        ItemHubButtonBinding skillInv = ItemHubButtonBinding.bind(binding.hubSkillInventory.getRoot());
        skillInv.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        skillInv.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        skillInv.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        skillInv.tvLabel.setText("Skill Inventory");
        skillInv.getRoot().setOnClickListener(v -> navigateToFragment(new SkillDistributionFragment()));

        // 3. Training Effectiveness (Indigo)
        ItemHubButtonBinding training = ItemHubButtonBinding.bind(binding.hubTrainingEffectiveness.getRoot());
        training.ivIcon.setImageResource(android.R.drawable.ic_menu_slideshow);
        training.ivIcon.setColorFilter(Color.parseColor("#3949AB"));
        training.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8EAF6"));
        training.tvLabel.setText("Training ROI");
        training.getRoot().setOnClickListener(v -> navigateToFragment(new ManagerLearningHubFragment()));

        // 4. Strategic Skill Forecasting (Purple)
        ItemHubButtonBinding forecast = ItemHubButtonBinding.bind(binding.hubSkillForecasting.getRoot());
        forecast.ivIcon.setImageResource(android.R.drawable.ic_menu_directions);
        forecast.ivIcon.setColorFilter(Color.parseColor("#7B1FA2"));
        forecast.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        forecast.tvLabel.setText("Skill Forecast");
        forecast.getRoot().setOnClickListener(v -> navigateToFragment(new AIRecommendationFragment()));

        // 5. User Management (Green)
        ItemHubButtonBinding users = ItemHubButtonBinding.bind(binding.hubUserManagement.getRoot());
        users.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        users.ivIcon.setColorFilter(Color.parseColor("#388E3C"));
        users.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        users.tvLabel.setText("User Directory");
        users.getRoot().setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));

        // 6. Reports Management (Orange)
        ItemHubButtonBinding reports = ItemHubButtonBinding.bind(binding.hubReports.getRoot());
        reports.ivIcon.setImageResource(android.R.drawable.ic_menu_save);
        reports.ivIcon.setColorFilter(Color.parseColor("#E65100"));
        reports.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        reports.tvLabel.setText("Reports Center");
        reports.getRoot().setOnClickListener(v -> navigateToFragment(new ReportsFragment()));
    }

    private void setupRecyclerView() {
        deptAdapter = new DepartmentHealthAdapter(new ArrayList<>(), dept -> {
            navigateToFragment(DepartmentDetailFragment.newInstance(dept.getName()));
        });
        binding.rvDeptHealth.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvDeptHealth.setAdapter(deptAdapter);
    }

    private void setupNavigation() {
        // Metric card shortcuts
        binding.cardTotalEmployees.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
        binding.cardTotalDepartments.setOnClickListener(v -> navigateToFragment(new DepartmentListFragment()));
        binding.cardCriticalGaps.setOnClickListener(v -> navigateToFragment(new SkillGapFragment()));
        binding.cardTrainingNeeds.setOnClickListener(v -> navigateToFragment(new ManagerLearningHubFragment()));

        // Banner and feature shortcuts
        View.OnClickListener openHeatmap = v -> navigateToFragment(new HeatmapFragment());
        binding.btnViewOrgHeatmap.setOnClickListener(openHeatmap);
        binding.cardOrgHeatmapBanner.setOnClickListener(openHeatmap);

        View.OnClickListener openForecast = v -> navigateToFragment(new AIRecommendationFragment());
        binding.btnActionForecast.setOnClickListener(openForecast);
        binding.cardStrategicForecasting.setOnClickListener(openForecast);
    }

    private void observeViewModel() {
        viewModel.getTotalEmployees().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalEmployees.setText(String.valueOf(count)));
            
        viewModel.getTotalDepartments().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalDepartments.setText(String.valueOf(count)));
            
        viewModel.getCriticalGaps().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalCriticalGaps.setText(String.valueOf(count)));

        viewModel.getTrainingAdoptionRate().observe(getViewLifecycleOwner(), rate -> {
            if (binding.tvTrainingAdoption != null) {
                binding.tvTrainingAdoption.setText(rate + "%");
            }
        });

        viewModel.getCompletedTrainings().observe(getViewLifecycleOwner(), completed -> {
            if (binding.tvTrainingSub != null) {
                binding.tvTrainingSub.setText(completed + " Completed • Active ROI →");
            }
        });

        viewModel.getDepartments().observe(getViewLifecycleOwner(), departments -> {
            if (departments != null) {
                deptAdapter.setDepartments(departments);
            }
        });

        viewModel.getDeptEmployeeCounts().observe(getViewLifecycleOwner(), empCounts -> {
            if (empCounts != null) {
                deptAdapter.setEmployeeCounts(empCounts);
            }
        });

        viewModel.getDeptGapCounts().observe(getViewLifecycleOwner(), counts -> {
            if (counts != null) {
                deptAdapter.setGapCounts(counts);
                setupCleanPieChart(counts);
            }
        });
    }

    private void setupCleanPieChart(Map<String, Integer> counts) {
        List<PieEntry> entries = new ArrayList<>();
        int totalGaps = 0;
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            if (entry.getValue() != null && entry.getValue() > 0) {
                entries.add(new PieEntry(entry.getValue().floatValue(), entry.getKey()));
                totalGaps += entry.getValue();
            }
        }

        if (entries.isEmpty()) {
            entries.add(new PieEntry(1f, "All Skills Met"));
        }

        PieDataSet dataSet = new PieDataSet(entries, "");
        List<Integer> colors = new ArrayList<>();
        colors.add(Color.parseColor("#00897B")); // Backend Teal
        colors.add(Color.parseColor("#0288D1")); // Frontend Blue
        colors.add(Color.parseColor("#7B1FA2")); // Data Purple
        colors.add(Color.parseColor("#3949AB")); // DevOps Indigo
        colors.add(Color.parseColor("#D84315")); // Cybersecurity Red
        colors.add(Color.parseColor("#F57C00")); // Product Orange
        dataSet.setColors(colors);
        dataSet.setSliceSpace(3f);
        dataSet.setSelectionShift(6f);
        dataSet.setValueTextColor(Color.WHITE);
        dataSet.setValueTextSize(11f);
        dataSet.setValueTypeface(Typeface.DEFAULT_BOLD);
        dataSet.setValueFormatter(new PercentFormatter(binding.pieChartDeptHealth));

        PieData data = new PieData(dataSet);
        binding.pieChartDeptHealth.setData(data);
        binding.pieChartDeptHealth.setDescription(null);
        binding.pieChartDeptHealth.setUsePercentValues(true);
        binding.pieChartDeptHealth.setDrawEntryLabels(false); // Eliminates text overlapping on slices!
        binding.pieChartDeptHealth.setDrawHoleEnabled(true);
        binding.pieChartDeptHealth.setHoleColor(Color.WHITE);
        binding.pieChartDeptHealth.setHoleRadius(58f);
        binding.pieChartDeptHealth.setTransparentCircleRadius(63f);
        binding.pieChartDeptHealth.setTransparentCircleColor(Color.parseColor("#F5F5F5"));

        // Clean Center text
        SpannableString centerText = new SpannableString(totalGaps + " Gaps\nDistribution");
        centerText.setSpan(new RelativeSizeSpan(1.3f), 0, String.valueOf(totalGaps).length() + 5, 0);
        centerText.setSpan(new StyleSpan(Typeface.BOLD), 0, String.valueOf(totalGaps).length() + 5, 0);
        binding.pieChartDeptHealth.setCenterText(centerText);
        binding.pieChartDeptHealth.setCenterTextColor(Color.parseColor("#263238"));

        // Clean bottom legend
        Legend l = binding.pieChartDeptHealth.getLegend();
        l.setVerticalAlignment(Legend.LegendVerticalAlignment.BOTTOM);
        l.setHorizontalAlignment(Legend.LegendHorizontalAlignment.CENTER);
        l.setOrientation(Legend.LegendOrientation.HORIZONTAL);
        l.setDrawInside(false);
        l.setWordWrapEnabled(true);
        l.setForm(Legend.LegendForm.CIRCLE);
        l.setFormSize(9f);
        l.setTextSize(11f);
        l.setTextColor(Color.parseColor("#37474F"));
        l.setXEntrySpace(14f);
        l.setYEntrySpace(6f);
        l.setYOffset(10f);

        binding.pieChartDeptHealth.animateY(900);
        binding.pieChartDeptHealth.invalidate();
    }

    private void navigateToFragment(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, fragment)
                .addToBackStack(null)
                .commit();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        sliderHandler.removeCallbacksAndMessages(null);
        binding = null;
    }
}
