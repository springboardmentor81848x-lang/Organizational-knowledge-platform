package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.R;
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.DeptSkillCoverageAdapter;
import com.kgap.intel.adapters.HeatmapAdapter;
import com.kgap.intel.adapters.HighRiskGapAdapter;
import com.kgap.intel.databinding.DialogGapDetailsBinding;
import com.kgap.intel.databinding.FragmentDeptHeadSkillsBinding;
import com.kgap.intel.databinding.ViewLegendItemBinding;
import com.kgap.intel.models.HeatmapResponse;
import com.kgap.intel.models.HighRiskGap;
import com.kgap.intel.models.MentorAssignmentRequest;
import com.kgap.intel.models.MentorProfileResponse;
import com.kgap.intel.repository.MentorAssignmentRepository;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.repository.RealMentorRepository;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.DepartmentHeadViewModel;

public class DeptHeadSkillsFragment extends Fragment {
    private FragmentDeptHeadSkillsBinding binding;
    private DepartmentHeadViewModel viewModel;
    private RealMentorRepository mentorRepository;
    private MentorAssignmentRepository assignmentRepository;
    private NotificationRepository notificationRepository;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentDeptHeadSkillsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(DepartmentHeadViewModel.class);
        mentorRepository = new RealMentorRepository(requireContext());
        assignmentRepository = new MentorAssignmentRepository(requireContext());
        notificationRepository = new NotificationRepository(requireContext());

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        setupLegend();
        setupRecyclerViews();
        observeViewModel();
    }

    private void setupLegend() {
        ViewLegendItemBinding crit = ViewLegendItemBinding.bind(binding.legendCritical.getRoot());
        crit.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_critical));
        crit.tvLegendLabel.setText("Critical");

        ViewLegendItemBinding high = ViewLegendItemBinding.bind(binding.legendHigh.getRoot());
        high.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_critical));
        high.tvLegendLabel.setText("High");

        ViewLegendItemBinding med = ViewLegendItemBinding.bind(binding.legendMed.getRoot());
        med.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_high));
        med.tvLegendLabel.setText("Medium");

        ViewLegendItemBinding low = ViewLegendItemBinding.bind(binding.legendLow.getRoot());
        low.viewDot.setBackgroundTintList(ContextCompat.getColorStateList(requireContext(), R.color.gap_low));
        low.tvLegendLabel.setText("Low / Met");
    }

    private void setupRecyclerViews() {
        binding.rvHeatmap.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvSkillCoverage.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvHighRiskGaps.setLayoutManager(new LinearLayoutManager(getContext()));
    }

    private void observeViewModel() {
        viewModel.getHeatmapRows().observe(getViewLifecycleOwner(), rows -> {
            if (rows != null && !rows.isEmpty()) {
                binding.rvHeatmap.setAdapter(new HeatmapAdapter(rows, this::showCellDetails));
            }
        });
        
        viewModel.getSkillCoverage().observe(getViewLifecycleOwner(), skills -> {
            if (skills != null) {
                binding.rvSkillCoverage.setAdapter(new DeptSkillCoverageAdapter(skills));
            }
        });

        viewModel.getHighRiskGaps().observe(getViewLifecycleOwner(), gaps -> {
            if (gaps != null) {
                binding.rvHighRiskGaps.setAdapter(new HighRiskGapAdapter(gaps, new HighRiskGapAdapter.OnGapActionListener() {
                    @Override
                    public void onRecommendTraining(HighRiskGap gap) {
                        String empName = gap.getEmployeeName() != null ? gap.getEmployeeName() : "the employee";
                        new MaterialAlertDialogBuilder(requireContext())
                            .setTitle("Recommend Training")
                            .setMessage("Send learning recommendation for " + gap.getSkillName() + " to " + empName + " through Department Head?")
                            .setPositiveButton("Send", (d, w) -> {
                                String headName = SharedPrefManager.getInstance(getContext()).getUserName();
                                Long headId = SharedPrefManager.getInstance(getContext()).getUserId();

                                if (gap.getEmployeeId() != null) {
                                    String empMsg = "🎓 " + (headName != null ? headName : "Department Head") + 
                                        " (Department Head) recommended training for: " + gap.getSkillName() + " to address your skill gap.";
                                    notificationRepository.createNotification(gap.getEmployeeId(), "TRAINING_REMINDER", empMsg)
                                        .observe(getViewLifecycleOwner(), success -> {
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
                }));
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
                    if (getActivity() instanceof MainActivity) {
                        ((MainActivity) getActivity()).switchFragment(new AssignMentorsFragment());
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
        });
    }

    private void showCellDetails(HeatmapResponse cell) {
        BottomSheetDialog dialog = new BottomSheetDialog(requireContext());
        DialogGapDetailsBinding dialogBinding = DialogGapDetailsBinding.inflate(getLayoutInflater());
        dialog.setContentView(dialogBinding.getRoot());

        dialogBinding.tvTitle.setText(cell.getSkillName());
        dialogBinding.tvMembers.setText(cell.getEmployeeName() != null ? "Employee: " + cell.getEmployeeName() : "Department Member");
        dialogBinding.tvProfVal.setText("Gap Score: " + cell.getGapScore());
        dialogBinding.tvGapVal.setText(cell.getGapLevel());

        int color;
        String level = cell.getGapLevel() != null ? cell.getGapLevel() : "LOW";
        switch (level.toUpperCase()) {
            case "HIGH": color = ContextCompat.getColor(requireContext(), R.color.gap_critical); break;
            case "MEDIUM": color = ContextCompat.getColor(requireContext(), R.color.gap_high); break;
            default: color = ContextCompat.getColor(requireContext(), R.color.gap_low); break;
        }
        dialogBinding.tvGapVal.setTextColor(color);

        dialog.show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
