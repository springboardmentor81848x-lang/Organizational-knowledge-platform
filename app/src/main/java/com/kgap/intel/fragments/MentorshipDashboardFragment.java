package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.view.GravityCompat;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentMentorshipDashboardBinding;
import com.kgap.intel.databinding.ItemMentorCardModernBinding;
import com.kgap.intel.databinding.ItemMentorshipActivityBinding;
import com.kgap.intel.databinding.ItemMentorshipSessionBinding;
import com.kgap.intel.databinding.LayoutSummaryCardBinding;
import java.util.ArrayList;
import java.util.List;

public class MentorshipDashboardFragment extends Fragment {
    private FragmentMentorshipDashboardBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorshipDashboardBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        setupToolbar();
        setupSummaryCards();
        setupRecommendedMentors();
        setupUpcomingSessions();
        setupRecentActivity();
        setupSidebar();
    }

    private void setupToolbar() {
        binding.toolbar.setNavigationOnClickListener(v -> binding.drawerLayout.openDrawer(GravityCompat.START));
    }

    private void setupSidebar() {
        binding.navigationView.setNavigationItemSelectedListener(item -> {
            int id = item.getItemId();
            Toast.makeText(getContext(), "Navigate to: " + item.getTitle(), Toast.LENGTH_SHORT).show();
            binding.drawerLayout.closeDrawer(GravityCompat.START);
            return true;
        });
    }

    private void setupSummaryCards() {
        // Active Mentors
        LayoutSummaryCardBinding mentors = binding.cardActiveMentors;
        mentors.tvSummaryValue.setText("4");
        mentors.tvSummaryLabel.setText("Active Mentors");
        mentors.ivSummaryIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        
        // Active Mentees
        LayoutSummaryCardBinding mentees = binding.cardActiveMentees;
        mentees.tvSummaryValue.setText("12");
        mentees.tvSummaryLabel.setText("Active Mentees");
        mentees.cardIconBg.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        mentees.ivSummaryIcon.setImageResource(android.R.drawable.ic_menu_slideshow);
        mentees.ivSummaryIcon.setColorFilter(Color.parseColor("#1976D2"));

        // Upcoming Sessions
        LayoutSummaryCardBinding upcoming = binding.cardUpcomingSessions;
        upcoming.tvSummaryValue.setText("3");
        upcoming.tvSummaryLabel.setText("Upcoming");
        upcoming.cardIconBg.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        upcoming.ivSummaryIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        upcoming.ivSummaryIcon.setColorFilter(Color.parseColor("#F57C00"));

        // Completed
        LayoutSummaryCardBinding completed = binding.cardCompletedSessions;
        completed.tvSummaryValue.setText("48");
        completed.tvSummaryLabel.setText("Total Sessions");
        completed.cardIconBg.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        completed.ivSummaryIcon.setImageResource(android.R.drawable.ic_menu_view);
        completed.ivSummaryIcon.setColorFilter(Color.parseColor("#7B1FA2"));
    }

    private void setupRecommendedMentors() {
        binding.rvRecommendedMentors.setLayoutManager(new LinearLayoutManager(getContext(), RecyclerView.HORIZONTAL, false));
        List<com.kgap.intel.models.MentorProfileResponse> list = new ArrayList<>();

        GenericAdapter<com.kgap.intel.models.MentorProfileResponse> adapter = new GenericAdapter<com.kgap.intel.models.MentorProfileResponse>(list) {
            @Override
            public void onBind(View view, com.kgap.intel.models.MentorProfileResponse item) {
                ItemMentorCardModernBinding b = ItemMentorCardModernBinding.bind(view);
                b.tvMentorName.setText(item.getDisplayName());
                b.tvMentorExpertise.setText(item.getExpertise());
                b.tvMentorExperience.setText(item.getExperienceYears() + " Years Experience");
                b.tvMentorRating.setText(item.getRatingFormatted() + " (80+ reviews)");
                b.tvAvailabilityBadge.setText(item.getAvailability());

                if ("Busy".equalsIgnoreCase(item.getAvailability())) {
                    b.tvAvailabilityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#FFF3E0")));
                    b.tvAvailabilityBadge.setTextColor(Color.parseColor("#E65100"));
                } else {
                    b.tvAvailabilityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
                    b.tvAvailabilityBadge.setTextColor(Color.parseColor("#2E7D32"));
                }

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
                list.clear();
                list.addAll(response);
                adapter.notifyDataSetChanged();
            }
        });
    }

    private void openMentorProfile(String mentorName, Long mentorId) {
        getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, MentorProfileFragment.newInstance(mentorName, mentorId))
                .addToBackStack(null)
                .commit();
    }

    private void openMentorshipRequest(String mentorName, Long mentorId) {
        MentorshipRequestBottomSheet bottomSheet = MentorshipRequestBottomSheet.newInstance(mentorName, mentorId);
        bottomSheet.show(getChildFragmentManager(), "MentorshipRequest");
    }

    private void setupUpcomingSessions() {
        binding.rvUpcomingSessions.setLayoutManager(new LinearLayoutManager(getContext()));
        List<SessionDummy> list = new ArrayList<>();
        list.add(new SessionDummy("Python Microservices", "with Michael Chen", "10:00 AM", "18\nAUG"));
        list.add(new SessionDummy("Design Systems 101", "with Emily Rod", "02:30 PM", "20\nAUG"));

        binding.rvUpcomingSessions.setAdapter(new GenericAdapter<SessionDummy>(list) {
            @Override
            public void onBind(View view, SessionDummy item) {
                ItemMentorshipSessionBinding b = ItemMentorshipSessionBinding.bind(view);
                b.tvSessionTitle.setText(item.title);
                b.tvSessionSubtitle.setText(item.subtitle + " • " + item.time);
                b.tvSessionDate.setText(item.date);
            }
            @Override
            public int getLayout() { return R.layout.item_mentorship_session; }
        });
    }

    private void setupRecentActivity() {
        binding.rvRecentActivity.setLayoutManager(new LinearLayoutManager(getContext()));
        List<String> list = new ArrayList<>();
        list.add("You accepted Jordan Lee as a mentee.");
        list.add("Session with Dr. Sarah moved to Monday.");
        list.add("New feedback received from Michael Chen.");

        binding.rvRecentActivity.setAdapter(new GenericAdapter<String>(list) {
            @Override
            public void onBind(View view, String item) {
                ItemMentorshipActivityBinding b = ItemMentorshipActivityBinding.bind(view);
                b.tvActivityText.setText(item);
            }
            @Override
            public int getLayout() { return R.layout.item_mentorship_activity; }
        });
    }

    private static class SessionDummy {
        String title, subtitle, time, date;
        SessionDummy(String t, String s, String tm, String d) {
            title = t; subtitle = s; time = tm; date = d;
        }
    }

    // Small inner generic adapter for dummy data
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
