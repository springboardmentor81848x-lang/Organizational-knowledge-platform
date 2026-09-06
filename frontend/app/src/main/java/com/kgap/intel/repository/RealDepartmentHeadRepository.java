package com.kgap.intel.repository;

import android.content.Context;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import com.kgap.intel.api.*;
import com.kgap.intel.models.*;
import com.kgap.intel.utils.SharedPrefManager;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class RealDepartmentHeadRepository implements DepartmentHeadRepository {
    private final EmployeeApiService employeeApiService;
    private final SkillApiService skillApiService;
    private final GapApiService gapApiService;
    private final TrainingApiService trainingApiService;
    private final Context context;
    private final MutableLiveData<String> deptNameData = new MutableLiveData<>();
    private String resolvedDeptName = null;

    public RealDepartmentHeadRepository(Context context) {
        this.context = context.getApplicationContext();
        this.employeeApiService = ApiClient.getEmployeeApiService(context);
        this.skillApiService = ApiClient.getSkillApiService(context);
        this.gapApiService = ApiClient.getGapApiService(context);
        this.trainingApiService = ApiClient.getTrainingApiService(context);
    }

    @FunctionalInterface
    private interface OnDeptEmployeesResolvedListener {
        void onResolved(List<EmployeeResponse> deptEmployees, String deptName);
    }

    private boolean isMatchingDepartment(String headEmail, String deptName, String empDept, Long jobRoleId) {
        if (empDept == null && jobRoleId == null) return false;
        String he = (headEmail != null ? headEmail : "").toLowerCase();
        String hd = (deptName != null ? deptName : "").toLowerCase();
        String ed = (empDept != null ? empDept : "").toLowerCase();

        if (he.contains("backend") || hd.contains("backend")) {
            return (jobRoleId != null && jobRoleId == 1L) || ed.contains("backend");
        } else if (he.contains("frontend") || hd.contains("frontend")) {
            return (jobRoleId != null && jobRoleId == 2L) || ed.contains("frontend");
        } else if (he.contains("data") || hd.contains("data") || hd.contains("science")) {
            return (jobRoleId != null && jobRoleId == 3L) || ed.contains("data") || ed.contains("ai");
        } else if (he.contains("devops") || hd.contains("devops") || hd.contains("cloud")) {
            return (jobRoleId != null && jobRoleId == 7L) || ed.contains("devops") || ed.contains("cloud");
        } else if (he.contains("security") || hd.contains("security") || hd.contains("cyber")) {
            return (jobRoleId != null && jobRoleId == 8L) || ed.contains("security") || ed.contains("cyber");
        } else if (he.contains("product") || hd.contains("product")) {
            return (jobRoleId != null && (jobRoleId == 5L || jobRoleId == 6L)) || ed.contains("product");
        }

        return ed.equalsIgnoreCase(hd);
    }

    private void getDepartmentEmployees(OnDeptEmployeesResolvedListener listener) {
        String email = SharedPrefManager.getInstance(context).getUserEmail();
        employeeApiService.getAllEmployees().enqueue(new Callback<List<EmployeeResponse>>() {
            @Override
            public void onResponse(Call<List<EmployeeResponse>> call, Response<List<EmployeeResponse>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<EmployeeResponse> all = response.body();
                    String deptName = null;
                    for (EmployeeResponse emp : all) {
                        if (email != null && email.equalsIgnoreCase(emp.getEmail())) {
                            deptName = emp.getDepartment();
                            break;
                        }
                    }

                    if (deptName == null) {
                        deptName = "Engineering";
                    }
                    resolvedDeptName = deptName;
                    deptNameData.postValue(deptName);

                    List<EmployeeResponse> filtered = new ArrayList<>();
                    for (EmployeeResponse emp : all) {
                        boolean isEmployee = emp.getRole() != null && "EMPLOYEE".equalsIgnoreCase(emp.getRole());
                        if (isEmployee && isMatchingDepartment(email, resolvedDeptName, emp.getDepartment(), emp.getJobRoleId())) {
                            filtered.add(emp);
                        }
                    }
                    listener.onResolved(filtered, resolvedDeptName);
                } else {
                    listener.onResolved(new ArrayList<>(), "Engineering");
                }
            }

            @Override
            public void onFailure(Call<List<EmployeeResponse>> call, Throwable t) {
                listener.onResolved(new ArrayList<>(), "Engineering");
            }
        });
    }

    @Override
    public LiveData<List<DepartmentSkill>> getDepartmentSkillCoverage() {
        MutableLiveData<List<DepartmentSkill>> data = new MutableLiveData<>();
        getDepartmentEmployees((deptEmployees, deptName) -> {
            Set<Long> memberIds = deptEmployees.stream().map(EmployeeResponse::getId).collect(Collectors.toSet());

            skillApiService.getAllSkills().enqueue(new Callback<List<SkillItem>>() {
                @Override
                public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> skillResp) {
                    Map<Long, SkillItem> skillMap = new HashMap<>();
                    if (skillResp.isSuccessful() && skillResp.body() != null) {
                        for (SkillItem s : skillResp.body()) {
                            try {
                                skillMap.put(Long.parseLong(s.getId()), s);
                            } catch (Exception ignored) {}
                        }
                    }

                    skillApiService.getAllEmployeeSkills().enqueue(new Callback<List<EmployeeSkillResponse>>() {
                        @Override
                        public void onResponse(Call<List<EmployeeSkillResponse>> call, Response<List<EmployeeSkillResponse>> empSkillResp) {
                            if (empSkillResp.isSuccessful() && empSkillResp.body() != null) {
                                Map<Long, List<Integer>> skillScores = new HashMap<>();
                                for (EmployeeSkillResponse es : empSkillResp.body()) {
                                    if (memberIds.contains(es.getEmployeeId()) && es.getSkillId() != null) {
                                        int score = 50;
                                        if (es.getProficiencyScore() != null) {
                                            score = (int) Math.round(es.getProficiencyScore());
                                        } else if (es.getProficiencyLevel() != null) {
                                            switch (es.getProficiencyLevel().toUpperCase()) {
                                                case "EXPERT": score = 95; break;
                                                case "ADVANCED": score = 80; break;
                                                case "INTERMEDIATE": score = 65; break;
                                                case "BEGINNER": score = 40; break;
                                                default: score = 20; break;
                                            }
                                        }
                                        skillScores.computeIfAbsent(es.getSkillId(), k -> new ArrayList<>()).add(score);
                                    }
                                }

                                List<DepartmentSkill> result = new ArrayList<>();
                                for (Map.Entry<Long, List<Integer>> entry : skillScores.entrySet()) {
                                    SkillItem s = skillMap.get(entry.getKey());
                                    String name = s != null ? s.getName() : "Skill #" + entry.getKey();
                                    String category = s != null && s.getCategory() != null ? s.getCategory() : "Technical";
                                    double avg = entry.getValue().stream().mapToInt(Integer::intValue).average().orElse(0.0);
                                    int cov = (int) Math.round(avg);
                                    result.add(new DepartmentSkill(name, cov, 85, category));
                                }

                                if (result.isEmpty()) {
                                    for (SkillItem s : skillMap.values()) {
                                        result.add(new DepartmentSkill(s.getName(), 70, 85, s.getCategory() != null ? s.getCategory() : "Core"));
                                    }
                                }
                                data.postValue(result);
                            } else {
                                data.postValue(new ArrayList<>());
                            }
                        }

                        @Override
                        public void onFailure(Call<List<EmployeeSkillResponse>> call, Throwable t) {
                            data.postValue(new ArrayList<>());
                        }
                    });
                }

                @Override
                public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                    data.postValue(new ArrayList<>());
                }
            });
        });
        return data;
    }

    @Override
    public LiveData<List<SkillGap>> getTeamGapHeatmap() {
        MutableLiveData<List<SkillGap>> data = new MutableLiveData<>();
        getDepartmentEmployees((deptEmployees, deptName) -> {
            Set<Long> memberIds = deptEmployees.stream().map(EmployeeResponse::getId).collect(Collectors.toSet());
            Map<Long, String> empNameMap = new HashMap<>();
            for (EmployeeResponse emp : deptEmployees) {
                empNameMap.put(emp.getId(), emp.getFirstName() + " " + emp.getLastName());
            }

            skillApiService.getAllSkills().enqueue(new Callback<List<SkillItem>>() {
                @Override
                public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> skillResp) {
                    Map<Long, String> skillMap = new HashMap<>();
                    if (skillResp.isSuccessful() && skillResp.body() != null) {
                        for (SkillItem s : skillResp.body()) {
                            try {
                                skillMap.put(Long.parseLong(s.getId()), s.getName());
                            } catch (Exception ignored) {}
                        }
                    }

                    gapApiService.getHeatmapData().enqueue(new Callback<List<HeatmapResponse>>() {
                        @Override
                        public void onResponse(Call<List<HeatmapResponse>> call, Response<List<HeatmapResponse>> heatmapResp) {
                            if (heatmapResp.isSuccessful() && heatmapResp.body() != null) {
                                List<SkillGap> list = new ArrayList<>();
                                for (HeatmapResponse h : heatmapResp.body()) {
                                    if (memberIds.contains(h.getEmployeeId())) {
                                        String sName = skillMap.getOrDefault(h.getSkillId(), "Skill " + h.getSkillId());
                                        String eName = empNameMap.getOrDefault(h.getEmployeeId(), "Employee " + h.getEmployeeId());
                                        String level = h.getGapLevel() != null ? h.getGapLevel() : "LOW";
                                        int score = h.getGapScore() != null ? h.getGapScore() : 1;
                                        list.add(new SkillGap(sName, eName, level, score));
                                    }
                                }
                                data.postValue(list);
                            } else {
                                data.postValue(new ArrayList<>());
                            }
                        }

                        @Override
                        public void onFailure(Call<List<HeatmapResponse>> call, Throwable t) {
                            data.postValue(new ArrayList<>());
                        }
                    });
                }

                @Override
                public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                    data.postValue(new ArrayList<>());
                }
            });
        });
        return data;
    }

    @Override
    public LiveData<List<HeatmapRow>> getDepartmentHeatmapRows() {
        MutableLiveData<List<HeatmapRow>> data = new MutableLiveData<>();
        getDepartmentEmployees((deptEmployees, deptName) -> {
            Set<Long> memberIds = deptEmployees.stream().map(EmployeeResponse::getId).collect(Collectors.toSet());
            Map<Long, String> empNameMap = new HashMap<>();
            for (EmployeeResponse emp : deptEmployees) {
                empNameMap.put(emp.getId(), emp.getFirstName() + " " + emp.getLastName());
            }

            skillApiService.getAllSkills().enqueue(new Callback<List<SkillItem>>() {
                @Override
                public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> skillResp) {
                    Map<Long, String> skillMap = new HashMap<>();
                    if (skillResp.isSuccessful() && skillResp.body() != null) {
                        for (SkillItem s : skillResp.body()) {
                            try {
                                skillMap.put(Long.parseLong(s.getId()), s.getName());
                            } catch (Exception ignored) {}
                        }
                    }

                    gapApiService.getHeatmapData().enqueue(new Callback<List<HeatmapResponse>>() {
                        @Override
                        public void onResponse(Call<List<HeatmapResponse>> call, Response<List<HeatmapResponse>> heatmapResp) {
                            if (heatmapResp.isSuccessful() && heatmapResp.body() != null) {
                                Map<String, List<HeatmapResponse>> grouped = new LinkedHashMap<>();
                                for (EmployeeResponse emp : deptEmployees) {
                                    grouped.put(emp.getFirstName() + " " + emp.getLastName(), new ArrayList<>());
                                }

                                for (HeatmapResponse h : heatmapResp.body()) {
                                    if (memberIds.contains(h.getEmployeeId())) {
                                        String eName = empNameMap.get(h.getEmployeeId());
                                        if (eName != null) {
                                            h.setSkillName(skillMap.getOrDefault(h.getSkillId(), "Skill #" + h.getSkillId()));
                                            h.setEmployeeName(eName);
                                            grouped.computeIfAbsent(eName, k -> new ArrayList<>()).add(h);
                                        }
                                    }
                                }

                                List<HeatmapRow> rows = new ArrayList<>();
                                for (Map.Entry<String, List<HeatmapResponse>> entry : grouped.entrySet()) {
                                    rows.add(new HeatmapRow(entry.getKey(), entry.getValue()));
                                }
                                data.postValue(rows);
                            } else {
                                data.postValue(new ArrayList<>());
                            }
                        }

                        @Override
                        public void onFailure(Call<List<HeatmapResponse>> call, Throwable t) {
                            data.postValue(new ArrayList<>());
                        }
                    });
                }

                @Override
                public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                    data.postValue(new ArrayList<>());
                }
            });
        });
        return data;
    }

    @Override
    public LiveData<TrainingAdoption> getTrainingAdoptionRates() {
        MutableLiveData<TrainingAdoption> data = new MutableLiveData<>();
        getDepartmentEmployees((deptEmployees, deptName) -> {
            if (deptEmployees.isEmpty()) {
                data.postValue(new TrainingAdoption(0, 0, 0, 0.0));
                return;
            }

            final int totalEmps = deptEmployees.size();
            final AtomicInteger finishedCalls = new AtomicInteger(0);
            final AtomicInteger totalEnrollments = new AtomicInteger(0);
            final AtomicInteger completedCount = new AtomicInteger(0);
            final AtomicInteger inProgressCount = new AtomicInteger(0);
            final Set<Long> activeParticipants = new HashSet<>();

            for (EmployeeResponse emp : deptEmployees) {
                trainingApiService.getEmployeeEnrollments(emp.getId()).enqueue(new Callback<List<TrainingEnrollment>>() {
                    @Override
                    public void onResponse(Call<List<TrainingEnrollment>> call, Response<List<TrainingEnrollment>> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            for (TrainingEnrollment en : response.body()) {
                                totalEnrollments.incrementAndGet();
                                activeParticipants.add(emp.getId());
                                if ("COMPLETED".equalsIgnoreCase(en.getStatus()) || (en.getProgressPercentage() != null && en.getProgressPercentage() >= 100)) {
                                    completedCount.incrementAndGet();
                                } else {
                                    inProgressCount.incrementAndGet();
                                }
                            }
                        }
                        if (finishedCalls.incrementAndGet() == totalEmps) {
                            int tot = totalEnrollments.get();
                            int comp = completedCount.get();
                            int inProg = inProgressCount.get();
                            int participation = activeParticipants.size();
                            double rate = tot > 0 ? Math.round(((double) comp / tot) * 100.0) : 0.0;
                            data.postValue(new TrainingAdoption(participation, comp, inProg, rate));
                        }
                    }

                    @Override
                    public void onFailure(Call<List<TrainingEnrollment>> call, Throwable t) {
                        if (finishedCalls.incrementAndGet() == totalEmps) {
                            int tot = totalEnrollments.get();
                            int comp = completedCount.get();
                            int inProg = inProgressCount.get();
                            int participation = activeParticipants.size();
                            double rate = tot > 0 ? Math.round(((double) comp / tot) * 100.0) : 0.0;
                            data.postValue(new TrainingAdoption(participation, comp, inProg, rate));
                        }
                    }
                });
            }
        });
        return data;
    }

    @Override
    public LiveData<List<HighRiskGap>> getHighRiskSkillGaps() {
        MutableLiveData<List<HighRiskGap>> data = new MutableLiveData<>();
        getDepartmentEmployees((deptEmployees, deptName) -> {
            Set<Long> memberIds = deptEmployees.stream().map(EmployeeResponse::getId).collect(Collectors.toSet());
            Map<Long, String> empNameMap = new HashMap<>();
            for (EmployeeResponse emp : deptEmployees) {
                empNameMap.put(emp.getId(), emp.getFirstName() + " " + emp.getLastName());
            }

            skillApiService.getAllSkills().enqueue(new Callback<List<SkillItem>>() {
                @Override
                public void onResponse(Call<List<SkillItem>> call, Response<List<SkillItem>> skillResp) {
                    Map<Long, String> skillMap = new HashMap<>();
                    if (skillResp.isSuccessful() && skillResp.body() != null) {
                        for (SkillItem s : skillResp.body()) {
                            try {
                                skillMap.put(Long.parseLong(s.getId()), s.getName());
                            } catch (Exception ignored) {}
                        }
                    }

                    gapApiService.getAllGaps().enqueue(new Callback<List<SkillGapResponse>>() {
                        @Override
                        public void onResponse(Call<List<SkillGapResponse>> call, Response<List<SkillGapResponse>> gapResp) {
                            if (gapResp.isSuccessful() && gapResp.body() != null) {
                                List<HighRiskGap> highRisk = new ArrayList<>();
                                for (SkillGapResponse g : gapResp.body()) {
                                    if (memberIds.contains(g.getEmployeeId())) {
                                        String level = g.getGapLevel();
                                        int score = g.getGapScore() != null ? g.getGapScore() : 0;
                                        if ("HIGH".equalsIgnoreCase(level) || "CRITICAL".equalsIgnoreCase(level) || score >= 2) {
                                            String sName = skillMap.getOrDefault(g.getSkillId(), "Skill " + g.getSkillId());
                                            String eName = empNameMap.getOrDefault(g.getEmployeeId(), "Employee " + g.getEmployeeId());
                                            highRisk.add(new HighRiskGap(sName, eName, level != null ? level : "HIGH", 40, 90, g.getEmployeeId(), g.getSkillId(), score));
                                        }
                                    }
                                }
                                data.postValue(highRisk);
                            } else {
                                data.postValue(new ArrayList<>());
                            }
                        }

                        @Override
                        public void onFailure(Call<List<SkillGapResponse>> call, Throwable t) {
                            data.postValue(new ArrayList<>());
                        }
                    });
                }

                @Override
                public void onFailure(Call<List<SkillItem>> call, Throwable t) {
                    data.postValue(new ArrayList<>());
                }
            });
        });
        return data;
    }

    @Override
    public LiveData<List<EmployeeProgress>> getIndividualProgressSnapshots() {
        MutableLiveData<List<EmployeeProgress>> data = new MutableLiveData<>();
        getDepartmentEmployees((deptEmployees, deptName) -> {
            if (deptEmployees.isEmpty()) {
                data.postValue(new ArrayList<>());
                return;
            }

            final int totalEmps = deptEmployees.size();
            final AtomicInteger completedCalls = new AtomicInteger(0);
            final List<EmployeeProgress> snapshots = Collections.synchronizedList(new ArrayList<>());

            gapApiService.getAllGaps().enqueue(new Callback<List<SkillGapResponse>>() {
                @Override
                public void onResponse(Call<List<SkillGapResponse>> call, Response<List<SkillGapResponse>> gapResp) {
                    Map<Long, Integer> gapCounts = new HashMap<>();
                    if (gapResp.isSuccessful() && gapResp.body() != null) {
                        for (SkillGapResponse g : gapResp.body()) {
                            gapCounts.put(g.getEmployeeId(), gapCounts.getOrDefault(g.getEmployeeId(), 0) + 1);
                        }
                    }

                    for (EmployeeResponse emp : deptEmployees) {
                        final int activeGaps = gapCounts.getOrDefault(emp.getId(), 0);
                        trainingApiService.getEmployeeEnrollments(emp.getId()).enqueue(new Callback<List<TrainingEnrollment>>() {
                            @Override
                            public void onResponse(Call<List<TrainingEnrollment>> call, Response<List<TrainingEnrollment>> enResp) {
                                double progressSum = 0;
                                int coursesDone = 0;
                                int totalCourses = 0;
                                if (enResp.isSuccessful() && enResp.body() != null) {
                                    for (TrainingEnrollment en : enResp.body()) {
                                        totalCourses++;
                                        if ("COMPLETED".equalsIgnoreCase(en.getStatus()) || (en.getProgressPercentage() != null && en.getProgressPercentage() >= 100)) {
                                            coursesDone++;
                                        }
                                        if (en.getProgressPercentage() != null) {
                                            progressSum += en.getProgressPercentage();
                                        }
                                    }
                                }
                                int avgProgress = totalCourses > 0 ? (int) Math.round(progressSum / totalCourses) : 0;
                                int skillProficiency = 75; // Baseline proficiency
                                String fullName = emp.getFirstName() + " " + emp.getLastName();

                                snapshots.add(new EmployeeProgress(emp.getId(), fullName, emp.getRole(), emp.getDepartment(), skillProficiency, avgProgress, coursesDone, activeGaps));

                                if (completedCalls.incrementAndGet() == totalEmps) {
                                    snapshots.sort((a, b) -> a.getEmployeeName().compareToIgnoreCase(b.getEmployeeName()));
                                    data.postValue(new ArrayList<>(snapshots));
                                }
                            }

                            @Override
                            public void onFailure(Call<List<TrainingEnrollment>> call, Throwable t) {
                                String fullName = emp.getFirstName() + " " + emp.getLastName();
                                snapshots.add(new EmployeeProgress(emp.getId(), fullName, emp.getRole(), emp.getDepartment(), 70, 0, 0, activeGaps));
                                if (completedCalls.incrementAndGet() == totalEmps) {
                                    snapshots.sort((a, b) -> a.getEmployeeName().compareToIgnoreCase(b.getEmployeeName()));
                                    data.postValue(new ArrayList<>(snapshots));
                                }
                            }
                        });
                    }
                }

                @Override
                public void onFailure(Call<List<SkillGapResponse>> call, Throwable t) {
                    for (EmployeeResponse emp : deptEmployees) {
                        String fullName = emp.getFirstName() + " " + emp.getLastName();
                        snapshots.add(new EmployeeProgress(emp.getId(), fullName, emp.getRole(), emp.getDepartment(), 70, 0, 0, 0));
                    }
                    data.postValue(new ArrayList<>(snapshots));
                }
            });
        });
        return data;
    }

    @Override
    public LiveData<String> getDepartmentName() {
        return deptNameData;
    }
}
