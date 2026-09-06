package com.kgap.intel.fragments;

import android.content.Context;
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
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentMentorshipSessionsBinding;
import com.kgap.intel.databinding.ItemMentorshipSessionCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.MentorshipSession;
import com.kgap.intel.repository.EmployeeRepository;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.MentorshipSessionViewModel;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MentorshipSessionsFragment extends Fragment {
    private FragmentMentorshipSessionsBinding binding;
    private MentorshipSessionViewModel viewModel;
    private EmployeeRepository employeeRepository;
    private Long loggedInUserId;
    private String userRole;
    private SessionAdapter adapter;

    private final List<MentorshipSession> allSessions = new ArrayList<>();
    private final List<MentorshipSession> filteredSessions = new ArrayList<>();
    private final Map<Long, String> employeeNameMap = new HashMap<>();

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorshipSessionsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Context context = requireContext();
        SharedPrefManager prefManager = SharedPrefManager.getInstance(context);
        loggedInUserId = prefManager.getUserId();
        userRole = prefManager.getUserRole();

        viewModel = new ViewModelProvider(this).get(MentorshipSessionViewModel.class);
        employeeRepository = new EmployeeRepository(context);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupRecyclerView();
        observeViewModel();
        setupTabLayout();

        binding.fabSchedule.setOnClickListener(v -> {
            ScheduleSessionBottomSheet sheet = new ScheduleSessionBottomSheet();
            sheet.show(getChildFragmentManager(), "ScheduleSession");
        });

        // Load employee names for lookup
        employeeRepository.getAllEmployees().observe(getViewLifecycleOwner(), employees -> {
            if (employees != null) {
                employeeNameMap.clear();
                for (EmployeeResponse emp : employees) {
                    employeeNameMap.put(emp.getId(), emp.getFirstName() + " " + emp.getLastName());
                }
                if (adapter != null) {
                    adapter.notifyDataSetChanged();
                }
            }
        });

        loadData();
    }

    private void loadData() {
        if (loggedInUserId == null || loggedInUserId <= 0) {
            loggedInUserId = 4L; // Default to demo employee (Aarav Sharma) if unset
        }
        viewModel.loadSessions(loggedInUserId, userRole);
    }

    private void setupRecyclerView() {
        adapter = new SessionAdapter(filteredSessions);
        binding.rvSessions.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvSessions.setAdapter(adapter);
    }

    private void setupTabLayout() {
        binding.tabLayout.addOnTabSelectedListener(new com.google.android.material.tabs.TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(com.google.android.material.tabs.TabLayout.Tab tab) {
                applyFilters();
            }

            @Override
            public void onTabUnselected(com.google.android.material.tabs.TabLayout.Tab tab) {}

            @Override
            public void onTabReselected(com.google.android.material.tabs.TabLayout.Tab tab) {}
        });
    }

    private void observeViewModel() {
        viewModel.getSessions().observe(getViewLifecycleOwner(), list -> {
            if (list != null) {
                allSessions.clear();
                allSessions.addAll(list);
                applyFilters();
            }
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                Toast.makeText(getContext(), error, Toast.LENGTH_LONG).show();
            }
        });

        viewModel.getCancelResult().observe(getViewLifecycleOwner(), result -> {
            if (result != null) {
                Toast.makeText(getContext(), "Session cancelled successfully!", Toast.LENGTH_SHORT).show();
                loadData();
            }
        });

        viewModel.getRescheduleResult().observe(getViewLifecycleOwner(), result -> {
            if (result != null) {
                Toast.makeText(getContext(), "Session rescheduled successfully!", Toast.LENGTH_SHORT).show();
                loadData();
            }
        });

        viewModel.getCompleteResult().observe(getViewLifecycleOwner(), result -> {
            if (result != null) {
                Toast.makeText(getContext(), "Session completed successfully!", Toast.LENGTH_SHORT).show();
                loadData();
            }
        });
    }

    private void applyFilters() {
        filteredSessions.clear();
        int selectedTab = binding.tabLayout.getSelectedTabPosition();

        for (MentorshipSession session : allSessions) {
            boolean isPast = "COMPLETED".equalsIgnoreCase(session.getStatus()) || "CANCELLED".equalsIgnoreCase(session.getStatus());
            if (selectedTab == 0) { // Upcoming
                if (!isPast) filteredSessions.add(session);
            } else { // Past
                if (isPast) filteredSessions.add(session);
            }
        }
        adapter.notifyDataSetChanged();
    }

    private void showReschedulePicker(Long sessionId) {
        Context context = getContext();
        if (context == null) return;

        java.util.Calendar calendar = java.util.Calendar.getInstance();
        new android.app.DatePickerDialog(context, (view, year, month, dayOfMonth) -> {
            new android.app.TimePickerDialog(context, (view1, hourOfDay, minute) -> {
                String newIsoDateTime = String.format("%04d-%02d-%02dT%02d:%02d:00", year, month + 1, dayOfMonth, hourOfDay, minute);
                viewModel.rescheduleSession(sessionId, newIsoDateTime);
            }, calendar.get(java.util.Calendar.HOUR_OF_DAY), calendar.get(java.util.Calendar.MINUTE), false).show();
        }, calendar.get(java.util.Calendar.YEAR), calendar.get(java.util.Calendar.MONTH), calendar.get(java.util.Calendar.DAY_OF_MONTH)).show();
    }

    private String formatDisplayDate(String isoDateTime) {
        if (isoDateTime == null || !isoDateTime.contains("T")) return isoDateTime;
        try {
            String datePart = isoDateTime.split("T")[0];
            String[] parts = datePart.split("-");
            if (parts.length == 3) {
                String year = parts[0];
                String monthNum = parts[1];
                String day = parts[2];
                String monthName = getMonthName(monthNum);
                return monthName + " " + day + ", " + year;
            }
            return datePart;
        } catch (Exception e) {
            return isoDateTime;
        }
    }

    private String formatDisplayTime(String isoDateTime) {
        if (isoDateTime == null || !isoDateTime.contains("T")) return "";
        try {
            String timePart = isoDateTime.split("T")[1];
            String[] parts = timePart.split(":");
            if (parts.length >= 2) {
                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);
                String ampm = hour >= 12 ? "PM" : "AM";
                int displayHour = hour % 12;
                if (displayHour == 0) displayHour = 12;
                return String.format("%02d:%02d %s", displayHour, minute, ampm);
            }
            return timePart;
        } catch (Exception e) {
            return "";
        }
    }

    private String getMonthName(String monthNum) {
        switch (monthNum) {
            case "01": return "Jan";
            case "02": return "Feb";
            case "03": return "Mar";
            case "04": return "Apr";
            case "05": return "May";
            case "06": return "Jun";
            case "07": return "Jul";
            case "08": return "Aug";
            case "09": return "Sep";
            case "10": return "Oct";
            case "11": return "Nov";
            case "12": return "Dec";
            default: return monthNum;
        }
    }

    private class SessionAdapter extends RecyclerView.Adapter<SessionAdapter.ViewHolder> {
        private final List<MentorshipSession> list;

        SessionAdapter(List<MentorshipSession> list) {
            this.list = list;
        }

        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemMentorshipSessionCardBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            MentorshipSession item = list.get(pos);
            Context context = h.itemView.getContext();

            // Display other participant's name
            Long otherPartyId = "MENTOR".equalsIgnoreCase(userRole) ? item.getMenteeId() : item.getMentorId();
            String otherPartyName = employeeNameMap.get(otherPartyId);
            if (otherPartyName == null) {
                otherPartyName = "User #" + otherPartyId;
            }
            h.b.tvMentorName.setText(otherPartyName);

            // Display notes as topic if notes are available
            h.b.tvSessionTopic.setText(item.getNotes() != null && !item.getNotes().trim().isEmpty() ? item.getNotes() : "Mentorship Meeting");

            h.b.tvSessionDate.setText(formatDisplayDate(item.getScheduledAt()));
            String timeAndDur = formatDisplayTime(item.getScheduledAt()) + " (" + item.getDurationMinutes() + "m)";
            h.b.tvSessionTime.setText(timeAndDur);
            h.b.tvSessionStatus.setText(item.getStatus() != null ? item.getStatus() : "SCHEDULED");

            boolean isPast = "COMPLETED".equalsIgnoreCase(item.getStatus()) || "CANCELLED".equalsIgnoreCase(item.getStatus());
            if (isPast) {
                h.b.tvSessionStatus.setTextColor(ContextCompat.getColor(context, R.color.gray_500));
                h.b.layoutUpcomingActions.setVisibility(View.GONE);
                h.b.btnJoin.setVisibility(View.GONE);
            } else {
                h.b.tvSessionStatus.setTextColor(ContextCompat.getColor(context, R.color.primary_purple));
                h.b.layoutUpcomingActions.setVisibility(View.VISIBLE);
                
                // Show join button only if meeting link exists
                if (item.getMeetingLink() != null && !item.getMeetingLink().trim().isEmpty()) {
                    h.b.btnJoin.setVisibility(View.VISIBLE);
                    h.b.btnJoin.setOnClickListener(v -> {
                        try {
                            android.content.Intent intent = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(item.getMeetingLink()));
                            context.startActivity(intent);
                        } catch (Exception e) {
                            Toast.makeText(context, "Invalid meeting link", Toast.LENGTH_SHORT).show();
                        }
                    });
                } else {
                    h.b.btnJoin.setVisibility(View.GONE);
                }

                h.b.btnCancel.setOnClickListener(v -> viewModel.cancelSession(item.getId()));
                h.b.btnReschedule.setOnClickListener(v -> showReschedulePicker(item.getId()));
            }
        }

        @Override
        public int getItemCount() {
            return list.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            final ItemMentorshipSessionCardBinding b;

            ViewHolder(ItemMentorshipSessionCardBinding b) {
                super(b.getRoot());
                this.b = b;
            }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
