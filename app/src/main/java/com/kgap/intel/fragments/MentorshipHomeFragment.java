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
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentMentorshipHomeBinding;
import com.kgap.intel.databinding.ItemHubButtonBinding;
import com.kgap.intel.databinding.ItemKnowledgeCardBinding;
import com.kgap.intel.databinding.ItemMentorCardModernBinding;
import com.kgap.intel.databinding.ItemMentorshipSessionBinding;
import com.kgap.intel.databinding.LayoutSummaryCardCompactBinding;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;

public class MentorshipHomeFragment extends Fragment {
    private FragmentMentorshipHomeBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorshipHomeBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupHub();
        setupSummaryCards();
        setupMyMentor();
        setupUpcomingSessions();
        setupRecommendedMentors();
        setupRecentKnowledge();
    }

    private void setupHub() {
        // 1. Find Mentor
        ItemHubButtonBinding find = binding.hubFindMentor;
        find.ivIcon.setImageResource(android.R.drawable.ic_menu_search);
        find.ivIcon.setColorFilter(Color.parseColor("#00B894"));
        find.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        find.tvLabel.setText("Find Mentor");
        find.getRoot().setOnClickListener(v -> navigateTo(new FindMentorFragment()));

        // 2. My Mentors
        ItemHubButtonBinding myMentors = binding.hubMyMentors;
        myMentors.ivIcon.setImageResource(android.R.drawable.ic_menu_share);
        myMentors.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        myMentors.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        myMentors.tvLabel.setText("Community Q&A");
        myMentors.getRoot().setOnClickListener(v -> navigateTo(new CommunityQaFragment()));

        // 3. Sessions
        ItemHubButtonBinding sessions = binding.hubSessions;
        sessions.ivIcon.setImageResource(android.R.drawable.ic_menu_today);
        sessions.ivIcon.setColorFilter(Color.parseColor("#EF6C00"));
        sessions.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        sessions.tvLabel.setText("Sessions");
        sessions.getRoot().setOnClickListener(v -> navigateTo(new MentorshipSessionsFragment()));

        // 4. Resources
        ItemHubButtonBinding resources = binding.hubResources;
        String role = SharedPrefManager.getInstance(requireContext()).getUserRole();
        if ("MENTOR".equalsIgnoreCase(role) || "ADMIN".equalsIgnoreCase(role) || "LD_ADMIN".equalsIgnoreCase(role)) {
            resources.ivIcon.setImageResource(android.R.drawable.ic_menu_add);
            resources.ivIcon.setColorFilter(Color.parseColor("#7B1FA2"));
            resources.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
            resources.tvLabel.setText("Host Session");
            resources.getRoot().setOnClickListener(v -> navigateTo(new KnowledgeSessionCreateFragment()));
        } else {
            resources.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
            resources.ivIcon.setColorFilter(Color.parseColor("#7B1FA2"));
            resources.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
            resources.tvLabel.setText("Resources");
            resources.getRoot().setOnClickListener(v -> navigateTo(new KnowledgeHubFragment()));
        }

        // 5. Received Requests
        ItemHubButtonBinding received = binding.hubRequestsReceived;
        received.ivIcon.setImageResource(android.R.drawable.ic_menu_info_details);
        received.ivIcon.setColorFilter(Color.parseColor("#E91E63"));
        received.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FCE4EC"));
        received.tvLabel.setText("Incoming");
        received.getRoot().setOnClickListener(v -> navigateTo(MentorshipRequestsListFragment.newInstance(true)));

        // 6. Sent Requests
        ItemHubButtonBinding sent = binding.hubRequestsSent;
        sent.ivIcon.setImageResource(android.R.drawable.ic_menu_send);
        sent.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        sent.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        sent.tvLabel.setText("Sent");
        sent.getRoot().setOnClickListener(v -> navigateTo(MentorshipRequestsListFragment.newInstance(false)));

        if ("LD_ADMIN".equalsIgnoreCase(role) || "LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(role)) {
            received.getRoot().setVisibility(View.GONE);
            sent.getRoot().setVisibility(View.GONE);
        }

        binding.tvSeeAllMentors.setOnClickListener(v -> navigateTo(new FindMentorFragment()));
    }

    private void setupSummaryCards() {
        // Active Mentorship
        LayoutSummaryCardCompactBinding active = binding.summaryActive;
        active.tvCardLabel.setText("Active Mentorship");
        active.tvCardValue.setText("2");
        active.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E8F5E9"));
        active.ivCardIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        active.ivCardIcon.setColorFilter(Color.parseColor("#2E7D32"));

        // Upcoming Session
        LayoutSummaryCardCompactBinding upcoming = binding.summaryUpcoming;
        upcoming.tvCardLabel.setText("Upcoming Session");
        upcoming.tvCardValue.setText("Tomorrow");
        upcoming.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        upcoming.ivCardIcon.setImageResource(android.R.drawable.ic_menu_today);
        upcoming.ivCardIcon.setColorFilter(Color.parseColor("#EF6C00"));

        // Learning Progress
        LayoutSummaryCardCompactBinding progress = binding.summaryProgress;
        progress.tvCardLabel.setText("Learning Progress");
        progress.tvCardValue.setText("65%");
        progress.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        progress.ivCardIcon.setImageResource(android.R.drawable.ic_menu_slideshow);
        progress.ivCardIcon.setColorFilter(Color.parseColor("#1565C0"));

        // Goals
        LayoutSummaryCardCompactBinding goals = binding.summaryGoals;
        goals.tvCardLabel.setText("Active Goals");
        goals.tvCardValue.setText("4/6");
        goals.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        goals.ivCardIcon.setImageResource(android.R.drawable.ic_menu_compass);
        goals.ivCardIcon.setColorFilter(Color.parseColor("#7B1FA2"));
        goals.getRoot().setOnClickListener(v -> navigateTo(new MyProgressFragment()));
    }

    private void setupMyMentor() {
        ItemMentorCardModernBinding b = binding.cardMyMentor;
        b.tvMentorName.setText("Michael Chen");
        b.tvMentorExpertise.setText("Architect at Google");
        b.tvMentorRating.setText("5.0 (210 reviews)");
        b.tvMentorExperience.setText("15 Years Experience");
        b.tvAvailabilityBadge.setText("Connected");
        b.tvAvailabilityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
        b.btnRequestMentorship.setText("Message");

        b.btnViewProfile.setOnClickListener(v -> openMentorProfile("Michael Chen", 16L));
        b.btnRequestMentorship.setOnClickListener(v -> Toast.makeText(getContext(), "Opening chat with Michael Chen...", Toast.LENGTH_SHORT).show());
    }

    private void setupUpcomingSessions() {
        binding.rvUpcomingSessions.setLayoutManager(new LinearLayoutManager(getContext()));
        List<String> sessions = new ArrayList<>();
        sessions.add("System Design Review");
        sessions.add("React Native Optimization");
        
        binding.rvUpcomingSessions.setAdapter(new GenericAdapter<String>(sessions) {
            @Override
            public void onBind(View view, String item) {
                ItemMentorshipSessionBinding b = ItemMentorshipSessionBinding.bind(view);
                b.tvSessionTitle.setText(item);
                if (item.contains("System")) b.tvSessionSubtitle.setText("with Michael Chen • 04:00 PM");
                else b.tvSessionSubtitle.setText("with Jane Cooper • 11:30 AM");
            }
            @Override
            public int getLayout() { return R.layout.item_mentorship_session; }
        });
    }

    private void setupRecommendedMentors() {
        binding.rvRecommendedMentors.setLayoutManager(new LinearLayoutManager(getContext(), RecyclerView.HORIZONTAL, false));
        List<com.kgap.intel.models.MentorProfileResponse> mentorsList = new ArrayList<>();
        
        GenericAdapter<com.kgap.intel.models.MentorProfileResponse> adapter = new GenericAdapter<com.kgap.intel.models.MentorProfileResponse>(mentorsList) {
            @Override
            public void onBind(View view, com.kgap.intel.models.MentorProfileResponse item) {
                ItemMentorCardModernBinding b = ItemMentorCardModernBinding.bind(view);
                b.tvMentorName.setText(item.getDisplayName());
                b.tvMentorExpertise.setText(item.getExpertise());
                b.tvMentorExperience.setText(item.getExperienceYears() + " Years Experience");
                b.tvMentorRating.setText(item.getRatingFormatted());
                b.tvAvailabilityBadge.setText(item.getAvailability());

                b.btnViewProfile.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), item.getEffectiveMentorId()));
                b.btnRequestMentorship.setOnClickListener(v -> openMentorshipRequest(item.getDisplayName(), item.getEffectiveMentorId()));
                view.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), item.getEffectiveMentorId()));
            }
            @Override
            public int getLayout() { return R.layout.item_mentor_card_modern; }
        };
        binding.rvRecommendedMentors.setAdapter(adapter);

        new com.kgap.intel.repository.RealMentorRepository(requireContext()).getMentors().observe(getViewLifecycleOwner(), response -> {
            if (response != null && !response.isEmpty()) {
                mentorsList.clear();
                mentorsList.addAll(response);
                adapter.notifyDataSetChanged();
            }
        });
    }

    private void openMentorProfile(String mentorName) {
        openMentorProfile(mentorName, null);
    }

    private void openMentorProfile(String mentorName, Long mentorId) {
        navigateTo(MentorProfileFragment.newInstance(mentorName, mentorId));
    }

    private void openMentorshipRequest(String mentorName, Long mentorId) {
        MentorshipRequestBottomSheet bottomSheet = MentorshipRequestBottomSheet.newInstance(mentorName, mentorId);
        bottomSheet.show(getChildFragmentManager(), "MentorshipRequest");
    }

    private void setupRecentKnowledge() {
        binding.rvRecentKnowledge.setLayoutManager(new LinearLayoutManager(getContext()));
        List<String> topics = new ArrayList<>();
        topics.add("Advanced GraphQL Patterns");
        topics.add("CI/CD Pipeline Best Practices");

        binding.rvRecentKnowledge.setAdapter(new GenericAdapter<String>(topics) {
            @Override
            public void onBind(View view, String item) {
                ItemKnowledgeCardBinding b = ItemKnowledgeCardBinding.bind(view);
                b.tvKnowledgeTitle.setText(item);
            }
            @Override
            public int getLayout() { return R.layout.item_knowledge_card; }
        });
    }

    private void navigateTo(Fragment fragment) {
        getParentFragmentManager().beginTransaction()
            .replace(R.id.fragment_container, fragment)
            .addToBackStack(null)
            .commit();
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
