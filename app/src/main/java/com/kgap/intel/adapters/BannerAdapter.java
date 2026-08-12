package com.kgap.intel.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import java.util.List;

public class BannerAdapter extends RecyclerView.Adapter<BannerAdapter.BannerViewHolder> {

    private final List<BannerItem> items;

    public BannerAdapter(List<BannerItem> items) {
        this.items = items;
    }

    @NonNull
    @Override
    public BannerViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.item_banner_slide, parent, false);
        return new BannerViewHolder(view);
    }

    @Override
    public void onBindViewHolder(@NonNull BannerViewHolder holder, int position) {
        BannerItem item = items.get(position);
        holder.ivBanner.setImageResource(item.imageRes);
        
        // Hide overlay text if images already have them
        holder.tvTitle.setVisibility(View.GONE);
        holder.tvDesc.setVisibility(View.GONE);
        
        // Handle Action Button for first slide
        if (position == 0) {
            holder.btnAction.setVisibility(View.VISIBLE);
        } else {
            holder.btnAction.setVisibility(View.GONE);
        }
    }

    @Override
    public int getItemCount() {
        return items.size();
    }

    public static class BannerViewHolder extends RecyclerView.ViewHolder {
        ImageView ivBanner;
        TextView tvTitle, tvDesc;
        View btnAction;

        public BannerViewHolder(@NonNull View itemView) {
            super(itemView);
            ivBanner = itemView.findViewById(R.id.iv_banner_img);
            tvTitle = itemView.findViewById(R.id.tv_banner_title);
            tvDesc = itemView.findViewById(R.id.tv_banner_desc);
            btnAction = itemView.findViewById(R.id.btn_banner_action);
        }
    }

    public static class BannerItem {
        String title, desc;
        int imageRes;

        public BannerItem(String title, String desc, int imageRes) {
            this.title = title;
            this.desc = desc;
            this.imageRes = imageRes;
        }
    }
}
