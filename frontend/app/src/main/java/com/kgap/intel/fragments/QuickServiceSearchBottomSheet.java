package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.databinding.DialogQuickServiceSearchBinding;
import com.kgap.intel.databinding.ItemQuickServiceBinding;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;

public class QuickServiceSearchBottomSheet extends BottomSheetDialogFragment {

    private DialogQuickServiceSearchBinding binding;
    private ServiceAdapter adapter;
    private final List<ServiceShortcut> allServices = new ArrayList<>();

    public interface OnServiceSelectListener {
        void onServiceSelected(Fragment fragment);
    }

    private OnServiceSelectListener listener;

    public void setOnServiceSelectListener(OnServiceSelectListener listener) {
        this.listener = listener;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = DialogQuickServiceSearchBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        initServicesList();

        adapter = new ServiceAdapter(allServices, shortcut -> {
            dismiss();
            if (listener != null) {
                listener.onServiceSelected(shortcut.createFragment());
            } else if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).switchFragment(shortcut.createFragment());
            }
        });

        binding.rvServices.setAdapter(adapter);

        binding.etServiceSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterServices(s.toString());
            }

            @Override
            public void afterTextChanged(Editable s) {}
        });
    }

    private void initServicesList() {
        allServices.clear();
        String role = SharedPrefManager.getInstance(requireContext()).getUserRole();
        if (role == null) role = "EMPLOYEE";

        // 1. My Profile & Account
        allServices.add(new ServiceShortcut(
                "My Profile & Account Info",
                "View personal profile, competencies, role, and department",
                android.R.drawable.ic_menu_myplaces,
                "#E8F5E9",
                "#2E7D32",
                ProfileFragment::new
        ));

        // 2. More & Account Settings
        allServices.add(new ServiceShortcut(
                "More & Account Settings",
                "Manage account preferences, profile details, and log out",
                android.R.drawable.ic_menu_preferences,
                "#F3E5F5",
                "#7B1FA2",
                MoreFragment::new
        ));

        // 3. Reports & PDF Downloads
        allServices.add(new ServiceShortcut(
                "Reports & PDF Analytics",
                "Generate and download official performance & skill gap PDF reports",
                android.R.drawable.ic_menu_save,
                "#E8F5E9",
                "#00B894",
                ReportsFragment::new
        ));

        // 4. Skills & Heatmap
        if (role.contains("DEPARTMENT_HEAD") || role.contains("DEPT_HEAD")) {
            allServices.add(new ServiceShortcut(
                    "Skills & Team Heatmap Analysis",
                    "Department-wide competency matrix, skill coverage, and alerts",
                    android.R.drawable.ic_menu_agenda,
                    "#E0F2F1",
                    "#00897B",
                    DeptHeadSkillsFragment::new
            ));
            allServices.add(new ServiceShortcut(
                    "Department Learning Hub",
                    "Monitor department training adoption, courses, and active learners",
                    android.R.drawable.ic_menu_directions,
                    "#E8EAF6",
                    "#3949AB",
                    DeptHeadLearningFragment::new
            ));
            allServices.add(new ServiceShortcut(
                    "Department Employees Directory",
                    "View all team members, individual progress snapshots, and details",
                    android.R.drawable.ic_menu_myplaces,
                    "#E8F5E9",
                    "#43A047",
                    DeptHeadEmployeesFragment::new
            ));
            allServices.add(new ServiceShortcut(
                    "Department Head Dashboard",
                    "Strategic oversight, metric overview, and control hub",
                    android.R.drawable.ic_menu_compass,
                    "#FFF3E0",
                    "#E65100",
                    DeptHeadDashboardFragment::new
            ));
        }

        // 5. Skill Gap Analysis (Standard)
        allServices.add(new ServiceShortcut(
                "Skill Gap Summary & Insights",
                "View proficiency gaps, critical alerts, and targeted recommendations",
                android.R.drawable.ic_menu_compass,
                "#FFF3E0",
                "#FF9800",
                SkillGapFragment::new
        ));

        // 6. Heatmap Grid
        allServices.add(new ServiceShortcut(
                "Team Skill Gap Heatmap Grid",
                "Interactive matrix displaying competency proficiencies across team",
                android.R.drawable.ic_menu_sort_by_size,
                "#EDE7F6",
                "#673AB7",
                HeatmapFragment::new
        ));

        // 7. Learning Progress Dashboard
        allServices.add(new ServiceShortcut(
                "My Learning Progress",
                "Track active training goals, milestone progress, and hours spent",
                android.R.drawable.ic_menu_recent_history,
                "#E3F2FD",
                "#1976D2",
                MyProgressFragment::new
        ));

        // 8. Learning & Growth Hub
        allServices.add(new ServiceShortcut(
                "Learning Hub & Discovery",
                "Explore curated learning paths, enrolled, and completed courses",
                android.R.drawable.ic_menu_slideshow,
                "#E8EAF6",
                "#3F51B5",
                LearningHubFragment::new
        ));

        // 9. Course Catalog
        allServices.add(new ServiceShortcut(
                "Browse Course Catalog",
                "Search and enroll in external courses from Coursera, Udemy, edX",
                android.R.drawable.ic_menu_search,
                "#F3E5F5",
                "#9C27B0",
                CourseCatalogFragment::new
        ));

        // 10. Mentorship Hub
        allServices.add(new ServiceShortcut(
                "Mentorship & Find Mentor",
                "Connect with peer mentors, request sessions, and review requests",
                android.R.drawable.ic_menu_share,
                "#E0F2F1",
                "#009688",
                MentorshipHomeFragment::new
        ));

        // 11. Assign Mentors (Manager/DeptHead/Admin)
        if (role.contains("MANAGER") || role.contains("ADMIN") || role.contains("DEPARTMENT_HEAD") || role.contains("DEPT_HEAD") || role.contains("HR")) {
            allServices.add(new ServiceShortcut(
                    "Assign Mentors to Team",
                    "Manage mentorship pairings and assign mentors to employees",
                    android.R.drawable.ic_menu_add,
                    "#E0F7FA",
                    "#00838F",
                    AssignMentorsFragment::new
            ));
        }

        // 12. Take Skill Assessment
        allServices.add(new ServiceShortcut(
                "Skill Assessment & Quizzes",
                "Take 5-question competency assessments to close skill gaps",
                android.R.drawable.ic_menu_agenda,
                "#FFF9C4",
                "#FBC02D",
                SkillsFragment::new
        ));

        // 13. Knowledge Sessions
        allServices.add(new ServiceShortcut(
                "Knowledge Sessions & Workshops",
                "Register for tech talks, live webinars, and peer workshops",
                android.R.drawable.ic_menu_today,
                "#E8EAF6",
                "#3F51B5",
                KnowledgeHubFragment::new
        ));

        // 14. Notifications
        allServices.add(new ServiceShortcut(
                "Notifications & System Alerts",
                "View gap alerts, training reminders, and mentorship updates",
                android.R.drawable.ic_popup_reminder,
                "#FFEBEE",
                "#E53935",
                NotificationsFragment::new
        ));

        // 15. Achievements
        allServices.add(new ServiceShortcut(
                "Achievements & Badges",
                "View earned milestone badges and top performer levels",
                android.R.drawable.btn_star_big_on,
                "#FFF8E1",
                "#FFA000",
                AchievementsFragment::new
        ));

        // 16. Manager Dashboard
        if (role.contains("MANAGER") || role.contains("ADMIN") || role.contains("HR")) {
            allServices.add(new ServiceShortcut(
                    "Manager Dashboard",
                    "Monitor team skill gaps, training adoption, and progress metrics",
                    android.R.drawable.ic_menu_manage,
                    "#E8F5E9",
                    "#2E7D32",
                    ManagerDashboardFragment::new
            ));
        }

        // 17. HR & Org Analytics
        if (role.contains("HR") || role.contains("ADMIN") || role.contains("LD_ADMIN") || role.contains("LEARNING_DEVELOPMENT_ADMIN")) {
            allServices.add(new ServiceShortcut(
                    "HR & Organization Analytics",
                    "Organization-wide skill health, training ROI, and adoption metrics",
                    android.R.drawable.ic_menu_info_details,
                    "#E1F5FE",
                    "#0288D1",
                    HRDashboardFragment::new
            ));
            allServices.add(new ServiceShortcut(
                    "L&D Learning Admin Hub",
                    "Create learning paths, external courses, and training programs",
                    android.R.drawable.ic_menu_edit,
                    "#FBE9E7",
                    "#D84315",
                    LDDashboardFragment::new
            ));
        }
    }

    private void filterServices(String query) {
        if (query == null || query.trim().isEmpty()) {
            adapter.updateData(allServices);
            return;
        }

        String q = query.toLowerCase().trim();
        List<ServiceShortcut> filtered = new ArrayList<>();
        for (ServiceShortcut s : allServices) {
            if (s.title.toLowerCase().contains(q) || s.description.toLowerCase().contains(q)) {
                filtered.add(s);
            }
        }
        adapter.updateData(filtered);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    // ────────────────────── Helper Classes ──────────────────────

    public interface FragmentSupplier {
        Fragment get();
    }

    public static class ServiceShortcut {
        final String title;
        final String description;
        final int iconRes;
        final String bgColor;
        final String iconColor;
        final FragmentSupplier supplier;

        public ServiceShortcut(String title, String description, int iconRes, String bgColor, String iconColor, FragmentSupplier supplier) {
            this.title = title;
            this.description = description;
            this.iconRes = iconRes;
            this.bgColor = bgColor;
            this.iconColor = iconColor;
            this.supplier = supplier;
        }

        public Fragment createFragment() {
            return supplier.get();
        }
    }

    private static class ServiceAdapter extends RecyclerView.Adapter<ServiceAdapter.VH> {
        private List<ServiceShortcut> items;
        private final OnShortcutClickListener listener;

        public interface OnShortcutClickListener {
            void onClick(ServiceShortcut shortcut);
        }

        ServiceAdapter(List<ServiceShortcut> items, OnShortcutClickListener listener) {
            this.items = new ArrayList<>(items);
            this.listener = listener;
        }

        void updateData(List<ServiceShortcut> newItems) {
            this.items = new ArrayList<>(newItems);
            notifyDataSetChanged();
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemQuickServiceBinding b = ItemQuickServiceBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            ServiceShortcut item = items.get(position);
            holder.b.tvServiceTitle.setText(item.title);
            holder.b.tvServiceDescription.setText(item.description);
            holder.b.ivServiceIcon.setImageResource(item.iconRes);
            holder.b.ivServiceIcon.setColorFilter(Color.parseColor(item.iconColor));
            holder.b.cardServiceIcon.setCardBackgroundColor(Color.parseColor(item.bgColor));

            holder.itemView.setOnClickListener(v -> listener.onClick(item));
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        static class VH extends RecyclerView.ViewHolder {
            final ItemQuickServiceBinding b;
            VH(ItemQuickServiceBinding b) {
                super(b.getRoot());
                this.b = b;
            }
        }
    }
}
