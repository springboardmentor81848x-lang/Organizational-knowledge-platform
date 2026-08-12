package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.adapters.CertificationAdapter;
import com.kgap.intel.databinding.FragmentCertificationsBinding;
import com.kgap.intel.models.Certification;
import java.util.ArrayList;
import java.util.List;

public class CertificationsFragment extends Fragment {
    private FragmentCertificationsBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentCertificationsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        setupRecyclerView();
        
        binding.fabAddCert.setOnClickListener(v -> {
            Toast.makeText(getContext(), "Feature to upload certificate coming soon!", Toast.LENGTH_SHORT).show();
        });
    }

    private void setupRecyclerView() {
        List<Certification> certs = new ArrayList<>();
        certs.add(new Certification("AWS Certified Solutions Architect", "Amazon Web Services", "2023"));
        certs.add(new Certification("Google Cloud Associate Engineer", "Google Cloud", "2022"));
        certs.add(new Certification("Project Management Professional (PMP)", "PMI", "2023"));
        
        binding.rvCertifications.setAdapter(new CertificationAdapter(certs));
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
