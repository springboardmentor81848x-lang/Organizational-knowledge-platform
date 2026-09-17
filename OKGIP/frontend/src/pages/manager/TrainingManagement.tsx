import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, GraduationCap, Loader2, RefreshCw, Search } from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

interface TrainingRow {
  trainingId: number;
  trainingName: string;
  provider?: string;
  duration?: string;
  level?: string;
  description?: string;
  courseUrl?: string;
  mappedSkills?: string[];
  matchedGapSkills?: string[];
  matchedGapCount?: number;
  enrolled?: number;
  completed?: number;
  averageProgress?: number;
}

export default function TrainingManagement() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const value = await managerService.getManagerTrainingAnalytics();
      setData(value || {});
    } catch (err: any) {
      console.error("MANAGER TRAINING ERROR:", err);
      setError(err?.response?.data?.message || err?.response?.data?.error || err?.message || "Unable to load training analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const catalog: TrainingRow[] = Array.isArray(data.catalog) ? data.catalog : [];
  const enrollments: TrainingRow[] = Array.isArray(data.enrollmentsData) ? data.enrollmentsData : [];

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog;
    return catalog.filter((r) => [r.trainingName, r.provider, r.level, ...(r.mappedSkills || []), ...(r.matchedGapSkills || [])]
      .some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [catalog, query]);

  const filteredEnrollments = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter((r: any) => [r.employeeName, r.trainingName, r.status]
      .some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [enrollments, query]);

  return (
    <ManagerPage
      title="Training Management"
      subtitle="Monitor training adoption, progress and gap-aligned learning across your assigned team."
      icon={GraduationCap}
      active="Training Management"
    >
      {loading ? (
        <div className="manager-loading"><Loader2 className="spin" size={18} /> Loading training analytics...</div>
      ) : error ? (
        <div className="manager-empty-state"><AlertTriangle size={24} /><strong>Unable to load training</strong><p>{error}</p><button className="manager-small-btn" onClick={() => void load()}>Retry</button></div>
      ) : (
        <>
          <div className="manager-stat-grid">
            {[
              ["Team Enrollments", data.enrollments ?? 0],
              ["Employees Enrolled", data.enrolledEmployees ?? 0],
              ["Not Started", data.notStarted ?? 0],
              ["In Progress", data.inProgress ?? 0],
              ["Completed", data.completed ?? 0],
              ["Adoption Rate", `${Number(data.adoptionRate ?? 0).toFixed(1)}%`],
              ["Completion Rate", `${Number(data.completionRate ?? 0).toFixed(1)}%`],
              ["Average Progress", `${Number(data.averageProgress ?? 0).toFixed(1)}%`],
            ].map(([label, value]) => (
              <div className="manager-stat-card" key={String(label)}><span>{label}</span><strong>{value}</strong></div>
            ))}
          </div>

          <section className="manager-card manager-data-card">
            <div className="manager-toolbar">
              <div>
                <span className="manager-section-label">GAP-ALIGNED LEARNING</span>
                <h2>Training Catalog</h2>
                <p>Courses are matched against the team's persisted open knowledge gaps. Enrollment and progress are read from employee activity.</p>
              </div>
              <div className="manager-toolbar-right">
                <div className="manager-search-large"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search training or skill..." /></div>
                <button className="manager-small-btn" onClick={() => void load()}><RefreshCw size={14} /> Refresh</button>
              </div>
            </div>

            {filteredCatalog.length === 0 ? (
              <div className="manager-empty-state"><BookOpen size={24} /><strong>No training catalog records</strong><p>Create trainings from the Admin training management page.</p></div>
            ) : (
              <div className="manager-functional-table">
                <div className="manager-functional-head"><span>TRAINING</span><span>MAPPED SKILLS</span><span>GAP MATCH</span><span>ENROLLED</span><span>PROGRESS</span></div>
                {filteredCatalog.map((r) => (
                  <div className="manager-functional-row" key={r.trainingId}>
                    <div><strong>{r.trainingName}</strong><small>{r.provider || "—"} · {r.level || "—"} · {r.duration || "—"}</small></div>
                    <span>{r.mappedSkills?.length ? r.mappedSkills.join(", ") : "Not mapped"}</span>
                    <strong>{r.matchedGapCount ? `${r.matchedGapCount} gap skill${r.matchedGapCount === 1 ? "" : "s"}` : "No current gap match"}</strong>
                    <span>{r.enrolled ?? 0}</span>
                    <strong>{Number(r.averageProgress ?? 0).toFixed(1)}%</strong>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="manager-card manager-data-card" style={{ marginTop: 18 }}>
            <div className="manager-toolbar"><div><span className="manager-section-label">LIVE EMPLOYEE ACTIVITY</span><h2>Team Training Progress</h2><p>Progress and learning hours are calculated automatically from training activity.</p></div></div>
            {filteredEnrollments.length === 0 ? (
              <div className="manager-empty-state"><GraduationCap size={24} /><strong>No team enrollments yet</strong><p>The catalog is available above. Once employees start training, their progress will appear here automatically.</p></div>
            ) : (
              <div className="manager-functional-table">
                <div className="manager-functional-head"><span>EMPLOYEE</span><span>TRAINING</span><span>STATUS</span><span>PROGRESS</span><span>HOURS</span></div>
                {filteredEnrollments.map((r: any) => (
                  <div className="manager-functional-row" key={r.employeeTrainingId ?? `${r.employeeId}-${r.trainingId}`}>
                    <strong>{r.employeeName || "—"}</strong><span>{r.trainingName || "—"}</span><span>{String(r.status || "—").replaceAll("_", " ")}</span><strong>{Number(r.progressPercentage ?? 0).toFixed(1)}%</strong><span>{Number(r.hoursSpent ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </ManagerPage>
  );
}
