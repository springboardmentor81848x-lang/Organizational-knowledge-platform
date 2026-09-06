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
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.BannerAdapter;
import com.kgap.intel.adapters.DeptHeadEmployeesAdapter;
import com.kgap.intel.adapters.DeptSkillCoverageAdapter;
import com.kgap.intel.adapters.HighRiskGapAdapter;
import com.kgap.intel.databinding.FragmentDeptHeadDashboardBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.models.DepartmentSkill;
import com.kgap.intel.models.HighRiskGap;
import com.kgap.intel.models.MentorAssignmentRequest;
import com.kgap.intel.models.MentorProfileResponse;
import com.kgap.intel.models.SkillGap;
import com.kgap.intel.repository.MentorAssignmentRepository;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.repository.RealMentorRepository;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.DepartmentHeadViewModel;

import java.util.ArrayList;
import java.util.List;

public class DeptHeadDashboardFragment extends Fragment {
    private FragmentDeptHeadDashboardBinding binding;
    private DepartmentHeadViewModel viewModel;
    private final Handler sliderHandler = new Handler(Looper.getMainLooper());
    private RealMentorRepository mentorRepository;
    private MentorAssignmentRepository assignmentRepository;
    private NotificationRepository notificationRepository;

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
        mentorRepository = new RealMentorRepository(requireContext());
        assignmentRepository = new MentorAssignmentRepository(requireContext());
        notificationRepository = new NotificationRepository(requireContext());

        setupUI();
        setupBanner();
        setupHub();
        setupRecyclerViews();
        observeViewModel();
    }

    private void setupUI() {
        binding.btnNotifications.setOnClickListener(v -> navigateToFragment(new NotificationsFragment()));
        binding.btnSearch.setOnClickListener(v -> new QuickServiceSearchBottomSheet().show(getParentFragmentManager(), "quick_service_search"));
        setupNotificationBadge();

        // Heatmap navigation - open dedicated department skills & heatmap screen
        View.OnClickListener openHeatmap = v -> navigateToFragment(new DeptHeadSkillsFragment());
        binding.btnViewFullHeatmap.setOnClickListener(openHeatmap);
        binding.cardHeatmapPreview.setOnClickListener(openHeatmap);
        binding.btnOpenHeatmap.setOnClickListener(openHeatmap);

        // Section header navigations
        binding.cardDeptCoverage.setOnClickListener(v -> navigateToFragment(new DeptHeadSkillsFragment()));
        binding.btnViewAllSkills.setOnClickListener(v -> navigateToFragment(new DeptHeadSkillsFragment()));

        binding.cardDeptAdoption.setOnClickListener(v -> navigateToFragment(new DeptHeadLearningFragment()));

        binding.cardHighRiskSummary.setOnClickListener(v -> navigateToFragment(new DeptHeadSkillsFragment()));
        binding.btnViewAllGaps.setOnClickListener(v -> navigateToFragment(new DeptHeadSkillsFragment()));

        binding.cardTeamMembers.setOnClickListener(v -> navigateToFragment(new DeptHeadEmployeesFragment()));
        binding.btnViewAllEmployees.setOnClickListener(v -> navigateToFragment(new DeptHeadEmployeesFragment()));
    }

    private void setupBanner() {
        List<BannerAdapter.BannerItem> bannerItems = new ArrayList<>();
        bannerItems.add(new BannerAdapter.BannerItem("Department Leadership", "Strategic Oversight & Performance Tracking", R.drawable.slide_5));
        bannerItems.add(new BannerAdapter.BannerItem("Skill Intelligence", "Proactive Gap Detection & Training Alignment", R.drawable.slide_1));
        bannerItems.add(new BannerAdapter.BannerItem("Resource Optimization", "Maximizing Department Competency & Growth", R.drawable.slide_2));

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
        learning.tvLabel.setText("Learning Hub");
        learning.getRoot().setOnClickListener(v -> navigateToFragment(new DeptHeadLearningFragment()));

        // 3. Employees - Green Theme
        ItemHubButtonBinding employees = ItemHubButtonBinding.bind(binding.hubEmployees.getRoot());
        employees.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        employees.ivIcon.setColorFilter(Color.parseColor("#43A047"));
        employees.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        employees.tvLabel.setText("Employees");
        employees.getRoot().setOnClickListener(v -> navigateToFragment(new DeptHeadEmployeesFragment()));

        // 4. Reports - Orange/Purple Theme
        ItemHubButtonBinding reports = ItemHubButtonBinding.bind(binding.hubReports.getRoot());
        reports.ivIcon.setImageResource(android.R.drawable.ic_menu_save);
        reports.ivIcon.setColorFilter(Color.parseColor("#E65100"));
        reports.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        reports.tvLabel.setText("Reports Hub");
        reports.getRoot().setOnClickListener(v -> navigateToFragment(new ReportsFragment()));

        // 5. My Profile - Emerald Theme
        ItemHubButtonBinding profile = ItemHubButtonBinding.bind(binding.hubProfile.getRoot());
        profile.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        profile.ivIcon.setColorFilter(Color.parseColor("#2E7D32"));
        profile.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        profile.tvLabel.setText("My Profile");
        profile.getRoot().setOnClickListener(v -> navigateToFragment(new ProfileFragment()));

        // 6. More / Account - Purple Theme
        ItemHubButtonBinding more = ItemHubButtonBinding.bind(binding.hubMore.getRoot());
        more.ivIcon.setImageResource(android.R.drawable.ic_menu_preferences);
        more.ivIcon.setColorFilter(Color.parseColor("#7B1FA2"));
        more.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        more.tvLabel.setText("Account / More");
        more.getRoot().setOnClickListener(v -> navigateToFragment(new MoreFragment()));
    }

    private void setupRecyclerViews() {
        binding.rvHighRiskAlerts.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvSkillCoverage.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvEmployeeSnapshots.setLayoutManager(new LinearLayoutManager(getContext()));
    }

    private void observeViewModel() {
        // Department Subtitle
        viewModel.getDepartmentName().observe(getViewLifecycleOwner(), deptName -> {
            if (deptName != null && !deptName.isEmpty()) {
                binding.tvDeptSubtitle.setText(deptName + " Department Overview");
            } else {
                binding.tvDeptSubtitle.setText("Department Overview");
            }
        });

        // 1. Department Skill Coverage
        viewModel.getSkillCoverage().observe(getViewLifecycleOwner(), skills -> {
            if (skills != null && !skills.isEmpty()) {
                int total = 0;
                for (DepartmentSkill s : skills) {
                    total += s.getCurrentCoverage();
                }
                int avg = (int) Math.round((double) total / skills.size());
                binding.tvAvgCoverage.setText(avg + "%");

                // Show top skills in the breakdown
                List<DepartmentSkill> topSkills = skills.size() > 4 ? skills.subList(0, 4) : skills;
                binding.rvSkillCoverage.setAdapter(new DeptSkillCoverageAdapter(topSkills));
            } else {
                binding.tvAvgCoverage.setText("0%");
            }
        });

        // 2. Training Adoption Rates
        viewModel.getAdoptionRates().observe(getViewLifecycleOwner(), adoption -> {
            if (adoption != null) {
                binding.tvAdoptionRate.setText((int) Math.round(adoption.getAdoptionRate()) + "%");
                binding.tvAdoptionSub.setText(adoption.getCompletion() + " Completed • " + adoption.getInProgress() + " In Progress");
            } else {
                binding.tvAdoptionRate.setText("0%");
            }
        });

        // 3. High-Risk Skill Gap Alerts
        viewModel.getHighRiskGaps().observe(getViewLifecycleOwner(), gaps -> {
            if (gaps != null && !gaps.isEmpty()) {
                binding.tvHighRiskCount.setText(gaps.size() + (gaps.size() == 1 ? " Alert" : " Alerts"));
                binding.tvEmptyRiskGaps.setVisibility(View.GONE);
                binding.rvHighRiskAlerts.setVisibility(View.VISIBLE);

                HighRiskGapAdapter adapter = new HighRiskGapAdapter(gaps, new HighRiskGapAdapter.OnGapActionListener() {
                    @Override
                    public void onRecommendTraining(HighRiskGap gap) {
                        String empName = gap.getEmployeeName() != null ? gap.getEmployeeName() : "the employee";
                        new MaterialAlertDialogBuilder(requireContext())
                            .setTitle("Recommend Training")
                            .setMessage("Send learning recommendation for " + gap.getSkillName() + " to " + empName + " through Department Head?")
                            .setPositiveButton("Send Recommendation", (d, w) -> {
                                String headName = SharedPrefManager.getInstance(getContext()).getUserName();
                                Long headId = SharedPrefManager.getInstance(getContext()).getUserId();

                                if (gap.getEmployeeId() != null) {
                                    String empMsg = "🎓 " + (headName != null ? headName : "Department Head") + 
                                        " (Department Head) recommended training for: " + gap.getSkillName() + " to address your skill gap.";
                                    notificationRepository.createNotification(gap.getEmployeeId(), "TRAINING_REMINDER", empMsg)
                                        .observe(getViewLifecycleOwner(), success -> {
                                            // Also create confirmation for Dept Head
                                            if (headId != null) {
                                                String headMsg = "✓ Recommended training for " + gap.getSkillName() + " to " + empName + " through Department Head.";
                                                notificationRepository.createNotification(headId, "TRAINING_REMINDER", headMsg);
                                            }
                                            Toast.makeText(getContext(), "✓ Training recommendation for " + gap.getSkillName() + " sent to " + empName + " through Dept Head!", Toast.LENGTH_LONG).show();
                                        });
                                } else {
                                    Toast.makeText(getContext(), "✓ Training recommendation sent to " + empName + "!", Toast.LENGTH_SHORT).show();
                                }
                            })
                            .setNegativeButton("Cancel", null)
                            .show();
                    }

                    @Override
                    public void onAssignMentor(HighRiskGap gap) {
                        showAssignMentorDialog(gap);
                    }
                });
                binding.rvHighRiskAlerts.setAdapter(adapter);
            } else {
                binding.tvHighRiskCount.setText("0 Alerts");
                binding.tvEmptyRiskGaps.setVisibility(View.VISIBLE);
                binding.rvHighRiskAlerts.setVisibility(View.GONE);
            }
        });

        // 4. Team Members & Progress Snapshots
        viewModel.getEmployeeProgress().observe(getViewLifecycleOwner(), progressList -> {
            if (progressList != null && !progressList.isEmpty()) {
                binding.tvTotalMembers.setText(progressList.size() + (progressList.size() == 1 ? " Member" : " Members"));
                DeptHeadEmployeesAdapter adapter = new DeptHeadEmployeesAdapter(progressList, employee -> {
                    if (employee.getEmployeeId() != null) {
                        navigateToFragment(UserDetailsFragment.newInstance(employee.getEmployeeId()));
                    }
                });
                binding.rvEmployeeSnapshots.setAdapter(adapter);
            } else {
                binding.tvTotalMembers.setText("0 Members");
            }
        });

        // 5. Team Gap Heatmap Counters
        viewModel.getHeatmap().observe(getViewLifecycleOwner(), gaps -> {
            if (gaps != null && !gaps.isEmpty()) {
                int critical = 0, high = 0, medium = 0, low = 0;
                for (SkillGap g : gaps) {
                    String lvl = g.getGapLevel();
                    if ("CRITICAL".equalsIgnoreCase(lvl)) critical++;
                    else if ("HIGH".equalsIgnoreCase(lvl)) high++;
                    else if ("MEDIUM".equalsIgnoreCase(lvl)) medium++;
                    else low++;
                }
                binding.tvHeatCritical.setText(String.valueOf(critical));
                binding.tvHeatHigh.setText(String.valueOf(high));
                binding.tvHeatMedium.setText(String.valueOf(medium));
                binding.tvHeatLow.setText(String.valueOf(low));
            } else {
                binding.tvHeatCritical.setText("0");
                binding.tvHeatHigh.setText("0");
                binding.tvHeatMedium.setText("0");
                binding.tvHeatLow.setText("0");
            }
        });
    }

    private void showAssignMentorDialog(HighRiskGap gap) {
        mentorRepository.getMentors().observe(getViewLifecycleOwner(), mentors -> {
            if (mentors == null || mentors.isEmpty()) {
                Toast.makeText(getContext(), "No mentors currently available", Toast.LENGTH_SHORT).show();
                return;
            }

            String empName = gap.getEmployeeName() != null ? gap.getEmployeeName() : "Employee";
            String[] mentorNames = new String[mentors.size()];
            for (int i = 0; i < mentors.size(); i++) {
                MentorProfileResponse m = mentors.get(i);
                mentorNames[i] = m.getDisplayName() + " (" + (m.getExpertise() != null ? m.getExpertise() : "Technical Mentor") + ")";
            }

            new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Assign Mentor for " + empName)
                .setItems(mentorNames, (dialog, which) -> {
                    MentorProfileResponse selectedMentor = mentors.get(which);
                    Long mentorId = selectedMentor.getEffectiveMentorId();
                    if (gap.getEmployeeId() != null && mentorId != null) {
                        assignmentRepository.createAssignment(new MentorAssignmentRequest(gap.getEmployeeId(), mentorId))
                            .observe(getViewLifecycleOwner(), assignment -> {
                                Toast.makeText(getContext(), "✓ Assigned " + selectedMentor.getDisplayName() + " to " + empName + "!", Toast.LENGTH_LONG).show();
                                
                                String headName = SharedPrefManager.getInstance(getContext()).getUserName();
                                String msg = (headName != null ? headName : "Department Head") + 
                                    " has assigned " + selectedMentor.getDisplayName() + " as your mentor for " + gap.getSkillName() + ".";
                                notificationRepository.createNotification(gap.getEmployeeId(), "MENTORSHIP", msg);
                            });
                    }
                })
                .setNeutralButton("Manage All Assignments", (d, w) -> {
                    navigateToFragment(new AssignMentorsFragment());
                })
                .setNegativeButton("Cancel", null)
                .show();
        });
    }

    private void navigateToFragment(Fragment fragment) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).switchFragment(fragment);
        }
    }

    private void setupNotificationBadge() {
        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
        com.kgap.intel.repository.NotificationRepository notifRepo = new com.kgap.intel.repository.NotificationRepository(requireContext());
        notifRepo.getUnreadCount(userId).observe(getViewLifecycleOwner(), unreadCount -> {
            if (binding != null && binding.tvNotifBadge != null) {
                if (unreadCount != null && unreadCount > 0) {
                    binding.tvNotifBadge.setVisibility(View.VISIBLE);
                    binding.tvNotifBadge.setText(unreadCount > 9 ? "9+" : String.valueOf(unreadCount));
                } else {
                    binding.tvNotifBadge.setVisibility(View.GONE);
                }
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        sliderHandler.removeCallbacksAndMessages(null);
        binding = null;
    }
}
