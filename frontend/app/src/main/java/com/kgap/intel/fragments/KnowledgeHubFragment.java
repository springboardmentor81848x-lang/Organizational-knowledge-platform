package com.kgap.intel.fragments;

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
import com.google.android.material.chip.Chip;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentKnowledgeHubBinding;
import com.kgap.intel.databinding.ItemKnowledgeResourceCardBinding;
import com.kgap.intel.models.KnowledgeSession;
import com.kgap.intel.repository.KnowledgeSessionRepository;
import java.util.ArrayList;
import java.util.List;

public class KnowledgeHubFragment extends Fragment {
    private static final String ARG_OPEN_SESSIONS = "open_sessions";
    private FragmentKnowledgeHubBinding binding;
    private KnowledgeSessionRepository repository;
    private List<ResourceMock> mockList;
    private final List<HubItem> displayedList = new ArrayList<>();
    private ResourceAdapter adapter;

    public static KnowledgeHubFragment newInstance(boolean openSessionsTab) {
        KnowledgeHubFragment fragment = new KnowledgeHubFragment();
        Bundle args = new Bundle();
        args.putBoolean(ARG_OPEN_SESSIONS, openSessionsTab);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentKnowledgeHubBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        repository = new KnowledgeSessionRepository(requireContext());
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupMockData();
        setupList();

        binding.cgCategories.setOnCheckedStateChangeListener((group, checkedIds) -> filterAndDisplay());
        binding.tabLayout.addOnTabSelectedListener(new com.google.android.material.tabs.TabLayout.OnTabSelectedListener() {
            @Override
            public void onTabSelected(com.google.android.material.tabs.TabLayout.Tab tab) {
                boolean isSessions = tab.getPosition() == 5;
                
                binding.chipAll.setVisibility(isSessions ? View.GONE : View.VISIBLE);
                binding.chipSystemDesign.setVisibility(isSessions ? View.GONE : View.VISIBLE);
                binding.chipArchitecture.setVisibility(isSessions ? View.GONE : View.VISIBLE);
                binding.chipCloud.setVisibility(isSessions ? View.GONE : View.VISIBLE);
                binding.chipFrontend.setVisibility(isSessions ? View.GONE : View.VISIBLE);
                
                binding.chipSessionAll.setVisibility(isSessions ? View.VISIBLE : View.GONE);
                binding.chipSessionRegistered.setVisibility(isSessions ? View.VISIBLE : View.GONE);
                binding.chipSessionUpcoming.setVisibility(isSessions ? View.VISIBLE : View.GONE);
                binding.chipSessionCompleted.setVisibility(isSessions ? View.VISIBLE : View.GONE);

                if (isSessions) {
                    binding.chipSessionAll.setChecked(true);
                } else {
                    binding.chipAll.setChecked(true);
                }
                
                filterAndDisplay();
            }
            @Override
            public void onTabUnselected(com.google.android.material.tabs.TabLayout.Tab tab) {}
            @Override
            public void onTabReselected(com.google.android.material.tabs.TabLayout.Tab tab) {}
        });

        binding.fabShare.setOnClickListener(v -> Toast.makeText(getContext(), "Opening Share Knowledge form...", Toast.LENGTH_SHORT).show());
        
        // Initial load
        boolean openSessions = getArguments() != null && getArguments().getBoolean(ARG_OPEN_SESSIONS, false);
        if (openSessions) {
            binding.tabLayout.post(() -> {
                com.google.android.material.tabs.TabLayout.Tab tab = binding.tabLayout.getTabAt(5);
                if (tab != null) {
                    tab.select();
                }
            });
        } else {
            filterAndDisplay();
        }
    }

    private void setupMockData() {
        mockList = new ArrayList<>();
        com.kgap.intel.api.ApiClient.getTrainingApiService(requireContext()).getAllCourses().enqueue(new retrofit2.Callback<List<com.kgap.intel.models.ExternalCourse>>() {
            @Override
            public void onResponse(retrofit2.Call<List<com.kgap.intel.models.ExternalCourse>> call, retrofit2.Response<List<com.kgap.intel.models.ExternalCourse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (com.kgap.intel.models.ExternalCourse c : response.body()) {
                        String author = c.getProvider() != null ? c.getProvider() : "L&D System";
                        String category = c.getSkillName() != null ? c.getSkillName() : "General";
                        String views = (c.getDurationHours() != null ? c.getDurationHours() : 10) + "h";
                        String likes = c.getLevel() != null ? c.getLevel() : "Intermediate";
                        String type = "Articles";
                        if (category.toLowerCase().contains("frontend") || category.toLowerCase().contains("ui")) type = "Videos";
                        else if (category.toLowerCase().contains("cloud") || category.toLowerCase().contains("security")) type = "PDFs";
                        else if (category.toLowerCase().contains("api") || category.toLowerCase().contains("design")) type = "Tutorials";

                        mockList.add(new ResourceMock(c.getTitle(), author, category, c.getDescription(), views, likes, type));
                    }
                    filterAndDisplay();
                }
            }

            @Override
            public void onFailure(retrofit2.Call<List<com.kgap.intel.models.ExternalCourse>> call, Throwable t) {
                filterAndDisplay();
            }
        });
    }

    private void setupList() {
        binding.rvResources.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new ResourceAdapter(displayedList);
        binding.rvResources.setAdapter(adapter);
    }

    private void filterAndDisplay() {
        // Find selected category
        String selectedCategory = "All";
        int checkedId = binding.cgCategories.getCheckedChipId();
        if (checkedId != View.NO_ID) {
            Chip chip = binding.cgCategories.findViewById(checkedId);
            if (chip != null) {
                selectedCategory = chip.getText().toString();
            }
        }

        // Find selected tab
        int tabPosition = binding.tabLayout.getSelectedTabPosition();
        String selectedTab = "Articles";
        switch (tabPosition) {
            case 0: selectedTab = "Articles"; break;
            case 1: selectedTab = "Videos"; break;
            case 2: selectedTab = "PDFs"; break;
            case 3: selectedTab = "Tutorials"; break;
            case 4: selectedTab = "Shared"; break;
            case 5: selectedTab = "Sessions"; break;
        }

        displayedList.clear();
        adapter.notifyDataSetChanged();

        if ("Sessions".equalsIgnoreCase(selectedTab)) {
            // Load real sessions from backend database
            binding.progressBar.setVisibility(View.VISIBLE);
            Long employeeId = com.kgap.intel.utils.SharedPrefManager.getInstance(requireContext()).getUserId();
            final String categoryFilter = selectedCategory;
            
            // First get user registrations to check registered status
            repository.getUserRegistrations(employeeId).observe(getViewLifecycleOwner(), registrations -> {
                repository.getAllSessions().observe(getViewLifecycleOwner(), sessions -> {
                    binding.progressBar.setVisibility(View.GONE);
                    displayedList.clear();
                    if (sessions != null) {
                        java.util.HashSet<Long> registeredSessionIds = new java.util.HashSet<>();
                        if (registrations != null) {
                            for (com.kgap.intel.models.KnowledgeSessionRegistration reg : registrations) {
                                if (!"CANCELLED".equalsIgnoreCase(reg.getStatus())) {
                                    registeredSessionIds.add(reg.getSessionId());
                                }
                            }
                        }

                        // Determine filter chip flags
                        int selectedChipId = binding.cgCategories.getCheckedChipId();
                        boolean filterRegistered = selectedChipId == R.id.chip_session_registered;
                        boolean filterUpcoming = selectedChipId == R.id.chip_session_upcoming;
                        boolean filterCompleted = selectedChipId == R.id.chip_session_completed;

                        for (KnowledgeSession s : sessions) {
                            boolean isRegistered = registeredSessionIds.contains(s.getId());
                            boolean isCompleted = "COMPLETED".equalsIgnoreCase(s.getStatus());
                            boolean isUpcoming = !isCompleted && !"CANCELLED".equalsIgnoreCase(s.getStatus());

                            boolean matchesFilter = true;
                            if (filterRegistered && !isRegistered) matchesFilter = false;
                            if (filterUpcoming && !isUpcoming) matchesFilter = false;
                            if (filterCompleted && !isCompleted) matchesFilter = false;

                            if (matchesFilter) {
                                displayedList.add(new HubItem(s, isRegistered));
                            }
                        }
                    }
                    adapter.notifyDataSetChanged();
                });
            });
        } else {
            // Display filtered mock resources
            binding.progressBar.setVisibility(View.GONE);
            for (ResourceMock res : mockList) {
                boolean matchesCategory = "All".equalsIgnoreCase(selectedCategory) || selectedCategory.equalsIgnoreCase(res.category);
                boolean matchesType = selectedTab.equalsIgnoreCase(res.type);
                if (matchesCategory && matchesType) {
                    displayedList.add(new HubItem(res));
                }
            }
            adapter.notifyDataSetChanged();
        }
    }

    private static class ResourceMock {
        String title, author, category, description, views, likes, type;
        ResourceMock(String t, String a, String c, String d, String v, String l, String type) {
            title = t; author = a; category = c; description = d; views = v; likes = l; this.type = type;
        }
    }

    private static class HubItem {
        boolean isSession;
        ResourceMock resource;
        KnowledgeSession session;
        boolean isRegistered;

        HubItem(ResourceMock r) {
            this.isSession = false;
            this.resource = r;
        }

        HubItem(KnowledgeSession s, boolean isRegistered) {
            this.isSession = true;
            this.session = s;
            this.isRegistered = isRegistered;
        }
    }

    private class ResourceAdapter extends RecyclerView.Adapter<ResourceAdapter.ViewHolder> {
        private final List<HubItem> list;
        ResourceAdapter(List<HubItem> list) { this.list = list; }

        @NonNull @Override public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemKnowledgeResourceCardBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }

        @Override public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            HubItem item = list.get(pos);
            if (!item.isSession) {
                ResourceMock res = item.resource;
                h.b.tvResourceTitle.setText(res.title);
                h.b.tvResourceAuthor.setText("by " + res.author);
                h.b.tvResourceCategory.setText(res.category);
                h.b.tvResourceDescription.setText(res.description);
                h.b.tvResourceViews.setText(res.views);
                h.b.tvResourceLikes.setText(res.likes);
                h.b.btnReadMore.setText("Read More");
                h.b.btnBookmark.setVisibility(View.VISIBLE);
                
                h.b.btnBookmark.setOnClickListener(v -> Toast.makeText(getContext(), "Resource bookmarked!", Toast.LENGTH_SHORT).show());
                h.b.btnReadMore.setOnClickListener(v -> {
                    getParentFragmentManager().beginTransaction()
                        .replace(R.id.fragment_container, KnowledgeResourceDetailsFragment.newInstance(res.title))
                        .addToBackStack(null)
                        .commit();
                });
            } else {
                KnowledgeSession s = item.session;
                h.b.tvResourceTitle.setText(s.getTitle());
                h.b.tvResourceAuthor.setText("by Employee ID: " + s.getCreatedByEmployeeId());
                h.b.tvResourceCategory.setText(s.getTopic());
                h.b.tvResourceDescription.setText(s.getDescription());
                
                String scheduled = s.getScheduledAt();
                String dateStr = scheduled != null && scheduled.contains("T") ? scheduled.split("T")[0] : scheduled;
                h.b.tvResourceViews.setText(dateStr != null ? dateStr : "N/A");
                
                if ("COMPLETED".equalsIgnoreCase(s.getStatus())) {
                    h.b.tvResourceLikes.setText("Completed");
                } else if (item.isRegistered) {
                    h.b.tvResourceLikes.setText("Registered");
                } else {
                    h.b.tvResourceLikes.setText(s.getStatus() != null ? s.getStatus() : "SCHEDULED");
                }
                
                h.b.btnBookmark.setVisibility(View.GONE);
                h.b.btnReadMore.setText("Register / Details");
                h.b.btnReadMore.setOnClickListener(v -> {
                    getParentFragmentManager().beginTransaction()
                        .replace(R.id.fragment_container, KnowledgeSessionDetailsFragment.newInstance(s))
                        .addToBackStack(null)
                        .commit();
                });
            }
        }

        @Override public int getItemCount() { return list.size(); }

        class ViewHolder extends RecyclerView.ViewHolder {
            final ItemKnowledgeResourceCardBinding b;
            ViewHolder(ItemKnowledgeResourceCardBinding b) { super(b.getRoot()); this.b = b; }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
