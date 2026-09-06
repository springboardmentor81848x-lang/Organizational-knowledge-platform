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
        Long userId = com.kgap.intel.utils.SharedPrefManager.getInstance(requireContext()).getUserId();
        com.kgap.intel.repository.TrainingRepository repo = new com.kgap.intel.repository.TrainingRepository(requireContext());
        
        repo.getEmployeeEnrollments(userId).observe(getViewLifecycleOwner(), enrollments -> {
            List<Certification> certs = new ArrayList<>();
            certs.add(new Certification("AWS Certified Solutions Architect", "Amazon Web Services", "Issued: Jan 2023", "ACTIVE", "2027-01-15"));
            certs.add(new Certification("Google Cloud Associate Engineer", "Google Cloud", "Issued: Feb 2022", "EXPIRING_SOON", "2026-09-15 (18 Days Left)"));
            certs.add(new Certification("Spring Certified Professional", "VMware Tanzu", "Issued: Mar 2021", "EXPIRED", "2026-08-01 (Expired)"));
            certs.add(new Certification("Project Management Professional (PMP)", "PMI", "Issued: Nov 2023", "ACTIVE", "2027-11-20"));

            if (enrollments != null) {
                for (com.kgap.intel.models.TrainingEnrollment enrollment : enrollments) {
                    String status = enrollment.getStatus() != null ? enrollment.getStatus().toUpperCase() : "ENROLLED";
                    int progress = enrollment.getProgressPercentage() != null ? enrollment.getProgressPercentage() : 0;
                    if ("COMPLETED".equals(status) || progress >= 100) {
                        String title = enrollment.getTrainingTitle() + " Certificate";
                        String dateStr = enrollment.getCompletedAt() != null ? "Issued: " + enrollment.getCompletedAt().split("T")[0] : "Issued Recently";
                        certs.add(new Certification(title, "KGap Academy", dateStr, "ACTIVE", "2028-12-31"));
                    }
                }
            }
            binding.rvCertifications.setAdapter(new CertificationAdapter(certs));
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
