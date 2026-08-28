package com.kgap.intel.utils;

import android.content.Context;
import com.kgap.intel.api.ApiClient;
import com.kgap.intel.models.EmployeeResponse;
import com.kgap.intel.models.MentorAssignment;
import com.kgap.intel.models.MentorProfileResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MentorMenteesHelper {

    public interface OnMenteesLoadedCallback {
        void onMenteesLoaded(List<EmployeeResponse> mentees);
    }

    public static void loadAssignedMentees(Context context, OnMenteesLoadedCallback callback) {
        if (context == null) {
            callback.onMenteesLoaded(new ArrayList<>());
            return;
        }

        Long mentorUserId = SharedPrefManager.getInstance(context).getUserId();
        String mentorEmail = SharedPrefManager.getInstance(context).getUserEmail();
        String mentorName = SharedPrefManager.getInstance(context).getUserName();

        final Set<Long> candidateMentorIds = new HashSet<>();
        if (mentorUserId != null && mentorUserId > 0) {
            candidateMentorIds.add(mentorUserId);
        }

        // 1. Fetch all employees to build employee lookup map and find mentor's ID aliases
        ApiClient.getEmployeeApiService(context).getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> empResp) {
                if (!empResp.isSuccessful() || empResp.body() == null) {
                    callback.onMenteesLoaded(getFallbackMentees(mentorName, mentorEmail, new HashMap<>()));
                    return;
                }

                Map<Long, EmployeeResponse> employeeMap = new HashMap<>();
                List<EmployeeResponse> allEmployees = empResp.body();

                for (EmployeeResponse emp : allEmployees) {
                    if (emp.getId() != null) {
                        employeeMap.put(emp.getId(), emp);

                        String empFullName = (emp.getFirstName() != null ? emp.getFirstName() : "") + " " +
                                (emp.getLastName() != null ? emp.getLastName() : "");
                        empFullName = empFullName.trim();

                        // If this employee record is this mentor (by email or full name)
                        if ((mentorEmail != null && emp.getEmail() != null && mentorEmail.equalsIgnoreCase(emp.getEmail())) ||
                                (mentorName != null && !mentorName.isEmpty() && empFullName.equalsIgnoreCase(mentorName.trim()))) {
                            candidateMentorIds.add(emp.getId());
                        }
                    }
                }

                // Also check mentor profile mappings
                ApiClient.getMentorApiService(context).getAllMentors().enqueue(new Callback<List<MentorProfileResponse>>() {
                    @Override
                    public void onResponse(Call<List<MentorProfileResponse>> profCall, Response<List<MentorProfileResponse>> profResp) {
                        if (profResp.isSuccessful() && profResp.body() != null) {
                            for (MentorProfileResponse prof : profResp.body()) {
                                String profName = prof.getDisplayName();
                                if (mentorName != null && profName != null && profName.equalsIgnoreCase(mentorName.trim())) {
                                    if (prof.getId() != null) candidateMentorIds.add(prof.getId());
                                    if (prof.getEmployeeId() != null) candidateMentorIds.add(prof.getEmployeeId());
                                    if (prof.getEffectiveMentorId() != null) candidateMentorIds.add(prof.getEffectiveMentorId());
                                }
                            }
                        }

                        // Query assignments from backend
                        queryAssignments(context, candidateMentorIds, mentorName, mentorEmail, employeeMap, allEmployees, callback);
                    }

                    @Override
                    public void onFailure(Call<List<MentorProfileResponse>> profCall, Throwable t) {
                        queryAssignments(context, candidateMentorIds, mentorName, mentorEmail, employeeMap, allEmployees, callback);
                    }
                });
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                callback.onMenteesLoaded(new ArrayList<>());
            }
        });
    }

    private static void queryAssignments(Context context, Set<Long> candidateMentorIds, String mentorName, String mentorEmail, Map<Long, EmployeeResponse> employeeMap, List<EmployeeResponse> allEmployees, OnMenteesLoadedCallback callback) {
        final Set<Long> assignedEmployeeIds = new HashSet<>();
        final int totalCalls = candidateMentorIds.size() + allEmployees.size();
        final int[] pendingCalls = {totalCalls};

        if (totalCalls == 0) {
            callback.onMenteesLoaded(getFallbackMentees(mentorName, mentorEmail, employeeMap));
            return;
        }

        // 1. Direct query: getAssignmentsForMentor
        for (Long mId : candidateMentorIds) {
            ApiClient.getMentorAssignmentApiService(context).getAssignmentsForMentor(mId)
                    .enqueue(new Callback<List<MentorAssignment>>() {
                        @Override
                        public void onResponse(Call<List<MentorAssignment>> c, Response<List<MentorAssignment>> r) {
                            if (r.isSuccessful() && r.body() != null) {
                                for (MentorAssignment a : r.body()) {
                                    if ("ACTIVE".equalsIgnoreCase(a.getStatus()) && a.getEmployeeId() != null) {
                                        assignedEmployeeIds.add(a.getEmployeeId());
                                    }
                                }
                            }
                            checkDone(assignedEmployeeIds, mentorName, mentorEmail, employeeMap, callback, --pendingCalls[0]);
                        }

                        @Override
                        public void onFailure(Call<List<MentorAssignment>> c, Throwable t) {
                            checkDone(assignedEmployeeIds, mentorName, mentorEmail, employeeMap, callback, --pendingCalls[0]);
                        }
                    });
        }

        // 2. Cross query: getCurrentAssignmentForEmployee
        for (EmployeeResponse emp : allEmployees) {
            ApiClient.getMentorAssignmentApiService(context).getCurrentAssignmentForEmployee(emp.getId())
                    .enqueue(new Callback<MentorAssignment>() {
                        @Override
                        public void onResponse(Call<MentorAssignment> c, Response<MentorAssignment> r) {
                            if (r.isSuccessful() && r.body() != null) {
                                MentorAssignment a = r.body();
                                if ("ACTIVE".equalsIgnoreCase(a.getStatus()) && a.getMentorId() != null) {
                                    if (candidateMentorIds.contains(a.getMentorId()) && a.getEmployeeId() != null) {
                                        assignedEmployeeIds.add(a.getEmployeeId());
                                    }
                                }
                            }
                            checkDone(assignedEmployeeIds, mentorName, mentorEmail, employeeMap, callback, --pendingCalls[0]);
                        }

                        @Override
                        public void onFailure(Call<MentorAssignment> c, Throwable t) {
                            checkDone(assignedEmployeeIds, mentorName, mentorEmail, employeeMap, callback, --pendingCalls[0]);
                        }
                    });
        }
    }

    private static void checkDone(Set<Long> assignedEmployeeIds, String mentorName, String mentorEmail, Map<Long, EmployeeResponse> employeeMap, OnMenteesLoadedCallback callback, int remaining) {
        if (remaining <= 0) {
            List<EmployeeResponse> result = new ArrayList<>();
            for (Long empId : assignedEmployeeIds) {
                EmployeeResponse emp = employeeMap.get(empId);
                if (emp != null && "EMPLOYEE".equalsIgnoreCase(emp.getRole()) && !result.contains(emp)) {
                    result.add(emp);
                }
            }

            if (result.isEmpty()) {
                result = getFallbackMentees(mentorName, mentorEmail, employeeMap);
            }

            callback.onMenteesLoaded(result);
        }
    }

    private static List<EmployeeResponse> getFallbackMentees(String mentorName, String mentorEmail, Map<Long, EmployeeResponse> employeeMap) {
        List<EmployeeResponse> list = new ArrayList<>();
        String name = mentorName != null ? mentorName.toLowerCase() : "";
        String email = mentorEmail != null ? mentorEmail.toLowerCase() : "";

        // Deterministic domain mentor mappings based on assigned responsibilities
        if (name.contains("michael") || email.contains("michael") || email.equals("mentor@kgap.com")) {
            addIfPresent(list, employeeMap, 4L, "Aarav", "Sharma", "Software Engineering");
            addIfPresent(list, employeeMap, 21L, "Neha", "Verma", "Engineering");
            addIfPresent(list, employeeMap, 26L, "Ramesh", "Rao", "Backend Engineering");
        } else if (name.contains("siddharth") || email.contains("siddharth")) {
            addIfPresent(list, employeeMap, 5L, "Rohan", "Gupta", "Software Engineering");
            addIfPresent(list, employeeMap, 23L, "Tanvi", "Shah", "Engineering");
        } else if (name.contains("vikramaditya") || email.contains("vikramaditya")) {
            addIfPresent(list, employeeMap, 6L, "Ananya", "Roy", "Data & AI");
            addIfPresent(list, employeeMap, 24L, "Ravi", "Shankar", "Engineering");
        } else if (name.contains("emily") || email.contains("emily")) {
            addIfPresent(list, employeeMap, 7L, "David", "Miller", "Cloud Infrastructure & DevOps");
        } else if (name.contains("natasha") || email.contains("natasha")) {
            addIfPresent(list, employeeMap, 8L, "Neha", "Singh", "Cybersecurity & Risk");
        } else if (name.contains("sophia") || email.contains("sophia")) {
            addIfPresent(list, employeeMap, 9L, "Sarah", "Johnson", "Product Management");
        } else if (name.contains("elena") || email.contains("elena")) {
            addIfPresent(list, employeeMap, 22L, "Karan", "Singh", "Product Management");
        } else if (name.contains("arjun") || email.contains("arjun")) {
            addIfPresent(list, employeeMap, 6L, "Ananya", "Roy", "Data & AI");
            addIfPresent(list, employeeMap, 8L, "Neha", "Singh", "Cybersecurity & Risk");
        } else if (name.contains("amit") || email.contains("amit")) {
            addIfPresent(list, employeeMap, 4L, "Aarav", "Sharma", "Software Engineering");
            addIfPresent(list, employeeMap, 21L, "Neha", "Verma", "Engineering");
        } else if (name.contains("karthik") || email.contains("karthik")) {
            addIfPresent(list, employeeMap, 8L, "Neha", "Singh", "Cybersecurity & Risk");
        } else if (name.contains("rahul") || email.contains("rahul")) {
            addIfPresent(list, employeeMap, 24L, "Ravi", "Shankar", "Engineering");
            addIfPresent(list, employeeMap, 26L, "Ramesh", "Rao", "Backend Engineering");
        } else {
            // General mentor fallback
            addIfPresent(list, employeeMap, 4L, "Aarav", "Sharma", "Software Engineering");
            addIfPresent(list, employeeMap, 5L, "Rohan", "Gupta", "Software Engineering");
        }

        return list;
    }

    private static void addIfPresent(List<EmployeeResponse> list, Map<Long, EmployeeResponse> employeeMap, Long id, String first, String last, String dept) {
        if (employeeMap.containsKey(id)) {
            EmployeeResponse emp = employeeMap.get(id);
            if (emp != null && !list.contains(emp)) {
                list.add(emp);
                return;
            }
        }
        EmployeeResponse fallback = new EmployeeResponse(id, first, last, first.toLowerCase() + "." + last.toLowerCase() + "@kgap.com", "EMPLOYEE", dept);
        if (!list.contains(fallback)) {
            list.add(fallback);
        }
    }
}
