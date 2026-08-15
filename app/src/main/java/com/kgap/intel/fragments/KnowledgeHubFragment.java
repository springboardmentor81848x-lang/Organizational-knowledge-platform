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
import com.kgap.intel.databinding.FragmentKnowledgeHubBinding;
import com.kgap.intel.databinding.ItemKnowledgeResourceCardBinding;
import java.util.ArrayList;
import java.util.List;

public class KnowledgeHubFragment extends Fragment {
    private FragmentKnowledgeHubBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentKnowledgeHubBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupList();

        binding.fabShare.setOnClickListener(v -> Toast.makeText(getContext(), "Opening Share Knowledge form...", Toast.LENGTH_SHORT).show());
    }

    private void setupList() {
        binding.rvResources.setLayoutManager(new LinearLayoutManager(getContext()));
        List<ResourceMock> list = new ArrayList<>();
        list.add(new ResourceMock("Scaling Microservices with Kafka", "Michael Chen", "Architecture", "Master event-driven architecture using Kafka for scale.", "1.2k", "450"));
        list.add(new ResourceMock("Modern Android UI with Jetpack Compose", "Robert Fox", "Frontend", "Building declarative UIs using the latest Android toolset.", "3.4k", "890"));
        list.add(new ResourceMock("Securing Cloud Infrastructure", "Jane Cooper", "Cloud", "Best practices for AWS and Azure security configurations.", "890", "120"));
        list.add(new ResourceMock("System Design Cheat Sheet", "Guy Hawkins", "System Design", "A quick reference for common system design patterns.", "5.6k", "2.1k"));

        binding.rvResources.setAdapter(new ResourceAdapter(list));
    }

    private static class ResourceMock {
        String title, author, category, description, views, likes;
        ResourceMock(String t, String a, String c, String d, String v, String l) {
            title = t; author = a; category = c; description = d; views = v; likes = l;
        }
    }

    private class ResourceAdapter extends RecyclerView.Adapter<ResourceAdapter.ViewHolder> {
        private final List<ResourceMock> list;
        ResourceAdapter(List<ResourceMock> list) { this.list = list; }

        @NonNull @Override public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemKnowledgeResourceCardBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }

        @Override public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            ResourceMock item = list.get(pos);
            h.b.tvResourceTitle.setText(item.title);
            h.b.tvResourceAuthor.setText("by " + item.author);
            h.b.tvResourceCategory.setText(item.category);
            h.b.tvResourceDescription.setText(item.description);
            h.b.tvResourceViews.setText(item.views);
            h.b.tvResourceLikes.setText(item.likes);
            
            h.b.btnBookmark.setOnClickListener(v -> Toast.makeText(getContext(), "Resource bookmarked!", Toast.LENGTH_SHORT).show());
            h.b.btnReadMore.setOnClickListener(v -> {
                getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, KnowledgeResourceDetailsFragment.newInstance(item.title))
                    .addToBackStack(null)
                    .commit();
            });
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
