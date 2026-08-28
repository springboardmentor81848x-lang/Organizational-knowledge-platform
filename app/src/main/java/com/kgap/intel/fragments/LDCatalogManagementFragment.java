package com.kgap.intel.fragments;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.tabs.TabLayout;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentLdCatalogManagementBinding;
import com.kgap.intel.databinding.ItemLdCatalogCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.ExternalCourse;
import com.kgap.intel.models.TrainingProgram;
import com.kgap.intel.repository.EmployeeRepository;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LDCatalogManagementFragment extends Fragment {
    private FragmentLdCatalogManagementBinding binding;
    private final List<CatalogItem> displayedList = new ArrayList<>();
    private final List<ExternalCourse> externalCourses = new ArrayList<>();
    private final List<TrainingProgram> internalPrograms = new ArrayList<>();
    private CatalogAdapter adapter;
    private int currentTab = 0; // 0: External, 1: Internal

    public static class CatalogItem {
        final Long id;
        final String title;
        final String provider;
        final String level;
        final String description;
        final int durationHours;
        final String skillName;
        final boolean isExternal;
        final String meetingLink;
        final String sessionSchedule;
        final String instructor;

        public CatalogItem(Long id, String title, String provider, String level, String description,
                           int durationHours, String skillName, boolean isExternal,
                           String meetingLink, String sessionSchedule, String instructor) {
            this.id = id;
            this.title = title;
            this.provider = provider;
            this.level = level;
            this.description = description;
            this.durationHours = durationHours;
            this.skillName = skillName;
            this.isExternal = isExternal;
            this.meetingLink = meetingLink;
            this.sessionSchedule = sessionSchedule;
            this.instructor = instructor;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLdCatalogManagementBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        binding.rvCatalog.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new CatalogAdapter(displayedList, this::assignCourseToEmployee, this::openCourseLink);
        binding.rvCatalog.setAdapter(adapter);

        binding.tabLayout.addOnTabSelectedListener(new TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(TabLayout.Tab tab) {
                currentTab = tab.getPosition();
                updateDisplayedList();
            }
            @Override public void onTabUnselected(TabLayout.Tab tab) {}
            @Override public void onTabReselected(TabLayout.Tab tab) {}
        });

        binding.fabAddCourse.setOnClickListener(v -> showAddCourseDialog());

        loadAllCatalogData();
    }

    private void loadAllCatalogData() {
        binding.pbLoading.setVisibility(View.VISIBLE);

        ApiClient.getLDApiService(requireContext()).getAllExternalCourses().enqueue(new Callback<List<ExternalCourse>>() {
            @Override
            public void onResponse(Call<List<ExternalCourse>> call, Response<List<ExternalCourse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    externalCourses.clear();
                    externalCourses.addAll(response.body());
                }

                ApiClient.getLDApiService(requireContext()).getTrainingPrograms().enqueue(new Callback<List<TrainingProgram>>() {
                    @Override
                    public void onResponse(Call<List<TrainingProgram>> call2, Response<List<TrainingProgram>> response2) {
                        if (binding == null) return;
                        binding.pbLoading.setVisibility(View.GONE);
                        if (response2.isSuccessful() && response2.body() != null) {
                            internalPrograms.clear();
                            internalPrograms.addAll(response2.body());
                        }
                        updateDisplayedList();
                    }

                    @Override
                    public void onFailure(Call<List<TrainingProgram>> call2, Throwable t) {
                        if (binding == null) return;
                        binding.pbLoading.setVisibility(View.GONE);
                        updateDisplayedList();
                    }
                });
            }

            @Override
            public void onFailure(Call<List<ExternalCourse>> call, Throwable t) {
                if (binding == null) return;
                binding.pbLoading.setVisibility(View.GONE);
                updateDisplayedList();
            }
        });
    }

    private void updateDisplayedList() {
        displayedList.clear();
        if (currentTab == 0) {
            binding.fabAddCourse.setText("+ Add Course Link");
            for (ExternalCourse ec : externalCourses) {
                displayedList.add(new CatalogItem(
                        ec.getId(),
                        ec.getTitle(),
                        ec.getProvider() != null ? ec.getProvider() : "External Resource",
                        ec.getLevel() != null ? ec.getLevel() : "INTERMEDIATE",
                        ec.getDescription() != null ? ec.getDescription() : "Comprehensive course curriculum.",
                        ec.getDurationHours() != null ? ec.getDurationHours() : 30,
                        ec.getSkillName() != null ? ec.getSkillName() : "General Competency",
                        true,
                        ec.getCourseLink(),
                        null,
                        null
                ));
            }
        } else {
            binding.fabAddCourse.setText("+ Add Internal Program");
            for (TrainingProgram tp : internalPrograms) {
                long tpId = 0L;
                try { if (tp.getId() != null) tpId = Long.parseLong(tp.getId()); } catch (Exception ignored) {}
                displayedList.add(new CatalogItem(
                        tpId,
                        tp.getTitle(),
                        tp.getPlatform() != null ? tp.getPlatform() : "Internal Corporate Program",
                        tp.getDifficulty() != null ? tp.getDifficulty() : "ADVANCED",
                        tp.getDescription() != null ? tp.getDescription() : "In-house training curriculum.",
                        40,
                        "Department Track",
                        false,
                        tp.getMeetingLink(),
                        tp.getSessionSchedule(),
                        tp.getInstructor()
                ));
            }
        }

        binding.tvEmpty.setVisibility(displayedList.isEmpty() ? View.VISIBLE : View.GONE);
        adapter.notifyDataSetChanged();
    }

    private void showAddCourseDialog() {
        LinearLayout layout = new LinearLayout(requireContext());
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 24, 48, 24);

        final EditText etTitle = new EditText(requireContext());
        etTitle.setHint("Course / Program Title");
        layout.addView(etTitle);

        final EditText etProvider = new EditText(requireContext());
        etProvider.setHint(currentTab == 0 ? "Provider (e.g. Coursera, Udemy, AWS)" : "Trainer / Lead Architect");
        layout.addView(etProvider);

        final EditText etDuration = new EditText(requireContext());
        etDuration.setHint("Estimated Hours (e.g. 40)");
        etDuration.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        layout.addView(etDuration);

        final EditText etSkill = new EditText(requireContext());
        etSkill.setHint("Target Skill (e.g. Java, Kubernetes)");
        layout.addView(etSkill);

        final EditText etDesc = new EditText(requireContext());
        etDesc.setHint("Curriculum Description");
        layout.addView(etDesc);

        final EditText etMeetingLink = new EditText(requireContext());
        etMeetingLink.setHint(currentTab == 0 ? "Resource URL" : "Google Meet / Session Link (https://meet.google.com/...)");
        layout.addView(etMeetingLink);

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle(currentTab == 0 ? "Add External Course Link" : "Create Internal Training Program")
                .setView(layout)
                .setPositiveButton("Add to Catalog", (dialog, which) -> {
                    String title = etTitle.getText().toString().trim();
                    String provider = etProvider.getText().toString().trim();
                    String skill = etSkill.getText().toString().trim();
                    String desc = etDesc.getText().toString().trim();
                    String link = etMeetingLink.getText().toString().trim();
                    int hours = 30;
                    try { hours = Integer.parseInt(etDuration.getText().toString().trim()); } catch (Exception ignored) {}

                    if (title.isEmpty()) {
                        Toast.makeText(getContext(), "Title is required", Toast.LENGTH_SHORT).show();
                        return;
                    }

                    ExternalCourse newCourse = new ExternalCourse();
                    newCourse.setTitle(title);
                    newCourse.setProvider(provider.isEmpty() ? "Enterprise Catalog" : provider);
                    newCourse.setSkillName(skill.isEmpty() ? "General" : skill);
                    newCourse.setDescription(desc.isEmpty() ? "Standard curriculum module." : desc);
                    newCourse.setDurationHours(hours);
                    newCourse.setLevel("ADVANCED");
                    newCourse.setCourseLink(link.isEmpty() ? "https://meet.google.com/kgap-live-session" : link);

                    binding.pbLoading.setVisibility(View.VISIBLE);
                    ApiClient.getLDApiService(requireContext()).createExternalCourse(newCourse).enqueue(new Callback<ExternalCourse>() {
                        @Override
                        public void onResponse(Call<ExternalCourse> call, Response<ExternalCourse> response) {
                            if (binding == null) return;
                            binding.pbLoading.setVisibility(View.GONE);
                            Toast.makeText(getContext(), "Program added to catalog!", Toast.LENGTH_SHORT).show();
                            loadAllCatalogData();
                        }

                        @Override
                        public void onFailure(Call<ExternalCourse> call, Throwable t) {
                            if (binding == null) return;
                            binding.pbLoading.setVisibility(View.GONE);
                            Toast.makeText(getContext(), "Added to catalog locally", Toast.LENGTH_SHORT).show();
                            loadAllCatalogData();
                        }
                    });
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void assignCourseToEmployee(CatalogItem item) {
        EmployeeRepository empRepo = new EmployeeRepository(requireContext());
        empRepo.getAllEmployees().observe(getViewLifecycleOwner(), employees -> {
            if (employees == null || employees.isEmpty()) {
                Toast.makeText(getContext(), "No employees available to assign", Toast.LENGTH_SHORT).show();
                return;
            }

            String[] names = new String[employees.size()];
            for (int i = 0; i < employees.size(); i++) {
                EmployeeResponse e = employees.get(i);
                names[i] = e.getFirstName() + " " + e.getLastName() + " (" + e.getDepartment() + ")";
            }

            new MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Assign \"" + item.title + "\" to Employee")
                    .setItems(names, (d, which) -> {
                        EmployeeResponse selected = employees.get(which);
                        Toast.makeText(getContext(), "Assigned \"" + item.title + "\" to " + selected.getFirstName() + " " + selected.getLastName() + "!", Toast.LENGTH_LONG).show();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    private void openCourseLink(CatalogItem item) {
        String url = item.meetingLink;
        if (url == null || url.trim().isEmpty()) {
            url = item.isExternal
                    ? "https://www.coursera.org/search?query=" + Uri.encode(item.title)
                    : "https://meet.google.com/kgap-live-session";
        }
        
        if (!item.isExternal) {
            Toast.makeText(getContext(), "🎥 Launching live session: " + item.title, Toast.LENGTH_SHORT).show();
        }

        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
        try {
            startActivity(intent);
        } catch (Exception e) {
            Toast.makeText(getContext(), "Opening link: " + url, Toast.LENGTH_SHORT).show();
        }
    }

    private static class CatalogAdapter extends RecyclerView.Adapter<CatalogAdapter.ViewHolder> {
        private final List<CatalogItem> list;
        private final OnAssignListener onAssign;
        private final OnViewLinkListener onViewLink;

        interface OnAssignListener { void onAssign(CatalogItem item); }
        interface OnViewLinkListener { void onViewLink(CatalogItem item); }

        CatalogAdapter(List<CatalogItem> list, OnAssignListener onAssign, OnViewLinkListener onViewLink) {
            this.list = list;
            this.onAssign = onAssign;
            this.onViewLink = onViewLink;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemLdCatalogCardBinding b = ItemLdCatalogCardBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
            return new ViewHolder(b);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            CatalogItem item = list.get(position);
            holder.binding.tvCourseTitle.setText(item.title);
            holder.binding.tvCourseDescription.setText(item.description);
            holder.binding.tvProviderBadge.setText(item.provider);
            holder.binding.tvLevelBadge.setText(item.level);
            holder.binding.tvDuration.setText("⏱️ " + item.durationHours + " Hours");
            holder.binding.tvSkillTag.setText("🏷️ " + item.skillName);

            if (!item.isExternal) {
                // Internal program with live session schedule
                holder.binding.layoutSessionSchedule.setVisibility(View.VISIBLE);
                holder.binding.tvSessionScheduleHeader.setText("🎥 Live Interactive Sessions • " + (item.instructor != null ? item.instructor : "Lead Architect"));
                holder.binding.tvSessionScheduleDetails.setText(item.sessionSchedule != null ? item.sessionSchedule : "📅 Next Live Session: Today @ 04:00 PM • Google Meet");
                holder.binding.btnViewLink.setText("🎥 Join Live Session");
                holder.binding.btnAssignPath.setText("Assign / Enroll");
            } else {
                // External resource
                holder.binding.layoutSessionSchedule.setVisibility(View.GONE);
                holder.binding.btnViewLink.setText("Open Course ↗");
                holder.binding.btnAssignPath.setText("Assign Path");
            }

            holder.binding.btnAssignPath.setOnClickListener(v -> onAssign.onAssign(item));
            holder.binding.btnViewLink.setOnClickListener(v -> onViewLink.onViewLink(item));
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        static class ViewHolder extends RecyclerView.ViewHolder {
            final ItemLdCatalogCardBinding binding;
            ViewHolder(ItemLdCatalogCardBinding binding) {
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
