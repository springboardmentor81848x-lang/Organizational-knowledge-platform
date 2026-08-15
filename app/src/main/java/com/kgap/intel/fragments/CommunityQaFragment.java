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
import com.kgap.intel.databinding.FragmentCommunityQaBinding;
import com.kgap.intel.databinding.ItemQaQuestionCardBinding;
import java.util.ArrayList;
import java.util.List;

public class CommunityQaFragment extends Fragment {
    private FragmentCommunityQaBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentCommunityQaBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupList();

        binding.fabAskQuestion.setOnClickListener(v -> Toast.makeText(getContext(), "Opening Ask Question screen...", Toast.LENGTH_SHORT).show());
    }

    private void setupList() {
        binding.rvQuestions.setLayoutManager(new LinearLayoutManager(getContext()));
        List<QuestionMock> list = new ArrayList<>();
        list.add(new QuestionMock("How to properly handle database migrations in a production Spring Boot app?", "Aarav S.", 24, 3, "Spring Boot", "Database"));
        list.add(new QuestionMock("What is the difference between useEffect and useLayoutEffect in React?", "Rohan G.", 15, 2, "React", "Frontend"));
        list.add(new QuestionMock("Best way to secure internal REST APIs with JWT?", "Neha S.", 42, 5, "Security", "Backend"));

        binding.rvQuestions.setAdapter(new QuestionAdapter(list));
    }

    private static class QuestionMock {
        String title, author, category, tag;
        int votes, answers;
        QuestionMock(String t, String a, int v, int ans, String c, String tg) {
            title = t; author = a; votes = v; answers = ans; category = c; tag = tg;
        }
    }

    private class QuestionAdapter extends RecyclerView.Adapter<QuestionAdapter.ViewHolder> {
        private final List<QuestionMock> list;
        QuestionAdapter(List<QuestionMock> list) { this.list = list; }

        @NonNull @Override public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemQaQuestionCardBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }

        @Override public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            QuestionMock item = list.get(pos);
            h.b.tvQuestionTitle.setText(item.title);
            h.b.tvAuthor.setText("by " + item.author);
            h.b.tvVotes.setText(String.valueOf(item.votes));
            h.b.tvAnswersCount.setText(String.valueOf(item.answers));

            h.b.cgQuestionTags.removeAllViews();
            addTag(h.b.cgQuestionTags, item.category);
            addTag(h.b.cgQuestionTags, item.tag);

            h.itemView.setOnClickListener(v -> {
                getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, QaDetailsFragment.newInstance(item.title))
                    .addToBackStack(null)
                    .commit();
            });
        }

        private void addTag(ViewGroup group, String text) {
            Chip chip = new Chip(requireContext());
            chip.setText(text);
            chip.setChipMinHeight(24);
            chip.setTextSize(10);
            group.addView(chip);
        }

        @Override public int getItemCount() { return list.size(); }

        class ViewHolder extends RecyclerView.ViewHolder {
            final ItemQaQuestionCardBinding b;
            ViewHolder(ItemQaQuestionCardBinding b) { super(b.getRoot()); this.b = b; }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
