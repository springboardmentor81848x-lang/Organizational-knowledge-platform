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
import com.kgap.intel.databinding.FragmentHomeBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HomeViewModel;
import java.util.ArrayList;
import java.util.List;

public class HomeFragment extends Fragment {
    private FragmentHomeBinding binding;
    private HomeViewModel viewModel;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentHomeBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(HomeViewModel.class);

        setupUI();
        setupBanner();
        setupNavigation();
        observeViewModel();
    }

    private void setupUI() {
        SharedPrefManager prefManager = SharedPrefManager.getInstance(getContext());
        String name = prefManager.getUserName();
        updateGreeting(name);

        // Tool Bar Actions
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnProfileAvatar.setOnClickListener(v -> navigateToFragment(new ProfileFragment()));

        // Quick Actions
        binding.qaAssess.setOnClickListener(v -> navigateToFragment(new SkillsFragment()));
        binding.qaGaps.setOnClickListener(v -> navigateToFragment(new SkillGapFragment()));
        binding.qaContinue.setOnClickListener(v -> navigateToFragment(new MyProgressFragment()));

        // Path & Achievements
        binding.tvViewAchievements.setOnClickListener(v -> navigateToFragment(new AchievementsFragment()));
        binding.cardContinueLearning.setOnClickListener(v -> navigateToFragment(new LearningFragment()));
    }

    private void updateGreeting(String name) {
        if (name == null || name.isEmpty() || name.equals("User")) {
            name = "Employee";
        }
        binding.tvGreeting.setText("Welcome back, " + name + "! 👋");
    }

    private void setupNavigation() {
        // 1. Skills - Emerald Theme
        ItemHubButtonBinding skills = ItemHubButtonBinding.bind(binding.hubSkills.getRoot());
        skills.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        skills.ivIcon.setColorFilter(Color.parseColor("#00C853"));
        skills.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        skills.tvLabel.setText("Skills Hub");
        skills.getRoot().setOnClickListener(v -> navigateToFragment(new SkillsHubFragment()));

        // 2. Mentor - Blue Theme
        ItemHubButtonBinding mentor = ItemHubButtonBinding.bind(binding.hubMentor.getRoot());
        mentor.ivIcon.setImageResource(android.R.drawable.ic_menu_share);
        mentor.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        mentor.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        mentor.tvLabel.setText("Mentorship");
        mentor.getRoot().setOnClickListener(v -> navigateToFragment(new MentorshipHomeFragment()));

        // 3. Learning - Indigo Theme
        ItemHubButtonBinding learning = ItemHubButtonBinding.bind(binding.hubLearning.getRoot());
        learning.ivIcon.setImageResource(android.R.drawable.ic_menu_slideshow);
        learning.ivIcon.setColorFilter(Color.parseColor("#3F51B5"));
        learning.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8EAF6"));
        learning.tvLabel.setText("Learning");
        learning.getRoot().setOnClickListener(v -> navigateToFragment(new LearningHubFragment()));

        // 4. More - Purple Theme
        ItemHubButtonBinding more = ItemHubButtonBinding.bind(binding.hubMore.getRoot());
        String role = SharedPrefManager.getInstance(requireContext()).getUserRole();
        if ("MENTOR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "LD_ADMIN".equalsIgnoreCase(role) || "LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(role)) {
            more.ivIcon.setImageResource(android.R.drawable.ic_menu_add);
            more.tvLabel.setText("New Session");
            more.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
            more.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
            more.getRoot().setOnClickListener(v -> navigateToFragment(new KnowledgeSessionCreateFragment()));
        } else {
            more.ivIcon.setImageResource(android.R.drawable.ic_menu_more);
            more.ivIcon.setColorFilter(Color.parseColor("#6200EA"));
            more.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
            more.tvLabel.setText("Account");
            more.getRoot().setOnClickListener(v -> navigateToFragment(new MoreFragment()));
        }
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("KGap", "Knowledge Gap Intelligence Platform", R.drawable.slide_1));
        bannerItems.add(new BannerAdapter.BannerItem("Discover Your Skill Gaps", "Get AI-powered insights about your skills and competencies.", R.drawable.slide_2));
        bannerItems.add(new BannerAdapter.BannerItem("AI-Powered Recommendations", "Get personalized course and learning recommendations based on your gaps.", R.drawable.slide_3));
        bannerItems.add(new BannerAdapter.BannerItem("Structured Learning Paths", "Follow curated learning paths from beginner to advanced level.", R.drawable.slide_4));
        bannerItems.add(new BannerAdapter.BannerItem("Grow. Learn. Succeed.", "KGap helps you close knowledge gaps and achieve your career goals.", R.drawable.slide_5));

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
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).switchFragment(fragment);
        }
    }

    private void observeViewModel() {
        viewModel.getEmployeeName().observe(getViewLifecycleOwner(), this::updateGreeting);

        viewModel.getHighGapsCount().observe(getViewLifecycleOwner(), count -> {
            binding.tvHighGaps.setText(String.valueOf(count));
        });

        viewModel.getMediumGapsCount().observe(getViewLifecycleOwner(), count -> {
            binding.tvMedGaps.setText(String.valueOf(count));
        });

        viewModel.getLowGapsCount().observe(getViewLifecycleOwner(), count -> {
            binding.tvLowGaps.setText(String.valueOf(count));
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        sliderHandler.removeCallbacksAndMessages(null);
        binding = null;
    }
}
