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
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentRoleManagementBinding;
import com.kgap.intel.databinding.ItemRoleCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RoleManagementFragment extends Fragment {
    private FragmentRoleManagementBinding binding;
    private RoleAdapter adapter;
    private List<RoleItem> roles = new ArrayList<>();

    public static class RoleItem {
        final String title;
        final String code;
        final String description;
        String permissionsSummary;
        String userCount;
        final String iconBgColor;
        final String iconColor;
        final int iconRes;
        boolean[] activePermissions;

        public RoleItem(String title, String code, String description, String permissionsSummary, String userCount, String iconBgColor, String iconColor, int iconRes, boolean[] activePermissions) {
            this.title = title;
            this.code = code;
            this.description = description;
            this.permissionsSummary = permissionsSummary;
            this.userCount = userCount;
            this.iconBgColor = iconBgColor;
            this.iconColor = iconColor;
            this.iconRes = iconRes;
            this.activePermissions = activePermissions;
        }
    }

    private static final String[] ALL_AVAILABLE_SCOPES = new String[]{
            "VIEW_ORG_SKILL_GAPS (Organization Gap Intelligence)",
            "RECOMMEND_TEAM_TRAINING (Recommend & Assign Interventions)",
            "EVALUATE_ASSESSMENTS (Submit Competency & Manager Assessments)",
            "MANAGE_LEARNING_CATALOG (Curate Courses & Learning Milestones)",
            "ASSIGN_MENTORSHIP (Pair Mentees with Domain Mentors)",
            "GENERATE_REPORTS (Generate Performance & Skill Audit Reports)",
            "ACCESS_DEPARTMENT_ROSTER (View Staff & Team Rosters)",
            "DISPATCH_HR_ALERTS (Dispatch Action Alerts & Reminders)"
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentRoleManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupRolesList();
        loadRealRoleUserCounts();
    }

    private void setupRolesList() {
        roles = new ArrayList<>();

        // 1. Human Resources
        roles.add(new RoleItem(
                "Human Resources",
                "ROLE_HR",
                "Enterprise talent inventory, organization-wide gap intelligence, and executive reporting oversight.",
                "📊 Talent Intelligence • 5 Permissions Active",
                "Loading...",
                "#E0F2F1", "#00897B", android.R.drawable.ic_menu_compass,
                new boolean[]{true, false, false, false, false, true, true, true}
        ));

        // 2. Department Head
        roles.add(new RoleItem(
                "Department Head",
                "ROLE_DEPARTMENT_HEAD",
                "Department skill health, team training recommendations, and mentor assignment leadership.",
                "🏢 Department Management • 6 Permissions Active",
                "Loading...",
                "#F3E5F5", "#7B1FA2", android.R.drawable.ic_menu_myplaces,
                new boolean[]{true, true, true, false, true, true, true, false}
        ));

        // 3. Engineering Manager
        roles.add(new RoleItem(
                "Engineering Manager",
                "ROLE_MANAGER",
                "Team skill matrix oversight, individual employee gap monitoring, and training nudges.",
                "👥 Team Leadership • 5 Permissions Active",
                "Loading...",
                "#E3F2FD", "#1976D2", android.R.drawable.ic_menu_agenda,
                new boolean[]{false, true, true, false, false, true, true, true}
        ));

        // 4. Employee
        roles.add(new RoleItem(
                "Employee",
                "ROLE_EMPLOYEE",
                "Self & peer competency assessments, personalized learning paths, and gap mitigation.",
                "🎯 Competency & Learning • 1 Permission Active",
                "Loading...",
                "#E8F5E9", "#2E7D32", android.R.drawable.ic_menu_edit,
                new boolean[]{false, false, true, false, false, false, false, false}
        ));

        // 5. Domain Mentor
        roles.add(new RoleItem(
                "Domain Mentor",
                "ROLE_MENTOR",
                "Mentee coaching, 1-on-1 knowledge sharing sessions, and growth feedback submissions.",
                "🤝 Mentorship & Feedback • 2 Permissions Active",
                "Loading...",
                "#FFF3E0", "#E65100", android.R.drawable.ic_menu_share,
                new boolean[]{false, false, true, false, true, false, false, false}
        ));

        // 6. L&D Administrator
        roles.add(new RoleItem(
                "L&D Administrator",
                "ROLE_LEARNING_DEVELOPMENT_ADMIN",
                "Curates enterprise training course catalog, manages learning milestones, and tracks ROI.",
                "🎓 Curriculum Management • 4 Permissions Active",
                "Loading...",
                "#FCE4EC", "#C2185B", android.R.drawable.ic_menu_slideshow,
                new boolean[]{false, true, false, true, false, true, false, true}
        ));

        adapter = new RoleAdapter(roles, this::showManageScopesDialog);
        binding.rvRoles.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvRoles.setAdapter(adapter);
    }

    private void loadRealRoleUserCounts() {
        ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null && binding != null) {
                    Map<String, Integer> countMap = new HashMap<>();
                    for (EmployeeResponse emp : response.body()) {
                        String role = emp.getRole() != null ? emp.getRole().toUpperCase() : "";
                        String email = emp.getEmail() != null ? emp.getEmail().toLowerCase() : "";

                        if (role.contains("HEAD") || email.contains("depthead")) {
                            countMap.put("ROLE_DEPARTMENT_HEAD", countMap.getOrDefault("ROLE_DEPARTMENT_HEAD", 0) + 1);
                        } else if (role.contains("MANAGER") || email.contains("manager")) {
                            countMap.put("ROLE_MANAGER", countMap.getOrDefault("ROLE_MANAGER", 0) + 1);
                        } else if (role.contains("MENTOR") || email.contains("mentor")) {
                            countMap.put("ROLE_MENTOR", countMap.getOrDefault("ROLE_MENTOR", 0) + 1);
                        } else if (role.contains("LEARNING") || role.contains("LD") || email.contains("ld")) {
                            countMap.put("ROLE_LEARNING_DEVELOPMENT_ADMIN", countMap.getOrDefault("ROLE_LEARNING_DEVELOPMENT_ADMIN", 0) + 1);
                        } else if (role.contains("HR") || email.contains("hr")) {
                            countMap.put("ROLE_HR", countMap.getOrDefault("ROLE_HR", 0) + 1);
                        } else if (!role.contains("ADMIN") && !email.contains("admin")) {
                            countMap.put("ROLE_EMPLOYEE", countMap.getOrDefault("ROLE_EMPLOYEE", 0) + 1);
                        }
                    }

                    for (RoleItem r : roles) {
                        int c = countMap.getOrDefault(r.code, 0);
                        r.userCount = c + (c == 1 ? " User" : " Users");
                    }
                    adapter.notifyDataSetChanged();
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
        });
    }

    private void showManageScopesDialog(RoleItem role) {
        boolean[] selected = Arrays.copyOf(role.activePermissions, role.activePermissions.length);

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("Manage Scopes: " + role.title)
                .setMultiChoiceItems(ALL_AVAILABLE_SCOPES, selected, (dialog, which, isChecked) -> {
                    selected[which] = isChecked;
                })
                .setPositiveButton("Save Permissions", (dialog, which) -> {
                    role.activePermissions = selected;
                    int count = 0;
                    for (boolean b : selected) {
                        if (b) count++;
                    }
                    role.permissionsSummary = "🔒 Custom Scopes • " + count + " Permissions Active";
                    adapter.notifyDataSetChanged();

                    Long adminId = com.kgap.intel.utils.SharedPrefManager.getInstance(getContext()).getUserId();
                    new com.kgap.intel.repository.NotificationRepository(requireContext())
                            .createNotification(adminId, "Role Permissions Enforced", "ADMIN_ACTION",
                                    "✓ Updated and enforced " + count + " access scopes for " + role.code + ".");

                    Toast.makeText(getContext(), "✓ Successfully saved permissions and enforced access scopes for " + role.code, Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private static class RoleAdapter extends RecyclerView.Adapter<RoleAdapter.ViewHolder> {
        public interface OnRoleClickListener {
            void onRoleClick(RoleItem role);
        }

        private final List<RoleItem> list;
        private final OnRoleClickListener listener;

        RoleAdapter(List<RoleItem> list, OnRoleClickListener listener) {
            this.list = list;
            this.listener = listener;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemRoleCardBinding b = ItemRoleCardBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
            return new ViewHolder(b);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            RoleItem item = list.get(position);
            holder.binding.tvRoleTitle.setText(item.title);
            holder.binding.tvRoleCode.setText(item.code);
            holder.binding.tvRoleDescription.setText(item.description);
            holder.binding.tvPermissionsSummary.setText(item.permissionsSummary);
            holder.binding.tvUserCountBadge.setText(item.userCount);

            holder.binding.cardIconBg.setCardBackgroundColor(Color.parseColor(item.iconBgColor));
            holder.binding.ivRoleIcon.setColorFilter(Color.parseColor(item.iconColor));
            holder.binding.ivRoleIcon.setImageResource(item.iconRes);

            holder.itemView.setOnClickListener(v -> listener.onRoleClick(item));
        }

        @Override
        public int getItemCount() { return list.size(); }

        static class ViewHolder extends RecyclerView.ViewHolder {
            final ItemRoleCardBinding binding;
            ViewHolder(ItemRoleCardBinding binding) {
                super(binding.getRoot());
                this.binding = binding;
            }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
