package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.ItemHeatmapRowBinding;
import com.kgap.intel.databinding.ItemHeatmapCellBinding;
import com.kgap.intel.models.HeatmapRow;
import com.kgap.intel.models.HeatmapResponse;
import java.util.List;

public class HeatmapAdapter extends RecyclerView.Adapter<HeatmapAdapter.ViewHolder> {

    private final List<HeatmapRow> items;
    private final OnCellClickListener listener;

    public interface OnCellClickListener {
        void onCellClick(HeatmapResponse cell);
    }

    public HeatmapAdapter(List<HeatmapRow> items, OnCellClickListener listener) {
        this.items = items;
        this.listener = listener;
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        ItemHeatmapRowBinding binding = ItemHeatmapRowBinding.inflate(LayoutInflater.from(parent.getContext()), parent, false);
        return new ViewHolder(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
        HeatmapRow row = items.get(position);
        holder.binding.tvRowLabel.setText(row.getLabel());
        
        holder.binding.layoutCells.removeAllViews();
        LayoutInflater inflater = LayoutInflater.from(holder.itemView.getContext());
        
        for (HeatmapResponse cell : row.getCells()) {
            ItemHeatmapCellBinding cellBinding = ItemHeatmapCellBinding.inflate(inflater, holder.binding.layoutCells, false);
            
            cellBinding.tvCellScore.setText(String.valueOf(cell.getGapScore()));
            cellBinding.tvCellLevel.setText(cell.getGapLevel());
            
            int color;
            String level = cell.getGapLevel() != null ? cell.getGapLevel() : "LOW";
            switch (level.toUpperCase()) {
                case "HIGH": color = R.color.gap_critical; break;
                case "MEDIUM": color = R.color.gap_high; break;
                case "LOW": color = R.color.gap_medium; break;
                default: color = R.color.gap_low; break;
            }
            cellBinding.cardCell.setCardBackgroundColor(ContextCompat.getColor(holder.itemView.getContext(), color));
            
            cellBinding.cardCell.setOnClickListener(v -> {
                if (listener != null) listener.onCellClick(cell);
            });
            
            holder.binding.layoutCells.addView(cellBinding.getRoot());
        }
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        ItemHeatmapRowBinding binding;
        ViewHolder(ItemHeatmapRowBinding binding) {
            super(binding.getRoot());
            this.binding = binding;
        }
    }
}
