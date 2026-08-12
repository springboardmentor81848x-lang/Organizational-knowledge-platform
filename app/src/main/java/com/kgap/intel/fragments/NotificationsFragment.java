package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.databinding.FragmentNotificationsBinding;
import java.util.ArrayList;
import java.util.List;

public class NotificationsFragment extends Fragment {
    private FragmentNotificationsBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentNotificationsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());
        
        setupRecyclerView();
    }

    private void setupRecyclerView() {
        List<String> notifications = new ArrayList<>();
        notifications.add("New course recommendation: Kotlin Advanced");
        notifications.add("Peer assessment request from Jordan");
        notifications.add("You've earned a new badge: Team Player!");
        notifications.add("Reminder: System Design session tomorrow at 2 PM");
        
        binding.rvNotifications.setAdapter(new RecyclerView.Adapter<NotificationViewHolder>() {
            @NonNull
            @Override
            public NotificationViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
                View view = LayoutInflater.from(parent.getContext()).inflate(android.R.layout.simple_list_item_1, parent, false);
                return new NotificationViewHolder(view);
            }

            @Override
            public void onBindViewHolder(@NonNull NotificationViewHolder holder, int position) {
                holder.textView.setText(notifications.get(position));
            }

            @Override
            public int getItemCount() {
                return notifications.size();
            }
        });
    }

    private static class NotificationViewHolder extends RecyclerView.ViewHolder {
        TextView textView;
        NotificationViewHolder(View itemView) {
            super(itemView);
            textView = itemView.findViewById(android.R.id.text1);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
