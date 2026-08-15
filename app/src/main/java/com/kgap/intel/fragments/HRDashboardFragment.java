package com.kgap.intel.fragments;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.BannerAdapter;
import com.kgap.intel.adapters.DepartmentHealthAdapter;
import com.kgap.intel.databinding.FragmentHrDashboardBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HRViewModel;

import java.util.ArrayList;
import java.util.List;

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
        binding.tvGreeting.setText("Welcome back, " + (name != null ? name : "HR Manager") + " 👋");

        setupRecyclerView();
        setupBanner();
        setupNavigation();
        observeViewModel();
    }

    private void setupRecyclerView() {
        deptAdapter = new DepartmentHealthAdapter(new ArrayList<>(), dept -> {
            navigateToFragment(DepartmentDetailFragment.newInstance(dept.getName()));
        });
        binding.rvDeptHealth.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvDeptHealth.setAdapter(deptAdapter);
    }

    private void setupNavigation() {
        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new MoreFragment()));
        binding.btnViewOrgHeatmap.setOnClickListener(v -> navigateToFragment(new HeatmapFragment()));

        binding.cardTotalEmployees.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
        binding.cardTotalDepartments.setOnClickListener(v -> navigateToFragment(new DepartmentListFragment()));
        binding.cardCriticalGaps.setOnClickListener(v -> navigateToFragment(new SkillGapFragment()));
        binding.cardTrainingNeeds.setOnClickListener(v -> navigateToFragment(new AIRecommendationFragment()));

        binding.btnActionEmployees.setOnClickListener(v -> navigateToFragment(new UserManagementFragment()));
        binding.btnActionGaps.setOnClickListener(v -> navigateToFragment(new SkillGapFragment()));
        binding.btnActionRecommend.setOnClickListener(v -> navigateToFragment(new AIRecommendationFragment()));
        binding.btnActionReports.setOnClickListener(v -> navigateToFragment(new ReportsFragment()));
    }

    private void observeViewModel() {
        viewModel.getTotalEmployees().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalEmployees.setText(String.valueOf(count)));
            
        viewModel.getTotalDepartments().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalDepartments.setText(String.valueOf(count)));
            
        viewModel.getCriticalGaps().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalCriticalGaps.setText(String.valueOf(count)));
            
        viewModel.getTrainingNeeds().observe(getViewLifecycleOwner(), count -> 
            binding.tvTotalTrainingNeeds.setText(String.valueOf(count)));

        viewModel.getDepartments().observe(getViewLifecycleOwner(), departments -> {
            if (departments != null) {
                deptAdapter.setDepartments(departments);
            }
        });

        viewModel.getDeptGapCounts().observe(getViewLifecycleOwner(), counts -> {
            if (counts != null) {
                deptAdapter.setGapCounts(counts);
            }
        });
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("Talent Analytics", "Understand your workforce better", R.drawable.slide_3));
        bannerItems.add(new BannerAdapter.BannerItem("Gap Assessment", "Identify and bridge skill shortages", R.drawable.slide_4));
        bannerItems.add(new BannerAdapter.BannerItem("Growth Strategy", "Build future-ready teams", R.drawable.slide_5));

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
