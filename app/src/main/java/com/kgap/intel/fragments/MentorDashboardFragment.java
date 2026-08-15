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
import com.kgap.intel.databinding.FragmentMentorDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.viewmodel.MentorViewModel;

import java.util.ArrayList;
import java.util.List;

public class MentorDashboardFragment extends Fragment {
    private FragmentMentorDashboardBinding binding;
    private MentorViewModel viewModel;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(MentorViewModel.class);

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
        bannerItems.add(new BannerAdapter.BannerItem("Mentorship Hub", "Guiding the Next Generation", R.drawable.slide_2));
        bannerItems.add(new BannerAdapter.BannerItem("Knowledge Sharing", "Bridging the Experience Gap", R.drawable.slide_3));
        bannerItems.add(new BannerAdapter.BannerItem("Progress Tracking", "Monitoring Mentee Growth", R.drawable.slide_4));

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
        // 1. Mentees - Teal Theme
        ItemHubButtonBinding mentees = ItemHubButtonBinding.bind(binding.hubMentees.getRoot());
        mentees.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        mentees.ivIcon.setColorFilter(Color.parseColor("#009688"));
        mentees.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E0F2F1"));
        mentees.tvLabel.setText("Mentees");
        mentees.getRoot().setOnClickListener(v -> navigateToFragment(new MentorMenteesFragment()));
        
        // 2. Sessions - Amber Theme
        ItemHubButtonBinding sessions = ItemHubButtonBinding.bind(binding.hubSessions.getRoot());
        sessions.ivIcon.setImageResource(android.R.drawable.ic_menu_today);
        sessions.ivIcon.setColorFilter(Color.parseColor("#FF8F00"));
        sessions.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF8E1"));
        sessions.tvLabel.setText("Sessions");
        sessions.getRoot().setOnClickListener(v -> navigateToFragment(new MentorMenteesFragment()));

        // 3. Progress - Emerald Theme
        ItemHubButtonBinding progress = ItemHubButtonBinding.bind(binding.hubMenteeProgress.getRoot());
        progress.ivIcon.setImageResource(android.R.drawable.ic_menu_sort_by_size);
        progress.ivIcon.setColorFilter(Color.parseColor("#00C853"));
        progress.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        progress.tvLabel.setText("Progress");
        progress.getRoot().setOnClickListener(v -> navigateToFragment(new MentorMenteesFragment()));

        // 4. Profile - Purple Theme
        ItemHubButtonBinding profile = ItemHubButtonBinding.bind(binding.hubMentorProfile.getRoot());
        profile.ivIcon.setImageResource(android.R.drawable.ic_menu_manage);
        profile.ivIcon.setColorFilter(Color.parseColor("#6200EA"));
        profile.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        profile.tvLabel.setText("Profile");
        profile.getRoot().setOnClickListener(v -> navigateToFragment(new MoreFragment()));
    }

    private void observeViewModel() {
        viewModel.getDashboardStats().observe(getViewLifecycleOwner(), stats -> {
            binding.tvAssignedMentees.setText(String.valueOf(stats.assignedMentees));
            binding.tvActiveMentorships.setText(String.valueOf(stats.activeMentorships));
            binding.tvUpcomingSessions.setText("• " + stats.upcomingSessions + " sessions scheduled for this week");
            binding.tvPendingRequests.setText("• " + stats.pendingRequests + " pending mentee request");
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
