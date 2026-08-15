package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import com.kgap.intel.databinding.FragmentPeerAssessmentBinding;

import androidx.recyclerview.widget.LinearLayoutManager;
import com.kgap.intel.R;
import com.kgap.intel.adapters.PeerAssessmentAdapter;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentPeerAssessmentBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.EmployeeSkillResponse;
import com.kgap.intel.models.PeerAssessmentRequest;
import com.kgap.intel.models.SkillItem;
import com.kgap.intel.utils.SharedPrefManager;
import java.util.ArrayList;
import java.util.List;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class PeerAssessmentFragment extends Fragment {
    private FragmentPeerAssessmentBinding binding;
    private final List<PeerAssessmentRequest> requestList = new ArrayList<>();
    private PeerAssessmentAdapter adapter;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentPeerAssessmentBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupRecyclerView();
        loadPeerRequests();
    }

    private void setupRecyclerView() {
        adapter = new PeerAssessmentAdapter(requestList, request -> {
            getParentFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, SkillAssessmentFragment.newInstance(
                    String.valueOf(request.getSkillId()), 
                    request.getSkillName(), 
                    request.getTargetEmployeeId(),
                    request.getTargetEmployeeName()))
                .addToBackStack(null)
                .commit();
        });
        binding.rvPendingRequests.setLayoutManager(new LinearLayoutManager(getContext()));
        binding.rvPendingRequests.setAdapter(adapter);
    }

    private void loadPeerRequests() {
        requestList.clear();
        Long currentUserId = SharedPrefManager.getInstance(getContext()).getUserId();
        
        // 1. Fetch Skill Catalog once
        ApiClient.getSkillApiService(getContext()).getAllSkills().enqueue(new Callback<List<SkillItem>>() {
            @Override
            public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> catResponse) {
                if (catResponse.isSuccessful() && catResponse.body() != null) {
                    List<SkillItem> catalog = catResponse.body();
                    
                    // 2. Fetch all employees
                    ApiClient.getEmployeeApiService(getContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
                        @Override
                        public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> empResponse) {
                            if (empResponse.isSuccessful() && empResponse.body() != null) {
                                for (EmployeeResponse employee : empResponse.body()) {
                                    if (!employee.getId().equals(currentUserId)) {
                                        fetchSkillsForPeer(employee, catalog);
                                    }
                                }
                            }
                        }
                        @Override
                        public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {}
                    });
                }
            }
            @Override
            public void onFailure(Call<List<SkillItem>> call, Throwable t) {}
        });
    }

    private void fetchSkillsForPeer(EmployeeResponse peer, List<SkillItem> catalog) {
        ApiClient.getSkillApiService(getContext()).getEmployeeSkills(peer.getId()).enqueue(new Callback<List<EmployeeSkillResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeSkillResponse>> call, Response<List<EmployeeSkillResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (EmployeeSkillResponse es : response.body()) {
                        // Logic: Any skill that isn't Expert level can be assessed by a peer for feedback
                        if (!"EXPERT".equalsIgnoreCase(es.getProficiencyLevel())) {
                            String skillName = "Unknown Skill";
                            for (SkillItem s : catalog) {
                                if (s.getId().equals(String.valueOf(es.getSkillId()))) {
                                    skillName = s.getName();
                                    break;
                                }
                            }
                            requestList.add(new PeerAssessmentRequest(
                                peer.getId(), 
                                peer.getFirstName() + " " + peer.getLastName(), 
                                es.getSkillId(), 
                                skillName));
                        }
                    }
                    updateUI();
                }
            }
            @Override
            public void onFailure(Call<List<EmployeeSkillResponse>> call, Throwable t) {}
        });
    }

    private void updateUI() {
        if (adapter != null) adapter.notifyDataSetChanged();
        binding.tvEmptyRequests.setVisibility(requestList.isEmpty() ? View.VISIBLE : View.GONE);
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
