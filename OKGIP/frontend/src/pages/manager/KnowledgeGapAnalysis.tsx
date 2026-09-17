import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Search,
  Target,
  Users,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";

import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";
import { TeamAnalytics } from "@/services/analyticsService";

const formatPercentage = (value: any) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return `${number.toFixed(1)}%`;
};

const formatGapPercentage = (value: any) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.min(100, Math.max(0, number));
};

const KnowledgeGapAnalysis: React.FC = () => {
  const [params] = useSearchParams();

  const [team, setTeam] = useState<TeamAnalytics[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [busy, setBusy] = useState<number | null>(null);

  const [query, setQuery] = useState("");

  const [error, setError] = useState("");

  /**
   * ============================
   * LOAD TEAM DATA
   * ============================
   */
  const loadTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await managerService.getManagerTeam();

      console.log("KNOWLEDGE GAP TEAM DATA:", data);

      const teamRows = Array.isArray(data) ? data : [];
      setTeam(teamRows);

      // If an employee has role competencies but no persisted gap records,
      // generate the analysis once automatically. This prevents the manager
      // page from showing a misleading 0% before analysis has ever run.
      const pending = teamRows.filter(
        (employee: any) => employee.analysisStatus === "NOT_RUN"
      );

      for (const employee of pending) {
        try {
          await managerService.runManagerGapAnalysis(employee.employeeId);
        } catch (runError) {
          console.error(
            "AUTO GAP ANALYSIS FAILED:",
            employee.employeeId,
            runError
          );
        }
      }

      if (pending.length > 0) {
        const refreshed = await managerService.getManagerTeam();
        setTeam(Array.isArray(refreshed) ? refreshed : teamRows);
        return refreshed;
      }

      return teamRows;
    } catch (err: any) {
      console.error("KNOWLEDGE GAP TEAM ERROR:", err);

      setTeam([]);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load team gap data."
      );

      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * ============================
   * OPEN EMPLOYEE GAP DETAILS
   * ============================
   */
  const openEmployee = async (employeeId: number) => {
    try {
      setDetailLoading(true);

      console.log(
        "LOADING GAP ANALYSIS FOR EMPLOYEE:",
        employeeId
      );

      const result =
        await managerService.getManagerGapAnalysis(
          employeeId
        );

      console.log(
        "EMPLOYEE GAP ANALYSIS RESPONSE:",
        result
      );

      if (!result?.knowledgeGaps?.length) {
        try {
          const regenerated = await managerService.runManagerGapAnalysis(employeeId);
          setSelected(regenerated);
          return;
        } catch (regenerateError) {
          console.error("REGENERATE GAP ANALYSIS ERROR:", regenerateError);
        }
      }

      setSelected(result);
    } catch (err: any) {
      console.error(
        "EMPLOYEE GAP ANALYSIS ERROR:",
        err
      );

      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * ============================
   * INITIAL LOAD
   * ============================
   */
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      const data = await loadTeam();

      if (!mounted) {
        return;
      }

      const employeeParam =
        params.get("employee");

      const employeeId = Number(
        employeeParam
      );

      if (
        employeeParam &&
        Number.isFinite(employeeId) &&
        employeeId > 0
      ) {
        await openEmployee(employeeId);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * ============================
   * FILTER + SORT
   * ============================
   */
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...team]
      .filter((employee) => {
        if (!q) {
          return true;
        }

        return [
          employee.employeeName,
          employee.jobRoleName,
          employee.employeeCode,
        ].some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(q)
        );
      })
      .sort(
        (a, b) =>
          Number(b.gapPercentage || 0) -
          Number(a.gapPercentage || 0)
      );
  }, [team, query]);

  /**
   * ============================
   * RE-RUN GAP ANALYSIS
   * ============================
   */
  const runGapAnalysis = async (
    employeeId: number
  ) => {
    try {
      setBusy(employeeId);

      console.log(
        "RUNNING GAP ANALYSIS:",
        employeeId
      );

      await managerService.runManagerGapAnalysis(
        employeeId
      );

      await openEmployee(employeeId);

      await loadTeam();
    } catch (err: any) {
      console.error(
        "RUN GAP ANALYSIS ERROR:",
        err
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <ManagerPage
      title="Knowledge Gap Analysis"
      subtitle="Prioritize employee gaps using live team and gap-analysis data."
      icon={Activity}
      active="Knowledge Gap Analysis"
    >
      <div className="manager-page-grid">
        {/* =====================================
            LEFT - GAP RISK QUEUE
        ====================================== */}
        <section className="manager-card manager-data-card">
          <div className="manager-toolbar">
            <div>
              <span className="manager-section-label">
                TEAM INTELLIGENCE
              </span>

              <h2>Gap Risk Queue</h2>

              <p>
                Employees are ordered by current
                knowledge-gap percentage.
              </p>
            </div>

            <div className="manager-search-large">
              <Search size={15} />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search employees..."
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="manager-loading">
              <Loader2
                className="spin"
                size={18}
              />

              Loading team gap data...
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="manager-empty-state">
              <AlertTriangle size={24} />

              <strong>
                Unable to load gap analysis
              </strong>

              <p>{error}</p>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            rows.length === 0 && (
              <div className="manager-empty-state">
                <Users size={24} />

                <strong>
                  No employees found
                </strong>

                <p>
                  No team members match the
                  current search.
                </p>
              </div>
            )}

          {/* Table */}
          {!loading &&
            !error &&
            rows.length > 0 && (
              <div className="risk-table">
                <div className="risk-table-header">
                  <span>EMPLOYEE</span>
                  <span>GAP RISK</span>
                  <span>GAP</span>
                  <span>ACTIONS</span>
                </div>

                {rows.map((employee) => {
                  const gap =
                    formatGapPercentage(
                      employee.gapPercentage
                    );

                  const highRisk = gap >= 50;

                  return (
                    <div
                      className="risk-row"
                      key={employee.employeeId}
                    >
                      {/* Employee */}
                      <div className="risk-person">
                        <div className="manager-avatar">
                          <Users size={15} />
                        </div>

                        <div>
                          <b>
                            {employee.employeeName ||
                              "Unknown Employee"}
                          </b>

                          <small>
                            {employee.jobRoleName ||
                              employee.employeeCode ||
                              "Employee"}
                          </small>
                        </div>
                      </div>

                      {/* Risk meter */}
                      <div className="risk-meter-wrapper">
                        <div className="risk-meter">
                          <span
                            style={{
                              width: `${gap}%`,
                            }}
                          />
                        </div>

                        <small>
                          {highRisk
                            ? "High Risk"
                            : "Moderate Risk"}
                        </small>
                      </div>

                      {/* Gap */}
                      <strong
                        className={
                          highRisk
                            ? "danger"
                            : ""
                        }
                      >
                        {Math.round(gap)}%
                      </strong>

                      {/* Actions */}
                      <div className="risk-actions">
                        <button
                          onClick={() =>
                            openEmployee(
                              employee.employeeId
                            )
                          }
                        >
                          Details
                        </button>

                        <button
                          onClick={() =>
                            runGapAnalysis(
                              employee.employeeId
                            )
                          }
                          disabled={
                            busy ===
                            employee.employeeId
                          }
                        >
                          {busy ===
                          employee.employeeId ? (
                            <>
                              <RefreshCw
                                className="spin"
                                size={14}
                              />

                              Running
                            </>
                          ) : (
                            <>
                              <RefreshCw
                                size={14}
                              />

                              Re-run
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </section>

        {/* =====================================
            RIGHT - GAP ANALYSIS RESULT
        ====================================== */}
        <section className="manager-card manager-detail-card">
          {detailLoading ? (
            <div className="manager-loading">
              <Loader2
                className="spin"
                size={18}
              />

              Loading employee gap analysis...
            </div>
          ) : selected ? (
            <>
              {/* Header */}
              <div className="detail-header">
                <div>
                  <span>
                    GAP ANALYSIS RESULT
                  </span>

                  <h2>
                    {selected.employeeName ||
                      "Employee"}
                  </h2>

                  <p>
                    {selected.jobRoleName ||
                      "Assigned role"}
                  </p>
                </div>

                <div className="detail-badge">
                  <Target size={15} />

                  Role Analysis
                </div>
              </div>

              {/* KPIs */}
              <div className="detail-kpis">
                <div>
                  <AlertTriangle />

                  <b>
                    {selected.gapSkills ??
                      selected.knowledgeGaps
                        ?.length ??
                      "—"}
                  </b>

                  <span>Gap Skills</span>
                </div>

                <div>
                  <Activity />

                  <b>
                    {formatPercentage(
                      selected.overallGapPercentage
                    )}
                  </b>

                  <span>Overall Gap</span>
                </div>

                <div>
                  <Target />

                  <b>
                    {formatPercentage(
                      selected.readinessPercentage
                    )}
                  </b>

                  <span>Readiness</span>
                </div>
              </div>

              {/* Knowledge Gaps */}
              <div className="gap-section">
                <div className="gap-section-header">
                  <h3>Knowledge Gaps</h3>

                  <p>
                    Skills where current
                    proficiency is below the
                    required level.
                  </p>
                </div>

                {Array.isArray(
                  selected.knowledgeGaps
                ) &&
                selected.knowledgeGaps.length >
                  0 ? (
                  <div className="gap-list">
                    {selected.knowledgeGaps.map(
                      (gap: any, index: number) => {
                        const gapValue =
                          formatGapPercentage(
                            gap.gapPercentage
                          );

                        return (
                          <div
                            className="gap-item"
                            key={
                              gap.knowledgeGapId ||
                              gap.skillId ||
                              gap.skillName ||
                              index
                            }
                          >
                            <div className="gap-item-left">
                              <div className="master-icon">
                                <Target
                                  size={15}
                                />
                              </div>

                              <div>
                                <b>
                                  {gap.skillName ||
                                    "Unknown Skill"}
                                </b>

                                <small>
                                  Current:{" "}
                                  {gap.currentProficiency ||
                                    "—"}{" "}
                                  → Required:{" "}
                                  {gap.requiredProficiency ||
                                    "—"}
                                </small>
                              </div>
                            </div>

                            <strong
                              className={
                                gapValue >= 50
                                  ? "danger"
                                  : ""
                              }
                            >
                              {formatPercentage(
                                gap.gapPercentage
                              )}
                            </strong>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="manager-empty-state compact">
                    <Target size={22} />

                    <h3>
                      No knowledge gaps
                    </h3>

                    <p>
                      No knowledge-gap records
                      were returned for this
                      employee.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="manager-empty-state compact">
              <Target size={22} />

              <h3>Select an employee</h3>

              <p>
                Select Details from the gap-risk
                queue to fetch the employee's
                live gap-analysis response.
              </p>
            </div>
          )}
        </section>
      </div>
    </ManagerPage>
  );
};

export default KnowledgeGapAnalysis;