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
import com.kgap.intel.databinding.FragmentQaDetailsBinding;
import com.kgap.intel.databinding.ItemQaAnswerCardBinding;
import java.util.ArrayList;
import java.util.List;

public class QaDetailsFragment extends Fragment {
    private static final String ARG_TITLE = "title";
    private FragmentQaDetailsBinding binding;

    public static QaDetailsFragment newInstance(String title) {
        QaDetailsFragment fragment = new QaDetailsFragment();
        Bundle args = new Bundle();
        args.putString(ARG_TITLE, title);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentQaDetailsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String title = getArguments() != null ? getArguments().getString(ARG_TITLE) : "Question Details";
        binding.tvDetailTitle.setText(title);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupTags();
        setupAnswers();

        binding.btnPostAnswer.setOnClickListener(v -> Toast.makeText(getContext(), "Opening Post Answer screen...", Toast.LENGTH_SHORT).show());
    }

    private void setupTags() {
        String[] tags = {"Spring Boot", "Database", "Backend"};
        for (String tag : tags) {
            Chip chip = new Chip(requireContext());
            chip.setText(tag);
            chip.setChipMinHeight(24);
            chip.setTextSize(10);
            binding.cgDetailTags.addView(chip);
        }
    }

    private void setupAnswers() {
        binding.rvAnswers.setLayoutManager(new LinearLayoutManager(getContext()));
        List<AnswerMock> list = new ArrayList<>();
        list.add(new AnswerMock("Michael Chen", "I recommend using Liquibase or Flyway. These tools help you keep track of all changes in your DB schema.", 12, true));
        list.add(new AnswerMock("Jane Cooper", "Flyway is simpler to set up, but Liquibase offers more complex migration scenarios.", 8, false));

        binding.rvAnswers.setAdapter(new AnswerAdapter(list));
    }

    private static class AnswerMock {
        String author, body;
        int votes;
        boolean accepted;
        AnswerMock(String a, String b, int v, boolean acc) {
            author = a; body = b; votes = v; accepted = acc;
        }
    }

    private class AnswerAdapter extends RecyclerView.Adapter<AnswerAdapter.ViewHolder> {
        private final List<AnswerMock> list;
        AnswerAdapter(List<AnswerMock> list) { this.list = list; }

        @NonNull @Override public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemQaAnswerCardBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }

        @Override public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            AnswerMock item = list.get(pos);
            h.b.tvAuthorName.setText(item.author);
            h.b.tvAnswerText.setText(item.body);
            h.b.tvAnswerVotes.setText(String.valueOf(item.votes));
            h.b.ivAcceptedCheck.setVisibility(item.accepted ? View.VISIBLE : View.GONE);
            
            h.b.btnUpvote.setOnClickListener(v -> Toast.makeText(getContext(), "Upvoted!", Toast.LENGTH_SHORT).show());
            h.b.btnDownvote.setOnClickListener(v -> Toast.makeText(getContext(), "Downvoted!", Toast.LENGTH_SHORT).show());
            h.b.btnReply.setOnClickListener(v -> Toast.makeText(getContext(), "Opening reply...", Toast.LENGTH_SHORT).show());
        }

        @Override public int getItemCount() { return list.size(); }

        class ViewHolder extends RecyclerView.ViewHolder {
            final ItemQaAnswerCardBinding b;
            ViewHolder(ItemQaAnswerCardBinding b) { super(b.getRoot()); this.b = b; }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
