package com.kgap.intel.fragments;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentKnowledgeSessionCreateBinding;
import com.kgap.intel.models.KnowledgeSession;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.repository.KnowledgeSessionRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Locale;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class KnowledgeSessionCreateFragment extends Fragment {
    private FragmentKnowledgeSessionCreateBinding binding;
    private KnowledgeSessionRepository repository;
    private Calendar calendar = Calendar.getInstance();
    private SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
    private SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm", Locale.getDefault());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentKnowledgeSessionCreateBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        repository = new KnowledgeSessionRepository(requireContext());

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        setupPickers();
        loadSkills();
        
        binding.btnCreate.setOnClickListener(v -> submitForm());
    }

    private void setupPickers() {
        binding.etDate.setOnClickListener(v -> {
            new DatePickerDialog(requireContext(), (view, year, month, dayOfMonth) -> {
                calendar.set(Calendar.YEAR, year);
                calendar.set(Calendar.MONTH, month);
                calendar.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                binding.etDate.setText(dateFormat.format(calendar.getTime()));
            }, calendar.get(Calendar.YEAR), calendar.get(Calendar.MONTH), calendar.get(Calendar.DAY_OF_MONTH)).show();
        });

        binding.etTime.setOnClickListener(v -> {
            new TimePickerDialog(requireContext(), (view, hourOfDay, minute) -> {
                calendar.set(Calendar.HOUR_OF_DAY, hourOfDay);
                calendar.set(Calendar.MINUTE, minute);
                binding.etTime.setText(timeFormat.format(calendar.getTime()));
            }, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE), true).show();
        });
    }

    private void loadSkills() {
        ApiClient.getSkillApiService(requireContext()).getAllSkills().enqueue(new Callback<List<SkillItem>>() {
            @Override
            public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<String> skillNames = new ArrayList<>();
                    for (SkillItem skill : response.body()) {
                        skillNames.add(skill.getName());
                    }
                    ArrayAdapter<String> adapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, skillNames);
                    binding.actTopic.setAdapter(adapter);
                }
            }

            @Override
            public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                Toast.makeText(getContext(), "Failed to load skills", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void submitForm() {
        String title = binding.etTitle.getText().toString().trim();
        String topic = binding.actTopic.getText().toString().trim();
        String description = binding.etDescription.getText().toString().trim();
        String dateStr = binding.etDate.getText().toString().trim();
        String timeStr = binding.etTime.getText().toString().trim();
        String durationStr = binding.etDuration.getText().toString().trim();
        String link = binding.etMeetingLink.getText().toString().trim();
        String maxParticipantsStr = binding.etMaxParticipants.getText().toString().trim();

        if (title.isEmpty() || topic.isEmpty() || dateStr.isEmpty() || timeStr.isEmpty() || durationStr.isEmpty()) {
            Toast.makeText(getContext(), "Please fill all required fields", Toast.LENGTH_SHORT).show();
            return;
        }

        Integer duration = Integer.parseInt(durationStr);
        Integer maxParticipants = maxParticipantsStr.isEmpty() ? null : Integer.parseInt(maxParticipantsStr);
        Long creatorId = SharedPrefManager.getInstance(requireContext()).getUserId();

        // Construct ISO LocalDateTime string: yyyy-MM-ddTHH:mm:ss
        String scheduledAt = dateStr + "T" + timeStr + ":00";

        KnowledgeSession session = new KnowledgeSession(title, description, topic, creatorId, scheduledAt, duration, link, maxParticipants);

        binding.btnCreate.setEnabled(false);
        binding.progressBar.setVisibility(View.VISIBLE);

        repository.createSession(session).observe(getViewLifecycleOwner(), createdSession -> {
            binding.btnCreate.setEnabled(true);
            binding.progressBar.setVisibility(View.GONE);

            if (createdSession != null) {
                Toast.makeText(getContext(), "Session Created Successfully!", Toast.LENGTH_SHORT).show();
                navigateToDetails(createdSession);
            } else {
                Toast.makeText(getContext(), "Failed to create session. Check backend logs.", Toast.LENGTH_LONG).show();
            }
        });
    }

    private void navigateToDetails(KnowledgeSession session) {
        getParentFragmentManager().beginTransaction()
                .replace(com.kgap.intel.R.id.fragment_container, KnowledgeSessionDetailsFragment.newInstance(session))
                .addToBackStack(null)
                .commit();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
