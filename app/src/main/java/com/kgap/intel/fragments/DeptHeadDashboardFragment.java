package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.BannerAdapter;
import com.kgap.intel.databinding.FragmentDeptHeadDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.models.DepartmentSkill;
import com.kgap.intel.models.HighRiskGap;
import com.kgap.intel.viewmodel.DepartmentHeadViewModel;

import java.util.ArrayList;
import java.util.List;

public class DeptHeadDashboardFragment extends Fragment {
    private FragmentDeptHeadDashboardBinding binding;
    private DepartmentHeadViewModel viewModel;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDeptHeadDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(DepartmentHeadViewModel.class);

        setupUI();
        setupBanner();
        setupHub();
        observeViewModel();
    }

    private void setupUI() {
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new MoreFragment()));
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("Engineering Dashboard", "Strategic Oversight & Performance", R.drawable.slide_5));
        bannerItems.add(new BannerAdapter.BannerItem("Team Synergy", "Optimizing Resource Allocation", R.drawable.slide_1));
        bannerItems.add(new BannerAdapter.BannerItem("Skills Matrix", "Identifying Departmental Strengths", R.drawable.slide_2));

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

    private void setupHub() {
        // 1. Skills - Teal Theme
        ItemHubButtonBinding skills = ItemHubButtonBinding.bind(binding.hubSkills.getRoot());
        skills.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        skills.ivIcon.setColorFilter(Color.parseColor("#00897B"));
        skills.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E0F2F1"));
        skills.tvLabel.setText("Skills Hub");
        skills.getRoot().setOnClickListener(v -> navigateToFragment(new DeptHeadSkillsFragment()));

        // 2. Learning - Indigo Theme
        ItemHubButtonBinding learning = ItemHubButtonBinding.bind(binding.hubLearning.getRoot());
        learning.ivIcon.setImageResource(android.R.drawable.ic_menu_directions);
        learning.ivIcon.setColorFilter(Color.parseColor("#3949AB"));
        learning.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8EAF6"));
        learning.tvLabel.setText("Learning");
        learning.getRoot().setOnClickListener(v -> navigateToFragment(new DeptHeadLearningFragment()));

        // 3. Employees - Green Theme
        ItemHubButtonBinding employees = ItemHubButtonBinding.bind(binding.hubEmployees.getRoot());
        employees.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        employees.ivIcon.setColorFilter(Color.parseColor("#43A047"));
        employees.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        employees.tvLabel.setText("Employees");
        employees.getRoot().setOnClickListener(v -> navigateToFragment(new DeptHeadEmployeesFragment()));

        // 4. More - Brown Theme
        ItemHubButtonBinding more = ItemHubButtonBinding.bind(binding.hubMore.getRoot());
        more.ivIcon.setImageResource(android.R.drawable.ic_menu_more);
        more.ivIcon.setColorFilter(Color.parseColor("#6D4C41"));
        more.cardIconContainer.setCardBackgroundColor(Color.parseColor("#EFEBE9"));
        more.tvLabel.setText("More");
        more.getRoot().setOnClickListener(v -> navigateToFragment(new MoreFragment()));

        // Card Listeners
        binding.cardDeptCoverage.setOnClickListener(v -> navigateToFragment(new DeptHeadSkillsFragment()));
        binding.cardDeptAdoption.setOnClickListener(v -> navigateToFragment(new DeptHeadLearningFragment()));
        binding.layoutRiskSummary.setOnClickListener(v -> navigateToFragment(new DeptHeadSkillsFragment()));
    }

    private void observeViewModel() {
        viewModel.getSkillCoverage().observe(getViewLifecycleOwner(), skills -> {
            if (skills != null && !skills.isEmpty()) {
                int total = 0;
                for (DepartmentSkill s : skills) {
                    total += s.getCurrentCoverage();
                }
                binding.tvAvgCoverage.setText((total / skills.size()) + "%");
            }
        });

        viewModel.getAdoptionRates().observe(getViewLifecycleOwner(), adoption -> {
            if (adoption != null) {
                binding.tvAdoptionRate.setText(adoption.getAdoptionRate() + "%");
            }
        });

        viewModel.getHighRiskGaps().observe(getViewLifecycleOwner(), gaps -> {
            if (gaps != null) {
                binding.layoutRiskSummary.removeAllViews();
                for (HighRiskGap gap : gaps) {
                    TextView tv = new TextView(getContext());
                    tv.setText("• " + gap.getSkillName() + " (" + gap.getRiskLevel() + ")");
                    tv.setPadding(0, 8, 0, 8);
                    binding.layoutRiskSummary.addView(tv);
                }
            }
        });
    }

    private void navigateToFragment(Fragment fragment) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).switchFragment(fragment);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        sliderHandler.removeCallbacksAndMessages(null);
        binding = null;
    }
}
