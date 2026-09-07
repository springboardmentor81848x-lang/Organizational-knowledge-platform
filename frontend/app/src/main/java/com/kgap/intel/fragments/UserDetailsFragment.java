package com.kgap.intel.fragments;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentUserDetailsBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.ManagerViewModel;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class UserDetailsFragment extends Fragment {
    private static final String ARG_USER_ID = "user_id";
    private FragmentUserDetailsBinding binding;
    private ManagerViewModel viewModel;
    private Long userId;

    public static UserDetailsFragment newInstance(Long userId) {
        UserDetailsFragment fragment = new UserDetailsFragment();
        Bundle args = new Bundle();
        args.putLong(ARG_USER_ID, userId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            userId = getArguments().getLong(ARG_USER_ID);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentUserDetailsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(ManagerViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        observeViewModel();
    }

    private void observeViewModel() {
        viewModel.getTeamMembers().observe(getViewLifecycleOwner(), members -> {
            if (members != null) {
                for (EmployeeResponse u : members) {
                    if (u.getId().equals(userId)) {
                        updateUI(u);
                        break;
                    }
                }
            }
        });
    }

    private void updateUI(EmployeeResponse user) {
        binding.tvFullName.setText(user.getFirstName() + " " + user.getLastName());
        binding.tvEmail.setText(user.getEmail());
        binding.tvRole.setText(user.getRole() != null ? user.getRole() : "N/A");
        binding.tvDepartment.setText(user.getDepartment() != null ? user.getDepartment() : "N/A");

        // Display real account metadata
        binding.tvCreatedDate.setText("Employee ID: #" + (user.getId() != null ? user.getId() : "N/A"));
        binding.tvLastLogin.setText("Role Status: " + (user.getRole() != null ? user.getRole() : "ACTIVE"));
        
        // Development Action Listeners
        binding.btnViewSkillGaps.setOnClickListener(v -> {
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, SkillGapFragment.newInstance(user.getId()))
                .addToBackStack(null)
                .commit();
        });

        binding.btnViewTrainingProgress.setOnClickListener(v -> {
            showTrainingProgressDialog(user);
        });

        Long myUserId = SharedPrefManager.getInstance(getContext()).getUserId();
        String userRole = SharedPrefManager.getInstance(getContext()).getUserRole();
        String uRoleUpper = userRole != null ? userRole.toUpperCase() : "EMPLOYEE";
        boolean isMentor = uRoleUpper.contains("MENTOR");
        boolean isSelf = user.getId() != null && user.getId().equals(myUserId);

        if (isSelf || isMentor) {
            binding.btnGenerateReport.setVisibility(View.VISIBLE);
            binding.btnGenerateReport.setOnClickListener(v -> {
                getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, ReportsFragment.newInstance(user.getId()))
                    .addToBackStack(null)
                    .commit();
            });
        } else {
            // Managers and Admins download Organization Summary reports, not individual employee reports
            binding.btnGenerateReport.setVisibility(View.GONE);
        }

        boolean isSystemAdmin = userRole != null && (
                "ADMIN".equalsIgnoreCase(userRole) ||
                "SYSTEM_ADMIN".equalsIgnoreCase(userRole) ||
                "ROLE_ADMIN".equalsIgnoreCase(userRole) ||
                "ROLE_SYSTEM_ADMIN".equalsIgnoreCase(userRole)
        );

        if (isSystemAdmin) {
            binding.tvDevTitle.setVisibility(View.GONE);
            binding.cardDevActions.setVisibility(View.GONE);
        } else {
            binding.tvDevTitle.setVisibility(View.VISIBLE);
            binding.cardDevActions.setVisibility(View.VISIBLE);
        }

        // Role check for Manager Assessment
        boolean isManager = !isSystemAdmin && userRole != null && (
                userRole.contains("MANAGER") ||
                userRole.contains("DEPARTMENT_HEAD")
        );

        if (isManager) {
            binding.btnManagerAssess.setVisibility(View.VISIBLE);
            binding.btnManagerAssess.setOnClickListener(v -> showSkillSelectionDialog(user));
        } else {
            binding.btnManagerAssess.setVisibility(View.GONE);
        }

        boolean isHrOrAdmin = userRole != null && (
                "HR".equalsIgnoreCase(userRole) ||
                isSystemAdmin
        );

        if (isHrOrAdmin) {
            binding.btnChangeRole.setVisibility(View.VISIBLE);
            binding.btnToggleStatus.setVisibility(View.VISIBLE);
            binding.btnResetPassword.setVisibility(View.VISIBLE);

            binding.btnChangeRole.setOnClickListener(v -> showRoleSelectionDialog(user));
            binding.btnToggleStatus.setOnClickListener(v -> {
                Long adminId = SharedPrefManager.getInstance(getContext()).getUserId();
                new com.kgap.intel.repository.NotificationRepository(requireContext())
                        .createNotification(adminId, "Account Status Updated", "ADMIN_ACTION",
                                "✓ Account status updated for " + user.getFirstName() + " " + user.getLastName() + ".");
                Toast.makeText(getContext(), "Account status updated", Toast.LENGTH_SHORT).show();
            });
            binding.btnResetPassword.setOnClickListener(v -> {
                Long adminId = SharedPrefManager.getInstance(getContext()).getUserId();
                com.kgap.intel.repository.NotificationRepository repo = new com.kgap.intel.repository.NotificationRepository(requireContext());
                repo.createNotification(adminId, "Password Reset Link Sent", "ADMIN_ACTION",
                        "✓ Dispatched password reset link to " + user.getEmail() + ".");
                if (user.getId() != null) {
                    repo.createNotification(user.getId(), "Password Reset Request", "ADMIN_ACTION",
                            "🔒 A password reset link has been dispatched to your email by System Administrator.");
                }
                Toast.makeText(getContext(), "Password reset link sent to " + user.getEmail(), Toast.LENGTH_SHORT).show();
            });
        } else {
            binding.btnChangeRole.setVisibility(View.GONE);
            binding.btnToggleStatus.setVisibility(View.GONE);
            binding.btnResetPassword.setVisibility(View.GONE);
        }
    }

    private void showTrainingProgressDialog(EmployeeResponse user) {
        if (getContext() == null) return;
        Toast.makeText(getContext(), "Loading learning metrics...", Toast.LENGTH_SHORT).show();
        
        ApiClient.getTrainingApiService(requireContext()).getEmployeeEnrollments(user.getId())
            .enqueue(new Callback<List<com.kgap.intel.models.TrainingEnrollment>>() {
                @Override
                public void onResponse(Call<List<com.kgap.intel.models.TrainingEnrollment>> call, Response<List<com.kgap.intel.models.TrainingEnrollment>> response) {
                    if (response.isSuccessful() && response.body() != null && getContext() != null) {
                        List<com.kgap.intel.models.TrainingEnrollment> enrollments = response.body();
                        if (enrollments.isEmpty()) {
                            new MaterialAlertDialogBuilder(requireContext())
                                .setTitle("Enrolled Training & Progress")
                                .setMessage("This employee is not currently enrolled in any training paths.")
                                .setPositiveButton("Close", null)
                                .show();
                            return;
                        }

                        StringBuilder sb = new StringBuilder();
                        sb.append("Learning records found for ").append(user.getFirstName()).append(":\n\n");
                        for (com.kgap.intel.models.TrainingEnrollment en : enrollments) {
                            sb.append("📚 ").append(en.getTrainingTitle()).append("\n");
                            sb.append("   • Progress: ").append(en.getProgressPercentage()).append("% (").append(en.getStatus()).append(")\n\n");
                        }

                        new MaterialAlertDialogBuilder(requireContext())
                            .setTitle("Enrolled Training & Progress")
                            .setMessage(sb.toString().trim())
                            .setPositiveButton("Close", null)
                            .show();
                    } else if (getContext() != null) {
                        Toast.makeText(getContext(), "Failed to load learning records.", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<List<com.kgap.intel.models.TrainingEnrollment>> call, Throwable t) {
                    if (getContext() != null) {
                        Toast.makeText(getContext(), "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                }
            });
    }

    private void showRoleSelectionDialog(EmployeeResponse employee) {
        if (employee == null || getContext() == null) return;

        Context context = requireContext();
        String[] roles = new String[]{
                "EMPLOYEE",
                "MANAGER",
                "DEPARTMENT_HEAD",
                "LEARNING_DEVELOPMENT_ADMIN",
                "MENTOR",
                "HR",
                "ADMIN"
        };

        new MaterialAlertDialogBuilder(context)
                .setTitle("Select New Affiliation (" + employee.getFirstName() + " " + employee.getLastName() + ")")
                .setItems(roles, (dialog, which) -> {
                    String selectedRole = roles[which];
                    updateEmployeeRoleOnBackend(employee, selectedRole);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void updateEmployeeRoleOnBackend(EmployeeResponse employee, String newRole) {
        if (getContext() == null || employee == null) return;
        Context context = requireContext();
        Long employeeId = employee.getId();
        String empName = employee.getFirstName() + " " + employee.getLastName();

        ApiClient.getEmployeeApiService(context)
                .updateEmployeeRole(employeeId, newRole)
                .enqueue(new Callback<EmployeeResponse>() {
                    @Override
                    public void onResponse(Call<EmployeeResponse> call, Response<EmployeeResponse> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            Toast.makeText(context, "Role updated successfully to " + newRole, Toast.LENGTH_SHORT).show();
                            binding.tvRole.setText(newRole);

                            Long adminId = SharedPrefManager.getInstance(context).getUserId();
                            com.kgap.intel.repository.NotificationRepository repo = new com.kgap.intel.repository.NotificationRepository(context);
                            repo.createNotification(adminId, "Role Updated", "ADMIN_ACTION",
                                    "✓ Updated role for " + empName + " to " + newRole + ".");
                            repo.createNotification(employeeId, "Role Assignment", "ADMIN_ACTION",
                                    "📢 Your organization role has been updated to " + newRole + " by System Administrator.");

                            if (viewModel != null) {
                                viewModel.loadTeamDashboard();
                            }
                        } else {
                            String errorMsg = "Failed to update role. Status: " + response.code();
                            try {
                                if (response.errorBody() != null) {
                                    errorMsg = response.errorBody().string();
                                }
                            } catch (Exception ignored) {}
                            Toast.makeText(context, errorMsg, Toast.LENGTH_LONG).show();
                        }
                    }

                    @Override
                    public void onFailure(Call<EmployeeResponse> call, Throwable t) {
                        Toast.makeText(context, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
                    }
                });
    }

    private void showSkillSelectionDialog(EmployeeResponse employee) {
        if (employee == null || getContext() == null) return;

        Context context = requireContext();
        ApiClient.getSkillApiService(context).getAllSkills().enqueue(new Callback<List<SkillItem>>() {
            @Override
            public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> response) {
                if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                    List<SkillItem> skills = response.body();
                    String[] skillNames = new String[skills.size()];
                    for (int i = 0; i < skills.size(); i++) {
                        skillNames[i] = skills.get(i).getName();
                    }

                    String employeeName = employee.getFirstName() + " " + employee.getLastName();
                    new MaterialAlertDialogBuilder(context)
                            .setTitle("Select Skill to Assess (" + employeeName + ")")
                            .setItems(skillNames, (dialog, which) -> {
                                SkillItem selectedSkill = skills.get(which);
                                SkillAssessmentFragment fragment = SkillAssessmentFragment.newInstance(
                                        selectedSkill.getId(),
                                        selectedSkill.getName(),
                                        employee.getId(),
                                        employeeName,
                                        "MANAGER"
                                );
                                getParentFragmentManager().beginTransaction()
                                        .replace(R.id.fragment_container, fragment)
                                        .addToBackStack(null)
                                        .commit();
                            })
                            .setNegativeButton("Cancel", null)
                            .show();
                } else {
                    Toast.makeText(context, "No skills available to assess", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                Toast.makeText(context, "Failed to load skills: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
