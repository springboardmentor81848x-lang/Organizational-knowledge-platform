package com.kgap.intel.fragments;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.kgap.intel.R;
import com.kgap.intel.adapters.SkillsAdapter;
import com.kgap.intel.databinding.FragmentSkillsBinding;
import com.kgap.intel.databinding.LayoutAddSkillBottomSheetBinding;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.viewmodel.SkillsViewModel;
import java.util.List;

public class SkillsFragment extends Fragment {
    private FragmentSkillsBinding binding;
    private SkillsViewModel viewModel;
    private SkillsAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentSkillsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(SkillsViewModel.class);

        setupRecyclerView();
        observeViewModel();
        setupListeners();
        
        viewModel.loadData();
    }

    private void setupRecyclerView() {
        adapter = new SkillsAdapter();
        binding.rvSkillsInventory.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvSkillsInventory.setAdapter(adapter);
    }

    private void observeViewModel() {
        viewModel.getSkills().observe(getViewLifecycleOwner(), skills -> {
            if (skills != null && !skills.isEmpty()) {
                adapter.submitList(skills);
                binding.layoutEmptySkills.setVisibility(View.GONE);
                binding.rvSkillsInventory.setVisibility(View.VISIBLE);
                updateHeaderStats(skills);
            } else {
                adapter.submitList(null);
                binding.layoutEmptySkills.setVisibility(View.VISIBLE);
                binding.rvSkillsInventory.setVisibility(View.GONE);
                updateHeaderStats(null);
            }
        });
    }

    private void updateHeaderStats(List<SkillItem> skills) {
        if (skills != null && !skills.isEmpty()) {
            binding.tvTotalSkills.setText(String.valueOf(skills.size()));
            int totalProf = 0;
            for (SkillItem s : skills) totalProf += s.getProficiency();
            binding.tvAvgLevel.setText((totalProf / skills.size()) + "%");
        } else {
            binding.tvTotalSkills.setText("0");
            binding.tvAvgLevel.setText("0%");
        }
    }

    private void setupListeners() {
        // FAB Listener
        binding.fabAddNewSkill.setOnClickListener(v -> showAddSkillBottomSheet());

        // Search Listener
        binding.etSearchSkills.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                viewModel.setSearchQuery(s.toString());
            }
            @Override
            public void afterTextChanged(Editable s) {}
        });

        // Category Filter Listener
        binding.chipGroupCategories.setOnCheckedStateChangeListener((group, checkedIds) -> {
            if (checkedIds.isEmpty()) {
                viewModel.setCategoryFilter("All");
                return;
            }
            
            int id = checkedIds.get(0);
            String category = "All";
            
            if (id == R.id.chip_all) category = "All";
            else if (id == R.id.chip_technical) category = "Technical";
            else if (id == R.id.chip_soft_skills) category = "Soft Skill";
            else if (id == R.id.chip_tools) category = "Tools";
            else if (id == R.id.chip_languages) category = "Language";
            else if (id == R.id.chip_others) category = "Others";
            
            viewModel.setCategoryFilter(category);
        });
    }

    private void showAddSkillBottomSheet() {
        BottomSheetDialog dialog = new BottomSheetDialog(requireContext());
        LayoutAddSkillBottomSheetBinding bsBinding = LayoutAddSkillBottomSheetBinding.inflate(getLayoutInflater());
        dialog.setContentView(bsBinding.getRoot());

        String[] categories = {"Technical", "Soft Skill", "Tools", "Language", "Others"};
        ArrayAdapter<String> catAdapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, categories);
        bsBinding.actBsCategory.setAdapter(catAdapter);
        
        // Ensure dropdown opens on click
        bsBinding.actBsCategory.setOnClickListener(v -> bsBinding.actBsCategory.showDropDown());

        bsBinding.btnBsSave.setOnClickListener(v -> {
            String name = bsBinding.etBsSkillName.getText() != null ? bsBinding.etBsSkillName.getText().toString().trim() : "";
            String category = bsBinding.actBsCategory.getText().toString();
            int proficiency = (int) bsBinding.sliderProficiency.getValue();

            if (name.isEmpty()) {
                bsBinding.etBsSkillName.setError("Skill name required");
                return;
            }
            
            if (category.isEmpty() || category.equals("Category")) {
                Toast.makeText(getContext(), "Please select a category", Toast.LENGTH_SHORT).show();
                return;
            }

            viewModel.addSkill(name, category, proficiency);
            Toast.makeText(getContext(), name + " added to inventory!", Toast.LENGTH_SHORT).show();
            dialog.dismiss();
        });

        dialog.show();
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
