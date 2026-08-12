package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.ViewGroup;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.ItemCertificationBinding;
import com.kgap.intel.models.Certification;
import java.util.List;

public class CertificationAdapter extends RecyclerView.Adapter<CertificationAdapter.CertViewHolder> {
    private List<Certification> certifications;

    public CertificationAdapter(List<Certification> certifications) {
        this.certifications = certifications;
    }

    @NonNull
    @Override
    public CertViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemCertificationBinding binding = ItemCertificationBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new CertViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull CertViewHolder holder, int position) {
        Certification cert = certifications.get(position);
        holder.binding.tvCertTitle.setText(cert.getTitle());
        holder.binding.tvCertIssuer.setText(cert.getIssuer());
        holder.binding.tvCertDate.setText(cert.getDate());
    }

    @Override
    public int getItemCount() {
        return certifications.size();
    }

    static class CertViewHolder extends RecyclerView.ViewHolder {
        ItemCertificationBinding binding;
        CertViewHolder(ItemCertificationBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
