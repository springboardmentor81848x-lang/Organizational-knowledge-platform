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
import com.kgap.intel.databinding.FragmentMentorProfileBinding;
import com.kgap.intel.databinding.ItemKnowledgeCardBinding;
import com.kgap.intel.databinding.ItemMentorReviewBinding;
import com.kgap.intel.databinding.ItemMentorshipSessionBinding;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;

public class MentorProfileFragment extends Fragment {
    private static final String ARG_MENTOR_NAME = "mentor_name";
    private static final String ARG_MENTOR_ID = "mentor_id";
    private FragmentMentorProfileBinding binding;

    public static MentorProfileFragment newInstance(String mentorName) {
        return newInstance(mentorName, null);
    }

    public static MentorProfileFragment newInstance(String mentorName, Long mentorId) {
        MentorProfileFragment fragment = new MentorProfileFragment();
        Bundle args = new Bundle();
        args.putString(ARG_MENTOR_NAME, mentorName);
        if (mentorId != null) {
            args.putLong(ARG_MENTOR_ID, mentorId);
        }
        fragment.setArguments(args);
        return fragment;
    } 

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorProfileBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String mentorName = "Michael Chen";
        Long mentorId = 16L;
        if (getArguments() != null) {
            mentorName = getArguments().getString(ARG_MENTOR_NAME, "Michael Chen");
            if (getArguments().containsKey(ARG_MENTOR_ID)) {
                mentorId = getArguments().getLong(ARG_MENTOR_ID);
            }
        }
        final String finalMentorName = mentorName;
        final Long finalMentorId = mentorId;
        binding.tvMentorName.setText(finalMentorName);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupExpertise();
        setupResources();
        setupPreviousSessions();
        setupReviews();

        binding.btnMessage.setOnClickListener(v -> {
            getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, ChatFragment.newInstance(finalMentorName, finalMentorId))
                    .addToBackStack(null)
                    .commit();
        });

        Long userId = SharedPrefManager.getInstance(requireContext()).getUserId();
        if (userId == null || userId == -1L) userId = 4L;

        new com.kgap.intel.repository.MentorAssignmentRepository(requireContext()).getCurrentAssignmentForEmployee(userId).observe(getViewLifecycleOwner(), assignment -> {
            if (assignment != null && "ACTIVE".equalsIgnoreCase(assignment.getStatus()) && assignment.getMentorId() != null && assignment.getMentorId().equals(finalMentorId)) {
                binding.btnRequestMentorship.setVisibility(View.GONE);
            } else {
                binding.btnRequestMentorship.setVisibility(View.VISIBLE);
                binding.btnRequestMentorship.setOnClickListener(v -> {
                    MentorshipRequestBottomSheet bottomSheet = MentorshipRequestBottomSheet.newInstance(finalMentorName, finalMentorId);
                    bottomSheet.show(getChildFragmentManager(), "MentorshipRequest");
                });
            }
        });
    }

    private void setupExpertise() {
        String[] skills = {"Python", "System Design", "Microservices", "AWS", "Kubernetes", "Java"};
        for (String skill : skills) {
            Chip chip = new Chip(requireContext());
            chip.setText(skill);
            chip.setChipBackgroundColorResource(R.color.overlay_emerald);
            chip.setTextColor(getResources().getColor(R.color.primary_emerald, null));
            chip.setChipStrokeWidth(0);
            binding.cgExpertise.addView(chip);
        }
    }

    private void setupResources() {
        binding.rvSharedResources.setLayoutManager(new LinearLayoutManager(getContext()));
        List<String> resources = new ArrayList<>();
        resources.add("System Design Interview Cheat Sheet");
        resources.add("Microservices Deployment Guide");
        
        binding.rvSharedResources.setAdapter(new GenericAdapter<String>(resources) {
            @Override
            public void onBind(View view, String item) {
                ItemKnowledgeCardBinding b = ItemKnowledgeCardBinding.bind(view);
                b.tvKnowledgeTitle.setText(item);
                b.tvKnowledgeMeta.setText("Shared by " + binding.tvMentorName.getText());
            }
            @Override
            public int getLayout() { return R.layout.item_knowledge_card; }
        });
    }

    private void setupPreviousSessions() {
        binding.rvPreviousSessions.setLayoutManager(new LinearLayoutManager(getContext()));
        List<String> history = new ArrayList<>();
        history.add("API Gateway Implementation");
        history.add("Database Partitioning Strategies");

        binding.rvPreviousSessions.setAdapter(new GenericAdapter<String>(history) {
            @Override
            public void onBind(View view, String item) {
                ItemMentorshipSessionBinding b = ItemMentorshipSessionBinding.bind(view);
                b.tvSessionTitle.setText(item);
                b.tvSessionDate.setText("04\nJUL");
            }
            @Override
            public int getLayout() { return R.layout.item_mentorship_session; }
        });
    }

    private void setupReviews() {
        binding.rvMentorReviews.setLayoutManager(new LinearLayoutManager(getContext()));
        List<String> reviewers = new ArrayList<>();
        reviewers.add("Alex Rivera");
        reviewers.add("Priya Sharma");

        binding.rvMentorReviews.setAdapter(new GenericAdapter<String>(reviewers) {
            @Override
            public void onBind(View view, String item) {
                ItemMentorReviewBinding b = ItemMentorReviewBinding.bind(view);
                b.tvReviewerName.setText(item);
            }
            @Override
            public int getLayout() { return R.layout.item_mentor_review; }
        });
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
