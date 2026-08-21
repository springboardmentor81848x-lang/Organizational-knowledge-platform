package com.kgap.intel.fragments;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
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
import com.kgap.intel.databinding.FragmentExpertDirectoryBinding;
import com.kgap.intel.databinding.ItemExpertCardBinding;
import com.kgap.intel.models.ExpertItem;
import com.kgap.intel.repository.ExpertRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class ExpertDirectoryFragment extends Fragment {
    private FragmentExpertDirectoryBinding binding;
    private ExpertRepository repository;
    private final List<ExpertItem> allExperts = new ArrayList<>();
    private final List<ExpertItem> displayedExperts = new ArrayList<>();
    private ExpertAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentExpertDirectoryBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        repository = new ExpertRepository(requireContext());

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupRecyclerView();
        setupSearchAndFilters();
        loadExperts();
    }

    private void setupRecyclerView() {
        binding.rvExperts.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new ExpertAdapter(displayedExperts);
        binding.rvExperts.setAdapter(adapter);
    }

    private void setupSearchAndFilters() {
        binding.etSearchExperts.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterAndSort();
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        binding.cgFilters.setOnCheckedStateChangeListener((group, checkedIds) -> filterAndSort());
    }

    private void loadExperts() {
        binding.progressBar.setVisibility(View.VISIBLE);
        binding.tvEmptyState.setVisibility(View.GONE);

        repository.getExperts().observe(getViewLifecycleOwner(), experts -> {
            binding.progressBar.setVisibility(View.GONE);
            if (experts != null) {
                allExperts.clear();
                allExperts.addAll(experts);
                filterAndSort();
            } else {
                Toast.makeText(getContext(), "Failed to load experts from backend", Toast.LENGTH_SHORT).show();
                binding.tvEmptyState.setVisibility(View.VISIBLE);
            }
        });
    }

    private void filterAndSort() {
        String query = "";
        if (binding.etSearchExperts.getText() != null) {
            query = binding.etSearchExperts.getText().toString().toLowerCase().trim();
        }
        final String finalQuery = query;
        int checkedId = binding.cgFilters.getCheckedChipId();

        List<ExpertItem> filtered = allExperts.stream()
                .filter(e -> e.getExpertName().toLowerCase().contains(finalQuery) ||
                        e.getSkillName().toLowerCase().contains(finalQuery) ||
                        e.getDepartment().toLowerCase().contains(finalQuery) ||
                        e.getProficiency().toLowerCase().contains(finalQuery) ||
                        e.getRole().toLowerCase().contains(finalQuery))
                .collect(Collectors.toList());

        if (checkedId == R.id.chip_expert_level) {
            filtered = filtered.stream()
                    .filter(e -> "EXPERT".equalsIgnoreCase(e.getProficiency()))
                    .collect(Collectors.toList());
        } else if (checkedId == R.id.chip_advanced_level) {
            filtered = filtered.stream()
                    .filter(e -> "ADVANCED".equalsIgnoreCase(e.getProficiency()))
                    .collect(Collectors.toList());
        } else if (checkedId == R.id.chip_backend_dept) {
            filtered = filtered.stream()
                    .filter(e -> e.getDepartment().toLowerCase().contains("backend"))
                    .collect(Collectors.toList());
        } else if (checkedId == R.id.chip_data_dept) {
            filtered = filtered.stream()
                    .filter(e -> e.getDepartment().toLowerCase().contains("data"))
                    .collect(Collectors.toList());
        }

        displayedExperts.clear();
        displayedExperts.addAll(filtered);
        adapter.notifyDataSetChanged();

        binding.tvEmptyState.setVisibility(displayedExperts.isEmpty() ? View.VISIBLE : View.GONE);
    }

    private void openExpertProfile(ExpertItem expert) {
        ExpertProfileBottomSheet bottomSheet = ExpertProfileBottomSheet.newInstance(expert);
        bottomSheet.show(getChildFragmentManager(), "ExpertProfile");
    }

    private class ExpertAdapter extends RecyclerView.Adapter<RecyclerView.ViewHolder> {
        private final List<ExpertItem> list;
        ExpertAdapter(List<ExpertItem> list) { this.list = list; }

        @NonNull @Override public RecyclerView.ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new RecyclerView.ViewHolder(ItemExpertCardBinding.inflate(LayoutInflater.from(p.getContext()), p, false).getRoot()) {};
        }

        @Override public void onBindViewHolder(@NonNull RecyclerView.ViewHolder h, int pos) {
            ExpertItem item = list.get(pos);
            ItemExpertCardBinding b = ItemExpertCardBinding.bind(h.itemView);

            b.tvExpertName.setText(item.getExpertName());
            b.tvExpertDepartment.setText(item.getDepartment());
            b.tvExpertSkill.setText(item.getSkillName());
            b.tvProficiencyBadge.setText(item.getProficiency());

            b.btnViewProfile.setOnClickListener(v -> openExpertProfile(item));
            h.itemView.setOnClickListener(v -> openExpertProfile(item));
        }

        @Override public int getItemCount() { return list.size(); }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
