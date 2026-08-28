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
        
        String status = cert.getStatus();
        String dateText = cert.getDate() + " • Expiry: " + cert.getExpiryDate();
        if ("EXPIRING_SOON".equalsIgnoreCase(status)) {
            dateText += " ⚠️ Expiring Soon (Action Required)";
            holder.binding.tvCertDate.setTextColor(android.graphics.Color.parseColor("#EF6C00"));
        } else if ("EXPIRED".equalsIgnoreCase(status)) {
            dateText += " ❌ Renewal Required";
            holder.binding.tvCertDate.setTextColor(android.graphics.Color.parseColor("#D32F2F"));
        } else {
            dateText += " ✅ Active";
            holder.binding.tvCertDate.setTextColor(android.graphics.Color.parseColor("#2E7D32"));
        }
        holder.binding.tvCertDate.setText(dateText);
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
