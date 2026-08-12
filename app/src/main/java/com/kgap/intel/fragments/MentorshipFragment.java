package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.databinding.FragmentMentorshipBinding;

public class MentorshipFragment extends Fragment {
    private FragmentMentorshipBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorshipBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        View.OnClickListener comingSoon = v -> Toast.makeText(getContext(), "Mentorship details coming soon!", Toast.LENGTH_SHORT).show();

        binding.cardFindMentor.setOnClickListener(comingSoon);
        binding.cardRequests.setOnClickListener(comingSoon);
        binding.cardSessions.setOnClickListener(comingSoon);
        binding.cardShare.setOnClickListener(comingSoon);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
