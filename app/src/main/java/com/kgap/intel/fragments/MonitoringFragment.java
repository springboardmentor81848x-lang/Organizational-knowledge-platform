package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentMonitoringBinding;
import com.kgap.intel.databinding.ItemStatusBinding;
import com.kgap.intel.databinding.ViewProfileRowBinding;

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
        setupOptions();
    }

    private void setupStatus() {
        ItemStatusBinding api = ItemStatusBinding.bind(binding.statusApi.getRoot());
        api.tvStatusName.setText("API Services");
        api.tvStatusVal.setText("Operational");
        api.tvStatusVal.setTextColor(getResources().getColor(R.color.primary_emerald, null));

        ItemStatusBinding db = ItemStatusBinding.bind(binding.statusDb.getRoot());
        db.tvStatusName.setText("Database");
        db.tvStatusVal.setText("Healthy");
        db.tvStatusVal.setTextColor(getResources().getColor(R.color.primary_emerald, null));

        ItemStatusBinding server = ItemStatusBinding.bind(binding.statusServer.getRoot());
        server.tvStatusName.setText("Cloud Server");
        server.tvStatusVal.setText("Connected");
        server.tvStatusVal.setTextColor(getResources().getColor(R.color.primary_emerald, null));
    }

    private void setupOptions() {
        ViewProfileRowBinding audit = ViewProfileRowBinding.bind(binding.optAuditLogs.getRoot());
        audit.tvLabel.setText("Audit Logs");
        audit.tvValue.setText("View system-wide action logs");

        ViewProfileRowBinding login = ViewProfileRowBinding.bind(binding.optLoginActivity.getRoot());
        login.tvLabel.setText("Login Activity");
        login.tvValue.setText("Monitor successful/failed logins");

        ViewProfileRowBinding security = ViewProfileRowBinding.bind(binding.optSecurityEvents.getRoot());
        security.tvLabel.setText("Security Events");
        security.tvValue.setText("Track unauthorized access attempts");
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
