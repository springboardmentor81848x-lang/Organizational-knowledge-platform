package com.kgap.intel.fragments;

import android.graphics.Color;
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
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.databinding.FragmentNotificationsBinding;
import com.kgap.intel.databinding.ItemNotificationBinding;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.NotificationItem;
import com.kgap.intel.repository.NotificationRepository;
import com.kgap.intel.utils.SharedPrefManager;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NotificationsFragment extends Fragment {

    private FragmentNotificationsBinding binding;
    private NotificationRepository repository;
    private NotificationAdapter adapter;
    private Long resolvedEmployeeId;
    private Long prefUserId;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        binding = FragmentNotificationsBinding.inflate(inflater, container, false);
        return binding.getRoot();
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        repository = new NotificationRepository(requireContext());
        binding.toolbar.setNavigationOnClickListener(v -> getParentFragmentManager().popBackStack());

        adapter = new NotificationAdapter(new ArrayList<>());
        binding.rvNotifications.setLayoutManager(new LinearLayoutManager(requireContext()));
        binding.rvNotifications.setAdapter(adapter);

        binding.btnMarkAllRead.setOnClickListener(v -> markAllRead());

        resolveUserAndLoadNotifications();
    }

    private void resolveUserAndLoadNotifications() {
        showLoading(true);
        String userEmail = SharedPrefManager.getInstance(requireContext()).getUserEmail();
        prefUserId = SharedPrefManager.getInstance(requireContext()).getUserId();

        ApiClient.getEmployeeApiService(requireContext()).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    for (EmployeeResponse emp : response.body()) {
                        if (userEmail != null && userEmail.equalsIgnoreCase(emp.getEmail())) {
                            resolvedEmployeeId = emp.getId();
                            break;
                        }
                    }
                }
                if (resolvedEmployeeId == null) {
                    resolvedEmployeeId = prefUserId;
                }
                loadNotifications();
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                resolvedEmployeeId = prefUserId;
                loadNotifications();
            }
        });
    }

    private void loadNotifications() {
        if (resolvedEmployeeId == null && prefUserId == null) {
            showLoading(false);
            binding.tvEmpty.setVisibility(View.VISIBLE);
            binding.rvNotifications.setVisibility(View.GONE);
            return;
        }

        Long primaryId = resolvedEmployeeId != null ? resolvedEmployeeId : prefUserId;
        repository.getNotifications(primaryId).observe(getViewLifecycleOwner(), primaryList -> {
            if (prefUserId != null && !prefUserId.equals(resolvedEmployeeId)) {
                // Also load for prefUserId and merge
                repository.getNotifications(prefUserId).observe(getViewLifecycleOwner(), secondaryList -> {
                    showLoading(false);
                    List<NotificationItem> merged = mergeNotificationLists(primaryList, secondaryList);
                    updateListUI(merged);
                });
            } else {
                showLoading(false);
                updateListUI(primaryList);
            }
        });
    }

    private List<NotificationItem> mergeNotificationLists(List<NotificationItem> l1, List<NotificationItem> l2) {
        Map<Long, NotificationItem> map = new LinkedHashMap<>();
        if (l1 != null) {
            for (NotificationItem n : l1) {
                if (n.getId() != null) map.put(n.getId(), n);
            }
        }
        if (l2 != null) {
            for (NotificationItem n : l2) {
                if (n.getId() != null && !map.containsKey(n.getId())) {
                    map.put(n.getId(), n);
                }
            }
        }
        return new ArrayList<>(map.values());
    }

    private void updateListUI(List<NotificationItem> notifications) {
        String userRole = SharedPrefManager.getInstance(requireContext()).getUserRole();
        boolean isLDAdmin = userRole != null && (userRole.contains("LEARNING") || userRole.contains("L_D") || userRole.contains("LD_ADMIN"));

        List<NotificationItem> filtered = new ArrayList<>();
        if (notifications != null) {
            for (NotificationItem item : notifications) {
                if (isLDAdmin) {
                    String type = item.getType() != null ? item.getType().toUpperCase() : "";
                    String msg = item.getMessage() != null ? item.getMessage() : "";
                    String title = item.getTitle() != null ? item.getTitle() : "";
                    if ("CHAT".equals(type) || "MESSAGE".equals(type) || "DIRECT_MESSAGE".equals(type)
                            || msg.contains("💬") || msg.startsWith("💬") || title.equalsIgnoreCase("New Chat Message")
                            || msg.toLowerCase().contains("doubt session") || msg.toLowerCase().contains("when you are available")
                            || msg.contains("https://meet.google.com/kgap-395")) {
                        continue;
                    }
                }
                filtered.add(item);
            }
        }

        if (filtered.isEmpty()) {
            binding.tvEmpty.setVisibility(View.VISIBLE);
            binding.rvNotifications.setVisibility(View.GONE);
        } else {
            binding.tvEmpty.setVisibility(View.GONE);
            binding.rvNotifications.setVisibility(View.VISIBLE);
            adapter.setData(filtered);
        }
    }

    private void markAllRead() {
        Long id = resolvedEmployeeId != null ? resolvedEmployeeId : prefUserId;
        if (id == null) return;
        repository.markAllRead(id).observe(getViewLifecycleOwner(), success -> {
            if (Boolean.TRUE.equals(success)) {
                if (prefUserId != null && !prefUserId.equals(resolvedEmployeeId)) {
                    repository.markAllRead(prefUserId);
                }
                loadNotifications();
                Toast.makeText(requireContext(), "All notifications marked as read", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(requireContext(), "Failed to mark all as read", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void showLoading(boolean loading) {
        if (binding != null) {
            binding.progressBar.setVisibility(loading ? View.VISIBLE : View.GONE);
        }
    }

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    // ────────────────────────────── Adapter ──────────────────────────────────────

    private class NotificationAdapter extends RecyclerView.Adapter<NotificationAdapter.VH> {
        private List<NotificationItem> items;

        NotificationAdapter(List<NotificationItem> items) {
            this.items = new ArrayList<>(items);
        }

        void setData(List<NotificationItem> data) {
            this.items = new ArrayList<>(data);
            notifyDataSetChanged();
        }

        @NonNull
        @Override
        public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            ItemNotificationBinding b = ItemNotificationBinding.inflate(
                    LayoutInflater.from(parent.getContext()), parent, false);
            return new VH(b);
        }

        @Override
        public void onBindViewHolder(@NonNull VH holder, int position) {
            holder.bind(items.get(position));
        }

        @Override
        public int getItemCount() {
            return items.size();
        }

        class VH extends RecyclerView.ViewHolder {
            final ItemNotificationBinding b;

            VH(ItemNotificationBinding binding) {
                super(binding.getRoot());
                this.b = binding;
            }

            void bind(NotificationItem item) {
                b.tvNotifMessage.setText(item.getMessage());
                b.tvNotifTime.setText(getRelativeTime(item.getCreatedAt()));

                String type = item.getType() != null ? item.getType() : "";
                b.tvNotifType.setText(type.replace("_", " "));

                // Icon and background per notification type
                int iconRes;
                int bgColor;
                switch (type) {
                    case "GAP_ALERT":
                        iconRes = android.R.drawable.ic_dialog_alert;
                        bgColor = Color.parseColor("#FFF3E0");
                        break;
                    case "TRAINING_REMINDER":
                        iconRes = android.R.drawable.ic_menu_agenda;
                        bgColor = Color.parseColor("#E8F5E9");
                        break;
                    case "MENTORSHIP":
                        iconRes = android.R.drawable.ic_menu_myplaces;
                        bgColor = Color.parseColor("#E3F2FD");
                        break;
                    case "ASSESSMENT_REMINDER":
                        iconRes = android.R.drawable.ic_menu_edit;
                        bgColor = Color.parseColor("#F3E5F5");
                        break;
                    case "ACHIEVEMENT":
                        iconRes = android.R.drawable.btn_star_big_on;
                        bgColor = Color.parseColor("#FFF9C4");
                        break;
                    case "SESSION_REMINDER":
                        iconRes = android.R.drawable.ic_menu_today;
                        bgColor = Color.parseColor("#E8EAF6");
                        break;
                    case "ADMIN_ACTION":
                        iconRes = android.R.drawable.ic_lock_lock;
                        bgColor = Color.parseColor("#E8EAF6");
                        break;
                    default:
                        iconRes = android.R.drawable.ic_dialog_info;
                        bgColor = Color.parseColor("#F0FAF5");
                        break;
                }
                b.ivNotifIcon.setImageResource(iconRes);
                b.cvIconBg.setCardBackgroundColor(bgColor);

                // Unread indicator
                boolean isRead = Boolean.TRUE.equals(item.getIsRead());
                b.viewUnreadDot.setVisibility(isRead ? View.GONE : View.VISIBLE);
                b.cardNotification.setCardBackgroundColor(
                        isRead ? Color.WHITE : Color.parseColor("#F0FBF8"));

                // Tap notification: Mark as read and open related detail screen
                b.cardNotification.setOnClickListener(v -> {
                    if (!Boolean.TRUE.equals(item.getIsRead())) {
                        int pos = getAdapterPosition();
                        if (pos != RecyclerView.NO_POSITION) {
                            repository.markAsRead(item.getId()).observe(getViewLifecycleOwner(), ok -> {
                                if (Boolean.TRUE.equals(ok)) {
                                    item.setIsRead(true);
                                    notifyItemChanged(pos);
                                }
                            });
                        }
                    }
                    showNotificationDetailDialog(item);
                });
            }
        }
    }

    private void showNotificationDetailDialog(NotificationItem item) {
        if (item == null || getContext() == null) return;

        String type = item.getType() != null ? item.getType().toUpperCase() : "NOTIFICATION";
        String displayType = type.replace("_", " ");
        String buttonText;
        Fragment destinationFragment;

        switch (type) {
            case "GAP_ALERT":
                buttonText = "View Skill Gaps";
                destinationFragment = new SkillGapFragment();
                break;
            case "TRAINING_REMINDER":
                buttonText = "View Training Progress";
                destinationFragment = new MyProgressFragment();
                break;
            case "MENTORSHIP":
                buttonText = "View Mentorship Hub";
                destinationFragment = new MentorshipHomeFragment();
                break;
            case "ASSESSMENT_REMINDER":
                if (item.getMessage() != null && item.getMessage().toLowerCase().contains("peer")) {
                    buttonText = "View Peer Assessments";
                    destinationFragment = PeerAssessmentFragment.newInstance("PEER");
                } else if (item.getMessage() != null && item.getMessage().toLowerCase().contains("manager")) {
                    buttonText = "View Manager Assessments";
                    destinationFragment = PeerAssessmentFragment.newInstance("MANAGER");
                } else {
                    buttonText = "View Skills Hub";
                    destinationFragment = new SkillsHubFragment();
                }
                break;
            case "ACHIEVEMENT":
                buttonText = "View Achievements";
                destinationFragment = new AchievementsFragment();
                break;
            case "SESSION_REMINDER":
                buttonText = "View Knowledge Sessions";
                destinationFragment = KnowledgeHubFragment.newInstance(true);
                break;
            case "ADMIN_ACTION":
                buttonText = "View User Directory";
                destinationFragment = new UserManagementFragment();
                break;
            default:
                buttonText = "View Competency Hub";
                destinationFragment = new SkillsHubFragment();
                break;
        }

        new com.google.android.material.dialog.MaterialAlertDialogBuilder(requireContext())
                .setTitle(displayType)
                .setMessage(item.getMessage() + "\n\nReceived: " + getRelativeTime(item.getCreatedAt()))
                .setPositiveButton(buttonText, (dialog, which) -> {
                    getParentFragmentManager().beginTransaction()
                            .replace(com.kgap.intel.R.id.fragment_container, destinationFragment)
                            .addToBackStack(null)
                            .commit();
                })
                .setNegativeButton("Close", null)
                .show();
    }

    // ─────────────────────────── Relative Time ────────────────────────────────────

    private static String getRelativeTime(String isoTimestamp) {
        if (isoTimestamp == null || isoTimestamp.isEmpty()) return "";
        try {
            SimpleDateFormat[] formats = {
                    new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSSSS", Locale.US),
                    new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.US),
                    new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.US)
            };
            Date date = null;
            for (SimpleDateFormat fmt : formats) {
                fmt.setTimeZone(TimeZone.getTimeZone("UTC"));
                try {
                    date = fmt.parse(isoTimestamp);
                    break;
                } catch (ParseException ignored) {
                }
            }
            if (date == null) return isoTimestamp;

            long diffMs = System.currentTimeMillis() - date.getTime();
            long diffSec = diffMs / 1000;
            long diffMin = diffSec / 60;
            long diffHr = diffMin / 60;
            long diffDay = diffHr / 24;

            if (diffSec < 60) return "just now";
            if (diffMin < 60) return diffMin + " min ago";
            if (diffHr < 24) return diffHr + (diffHr == 1 ? " hour ago" : " hours ago");
            if (diffDay < 7) return diffDay + (diffDay == 1 ? " day ago" : " days ago");
            return new SimpleDateFormat("MMM d, yyyy", Locale.US).format(date);
        } catch (Exception e) {
            return isoTimestamp;
        }
    }
}
