package com.kgap.intel.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.kgap.intel.R;
import com.kgap.intel.databinding.FragmentMentorshipSessionsBinding;
import com.kgap.intel.databinding.ItemMentorshipSessionCardBinding;
import java.util.ArrayList;
import java.util.List;

public class MentorshipSessionsFragment extends Fragment {
    private FragmentMentorshipSessionsBinding binding;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        binding = FragmentMentorshipSessionsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        setupList();

        binding.fabSchedule.setOnClickListener(v -> {
            new ScheduleSessionBottomSheet().show(getChildFragmentManager(), "ScheduleSession");
        });
    }

    private void setupList() {
        binding.rvSessions.setLayoutManager(new LinearLayoutManager(getContext()));
        List<SessionMock> list = new ArrayList<>();
        list.add(new SessionMock("Michael Chen", "Advanced System Design", "Aug 24, 2024", "10:00 AM", "60m", "Upcoming"));
        list.add(new SessionMock("Robert Fox", "Kubernetes Best Practices", "Aug 26, 2024", "02:00 PM", "45m", "Upcoming"));
        list.add(new SessionMock("Jane Cooper", "Product Roadmap Strategy", "Aug 15, 2024", "11:30 AM", "60m", "Completed"));

        binding.rvSessions.setAdapter(new SessionAdapter(list));
    }

    private static class SessionMock {
        String mentor, topic, date, time, duration, status;
        SessionMock(String m, String t, String d, String tm, String dur, String s) {
            mentor = m; topic = t; date = d; time = tm; duration = dur; status = s;
        }
    }

    private class SessionAdapter extends RecyclerView.Adapter<SessionAdapter.ViewHolder> {
        private final List<SessionMock> list;
        SessionAdapter(List<SessionMock> list) { this.list = list; }

        @NonNull @Override public ViewHolder onCreateViewHolder(@NonNull ViewGroup p, int v) {
            return new ViewHolder(ItemMentorshipSessionCardBinding.inflate(LayoutInflater.from(p.getContext()), p, false));
        }

        @Override public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
            SessionMock item = list.get(pos);
            h.b.tvMentorName.setText(item.mentor);
            h.b.tvSessionTopic.setText(item.topic);
            h.b.tvSessionDate.setText(item.date);
            h.b.tvSessionTime.setText(item.time + " (" + item.duration + ")");
            h.b.tvSessionStatus.setText(item.status);

            if (item.status.equals("Completed")) {
                h.b.tvSessionStatus.setTextColor(getResources().getColor(R.color.gray_500, null));
                h.b.layoutUpcomingActions.setVisibility(View.GONE);
                h.b.btnJoin.setVisibility(View.GONE);
            }

            h.b.btnCancel.setOnClickListener(v -> Toast.makeText(getContext(), "Session cancelled", Toast.LENGTH_SHORT).show());
            h.b.btnReschedule.setOnClickListener(v -> new ScheduleSessionBottomSheet().show(getChildFragmentManager(), "Reschedule"));
        }

        @Override public int getItemCount() { return list.size(); }

        class ViewHolder extends RecyclerView.ViewHolder {
            final ItemMentorshipSessionCardBinding b;
            ViewHolder(ItemMentorshipSessionCardBinding b) { super(b.getRoot()); this.b = b; }
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }
}
