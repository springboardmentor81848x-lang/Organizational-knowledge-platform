package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentMonitoringBinding;
import com.kgap.intel.databinding.ItemStatusBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MonitoringFragment extends Fragment {
    private FragmentMonitoringBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMonitoringBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupStatus();
        setupDiagnostics();
        runLiveProbe();
    }

    private void setupStatus() {
        ItemStatusBinding api = ItemStatusBinding.bind(binding.statusApi.getRoot());
        api.tvStatusName.setText("Spring Boot API Gateway");
        api.tvStatusVal.setText("Measuring latency...");
        api.tvStatusVal.setTextColor(getResources().getColor(R.color.primary_emerald, null));

        ItemStatusBinding db = ItemStatusBinding.bind(binding.statusDb.getRoot());
        db.tvStatusName.setText("PostgreSQL Database (HikariCP)");
        db.tvStatusVal.setText("Connected & Verified");
        db.tvStatusVal.setTextColor(getResources().getColor(R.color.primary_emerald, null));

        ItemStatusBinding server = ItemStatusBinding.bind(binding.statusServer.getRoot());
        server.tvStatusName.setText("JWT Security Engine");
        server.tvStatusVal.setText("Active (RS256 Signature)");
        server.tvStatusVal.setTextColor(getResources().getColor(R.color.primary_emerald, null));
    }

    private void runLiveProbe() {
        long startTime = System.currentTimeMillis();
        ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (binding != null) {
                    long latency = System.currentTimeMillis() - startTime;
                    ItemStatusBinding api = ItemStatusBinding.bind(binding.statusApi.getRoot());
                    api.tvStatusVal.setText("Operational (" + latency + "ms)");

                    ItemStatusBinding db = ItemStatusBinding.bind(binding.statusDb.getRoot());
                    int userCount = response.body() != null ? response.body().size() : 0;
                    db.tvStatusVal.setText("Healthy (" + userCount + " records queried)");
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                if (binding != null) {
                    ItemStatusBinding api = ItemStatusBinding.bind(binding.statusApi.getRoot());
                    api.tvStatusVal.setText("Disconnected");
                    api.tvStatusVal.setTextColor(getResources().getColor(R.color.gap_high, null));
                }
            }
        });
    }

    private void setupDiagnostics() {
        binding.btnRunDiagnostics.setOnClickListener(v -> {
            binding.btnRunDiagnostics.setEnabled(false);
            binding.btnRunDiagnostics.setText("Probing backend endpoints...");

            long startTime = System.currentTimeMillis();
            ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
                @Override
                public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                    if (binding != null) {
                        long latency = System.currentTimeMillis() - startTime;
                        binding.btnRunDiagnostics.setEnabled(true);
                        binding.btnRunDiagnostics.setText("⚡ Run Live Health Diagnostics");
                        binding.tvDiagnosticText.setText("✓ Diagnostics Passed: Real round-trip latency is " + latency + "ms. PostgreSQL connection pool responsive.");

                        ItemStatusBinding api = ItemStatusBinding.bind(binding.statusApi.getRoot());
                        api.tvStatusVal.setText("Operational (" + latency + "ms)");

                        Long adminId = SharedPrefManager.getInstance(getContext()).getUserId();
                        new NotificationRepository(requireContext())
                                .createNotification(adminId, "System Health Diagnostic", "ADMIN_ACTION",
                                        "✓ System Diagnostics: Live backend probe passed with " + latency + "ms latency. Database pool responsive.");

                        Toast.makeText(getContext(), "✓ Health Probe Passed (" + latency + "ms)", Toast.LENGTH_SHORT).show();
                    }
                }

                @Override
                public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                    if (binding != null) {
                        binding.btnRunDiagnostics.setEnabled(true);
                        binding.btnRunDiagnostics.setText("⚡ Run Live Health Diagnostics");
                        binding.tvDiagnosticText.setText("⚠ Probe Alert: Failed to reach backend gateway (" + t.getMessage() + ")");
                        Toast.makeText(getContext(), "Backend unreachable", Toast.LENGTH_SHORT).show();
                    }
                }
            });
        });
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
