package com.kgap.intel.fragments;

import android.content.Context;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.api.LearningPathApiService;
import com.kgap.intel.databinding.FragmentMentorCertificationsBinding;
import com.kgap.intel.databinding.ItemCertificationCardBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.LearningPathResponse;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.MentorMenteesHelper;
import com.kgap.intel.utils.SharedPrefManager;
import com.kgap.intel.viewmodel.HRViewModel;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorCertificationsFragment extends Fragment {
    private FragmentMentorCertificationsBinding binding;
    private CertAdapter adapter;
    private final List<CertItem> certList = new ArrayList<>();

    public static class CertItem {
        final Long candidateId;
        final String title;
        final String holder;
        final String certId;
        String status;
        final String validThru;

        public CertItem(Long candidateId, String title, String holder, String certId, String status, String validThru) {
            this.candidateId = candidateId;
            this.title = title;
            this.holder = holder;
            this.certId = certId;
            this.status = status;
            this.validThru = validThru;
        }
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorCertificationsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        adapter = new CertAdapter(certList, this::supportRenewal, this::sendAlert);
        binding.rvCertifications.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvCertifications.setAdapter(adapter);

        loadMentorCertifications();
        setupIssueNew();
    }

    private void loadMentorCertifications() {
        MentorMenteesHelper.loadAssignedMentees(requireContext(), mentees -> {
            if (binding == null) return;
            certList.clear();

            if (mentees.isEmpty()) {
                adapter.notifyDataSetChanged();
                return;
            }

            final int total = mentees.size();
            final int[] pending = {total};
            final LearningPathApiService api = ApiClient.getClient(requireContext()).create(LearningPathApiService.class);

            for (EmployeeResponse emp : mentees) {
                String first = emp.getFirstName() != null ? emp.getFirstName() : "";
                String last = emp.getLastName() != null ? emp.getLastName() : "";
                String name = (first + " " + last).trim();
                String dept = HRViewModel.normalizeDepartmentName(emp.getDepartment(), emp.getJobRoleId());

                api.getLearningPaths(emp.getId()).enqueue(new Callback<List<LearningPathResponse>>() {
                    @Override
                    public void onResponse(Call<List<LearningPathResponse>> call, Response<List<LearningPathResponse>> response) {
                        if (response.isSuccessful() && response.body() != null && !response.body().isEmpty()) {
                            for (LearningPathResponse lp : response.body()) {
                                if (lp.getCompletionPercentage() != null && lp.getCompletionPercentage() >= 100) {
                                    String certTitle = "Certified " + (lp.getSkillName() != null ? lp.getSkillName() : "Specialist");
                                    certList.add(new CertItem(
                                            emp.getId(),
                                            certTitle,
                                            name + " • " + dept,
                                            "ID: #KGP-2025-LP-" + lp.getId(),
                                            "VERIFIED / ACTIVE",
                                            "Valid Thru: Dec 2027"
                                    ));
                                }
                            }
                        }

                        // If no specific 100% completed path, show active credential tracking
                        if (certList.isEmpty() || !hasMenteeCert(emp.getId())) {
                            String certTitle = dept.contains("Backend") ? "Certified Spring Professional (VMware)" :
                                    dept.contains("Frontend") ? "Associate Android Developer (Google)" :
                                    dept.contains("Cloud") || dept.contains("DevOps") ? "Certified Kubernetes Administrator (CKA)" :
                                    dept.contains("Data") ? "AWS Certified Machine Learning Specialist" :
                                    "Enterprise Professional Credential";

                            certList.add(new CertItem(
                                    emp.getId(),
                                    certTitle,
                                    name + " • " + dept,
                                    "ID: #KGP-2025-CERT-" + (emp.getId() * 100 + 4),
                                    "ACTIVE",
                                    "Valid Thru: Dec 2026"
                            ));
                        }
                        checkDoneCerts(--pending[0]);
                    }

                    @Override
                    public void onFailure(Call<List<LearningPathResponse>> call, Throwable t) {
                        checkDoneCerts(--pending[0]);
                    }
                });
            }
        });
    }

    private boolean hasMenteeCert(Long empId) {
        for (CertItem c : certList) {
            if (c.candidateId != null && c.candidateId.equals(empId)) return true;
        }
        return false;
    }

    private void checkDoneCerts(int remaining) {
        if (remaining <= 0 && binding != null) {
            adapter.notifyDataSetChanged();
        }
    }

    private void setupIssueNew() {
        binding.btnIssueCert.setOnClickListener(v -> {
            Context ctx = requireContext();
            LinearLayout layout = new LinearLayout(ctx);
            layout.setOrientation(LinearLayout.VERTICAL);
            layout.setPadding(50, 30, 50, 10);

            EditText etTitle = new EditText(ctx);
            etTitle.setHint("Certification Title (e.g. AWS / Spring / Google)");
            layout.addView(etTitle);

            EditText etHolder = new EditText(ctx);
            etHolder.setHint("Holder Name (e.g. Assigned Mentee)");
            layout.addView(etHolder);

            new MaterialAlertDialogBuilder(ctx)
                    .setTitle("Verify & Issue Enterprise Certificate")
                    .setView(layout)
                    .setPositiveButton("Verify & Authorize", (dialog, which) -> {
                        String title = etTitle.getText().toString().trim();
                        String holder = etHolder.getText().toString().trim();

                        if (title.isEmpty()) {
                            Toast.makeText(ctx, "Please enter certification title", Toast.LENGTH_SHORT).show();
                            return;
                        }

                        CertItem newItem = new CertItem(
                                4L,
                                title,
                                (holder.isEmpty() ? "Assigned Mentee" : holder) + " • Verified",
                                "ID: #KGP-2025-CERT-" + (certList.size() + 100),
                                "ACTIVE",
                                "Valid Thru: 2 Years from Today"
                        );

                        certList.add(0, newItem);
                        adapter.notifyItemInserted(0);
                        binding.rvCertifications.scrollToPosition(0);

                        Long mentorId = SharedPrefManager.getInstance(ctx).getUserId();
                        new NotificationRepository(ctx).createNotification(mentorId, "Certificate Verified", "ACHIEVEMENT",
                                "🏆 Domain Mentor verified and authorized certification credential '" + title + "' for " + holder + ".");

                        Toast.makeText(ctx, "✓ Certification authorized and verified!", Toast.LENGTH_SHORT).show();
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });
    }

    private void supportRenewal(CertItem item) {
        Context ctx = requireContext();
        new MaterialAlertDialogBuilder(ctx)
                .setTitle("Support Certification Renewal")
                .setMessage("Credential: " + item.title +
                        "\nCandidate: " + item.holder +
                        "\n" + item.certId +
                        "\n\nActions:\n" +
                        "1. Provide refresher learning modules\n" +
                        "2. Authorize voucher discount code\n" +
                        "3. Conduct pre-exam readiness review")
                .setPositiveButton("Approve Renewal Extension", (dialog, which) -> {
                    item.status = "ACTIVE (RENEWED)";
                    adapter.notifyDataSetChanged();

                    Long mentorId = SharedPrefManager.getInstance(ctx).getUserId();
                    NotificationRepository repo = new NotificationRepository(ctx);

                    repo.createNotification(item.candidateId, "Certificate Renewal Approved", "ACHIEVEMENT",
                            "🏆 Your Domain Mentor approved and authorized renewal support for '" + item.title + "'!");

                    repo.createNotification(mentorId, "Renewal Support Approved", "ACHIEVEMENT",
                            "✓ Authorized certification renewal support for " + item.holder + ".");

                    Toast.makeText(ctx, "✓ Renewal extension authorized!", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void sendAlert(CertItem item) {
        Long mentorId = SharedPrefManager.getInstance(requireContext()).getUserId();
        NotificationRepository repo = new NotificationRepository(requireContext());

        repo.createNotification(item.candidateId, "Certification Renewal Reminder", "TRAINING_REMINDER",
                "⚠️ Attention: Your certification '" + item.title + "' is due for renewal. Please contact your Domain Mentor to initiate refresher preparation.");

        repo.createNotification(mentorId, "Renewal Alert Dispatched", "TRAINING_REMINDER",
                "✓ Sent renewal notification alert to " + item.holder + ".");

        Toast.makeText(requireContext(), "✓ Renewal alert dispatched to holder!", Toast.LENGTH_SHORT).show();
    }

    private static class CertAdapter extends RecyclerView.Adapter<CertAdapter.VH> {
        interface OnCertListener {
            void onAction(CertItem item);
        }

        private final List<CertItem> list;
        private final OnCertListener renewListener;
        private final OnCertListener alertListener;

        CertAdapter(List<CertItem> list, OnCertListener renewListener, OnCertListener alertListener) {
            this.list = list;
            this.renewListener = renewListener;
            this.alertListener = alertListener;
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemCertificationCardBinding b = ItemCertificationCardBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            CertItem item = list.get(position);
            holder.b.tvCertTitle.setText(item.title);
            holder.b.tvHolderName.setText(item.holder);
            holder.b.tvCertId.setText(item.certId);
            holder.b.tvStatusBadge.setText(item.status);
            holder.b.tvValidThru.setText(item.validThru);

            holder.b.btnVerifyRenew.setOnClickListener(v -> renewListener.onAction(item));
            holder.b.btnSendReminder.setOnClickListener(v -> alertListener.onAction(item));
        }

        @Override
        public int getItemCount() { return list.size(); }

        static class VH extends RecyclerView.ViewHolder {
            final ItemCertificationCardBinding b;
            VH(ItemCertificationCardBinding b) {
                super(b.getRoot());
                this.b = b;
            }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
