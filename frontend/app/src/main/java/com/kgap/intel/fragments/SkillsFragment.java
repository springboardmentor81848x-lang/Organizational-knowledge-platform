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
import java.util.ArrayList;
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
        adapter.setOnSkillActionListener(new SkillsAdapter.OnSkillActionListener() {
            @Override
            public void onDelete(SkillItem item) {
                new com.google.android.material.dialog.MaterialAlertDialogBuilder(requireContext())
                    .setTitle("Delete Skill")
                    .setMessage("Are you sure you want to remove " + item.getName() + " from your inventory?")
                    .setPositiveButton("Delete", (dialog, which) -> {
                        viewModel.deleteSkill(item);
                        Toast.makeText(getContext(), item.getName() + " removed", Toast.LENGTH_SHORT).show();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
            }

            @Override
            public void onTakeAssessment(SkillItem item) {
                getParentFragmentManager().beginTransaction()
                    .replace(R.id.fragment_container, SkillAssessmentFragment.newInstance(item.getId(), item.getName()))
                    .addToBackStack(null)
                    .commit();
            }
        });
        binding.rvSkillsInventory.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvSkillsInventory.setAdapter(adapter);
    }

    @Override
    public void onResume() {
        super.onResume();
        if (viewModel != null) {
            // Small delay to ensure backend has finished processing the submission
            new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
                if (isAdded()) {
                    viewModel.loadData();
                }
            }, 500);
        }
    }

    private void observeViewModel() {
        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            // Optional: Show a loading state in the UI if needed
        });

        viewModel.getSkills().observe(getViewLifecycleOwner(), skills -> {
            if (skills != null && !skills.isEmpty()) {
                android.util.Log.d("SkillsFragment", "UI Update: Received " + skills.size() + " skills");
                for (SkillItem s : skills) {
                    android.util.Log.d("SkillsFragment", "UI Skill: " + s.getName() + " -> " + s.getProficiency() + "% (" + s.getLevel() + ")");
                }
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
            long totalProf = 0;
            for (SkillItem s : skills) {
                totalProf += s.getProficiency();
            }
            binding.tvAvgLevel.setText((totalProf / skills.size()) + "%");
        } else {
            binding.tvTotalSkills.setText("0");
            binding.tvAvgLevel.setText("0%");
        }
    }

    private void setupListeners() {
        binding.toolbar.setNavigationOnClickListener(v -> {
            if (getParentFragmentManager().getBackStackEntryCount() > 0) {
                getParentFragmentManager().popBackStack();
            }
        });

        binding.fabAddNewSkill.setOnClickListener(v -> showAddSkillBottomSheet());

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

        binding.chipGroupCategories.setOnCheckedStateChangeListener((group, checkedIds) -> {
            int id = checkedIds.isEmpty() ? -1 : checkedIds.get(0);
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
        if (getContext() == null) return;
        
        BottomSheetDialog dialog = new BottomSheetDialog(requireContext());
        LayoutAddSkillBottomSheetBinding bsBinding = LayoutAddSkillBottomSheetBinding.inflate(getLayoutInflater());
        dialog.setContentView(bsBinding.getRoot());

        // Setup Skill Name autocomplete from catalog
        List<SkillItem> catalog = viewModel.getCatalog();
        if (catalog != null && !catalog.isEmpty()) {
            List<String> skillNames = new ArrayList<>();
            for (SkillItem s : catalog) skillNames.add(s.getName());
            ArrayAdapter<String> skillAdapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, skillNames);
            bsBinding.etBsSkillName.setAdapter(skillAdapter);
        }

        String[] categories = {"Technical", "Soft Skill", "Tools", "Language", "Others"};
        ArrayAdapter<String> catAdapter = new ArrayAdapter<>(requireContext(), android.R.layout.simple_dropdown_item_1line, categories);
        bsBinding.actBsCategory.setAdapter(catAdapter);
        
        bsBinding.actBsCategory.setOnClickListener(v -> bsBinding.actBsCategory.showDropDown());

        bsBinding.btnBsSave.setOnClickListener(v -> {
            String name = bsBinding.etBsSkillName.getText() != null ? bsBinding.etBsSkillName.getText().toString().trim() : "";
            String category = bsBinding.actBsCategory.getText().toString();
            int proficiency = 0; // Fixed: Always 0 until assessment

            if (name.isEmpty()) {
                bsBinding.etBsSkillName.setError("Skill name required");
                return;
            }
            
            if (category.isEmpty() || "Category".equals(category)) {
                Toast.makeText(getContext(), "Please select a category", Toast.LENGTH_SHORT).show();
                return;
            }

            viewModel.addSkill(name, category, proficiency);
            Toast.makeText(getContext(), name + " added! Please take the assessment to set proficiency.", Toast.LENGTH_LONG).show();
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
