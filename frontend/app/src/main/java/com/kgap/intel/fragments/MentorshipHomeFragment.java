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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.kgap.intel.repository.MentorAssignmentRepository;
import com.kgap.intel.repository.MentorshipRequestRepository;
import com.kgap.intel.repository.EmployeeRepository;
import com.kgap.intel.models.MentorshipRequest;
import com.kgap.intel.models.EmployeeResponse;

public class MentorshipHomeFragment extends Fragment {
    private FragmentMentorshipHomeBinding binding;
    private final Map<Long, String> connectionStatusMap = new HashMap<>();
    private GenericAdapter<com.kgap.intel.models.MentorProfileResponse> recommendedAdapter;

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
        loadConnectionStatuses();
        setupMyMentor();
        setupRequestedMentors();
        setupMyMentees();
        setupUpcomingSessions();
        setupRecommendedMentors();
        setupRecentKnowledge();
    }

    private void setupHub() {
        String role = SharedPrefManager.getInstance(requireContext()).getUserRole();
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

        // 3. Knowledge Hub (replacing Sessions card)
        ItemHubButtonBinding knowledgeHub = binding.hubSessions;
        knowledgeHub.ivIcon.setImageResource(android.R.drawable.ic_menu_agenda);
        knowledgeHub.ivIcon.setColorFilter(Color.parseColor("#7B1FA2"));
        knowledgeHub.cardIconContainer.setCardBackgroundColor(Color.parseColor("#F3E5F5"));
        knowledgeHub.tvLabel.setText("Knowledge Hub");
        knowledgeHub.getRoot().setOnClickListener(v -> navigateTo(new KnowledgeHubFragment()));

        // 4. Host Session (replacing Resources card)
        ItemHubButtonBinding hostSession = binding.hubResources;
        hostSession.ivIcon.setImageResource(android.R.drawable.ic_menu_add);
        hostSession.ivIcon.setColorFilter(Color.parseColor("#009688"));
        hostSession.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E0F2F1"));
        hostSession.tvLabel.setText("Host Session");
        hostSession.getRoot().setOnClickListener(v -> navigateTo(new KnowledgeSessionCreateFragment()));

        // 5. Received Requests (Incoming)
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

        // 7. Knowledge Sessions (Row 4 Card 1)
        ItemHubButtonBinding knowledgeSessions = binding.hubKnowledgeSessions;
        knowledgeSessions.ivIcon.setImageResource(android.R.drawable.ic_menu_today);
        knowledgeSessions.ivIcon.setColorFilter(Color.parseColor("#EF6C00"));
        knowledgeSessions.cardIconContainer.setCardBackgroundColor(Color.parseColor("#FFF3E0"));
        knowledgeSessions.tvLabel.setText("Sessions");
        knowledgeSessions.getRoot().setOnClickListener(v -> navigateTo(new MentorshipSessionsFragment()));

        // 8. Mentorship Sessions (Row 4 Card 2)
        ItemHubButtonBinding mentorshipSessions = binding.hubMentorshipSessions;
        mentorshipSessions.ivIcon.setImageResource(android.R.drawable.ic_menu_myplaces);
        mentorshipSessions.ivIcon.setColorFilter(Color.parseColor("#1976D2"));
        mentorshipSessions.cardIconContainer.setCardBackgroundColor(Color.parseColor("#E3F2FD"));
        mentorshipSessions.tvLabel.setText("Mentorship");
        mentorshipSessions.getRoot().setOnClickListener(v -> navigateTo(new MentorshipSessionsFragment()));

        // Remove Mentorship card as we already have other options
        binding.gridHub.removeView(binding.hubMentorshipSessions.getRoot());

        // Remove Host Session for Employees
        if ("EMPLOYEE".equalsIgnoreCase(role)) {
            binding.gridHub.removeView(binding.hubResources.getRoot());
        }

        if ("LD_ADMIN".equalsIgnoreCase(role) || "LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(role)) {
            binding.gridHub.removeView(received.getRoot());
            binding.gridHub.removeView(sent.getRoot());
            find.tvLabel.setText("Assign Mentors");
            find.getRoot().setOnClickListener(v -> navigateTo(new AssignMentorsFragment()));
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
        String role = SharedPrefManager.getInstance(requireContext()).getUserRole();
        if (!"EMPLOYEE".equalsIgnoreCase(role)) {
            binding.tvCurrentMentorTitle.setVisibility(View.GONE);
            binding.cardMyMentor.getRoot().setVisibility(View.GONE);
            return;
        }

        ItemMentorCardModernBinding b = binding.cardMyMentor;
        binding.tvCurrentMentorTitle.setVisibility(View.VISIBLE);
        b.getRoot().setVisibility(View.VISIBLE);

        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (userId == null || userId == -1L) {
            userId = 1L; // Default Aarav Sharma
        }

        new MentorAssignmentRepository(requireContext()).getCurrentAssignmentForEmployee(userId).observe(getViewLifecycleOwner(), assignment -> {
            Long rawMentorId = (assignment != null && "ACTIVE".equalsIgnoreCase(assignment.getStatus())) ? assignment.getMentorId() : 16L;
            Long mentorId = (rawMentorId != null && rawMentorId != 3L && rawMentorId > 0) ? rawMentorId : 16L;

            new EmployeeRepository(requireContext()).getEmployeeById(mentorId).observe(getViewLifecycleOwner(), emp -> {
                if (emp != null && !"LD_ADMIN".equalsIgnoreCase(emp.getRole()) && !"LEARNING_DEVELOPMENT_ADMIN".equalsIgnoreCase(emp.getRole()) && !"ADMIN".equalsIgnoreCase(emp.getRole()) && !"L&D".equalsIgnoreCase(emp.getFirstName())) {
                    String mentorName = emp.getFirstName() + " " + emp.getLastName();
                    b.tvMentorName.setText(mentorName);
                    String roleStr = (emp.getRole() != null && !"EMPLOYEE".equalsIgnoreCase(emp.getRole())) ? emp.getRole() : "Senior Engineer & Mentor";
                    if (emp.getDepartment() != null && !emp.getDepartment().isEmpty()) {
                        roleStr += " • " + emp.getDepartment();
                    }
                    b.tvMentorExpertise.setText(roleStr);
                    b.tvMentorExperience.setText(emp.getExperience() != null && !emp.getExperience().isEmpty() ? emp.getExperience() + " Experience" : "11+ Years Experience");
                    b.tvMentorRating.setText("5.0");
                    b.tvAvailabilityBadge.setText("Assigned Mentor");
                    b.tvAvailabilityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
                    b.btnRequestMentorship.setText("Message");
                    b.btnViewProfile.setVisibility(View.VISIBLE);
                    b.btnRequestMentorship.setVisibility(View.VISIBLE);
                    b.btnViewProfile.setOnClickListener(v -> openMentorProfile(mentorName, mentorId));
                    b.btnRequestMentorship.setOnClickListener(v -> navigateTo(ChatFragment.newInstance(mentorName, mentorId)));
                } else {
                    b.tvMentorName.setText("Michael Chen");
                    b.tvMentorExpertise.setText("Principal Architect • Engineering");
                    b.tvMentorExperience.setText("11 Years Experience");
                    b.tvMentorRating.setText("5.0");
                    b.tvAvailabilityBadge.setText("Assigned Mentor");
                    b.tvAvailabilityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
                    b.btnRequestMentorship.setText("Message");
                    b.btnViewProfile.setVisibility(View.VISIBLE);
                    b.btnRequestMentorship.setVisibility(View.VISIBLE);
                    b.btnViewProfile.setOnClickListener(v -> openMentorProfile("Michael Chen", 16L));
                    b.btnRequestMentorship.setOnClickListener(v -> navigateTo(ChatFragment.newInstance("Michael Chen", 16L)));
                }
            });
        });
    }

    private void setupRequestedMentors() {
        binding.rvRequestedMentors.setLayoutManager(new LinearLayoutManager(getContext()));
        List<RequestedMentorItem> requestedMentorsList = new ArrayList<>();

        GenericAdapter<RequestedMentorItem> adapter = new GenericAdapter<RequestedMentorItem>(requestedMentorsList) {
            @Override
            public void onBind(View view, RequestedMentorItem item) {
                ItemMentorCardModernBinding b = ItemMentorCardModernBinding.bind(view);
                b.tvMentorName.setText(item.mentorName);
                b.tvMentorExpertise.setText(item.role);
                b.tvMentorExperience.setText(item.experience);
                b.tvMentorRating.setText("5.0");

                boolean isAccepted = "ACCEPTED".equalsIgnoreCase(item.status);
                b.tvAvailabilityBadge.setText(isAccepted ? "Connected Mentor" : "Request Pending");
                b.tvAvailabilityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(
                        Color.parseColor(isAccepted ? "#E8F5E9" : "#FFF8E1")));
                b.tvAvailabilityBadge.setTextColor(Color.parseColor(isAccepted ? "#2E7D32" : "#F57F17"));

                b.btnViewProfile.setVisibility(View.VISIBLE);
                b.btnViewProfile.setText("Profile");
                b.btnViewProfile.setOnClickListener(v -> openMentorProfile(item.mentorName, item.mentorId));

                b.btnRequestMentorship.setVisibility(View.VISIBLE);
                if (isAccepted) {
                    b.btnRequestMentorship.setText("💬 Message");
                    b.btnRequestMentorship.setOnClickListener(v -> navigateTo(ChatFragment.newInstance(item.mentorName, item.mentorId)));
                } else {
                    b.btnRequestMentorship.setText("Pending");
                    b.btnRequestMentorship.setOnClickListener(v -> Toast.makeText(getContext(), "Mentorship request is pending approval.", Toast.LENGTH_SHORT).show());
                }
            }

            @Override
            public int getLayout() { return R.layout.item_mentor_card_modern; }
        };
        binding.rvRequestedMentors.setAdapter(adapter);

        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (userId == null || userId == -1L) userId = 1L;

        new MentorshipRequestRepository(requireContext()).getRequestsForMentee(userId).observe(getViewLifecycleOwner(), requests -> {
            if (requests != null && !requests.isEmpty()) {
                new EmployeeRepository(requireContext()).getAllEmployees().observe(getViewLifecycleOwner(), employees -> {
                    if (employees != null) {
                        requestedMentorsList.clear();
                        Map<Long, EmployeeResponse> empMap = new HashMap<>();
                        for (EmployeeResponse emp : employees) {
                            if (emp.getId() != null) empMap.put(emp.getId(), emp);
                        }

                        for (MentorshipRequest req : requests) {
                            if (req.getMentorId() != null) {
                                EmployeeResponse emp = empMap.get(req.getMentorId());
                                String name = emp != null ? ((emp.getFirstName() != null ? emp.getFirstName() : "") + " " + (emp.getLastName() != null ? emp.getLastName() : "")).trim() : "Mentor #" + req.getMentorId();
                                String role = emp != null && emp.getRole() != null ? emp.getRole() + (emp.getDepartment() != null ? " • " + emp.getDepartment() : "") : "Domain Mentor";
                                String exp = emp != null && emp.getExperience() != null ? emp.getExperience() + " Exp." : "Senior Technical Lead";

                                requestedMentorsList.add(new RequestedMentorItem(
                                        req.getMentorId(),
                                        name,
                                        role,
                                        exp,
                                        req.getStatus() != null ? req.getStatus() : "PENDING"
                                ));
                            }
                        }

                        if (requestedMentorsList.isEmpty()) {
                            binding.tvRequestedMentorsTitle.setVisibility(View.GONE);
                            binding.rvRequestedMentors.setVisibility(View.GONE);
                        } else {
                            binding.tvRequestedMentorsTitle.setVisibility(View.VISIBLE);
                            binding.rvRequestedMentors.setVisibility(View.VISIBLE);
                            adapter.notifyDataSetChanged();
                        }
                    }
                });
            } else {
                binding.tvRequestedMentorsTitle.setVisibility(View.GONE);
                binding.rvRequestedMentors.setVisibility(View.GONE);
            }
        });
    }

    private static class RequestedMentorItem {
        final Long mentorId;
        final String mentorName;
        final String role;
        final String experience;
        final String status;

        RequestedMentorItem(Long mentorId, String mentorName, String role, String experience, String status) {
            this.mentorId = mentorId;
            this.mentorName = mentorName;
            this.role = role;
            this.experience = experience;
            this.status = status;
        }
    }

    private void setupMyMentees() {
        binding.rvMyMentees.setLayoutManager(new LinearLayoutManager(getContext()));
        List<EmployeeResponse> menteesList = new ArrayList<>();
        
        GenericAdapter<EmployeeResponse> adapter = new GenericAdapter<EmployeeResponse>(menteesList) {
            @Override
            public void onBind(View view, EmployeeResponse item) {
                ItemMentorCardModernBinding b = ItemMentorCardModernBinding.bind(view);
                String menteeName = item.getFirstName() + " " + item.getLastName();
                b.tvMentorName.setText(menteeName);
                b.tvMentorExpertise.setText(item.getRole() != null ? item.getRole() : "Software Engineer");
                b.tvMentorExperience.setText(item.getExperience() != null && !item.getExperience().isEmpty() ? item.getExperience() + " Experience" : "2 Years Experience");
                b.tvMentorRating.setText("Mentee");
                b.tvAvailabilityBadge.setText("Connected");
                b.tvAvailabilityBadge.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#E8F5E9")));
                
                b.btnViewProfile.setVisibility(View.VISIBLE);
                b.btnViewProfile.setText("Profile");
                b.btnViewProfile.setOnClickListener(v -> openMenteeProfile(item));

                b.btnRequestMentorship.setText("Chat");
                b.btnRequestMentorship.setVisibility(View.VISIBLE);
                b.btnRequestMentorship.setOnClickListener(v -> navigateTo(ChatFragment.newInstance(menteeName, item.getId())));
            }
            @Override
            public int getLayout() { return R.layout.item_mentor_card_modern; }
        };
        binding.rvMyMentees.setAdapter(adapter);

        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (userId == null || userId == -1L) userId = 1L;

        new MentorshipRequestRepository(requireContext()).getRequestsForMentor(userId).observe(getViewLifecycleOwner(), requests -> {
            if (requests != null && !requests.isEmpty()) {
                List<Long> menteeIds = new ArrayList<>();
                for (MentorshipRequest req : requests) {
                    if ("ACCEPTED".equalsIgnoreCase(req.getStatus())) {
                        menteeIds.add(req.getMenteeId());
                    }
                }
                if (!menteeIds.isEmpty()) {
                    new EmployeeRepository(requireContext()).getAllEmployees().observe(getViewLifecycleOwner(), employees -> {
                        if (employees != null) {
                            menteesList.clear();
                            for (EmployeeResponse emp : employees) {
                                if (menteeIds.contains(emp.getId())) {
                                    menteesList.add(emp);
                                }
                            }
                            if (menteesList.isEmpty()) {
                                binding.tvMenteesTitle.setVisibility(View.GONE);
                                binding.rvMyMentees.setVisibility(View.GONE);
                            } else {
                                binding.tvMenteesTitle.setVisibility(View.VISIBLE);
                                binding.rvMyMentees.setVisibility(View.VISIBLE);
                                adapter.notifyDataSetChanged();
                            }
                        }
                    });
                } else {
                    binding.tvMenteesTitle.setVisibility(View.GONE);
                    binding.rvMyMentees.setVisibility(View.GONE);
                }
            } else {
                binding.tvMenteesTitle.setVisibility(View.GONE);
                binding.rvMyMentees.setVisibility(View.GONE);
            }
        });
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

    private void loadConnectionStatuses() {
        Long myUserId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (myUserId == null || myUserId <= 0) myUserId = 1L;
        MentorshipRequestRepository reqRepo = new MentorshipRequestRepository(requireContext());
        reqRepo.getRequestsForMentee(myUserId).observe(getViewLifecycleOwner(), requests -> {
            if (requests != null) {
                for (MentorshipRequest req : requests) {
                    if (req.getMentorId() != null) {
                        connectionStatusMap.put(req.getMentorId(), req.getStatus());
                    }
                }
                if (recommendedAdapter != null) recommendedAdapter.notifyDataSetChanged();
            }
        });
        reqRepo.getRequestsForMentor(myUserId).observe(getViewLifecycleOwner(), requests -> {
            if (requests != null) {
                for (MentorshipRequest req : requests) {
                    if (req.getMenteeId() != null) {
                        connectionStatusMap.put(req.getMenteeId(), req.getStatus());
                    }
                }
                if (recommendedAdapter != null) recommendedAdapter.notifyDataSetChanged();
            }
        });
    }

    private void setupRecommendedMentors() {
        binding.rvRecommendedMentors.setLayoutManager(new LinearLayoutManager(getContext(), RecyclerView.HORIZONTAL, false));
        List<com.kgap.intel.models.MentorProfileResponse> mentorsList = new ArrayList<>();
        Long myUserId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (myUserId == null || myUserId <= 0) myUserId = 1L;

        recommendedAdapter = new GenericAdapter<com.kgap.intel.models.MentorProfileResponse>(mentorsList) {
            @Override
            public void onBind(View view, com.kgap.intel.models.MentorProfileResponse item) {
                ItemMentorCardModernBinding b = ItemMentorCardModernBinding.bind(view);
                b.tvMentorName.setText(item.getDisplayName());
                b.tvMentorExpertise.setText(item.getExpertise());
                b.tvMentorExperience.setText(item.getExperienceYears() + " Years Experience");
                b.tvMentorRating.setText(item.getRatingFormatted());
                b.tvAvailabilityBadge.setText(item.getAvailability());

                Long targetId = item.getEffectiveMentorId();
                String status = connectionStatusMap.get(targetId);

                if (status != null && "ACCEPTED".equalsIgnoreCase(status)) {
                    b.btnRequestMentorship.setText("💬 Chat");
                    b.btnRequestMentorship.setEnabled(true);
                    b.btnRequestMentorship.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#00B894")));
                    b.btnRequestMentorship.setOnClickListener(v -> navigateTo(ChatFragment.newInstance(item.getDisplayName(), targetId)));
                } else if (status != null && "PENDING".equalsIgnoreCase(status)) {
                    b.btnRequestMentorship.setText("⏳ Pending");
                    b.btnRequestMentorship.setEnabled(false);
                    b.btnRequestMentorship.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#9E9E9E")));
                } else {
                    b.btnRequestMentorship.setText("Connect");
                    b.btnRequestMentorship.setEnabled(true);
                    b.btnRequestMentorship.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#00B894")));
                    b.btnRequestMentorship.setOnClickListener(v -> {
                        MentorshipRequestBottomSheet bottomSheet = MentorshipRequestBottomSheet.newInstance(item.getDisplayName(), targetId);
                        bottomSheet.show(getChildFragmentManager(), "MentorshipRequest");
                    });
                }

                b.btnViewProfile.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), targetId));
                view.setOnClickListener(v -> openMentorProfile(item.getDisplayName(), targetId));
            }
            @Override
            public int getLayout() { return R.layout.item_mentor_card_modern; }
        };
        binding.rvRecommendedMentors.setAdapter(recommendedAdapter);

        new com.kgap.intel.repository.RealMentorRepository(requireContext()).getMentors(myUserId).observe(getViewLifecycleOwner(), response -> {
            if (response != null && !response.isEmpty()) {
                mentorsList.clear();
                mentorsList.addAll(response);
                if (recommendedAdapter != null) recommendedAdapter.notifyDataSetChanged();
            }
        });
    }

    private void openMentorProfile(String mentorName) {
        openMentorProfile(mentorName, null);
    }

    private void openMentorProfile(String mentorName, Long mentorId) {
        navigateTo(MentorProfileFragment.newInstance(mentorName, mentorId));
    }

    private void openMenteeProfile(EmployeeResponse item) {
        if (item == null) return;
        String name = item.getFirstName() + " " + item.getLastName();
        com.kgap.intel.models.ExpertItem expertItem = new com.kgap.intel.models.ExpertItem(
            item.getId(),
            name,
            "Mentee Guidance",
            "Active Mentee",
            item.getDepartment() != null ? item.getDepartment() : "Engineering",
            item.getRole() != null ? item.getRole() : "Software Engineer",
            item.getBio() != null && !item.getBio().isEmpty() ? item.getBio() : "Active mentee receiving technical and domain guidance."
        );
        ExpertProfileBottomSheet bottomSheet = ExpertProfileBottomSheet.newInstance(expertItem);
        bottomSheet.show(getChildFragmentManager(), "MenteeProfile");
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
