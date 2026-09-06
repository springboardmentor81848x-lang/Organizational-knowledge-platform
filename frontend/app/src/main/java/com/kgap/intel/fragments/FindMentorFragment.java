package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentFindMentorBinding;
import com.kgap.intel.databinding.ItemMentorCardModernBinding;
import com.kgap.intel.databinding.ItemMentorCardSearchBinding;
import com.kgap.intel.models.MentorProfileResponse;
import com.kgap.intel.repository.RealMentorRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class FindMentorFragment extends Fragment {
    private static final String ARG_SKILL_FILTER = "skill_filter";
    private String preFilledSkillFilter;

    public static FindMentorFragment newInstance(String skillFilter) {
        FindMentorFragment fragment = new FindMentorFragment();
        Bundle args = new Bundle();
        args.putString(ARG_SKILL_FILTER, skillFilter);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            preFilledSkillFilter = getArguments().getString(ARG_SKILL_FILTER);
        }
    }

    private FragmentFindMentorBinding binding;
    private RealMentorRepository repository;
    private final List<MentorProfileResponse> allMentorsList = new ArrayList<>();
    private final List<MentorProfileResponse> displayedMentorsList = new ArrayList<>();
    private final List<MentorProfileResponse> recommendedMentorsList = new ArrayList<>();
    private final java.util.Map<Long, String> connectionStatusMap = new java.util.HashMap<>();
    private MentorAdapter mentorAdapter;
    private GenericAdapter<MentorProfileResponse> recommendedAdapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentFindMentorBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        repository = new RealMentorRepository(requireContext());

        setupRecommendedMentors();
        setupAllMentors();
        setupSearchAndFilters();

        if (preFilledSkillFilter != null && !preFilledSkillFilter.isEmpty()) {
            binding.etSearchMentors.setText(preFilledSkillFilter);
        }

        loadConnectionStatuses();
        loadMentorsFromBackend();
    }

    private void loadConnectionStatuses() {
        Long myUserId = com.kgap.intel.utils.SharedPrefManager.getInstance(requireContext()).getUserId();
        com.kgap.intel.repository.MentorshipRequestRepository reqRepo = new com.kgap.intel.repository.MentorshipRequestRepository(requireContext());
        reqRepo.getRequestsForMentee(myUserId).observe(getViewLifecycleOwner(), requests -> {
            if (requests != null) {
                for (com.kgap.intel.models.MentorshipRequest req : requests) {
                    if (req.getMentorId() != null) {
                        connectionStatusMap.put(req.getMentorId(), req.getStatus());
                    }
                }
                if (mentorAdapter != null) mentorAdapter.notifyDataSetChanged();
                if (recommendedAdapter != null) recommendedAdapter.notifyDataSetChanged();
            }
        });
        reqRepo.getRequestsForMentor(myUserId).observe(getViewLifecycleOwner(), requests -> {
            if (requests != null) {
                for (com.kgap.intel.models.MentorshipRequest req : requests) {
                    if (req.getMenteeId() != null) {
                        connectionStatusMap.put(req.getMenteeId(), req.getStatus());
                    }
                }
                if (mentorAdapter != null) mentorAdapter.notifyDataSetChanged();
                if (recommendedAdapter != null) recommendedAdapter.notifyDataSetChanged();
            }
        });
    }

    private void loadMentorsFromBackend() {
        Long myUserId = com.kgap.intel.utils.SharedPrefManager.getInstance(requireContext()).getUserId();
        repository.getMentors(myUserId).observe(getViewLifecycleOwner(), mentors -> {
            if (mentors != null) {
                allMentorsList.clear();
                allMentorsList.addAll(mentors);

                if (allMentorsList.isEmpty()) {
                    Toast.makeText(getContext(), "No eligible peer employees found.", Toast.LENGTH_SHORT).show();
                }

                updateRecommendedMentors();
                filterAndSort();
            } else {
                Toast.makeText(getContext(), "Failed to load peer employees from backend", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void setupSearchAndFilters() {
        binding.etSearchMentors.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterAndSort();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        binding.cgFilters.setOnCheckedStateChangeListener((group, checkedIds) -> {
            filterAndSort();
        });
    }

    private void filterAndSort() {
        String query = "";
        if (binding.etSearchMentors.getText() != null) {
            query = binding.etSearchMentors.getText().toString().toLowerCase().trim();
        }
        final String finalQuery = query;
        int checkedId = binding.cgFilters.getCheckedChipId();

        List<MentorProfileResponse> filtered = allMentorsList.stream()
                .filter(m -> m.getDisplayName().toLowerCase().contains(finalQuery) ||
                        m.getExpertise().toLowerCase().contains(finalQuery) ||
                        m.getSkillTags().stream().anyMatch(s -> s.toLowerCase().contains(finalQuery)))
                .collect(Collectors.toList());

        if (checkedId == R.id.chip_experience) {
            filtered.sort((a, b) -> Integer.compare(b.getExperienceYears(), a.getExperienceYears()));
        } else if (checkedId == R.id.chip_rating) {
            filtered.sort((a, b) -> Double.compare(b.getRatingVal(), a.getRatingVal()));
        } else if (checkedId == R.id.chip_availability) {
            filtered.sort((a, b) -> {
                if (a.getAvailability().equalsIgnoreCase(b.getAvailability())) return 0;
                return a.getAvailability().equalsIgnoreCase("Available") ? -1 : 1;
            });
        }

        displayedMentorsList.clear();
        displayedMentorsList.addAll(filtered);
        mentorAdapter.notifyDataSetChanged();
    }

    private void setupRecommendedMentors() {
        binding.rvRecommendedMentors.setLayoutManager(new LinearLayoutManager(getContext(), RecyclerView.HORIZONTAL, false));
        recommendedAdapter = new GenericAdapter<MentorProfileResponse>(recommendedMentorsList) {
            @Override
            public void onBind(View view, MentorProfileResponse item) {
                ItemMentorCardModernBinding b = ItemMentorCardModernBinding.bind(view);
                b.tvMentorName.setText(item.getDisplayName());
                b.tvMentorExpertise.setText(item.getExpertise());
                b.tvMentorExperience.setText(item.getExperienceYears() + " Years Exp.");
                b.tvMentorRating.setText(item.getRatingFormatted());
                b.tvAvailabilityBadge.setText(item.getAvailability());

                Long targetId = item.getEffectiveMentorId();
                String status = connectionStatusMap.get(targetId);

                if (status != null && "ACCEPTED".equalsIgnoreCase(status)) {
                    b.btnRequestMentorship.setText("💬 Chat");
                    b.btnRequestMentorship.setEnabled(true);
                    b.btnRequestMentorship.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#00B894")));
                    b.btnRequestMentorship.setOnClickListener(v -> openMentorChat(item.getDisplayName(), targetId));
                } else if (status != null && "PENDING".equalsIgnoreCase(status)) {
                    b.btnRequestMentorship.setText("⏳ Pending");
                    b.btnRequestMentorship.setEnabled(false);
                    b.btnRequestMentorship.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#9E9E9E")));
                } else {
                    b.btnRequestMentorship.setText("Connect");
                    b.btnRequestMentorship.setEnabled(true);
                    b.btnRequestMentorship.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#00B894")));
                    b.btnRequestMentorship.setOnClickListener(v -> openMentorshipRequest(item.getDisplayName(), targetId));
                }

                b.btnViewProfile.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), targetId));
                view.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), targetId));
            }
            @Override
            public int getLayout() { return R.layout.item_mentor_card_modern; }
        };
        binding.rvRecommendedMentors.setAdapter(recommendedAdapter);
    }

    private void updateRecommendedMentors() {
        recommendedMentorsList.clear();
        List<MentorProfileResponse> recommended = allMentorsList.stream()
                .sorted((a, b) -> Integer.compare(b.getExperienceYears(), a.getExperienceYears()))
                .limit(4)
                .collect(Collectors.toList());
        recommendedMentorsList.addAll(recommended);
        if (recommendedAdapter != null) {
            recommendedAdapter.notifyDataSetChanged();
        }
    }

    private void setupAllMentors() {
        binding.rvAllMentors.setLayoutManager(new LinearLayoutManager(getContext()));
        mentorAdapter = new MentorAdapter(displayedMentorsList);
        binding.rvAllMentors.setAdapter(mentorAdapter);
    }

    private void openMentorProfile(String mentorName, Long mentorId) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, MentorProfileFragment.newInstance(mentorName, mentorId))
                .addToBackStack(null)
                .commit();
    }

    private void openMentorChat(String mentorName, Long mentorId) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, ChatFragment.newInstance(mentorName, mentorId))
                .addToBackStack(null)
                .commit();
    }

    private void openMentorshipRequest(String mentorName, Long mentorId) {
        MentorshipRequestBottomSheet bottomSheet = MentorshipRequestBottomSheet.newInstance(mentorName, mentorId);
        bottomSheet.show(getChildFragmentManager(), "MentorshipRequest");
    }

    private class MentorAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
        private final List<MentorProfileResponse> list;
        MentorAdapter(List<MentorProfileResponse> list) { this.list = list; }

        @NonNull @Override public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new RecyclerView.ViewHolder(LayoutInflater.from(p.getContext()).inflate(R.layout.item_mentor_card_search, p, false)) {};
        }

        @Override public void onBindViewHolder(@NonNull RecyclerView.ViewHolder h, int pos) {
            MentorProfileResponse item = list.get(pos);
            ItemMentorCardSearchBinding b = ItemMentorCardSearchBinding.bind(h.itemView);
            b.tvMentorName.setText(item.getDisplayName());
            b.tvMentorRole.setText(item.getExpertise());
            b.tvMentorRating.setText(item.getRatingFormatted());
            b.tvMentorExperience.setText("• " + item.getExperienceYears() + " Years Exp.");
            b.tvAvailabilityStatus.setText(item.getAvailability());

            if (item.getAvailability().equalsIgnoreCase("Busy")) {
                b.tvAvailabilityStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#FFEBEE")));
                b.tvAvailabilityStatus.setTextColor(Color.parseColor("#C62828"));
            } else {
                b.tvAvailabilityStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
                b.tvAvailabilityStatus.setTextColor(Color.parseColor("#2E7D32"));
            }

            // Set tags
            b.cgExpertiseTags.removeAllViews();
            List<String> tags = item.getSkillTags();
            for (String skill : tags.subList(0, Math.min(3, tags.size()))) {
                com.google.android.material.chip.Chip chip = new com.google.android.material.chip.Chip(getContext());
                chip.setText(skill);
                chip.setTextSize(10);
                chip.setChipMinHeight(24);
                b.cgExpertiseTags.addView(chip);
            }

            Long targetId = item.getEffectiveMentorId();
            String status = connectionStatusMap.get(targetId);

            if (status != null && "ACCEPTED".equalsIgnoreCase(status)) {
                b.btnChatMentor.setText("💬 Chat");
                b.btnChatMentor.setEnabled(true);
                b.btnChatMentor.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#00B894")));
                b.btnChatMentor.setOnClickListener(v -> openMentorChat(item.getDisplayName(), targetId));
            } else if (status != null && "PENDING".equalsIgnoreCase(status)) {
                b.btnChatMentor.setText("⏳ Pending");
                b.btnChatMentor.setEnabled(false);
                b.btnChatMentor.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#9E9E9E")));
            } else {
                b.btnChatMentor.setText("Connect");
                b.btnChatMentor.setEnabled(true);
                b.btnChatMentor.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#00B894")));
                b.btnChatMentor.setOnClickListener(v -> openMentorshipRequest(item.getDisplayName(), targetId));
            }

            b.btnViewProfile.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), targetId));
            h.itemView.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), targetId));
        }
        @Override public int getItemCount() { return list.size(); }
    }

    abstract static class GenericAdapter<T> extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
        private final List<T> list;
        GenericAdapter(List<T> list) { this.list = list; }
        public abstract void onBind(View view, T item);
        public abstract int getLayout();
        @NonNull @Override public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new RecyclerView.ViewHolder(LayoutInflater.from(p.getContext()).inflate(getLayout(), p, false)) {};
        }
        @Override public void onBindViewHolder(@NonNull RecyclerView.ViewHolder h, int pos) { onBind(h.itemView, list.get(pos)); }
        @Override public int getItemCount() { return list.size(); }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
