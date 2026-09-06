package com.kgap.intel.fragments;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.LayoutScheduleSessionBottomSheetBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.MentorshipSession;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class ScheduleSessionBottomSheet extends BottomSheetDialogFragment {
    private LayoutScheduleSessionBottomSheetBinding binding;
    private final List<EmployeeResponse> counterparts = new ArrayList<>();
    private final Map<Long, Long> requestMap = new HashMap<>(); // Counterpart ID -> Mentorship Request ID

    private int selectedYear, selectedMonth, selectedDay;
    private int selectedHour, selectedMinute;
    private boolean isDateSelected = false;
    private boolean isTimeSelected = false;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = LayoutScheduleSessionBottomSheetBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupDatePicker();
        setupTimePicker();
        loadCounterparts();

        binding.btnConfirmSchedule.setOnClickListener(v -> scheduleSessionOnBackend());
    }

    private void setupDatePicker() {
        Calendar calendar = Calendar.getInstance();
        binding.etDate.setOnClickListener(v -> {
            DatePickerDialog dialog = new DatePickerDialog(requireContext(), (view, year, month, dayOfMonth) -> {
                selectedYear = year;
                selectedMonth = month + 1;
                selectedDay = dayOfMonth;
                isDateSelected = true;
                binding.etDate.setText(String.format("%04d-%02d-%02d", selectedYear, selectedMonth, selectedDay));
            }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH));
            dialog.show();
        });
    }

    private void setupTimePicker() {
        Calendar calendar = Calendar.getInstance();
        binding.etTime.setOnClickListener(v -> {
            TimePickerDialog dialog = new TimePickerDialog(requireContext(), (view, hourOfDay, minute) -> {
                selectedHour = hourOfDay;
                selectedMinute = minute;
                isTimeSelected = true;
                binding.etTime.setText(String.format("%02d:%02d", selectedHour, selectedMinute));
            }, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), false);
            dialog.show();
        });
    }

    private void loadCounterparts() {
        Context context = getContext();
        if (context == null) return;

        Long loggedInUserId = SharedPrefManager.getInstance(context).getUserId();
        String userRole = SharedPrefManager.getInstance(context).getUserRole();

        ApiClient.getEmployeeApiService(context).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> empResponse) {
                if (empResponse.isSuccessful() && empResponse.body() != null) {
                    List<EmployeeResponse> allEmployees = empResponse.body();
                    Map<Long, EmployeeResponse> empMap = new HashMap<>();
                    for (EmployeeResponse e : allEmployees) {
                        empMap.put(e.getId(), e);
                    }

                    Call<List<com.kgap.intel.models.MentorshipRequest>> reqCall;
                    if ("MENTOR".equalsIgnoreCase(userRole)) {
                        reqCall = ApiClient.getMentorshipRequestApiService(context).getRequestsForMentor(loggedInUserId);
                    } else {
                        reqCall = ApiClient.getMentorshipRequestApiService(context).getRequestsForMentee(loggedInUserId);
                    }

                    reqCall.enqueue(new Callback<List<com.kgap.intel.models.MentorshipRequest>>() {
                        @Override
                        public void onResponse(Call<List<com.kgap.intel.models.MentorshipRequest>> call2, Response<List<com.kgap.intel.models.MentorshipRequest>> reqResponse) {
                            if (reqResponse.isSuccessful() && reqResponse.body() != null && getContext() != null) {
                                counterparts.clear();
                                requestMap.clear();
                                List<String> displayNames = new ArrayList<>();

                                for (com.kgap.intel.models.MentorshipRequest req : reqResponse.body()) {
                                    if ("ACCEPTED".equalsIgnoreCase(req.getStatus())) {
                                        Long counterpartId = "MENTOR".equalsIgnoreCase(userRole) ? req.getMenteeId() : req.getMentorId();
                                        EmployeeResponse emp = empMap.get(counterpartId);
                                        if (emp != null) {
                                            counterparts.add(emp);
                                            requestMap.put(emp.getId(), req.getId());
                                            displayNames.add(emp.getFirstName() + " " + emp.getLastName());
                                        }
                                    }
                                }

                                ArrayAdapter<String> dropdownAdapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, displayNames);
                                binding.actMentor.setAdapter(dropdownAdapter);
                            }
                        }

                        @Override
                        public void onFailure(Call<List<com.kgap.intel.models.MentorshipRequest>> call2, Throwable t) {}
                    });
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
        });
    }

    private void scheduleSessionOnBackend() {
        Context context = getContext();
        if (context == null) return;

        String selectedText = binding.actMentor.getText().toString();
        EmployeeResponse selectedCounterpart = null;
        for (EmployeeResponse emp : counterparts) {
            String name = emp.getFirstName() + " " + emp.getLastName();
            if (name.equalsIgnoreCase(selectedText)) {
                selectedCounterpart = emp;
                break;
            }
        }

        if (selectedCounterpart == null) {
            Toast.makeText(context, "Please select a valid mentor/mentee.", Toast.LENGTH_SHORT).show();
            return;
        }

        if (!isDateSelected || !isTimeSelected) {
            Toast.makeText(context, "Please select a date and time.", Toast.LENGTH_SHORT).show();
            return;
        }

        int duration = 60;
        int checkedChipId = binding.cgDuration.getCheckedChipId();
        if (checkedChipId != View.NO_ID) {
            com.google.android.material.chip.Chip chip = binding.cgDuration.findViewById(checkedChipId);
            if (chip != null) {
                String chipText = chip.getText().toString();
                if (chipText.contains("30")) duration = 30;
                else if (chipText.contains("90")) duration = 90;
            }
        }

        Long loggedInUserId = SharedPrefManager.getInstance(context).getUserId();
        String userRole = SharedPrefManager.getInstance(context).getUserRole();

        MentorshipSession session = new MentorshipSession();
        session.setMentorshipRequestId(requestMap.get(selectedCounterpart.getId()));
        session.setDurationMinutes(duration);
        session.setStatus("SCHEDULED");

        String combinedNotes = "";
        if (binding.etTopic.getText() != null) {
            combinedNotes += binding.etTopic.getText().toString();
        }
        if (binding.etNotes.getText() != null) {
            if (!combinedNotes.isEmpty()) combinedNotes += "\nNotes: ";
            combinedNotes += binding.etNotes.getText().toString();
        }
        session.setNotes(combinedNotes);

        if ("MENTOR".equalsIgnoreCase(userRole)) {
            session.setMentorId(loggedInUserId);
            session.setMenteeId(selectedCounterpart.getId());
        } else {
            session.setMentorId(selectedCounterpart.getId());
            session.setMenteeId(loggedInUserId);
        }

        String scheduledAt = String.format("%04d-%02d-%02dT%02d:%02d:00", selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute);
        session.setScheduledAt(scheduledAt);

        binding.btnConfirmSchedule.setEnabled(false);

        ApiClient.getMentorshipSessionApiService(context).scheduleSession(session).enqueue(new Callback<MentorshipSession>() {
            @Override
            public void onResponse(Call<MentorshipSession> call, Response<MentorshipSession> response) {
                binding.btnConfirmSchedule.setEnabled(true);
                if (response.isSuccessful() && response.body() != null) {
                    Toast.makeText(context, "Session scheduled successfully!", Toast.LENGTH_SHORT).show();
                    Fragment parent = getParentFragment();
                    if (parent instanceof MentorshipSessionsFragment) {
                        ((MentorshipSessionsFragment) parent).onViewCreated(parent.getView(), null);
                    }
                    dismiss();
                } else {
                    String error = "Failed to schedule session. Status: " + response.code();
                    try {
                        if (response.errorBody() != null) {
                            error = response.errorBody().string();
                        }
                    } catch (Exception ignored) {}
                    Toast.makeText(context, error, Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<MentorshipSession> call, Throwable t) {
                binding.btnConfirmSchedule.setEnabled(true);
                Toast.makeText(context, "Network error: " + t.getMessage(), Toast.LENGTH_LONG).show();
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
