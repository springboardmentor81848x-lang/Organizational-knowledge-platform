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
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentKnowledgeResourceDetailsBinding;
import com.kgap.intel.databinding.ItemKnowledgeCommentBinding;
import com.kgap.intel.databinding.ItemKnowledgeResourceCardBinding;
import java.util.ArrayList;
import java.util.List;

public class KnowledgeResourceDetailsFragment extends Fragment {
    private static final String ARG_TITLE = "title";
    private FragmentKnowledgeResourceDetailsBinding binding;

    public static KnowledgeResourceDetailsFragment newInstance(String title) {
        KnowledgeResourceDetailsFragment fragment = new KnowledgeResourceDetailsFragment();
        Bundle args = new Bundle();
        args.putString(ARG_TITLE, title);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentKnowledgeResourceDetailsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        String title = getArguments() != null ? getArguments().getString(ARG_TITLE) : "Scaling Microservices with Kafka";
        binding.tvTitle.setText(title);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupRelatedResources();
        setupComments();

        binding.btnAction.setOnClickListener(v -> Toast.makeText(getContext(), "Opening full resource content...", Toast.LENGTH_SHORT).show());
        binding.btnShare.setOnClickListener(v -> Toast.makeText(getContext(), "Sharing resource...", Toast.LENGTH_SHORT).show());
        binding.btnBookmark.setOnClickListener(v -> Toast.makeText(getContext(), "Resource bookmarked!", Toast.LENGTH_SHORT).show());
    }

    private void setupRelatedResources() {
        binding.rvRelatedResources.setLayoutManager(new LinearLayoutManager(getContext(), RecyclerView.HORIZONTAL, false));
        List<String> related = new ArrayList<>();
        related.add("Event-Driven Architecture Guide");
        related.add("Microservices Monitoring");

        binding.rvRelatedResources.setAdapter(new GenericAdapter<String>(related) {
            @Override
            public void onBind(View view, String item) {
                ItemKnowledgeResourceCardBinding b = ItemKnowledgeResourceCardBinding.bind(view);
                b.tvResourceTitle.setText(item);
                b.tvResourceCategory.setText("Architecture");
                // Resize for horizontal list if needed or use a different layout
                ViewGroup.LayoutParams params = view.getLayoutParams();
                params.width = 700;
                view.setLayoutParams(params);
            }
            @Override
            public int getLayout() { return R.layout.item_knowledge_resource_card; }
        });
    }

    private void setupComments() {
        binding.rvComments.setLayoutManager(new LinearLayoutManager(getContext()));
        List<String> comments = new ArrayList<>();
        comments.add("Great explanation of partitioning!");
        comments.add("Can you share some code examples?");

        binding.rvComments.setAdapter(new GenericAdapter<String>(comments) {
            @Override
            public void onBind(View view, String item) {
                ItemKnowledgeCommentBinding b = ItemKnowledgeCommentBinding.bind(view);
                b.tvCommentText.setText(item);
            }
            @Override
            public int getLayout() { return R.layout.item_knowledge_comment; }
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
