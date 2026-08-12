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
import com.kgap.intel.activities.MainActivity;
import com.kgap.intel.adapters.TeamMemberAdapter;
import com.kgap.intel.databinding.FragmentTeamDirectoryBinding;
import com.kgap.intel.viewmodel.ManagerViewModel;

public class TeamDirectoryFragment extends Fragment {
    private FragmentTeamDirectoryBinding binding;
    private ManagerViewModel viewModel;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentTeamDirectoryBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(ManagerViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        binding.rvTeamMembers.setLayoutManager(new LinearLayoutManager(getContext()));

        viewModel.getTeamMembers().observe(getViewLifecycleOwner(), members -> {
            if (members != null) {
                TeamMemberAdapter adapter = new TeamMemberAdapter(members, member -> {
                    // Navigate to individual profile details
                    navigateToFragment(ProfileFragment.newInstance(member.getEmail()));
                });
                binding.rvTeamMembers.setAdapter(adapter);
            }
        });

        viewModel.loadTeamDashboard();
    }

    private void navigateToFragment(Fragment fragment) {
        if (getActivity() instanceof MainActivity) {
            ((MainActivity) getActivity()).switchFragment(fragment);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
