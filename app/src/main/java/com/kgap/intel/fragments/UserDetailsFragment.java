package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import com.kgap.intel.databinding.FragmentUserDetailsBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.viewmodel.ManagerViewModel;

public class UserDetailsFragment extends Fragment {
    private static final String ARG_USER_ID = "user_id";
    private FragmentUserDetailsBinding binding;
    private ManagerViewModel viewModel;
    private Long userId;

    public static UserDetailsFragment newInstance(Long userId) {
        UserDetailsFragment fragment = new UserDetailsFragment();
        Bundle args = new Bundle();
        args.putLong(ARG_USER_ID, userId);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            userId = getArguments().getLong(ARG_USER_ID);
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentUserDetailsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(requireActivity()).get(ManagerViewModel.class);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        observeViewModel();
    }

    private void observeViewModel() {
        viewModel.getTeamMembers().observe(getViewLifecycleOwner(), members -> {
            if (members != null) {
                for (EmployeeResponse u : members) {
                    if (u.getId().equals(userId)) {
                        updateUI(u);
                        break;
                    }
                }
            }
        });
    }

    private void updateUI(EmployeeResponse user) {
        binding.tvFullName.setText(user.getFirstName() + " " + user.getLastName());
        binding.tvEmail.setText(user.getEmail());
        binding.tvRole.setText(user.getRole() != null ? user.getRole() : "N/A");
        binding.tvDepartment.setText(user.getDepartment() != null ? user.getDepartment() : "N/A");
        
        binding.btnToggleStatus.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Account status updated", Toast.LENGTH_SHORT).show();
        });

        binding.btnChangeRole.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Change Role feature coming soon", Toast.LENGTH_SHORT).show();
        });

        binding.btnResetPassword.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Password reset link sent to " + user.getEmail(), Toast.LENGTH_SHORT).show();
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
