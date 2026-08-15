package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.databinding.FragmentLdProgramsBinding;
import com.kgap.intel.viewmodel.LDViewModel;
import com.kgap.intel.adapters.LDProgramsAdapter;

public class LDProgramsFragment extends Fragment {
    private FragmentLdProgramsBinding binding;
    private LDViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentLdProgramsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(LDViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvPrograms.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel.getTrainingPrograms().observe(getViewLifecycleOwner(), programs -> {
            if (programs != null) {
                binding.rvPrograms.setAdapter(new LDProgramsAdapter(programs));
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
