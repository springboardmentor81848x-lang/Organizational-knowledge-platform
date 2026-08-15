package com.kgap.intel.fragments;

import android.graphics.Color;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentFindMentorBinding;
import com.kgap.intel.databinding.ItemMentorCardModernBinding;
import com.kgap.intel.databinding.ItemMentorCardSearchBinding;
import java.util.ArrayList;
import java.util.List;

public class FindMentorFragment extends Fragment {
    private FragmentFindMentorBinding binding;

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

        setupRecommendedMentors();
        setupAllMentors();
    }

    private void setupRecommendedMentors() {
        binding.rvRecommendedMentors.setLayoutManager(new LinearLayoutManager(getContext(), RecyclerView.HORIZONTAL, false));
        List<MentorDummy> list = getDummyMentors().subList(0, 3);
        binding.rvRecommendedMentors.setAdapter(new GenericAdapter<MentorDummy>(list) {
            @Override
            public void onBind(View view, MentorDummy item) {
                ItemMentorCardModernBinding b = ItemMentorCardModernBinding.bind(view);
                b.tvMentorName.setText(item.name);
                b.tvMentorExpertise.setText(item.role);
                b.tvMentorExperience.setText(item.experience);
            }
            @Override
            public int getLayout() { return R.layout.item_mentor_card_modern; }
        });
    }

    private void setupAllMentors() {
        binding.rvAllMentors.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvAllMentors.setAdapter(new GenericAdapter<MentorDummy>(getDummyMentors()) {
            @Override
            public void onBind(View view, MentorDummy item) {
                ItemMentorCardSearchBinding b = ItemMentorCardSearchBinding.bind(view);
                b.tvMentorName.setText(item.name);
                b.tvMentorRole.setText(item.role);
                b.tvMentorRating.setText(item.rating);
                b.tvMentorExperience.setText("• " + item.experience);
                b.tvAvailabilityStatus.setText(item.availability);
                if (item.availability.equalsIgnoreCase("Busy")) {
                    b.tvAvailabilityStatus.setBackgroundTintList(android.content.res.ColorStateList.valueOf(Color.parseColor("#FFEBEE")));
                    b.tvAvailabilityStatus.setTextColor(Color.parseColor("#C62828"));
                }

                view.setOnClickListener(v -> {
                    getParentFragmentManager().beginTransaction()
                        .replace(R.id.fragment_container, MentorProfileFragment.newInstance(item.name))
                        .addToBackStack(null)
                        .commit();
                });
            }
            @Override
            public int getLayout() { return R.layout.item_mentor_card_search; }
        });
    }

    private List<MentorDummy> getDummyMentors() {
        List<MentorDummy> list = new ArrayList<>();
        list.add(new MentorDummy("Robert Fox", "Senior DevOps Engineer", "10 Years Exp.", "4.8", "Available"));
        list.add(new MentorDummy("Jane Cooper", "Lead Product Designer", "8 Years Exp.", "5.0", "Available"));
        list.add(new MentorDummy("Michael Chen", "Backend Architect", "15 Years Exp.", "4.9", "Busy"));
        list.add(new MentorDummy("Guy Hawkins", "Cloud Solutions Architect", "12 Years Exp.", "4.7", "Available"));
        list.add(new MentorDummy("Kristin Watson", "ML Engineer", "6 Years Exp.", "4.6", "Available"));
        return list;
    }

    private static class MentorDummy {
        String name, role, experience, rating, availability;
        MentorDummy(String n, String r, String e, String ra, String a) {
            name = n; role = r; experience = e; rating = ra; availability = a;
        }
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
