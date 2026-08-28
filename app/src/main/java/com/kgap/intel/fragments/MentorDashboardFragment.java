package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.BannerAdapter;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentMentorDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.utils.MentorMenteesHelper;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorDashboardFragment extends Fragment {
    private FragmentMentorDashboardBinding binding;
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

        setupUI();
        setupBanner();
        setupMentorHub();
        loadRealMentorMetrics();
    }

    private void setupUI() {
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnChat.setOnClickListener(v -> openMenteeChatSelection());
        binding.btnProfile.setOnClickListener(v -> navigateToFragment(new MoreFragment()));

        String userName = SharedPrefManager.getInstance(getContext()).getUserName();
        if (userName != null && !userName.isEmpty()) {
            binding.tvGreeting.setText("Welcome, " + userName + " 🤝");
        }
        setupNotificationBadge();
    }

    private void setupNotificationBadge() {
        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
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

    private void openMenteeChatSelection() {
        MentorMenteesHelper.loadAssignedMentees(requireContext(), mentees -> {
            if (mentees.isEmpty()) {
                Toast.makeText(getContext(), "No assigned mentees available to chat with.", Toast.LENGTH_SHORT).show();
                return;
            }

            if (mentees.size() == 1) {
                EmployeeResponse m = mentees.get(0);
                String name = (m.getFirstName() + " " + m.getLastName()).trim();
                navigateToFragment(ChatFragment.newInstance(name, m.getId()));
                return;
            }

            String[] names = new String[mentees.size()];
            for (int i = 0; i < mentees.size(); i++) {
                EmployeeResponse m = mentees.get(i);
                names[i] = "💬 " + m.getFirstName() + " " + m.getLastName() + " (" + (m.getDepartment() != null ? m.getDepartment() : "General") + ")";
            }

            new MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Select Mentee to Message")
                    .setItems(names, (dialog, which) -> {
                        EmployeeResponse selected = mentees.get(which);
                        String name = (selected.getFirstName() + " " + selected.getLastName()).trim();
                        navigateToFragment(ChatFragment.newInstance(name, selected.getId()));
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("Mentor Leadership Hub", "Curate Programs & Support Learning Paths", R.drawable.slide_2));
        bannerItems.add(new BannerAdapter.BannerItem("Participation & Growth", "Track Real-Time Mentee Milestone Completion", R.drawable.slide_3));
        bannerItems.add(new BannerAdapter.BannerItem("Certification Oversight", "Monitor Learning Impact & Credential Renewals", R.drawable.slide_4));

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

    private void setupMentorHub() {
        // 1. Manage Training Programs/Catalog - Teal Theme
        ItemHubButtonBinding catalog = ItemHubButtonBinding.bind(binding.hubTrainingCatalog.getRoot());
        catalog.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        catalog.ivIcon.setColorFilter(Color.parseColor("#00897B"));
        catalog.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E0F2F1"));
        catalog.tvLabel.setText("Training Catalog");
        catalog.getRoot().setOnClickListener(v -> navigateToFragment(new MentorTrainingCatalogFragment()));

        // 2. Support Learning Paths - Indigo Theme
        ItemHubButtonBinding paths = ItemHubButtonBinding.bind(binding.hubLearningPaths.getRoot());
        paths.ivIcon.setImageResource(android.R.drawable.ic_menu_compass);
        paths.ivIcon.setColorFilter(Color.parseColor("#3949AB"));
        paths.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8EAF6"));
        paths.tvLabel.setText("Learning Paths");
        paths.getRoot().setOnClickListener(v -> navigateToFragment(new MentorLearningPathsFragment()));

        // 3. Monitor Training Participation - Emerald Theme
        ItemHubButtonBinding part = ItemHubButtonBinding.bind(binding.hubTrainingParticipation.getRoot());
        part.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        part.ivIcon.setColorFilter(Color.parseColor("#2E7D32"));
        part.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        part.tvLabel.setText("Participation");
        part.getRoot().setOnClickListener(v -> navigateToFragment(new MentorParticipationFragment()));

        // 4. Track Completion - Blue Theme
        ItemHubButtonBinding completion = ItemHubButtonBinding.bind(binding.hubCompletionTracker.getRoot());
        completion.ivIcon.setImageResource(android.R.drawable.checkbox_on_background);
        completion.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        completion.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        completion.tvLabel.setText("Track Completion");
        completion.getRoot().setOnClickListener(v -> navigateToFragment(new MentorCompletionTrackingFragment()));

        // 5. Monitor Learning Effectiveness - Purple Theme
        ItemHubButtonBinding effectiveness = ItemHubButtonBinding.bind(binding.hubLearningEffectiveness.getRoot());
        effectiveness.ivIcon.setImageResource(android.R.drawable.ic_menu_sort_by_size);
        effectiveness.ivIcon.setColorFilter(Color.parseColor("#7B1FA2"));
        effectiveness.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        effectiveness.tvLabel.setText("Effectiveness");
        effectiveness.getRoot().setOnClickListener(v -> navigateToFragment(new MentorEffectivenessFragment()));

        // 6. Support Certification & Renewals - Amber Theme
        ItemHubButtonBinding certs = ItemHubButtonBinding.bind(binding.hubCertifications.getRoot());
        certs.ivIcon.setImageResource(android.R.drawable.btn_star_big_on);
        certs.ivIcon.setColorFilter(Color.parseColor("#E65100"));
        certs.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF8E1"));
        certs.tvLabel.setText("Certifications");
        certs.getRoot().setOnClickListener(v -> navigateToFragment(new MentorCertificationsFragment()));
    }

    private void loadRealMentorMetrics() {
        // Query assigned mentees specifically for this mentor
        MentorMenteesHelper.loadAssignedMentees(requireContext(), mentees -> {
            if (binding != null) {
                binding.tvAssignedMentees.setText(String.valueOf(mentees.size()));
            }
        });

        // Query real catalog programs
        ApiClient.getTrainingApiService(requireContext()).getAllCourses().enqueue(new Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(Call<List<ExternalCourse>> call, Response<List<ExternalCourse>> response) {
                if (binding != null && response.isSuccessful() && response.body() != null) {
                    binding.tvActiveTrainings.setText(String.valueOf(response.body().size()));
                }
            }

            @Override
            public void onFailure(Call<List<ExternalCourse>> call, Throwable t) {}
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
