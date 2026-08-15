package com.kgap.intel.fragments;

import android.graphics.Color;
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
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.BannerAdapter;
import com.kgap.intel.databinding.FragmentLdDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.viewmodel.LDViewModel;

import java.util.ArrayList;
import java.util.List;

public class LDDashboardFragment extends Fragment {
    private FragmentLdDashboardBinding binding;
    private LDViewModel viewModel;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLdDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(LDViewModel.class);

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
        bannerItems.add(new BannerAdapter.BannerItem("L&D Center", "Empowering Organizational Growth", R.drawable.slide_4));
        bannerItems.add(new BannerAdapter.BannerItem("Learning Paths", "Curated Knowledge Journeys", R.drawable.slide_5));
        bannerItems.add(new BannerAdapter.BannerItem("Analytics", "Measuring Training Impact", R.drawable.slide_1));

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
        // 1. Programs - Purple Theme
        ItemHubButtonBinding programs = ItemHubButtonBinding.bind(binding.hubPrograms.getRoot());
        programs.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        programs.ivIcon.setColorFilter(Color.parseColor("#673AB7"));
        programs.cardIconContainer.setCardBackgroundColor(Color.parseColor("#EDE7F6"));
        programs.tvLabel.setText("Programs");
        programs.getRoot().setOnClickListener(v -> navigateToFragment(new LDProgramsFragment()));
        
        // 2. Learning Paths - Indigo Theme
        ItemHubButtonBinding paths = ItemHubButtonBinding.bind(binding.hubPaths.getRoot());
        paths.ivIcon.setImageResource(android.R.drawable.ic_menu_directions);
        paths.ivIcon.setColorFilter(Color.parseColor("#3F51B5"));
        paths.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8EAF6"));
        paths.tvLabel.setText("Learning Paths");
        paths.getRoot().setOnClickListener(v -> navigateToFragment(new LDProgramsFragment())); // Reusing for demo

        // 3. Recommendations - Pink Theme
        ItemHubButtonBinding recommendations = ItemHubButtonBinding.bind(binding.hubRecommendations.getRoot());
        recommendations.ivIcon.setImageResource(android.R.drawable.ic_menu_view);
        recommendations.ivIcon.setColorFilter(Color.parseColor("#E91E63"));
        recommendations.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FCE4EC"));
        recommendations.tvLabel.setText("Recommendations");
        recommendations.getRoot().setOnClickListener(v -> navigateToFragment(new LDProgramsFragment())); // Reusing for demo

        // 4. Certifications - Cyan Theme
        ItemHubButtonBinding certifications = ItemHubButtonBinding.bind(binding.hubCertifications.getRoot());
        certifications.ivIcon.setImageResource(android.R.drawable.ic_menu_send);
        certifications.ivIcon.setColorFilter(Color.parseColor("#00BCD4"));
        certifications.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E0F7FA"));
        certifications.tvLabel.setText("Certifications");
        certifications.getRoot().setOnClickListener(v -> navigateToFragment(new LDProgramsFragment())); // Reusing for demo

        // 5. More - Grey Theme
        ItemHubButtonBinding more = ItemHubButtonBinding.bind(binding.hubMore.getRoot());
        more.ivIcon.setImageResource(android.R.drawable.ic_menu_more);
        more.ivIcon.setColorFilter(Color.parseColor("#607D8B"));
        more.cardIconContainer.setCardBackgroundColor(Color.parseColor("#ECEFF1"));
        more.tvLabel.setText("Account");
        more.getRoot().setOnClickListener(v -> navigateToFragment(new MoreFragment()));
    }

    private void observeViewModel() {
        viewModel.getDashboardStats().observe(getViewLifecycleOwner(), stats -> {
            binding.tvTotalPrograms.setText(String.valueOf(stats.totalPrograms));
            binding.tvTotalLearners.setText(String.valueOf(stats.totalLearners));
            binding.tvCompletionRate.setText(stats.completionRate + "%");
            binding.tvEffectiveness.setText(stats.learningEffectiveness + "%");
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
