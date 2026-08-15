package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.ItemPeerRequestBinding;
import com.kgap.intel.models.PeerAssessmentRequest;
import java.util.List;

public class PeerAssessmentAdapter extends RecyclerView.Adapter<PeerAssessmentAdapter.ViewHolder> {
    private final List<PeerAssessmentRequest> requests;
    private final OnPeerActionListener listener;

    public interface OnPeerActionListener {
        void onStartAssessment(PeerAssessmentRequest request);
    }

    public PeerAssessmentAdapter(List<PeerAssessmentRequest> requests, OnPeerActionListener listener) {
        this.requests = requests;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemPeerRequestBinding binding = ItemPeerRequestBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        PeerAssessmentRequest request = requests.get(position);
        holder.binding.tvPeerName.setText("Assess: " + request.getTargetEmployeeName());
        holder.binding.tvSkillName.setText("Skill: " + request.getSkillName());
        holder.binding.btnStartAssessment.setOnClickListener(v -> listener.onStartAssessment(request));
    }

    @Override
    public int getItemCount() {
        return requests.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        final ItemPeerRequestBinding binding;
        ViewHolder(ItemPeerRequestBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
