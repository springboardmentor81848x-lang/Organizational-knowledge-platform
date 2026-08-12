package com.kgap.intel.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;

import com.kgap.intel.R;
import com.kgap.intel.activities.LoginActivity;
import com.kgap.intel.adapters.CertificationAdapter;
import com.kgap.intel.adapters.SkillAdapter;
import com.kgap.intel.databinding.FragmentProfileBinding;
import com.kgap.intel.models.UserProfile;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.ProfileViewModel;

public class ProfileFragment extends Fragment {
    private static final String ARG_EMAIL = "user_email";
    private FragmentProfileBinding binding;
    private ProfileViewModel viewModel;

    public static ProfileFragment newInstance(String email) {
        ProfileFragment fragment = new ProfileFragment();
        Bundle args = new Bundle();
        args.putString(ARG_EMAIL, email);
        fragment.setArguments(args);
        return fragment;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentProfileBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        viewModel = new ViewModelProvider(this).get(ProfileViewModel.class);

        String targetEmail = getArguments() != null ? getArguments().getString(ARG_EMAIL) : null;
        boolean isOwnProfile = targetEmail == null || targetEmail.equalsIgnoreCase(SharedPrefManager.getInstance(getContext()).getUserEmail());

        if (!isOwnProfile) {
            viewModel.loadUserProfile(targetEmail);
            binding.toolbar.setNavigationIcon(android.R.drawable.ic_menu_revert);
            binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
            
            // Hide management actions when viewing someone else's profile
            binding.btnLogout.setVisibility(View.GONE);
            binding.btnEditProfile.setVisibility(View.GONE);
            binding.fabEditPhoto.setVisibility(View.GONE);
        } else {
            viewModel.loadUserProfile();
            binding.toolbar.setNavigationIcon(null);
            
            // Show management actions for own profile
            binding.btnLogout.setVisibility(View.VISIBLE);
            binding.btnEditProfile.setVisibility(View.VISIBLE);
            binding.fabEditPhoto.setVisibility(View.VISIBLE);
        }

        binding.toolbar.inflateMenu(R.menu.profile_menu);
        if (!isOwnProfile) {
            binding.toolbar.getMenu().clear(); // Hide logout menu if not own
        }

        binding.toolbar.setOnMenuItemClickListener(item -> {
            if (item.getItemId() == R.id.action_logout) {
                logout();
                return true;
            }
            return false;
        });

        binding.btnLogout.setOnClickListener(v -> logout());
        binding.btnRetry.setOnClickListener(v -> viewModel.loadUserProfile());

        setupRecyclerViews();
        observeViewModel();
    }

    private void logout() {
        SharedPrefManager.getInstance(getContext()).clear();
        Intent intent = new Intent(getActivity(), LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        if (getActivity() != null) {
            getActivity().finish();
        }
    }

    private void setupRecyclerViews() {
        binding.rvSkills.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvCerts.setLayoutManager(new LinearLayoutManager(getContext()));
    }

    private void observeViewModel() {
        viewModel.getIsLoading().observe(getViewLifecycleOwner(), loading -> {
            binding.layoutLoading.setVisibility(loading ? View.VISIBLE : View.GONE);
            if (loading) {
                binding.scrollView.setVisibility(View.GONE);
                binding.layoutError.setVisibility(View.GONE);
            }
        });

        viewModel.getErrorMessage().observe(getViewLifecycleOwner(), error -> {
            if (error != null) {
                binding.layoutError.setVisibility(View.VISIBLE);
                binding.tvErrorMessage.setText(error);
                binding.scrollView.setVisibility(View.GONE);
                binding.layoutLoading.setVisibility(View.GONE);
            } else {
                binding.layoutError.setVisibility(View.GONE);
            }
        });

        viewModel.getUserProfile().observe(getViewLifecycleOwner(), profile -> {
            if (profile != null) {
                updateUI(profile);
                binding.scrollView.setVisibility(View.VISIBLE);
                binding.layoutLoading.setVisibility(View.GONE);
                binding.layoutError.setVisibility(View.GONE);
            }
        });
    }

    private void updateUI(UserProfile profile) {
        String targetEmail = getArguments() != null ? getArguments().getString(ARG_EMAIL) : null;
        boolean isOwnProfile = targetEmail == null || targetEmail.equalsIgnoreCase(SharedPrefManager.getInstance(getContext()).getUserEmail());

        if (isOwnProfile) {
            binding.toolbar.setTitle("My Profile");
        } else {
            binding.toolbar.setTitle(profile.getFullName() + "'s Profile");
        }

        binding.tvName.setText(profile.getFullName());
        binding.tvId.setText("Employee ID: " + profile.getEmployeeId());
        
        if (profile.getBio() == null || profile.getBio().equals("Not provided")) {
            binding.cardBio.setVisibility(View.GONE);
        } else {
            binding.cardBio.setVisibility(View.VISIBLE);
            binding.tvBio.setText(profile.getBio());
        }

        // Update stats
        binding.tvStatSkills.setText(String.valueOf(profile.getSkills().size()));
        binding.tvStatCerts.setText(String.valueOf(profile.getCertifications().size()));
        binding.tvStatProgress.setText(profile.getLearningProgress() + "%");

        // Update Details Rows
        setupRow(binding.rowEmail, "Email", profile.getEmail());
        setupRow(binding.rowPhone, "Phone", profile.getPhoneNumber());
        setupRow(binding.rowDept, "Department", profile.getDepartment());
        setupRow(binding.rowDesig, "Job Role", profile.getDesignation());
        setupRow(binding.rowExp, "Experience", profile.getExperience());
        setupRow(binding.rowEdu, "Education", profile.getEducation());

        // Adapters
        if (profile.getSkills() == null || profile.getSkills().isEmpty()) {
            binding.cardSkillsSummary.setVisibility(View.GONE);
        } else {
            binding.cardSkillsSummary.setVisibility(View.VISIBLE);
            binding.rvSkills.setAdapter(new SkillAdapter(profile.getSkills()));
        }

        if (profile.getCertifications() == null || profile.getCertifications().isEmpty()) {
            binding.cardCertifications.setVisibility(View.GONE);
        } else {
            binding.cardCertifications.setVisibility(View.VISIBLE);
            binding.rvCerts.setAdapter(new CertificationAdapter(profile.getCertifications()));
        }
    }

    private void setupRow(com.kgap.intel.databinding.ViewProfileRowBinding rowBinding, String label, String value) {
        if (value == null || value.equals("Not provided")) {
            rowBinding.getRoot().setVisibility(View.GONE);
        } else {
            rowBinding.getRoot().setVisibility(View.VISIBLE);
            rowBinding.tvLabel.setText(label);
            rowBinding.tvValue.setText(value);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
