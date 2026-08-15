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
import com.kgap.intel.databinding.FragmentMentorMenteesBinding;
import com.kgap.intel.viewmodel.MentorViewModel;
import com.kgap.intel.adapters.MentorMenteesAdapter;

public class MentorMenteesFragment extends Fragment {
    private FragmentMentorMenteesBinding binding;
    private MentorViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorMenteesBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(MentorViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvMentees.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel.getMentees().observe(getViewLifecycleOwner(), mentees -> {
            if (mentees != null) {
                binding.rvMentees.setAdapter(new MentorMenteesAdapter(mentees));
            }
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
