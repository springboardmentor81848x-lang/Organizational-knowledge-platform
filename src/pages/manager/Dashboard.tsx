import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Search,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "@/styles/manager-dashboard.css";
import "@/styles/manager-pages.css";

import managerService from "@/services/managerService";
import { TeamAnalytics } from "@/services/analyticsService";
import ManagerLayout from "./ManagerLayout";

const pct = (value: any) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0%";
  }

  return `${Math.round(number)}%`;
};

const safeNumber = (value: any) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const initials = (name = "") => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "--"
  );
};

const getGapStatus = (gap: number) => {
  if (gap >= 50) {
    return {
      label: "High Risk",
      className: "high",
    };
  }

  if (gap >= 25) {
    return {
      label: "Needs Attention",
      className: "medium",
    };
  }

  return {
    label: "Healthy",
    className: "low",
  };
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [team, setTeam] = useState<TeamAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadTeam = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await managerService.getTeamAnalytics();

        console.log("MANAGER DASHBOARD TEAM DATA:", data);

        if (mounted) {
          setTeam(Array.isArray(data) ? data : []);
        }
      } catch (err: any) {
        console.error("MANAGER DASHBOARD ERROR:", err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Unable to load team analytics."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTeam();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================
   * TEAM CALCULATIONS
   * ============================
   */

  const avgGap = useMemo(() => {
    if (!team.length) return 0;

    return (
      team.reduce(
        (total, member) =>
          total + safeNumber(member.gapPercentage),
        0
      ) / team.length
    );
  }, [team]);

  const avgReadiness = useMemo(() => {
    if (!team.length) return 0;

    return (
      team.reduce(
        (total, member) =>
          total +
          safeNumber(member.readinessPercentage),
        0
      ) / team.length
    );
  }, [team]);

  const competencyScore = Math.max(
    0,
    Math.min(100, 100 - avgGap)
  );

  const criticalMembers = useMemo(() => {
    return [...team]
      .filter(
        (member) =>
          safeNumber(member.gapPercentage) >= 50
      )
      .sort(
        (a, b) =>
          safeNumber(b.gapPercentage) -
          safeNumber(a.gapPercentage)
      );
  }, [team]);

  const filteredTeam = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return team;
    }

    return team.filter((member) =>
      [
        member.employeeName,
        member.employeeCode,
        member.jobRoleName,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [team, search]);

  /*
   * ============================
   * RENDER
   * ============================
   */

  return (
    <ManagerLayout
      active="Dashboard"
      breadcrumb="Overview"
    >
      <section className="manager-dashboard-content">

        {/* =========================
            HEADER
        ========================= */}

        <header className="manager-dashboard-header">
          <div>
            <div className="manager-dashboard-eyebrow">
              <span className="eyebrow-dot" />
              TEAM INTELLIGENCE
              <span className="eyebrow-live">
                LIVE DATA
              </span>
            </div>

            <h1>Manager Dashboard</h1>

            <p>
              Monitor team readiness, competency and
              knowledge gaps from your organizational
              skill data.
            </p>
          </div>

          <div className="manager-dashboard-actions">
            <button
              type="button"
              className="dashboard-secondary-btn"
              onClick={() =>
                navigate("/manager/employees")
              }
            >
              <Users size={15} />
              View Team
            </button>

            <button
              type="button"
              className="dashboard-primary-btn"
              onClick={() =>
                navigate(
                  "/manager/knowledge-gap-analysis"
                )
              }
            >
              <Activity size={15} />
              Analyze Gaps
              <ArrowUpRight size={14} />
            </button>
          </div>
        </header>

        {/* =========================
            ERROR
        ========================= */}

        {error && (
          <div className="dashboard-error">
            <AlertTriangle size={17} />

            <div>
              <strong>
                Unable to load team analytics
              </strong>

              <p>{error}</p>
            </div>
          </div>
        )}

        {/* =========================
            KPI CARDS
        ========================= */}

        <div className="dashboard-kpi-grid">

          {/* TEAM MEMBERS */}

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon purple">
                <Users size={18} />
              </div>

              <span className="kpi-caption">
                TEAM
              </span>
            </div>

            <div className="kpi-number">
              {loading ? "—" : team.length}
            </div>

            <div className="kpi-title">
              Team Members
            </div>

            <div className="kpi-description">
              Employees available under your team.
            </div>
          </article>

          {/* COMPETENCY */}

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon blue">
                <Target size={18} />
              </div>

              <span className="kpi-caption">
                COMPETENCY
              </span>
            </div>

            <div className="kpi-number">
              {loading
                ? "—"
                : pct(competencyScore)}
            </div>

            <div className="kpi-title">
              Team Competency
            </div>

            <div className="kpi-progress">
              <span
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, competencyScore)
                  )}%`,
                }}
              />
            </div>
          </article>

          {/* GAP */}

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon red">
                <Activity size={18} />
              </div>

              <span className="kpi-caption">
                KNOWLEDGE GAP
              </span>
            </div>

            <div className="kpi-number">
              {loading ? "—" : pct(avgGap)}
            </div>

            <div className="kpi-title">
              Average Gap
            </div>

            <div className="kpi-progress gap-progress">
              <span
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, avgGap)
                  )}%`,
                }}
              />
            </div>
          </article>

          {/* READINESS */}

          <article className="dashboard-kpi-card">
            <div className="kpi-top">
              <div className="kpi-icon green">
                <ShieldCheck size={18} />
              </div>

              <span className="kpi-caption">
                READINESS
              </span>
            </div>

            <div className="kpi-number">
              {loading
                ? "—"
                : pct(avgReadiness)}
            </div>

            <div className="kpi-title">
              Team Readiness
            </div>

            <div className="kpi-progress readiness-progress">
              <span
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, avgReadiness)
                  )}%`,
                }}
              />
            </div>
          </article>
        </div>

        {/* =========================
            MAIN GRID
        ========================= */}

        <div className="dashboard-main-grid">

          {/* TEAM READINESS */}

          <section className="dashboard-panel readiness-panel">
            <div className="panel-header">
              <div>
                <div className="panel-overline">
                  TEAM OVERVIEW
                </div>

                <h2>
                  Team Readiness
                </h2>

                <p>
                  Readiness and knowledge-gap
                  performance across your team.
                </p>
              </div>

              <button
                type="button"
                className="panel-link"
                onClick={() =>
                  navigate("/manager/employees")
                }
              >
                View all
                <ChevronRight size={14} />
              </button>
            </div>

            {loading ? (
              <div className="dashboard-loading">
                <div className="dashboard-spinner" />
                <span>
                  Loading team analytics...
                </span>
              </div>
            ) : team.length === 0 ? (
              <div className="dashboard-empty">
                <Users size={25} />

                <strong>
                  No team data available
                </strong>

                <p>
                  The backend returned no team
                  members for this manager.
                </p>
              </div>
            ) : (
              <div className="readiness-list">
                {filteredTeam
                  .slice(0, 6)
                  .map((member) => {
                    const readiness =
                      safeNumber(
                        member.readinessPercentage
                      );

                    const gap =
                      safeNumber(
                        member.gapPercentage
                      );

                    const status =
                      getGapStatus(gap);

                    return (
                      <div
                        className="readiness-item"
                        key={member.employeeId}
                      >
                        <div className="readiness-person">
                          <div className="readiness-avatar">
                            {initials(
                              member.employeeName
                            )}
                          </div>

                          <div>
                            <strong>
                              {member.employeeName ||
                                "Employee"}
                            </strong>

                            <span>
                              {member.jobRoleName ||
                                member.employeeCode ||
                                "Team member"}
                            </span>
                          </div>
                        </div>

                        <div className="readiness-values">
                          <div>
                            <span>
                              Readiness
                            </span>

                            <strong>
                              {pct(readiness)}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Gap
                            </span>

                            <strong>
                              {pct(gap)}
                            </strong>
                          </div>
                        </div>

                        <div className="readiness-bars">
                          <div className="mini-bar">
                            <span
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    readiness
                                  )
                                )}%`,
                              }}
                            />
                          </div>

                          <div className="mini-bar gap-bar">
                            <span
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    gap
                                  )
                                )}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div
                          className={`readiness-status ${status.className}`}
                        >
                          {status.label}
                        </div>

                        <button
                          type="button"
                          className="row-arrow"
                          onClick={() =>
                            navigate(
                              `/manager/employees?employee=${member.employeeId}`
                            )
                          }
                        >
                          <ChevronRight
                            size={15}
                          />
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

            {!loading &&
              team.length > 6 && (
                <button
                  type="button"
                  className="show-more-btn"
                  onClick={() =>
                    navigate("/manager/employees")
                  }
                >
                  View all team members
                  <ArrowUpRight size={14} />
                </button>
              )}
          </section>

          {/* RISK WATCH */}

          <section className="dashboard-panel risk-panel">
            <div className="panel-header">
              <div>
                <div className="panel-overline risk-overline">
                  ATTENTION REQUIRED
                </div>

                <h2>
                  Risk Watch
                </h2>

                <p>
                  Employees with significant
                  knowledge gaps.
                </p>
              </div>

              <div className="risk-header-icon">
                <Zap size={17} />
              </div>
            </div>

            {criticalMembers.length === 0 ? (
              <div className="risk-success">
                <div className="success-icon">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <strong>
                    No high-risk gaps
                  </strong>

                  <p>
                    No employee currently has a
                    knowledge gap of 50% or higher.
                  </p>
                </div>
              </div>
            ) : (
              <div className="risk-list">
                {criticalMembers
                  .slice(0, 5)
                  .map((member) => (
                    <button
                      type="button"
                      className="risk-item"
                      key={member.employeeId}
                      onClick={() =>
                        navigate(
                          `/manager/knowledge-gap-analysis?employee=${member.employeeId}`
                        )
                      }
                    >
                      <div className="risk-avatar">
                        {initials(
                          member.employeeName
                        )}
                      </div>

                      <div className="risk-person">
                        <strong>
                          {member.employeeName ||
                            "Employee"}
                        </strong>

                        <span>
                          {member.jobRoleName ||
                            "Team member"}
                        </span>
                      </div>

                      <div className="risk-score">
                        <strong>
                          {pct(
                            member.gapPercentage
                          )}
                        </strong>

                        <span>
                          HIGH GAP
                        </span>
                      </div>

                      <ChevronRight
                        size={15}
                      />
                    </button>
                  ))}
              </div>
            )}

            <button
              type="button"
              className="risk-action"
              onClick={() =>
                navigate(
                  "/manager/knowledge-gap-analysis"
                )
              }
            >
              Open Knowledge Gap Analysis
              <ArrowRightIcon />
            </button>
          </section>
        </div>

        {/* =========================
            TEAM DIRECTORY
        ========================= */}

        <section className="dashboard-panel directory-panel">
          <div className="panel-header directory-panel-header">
            <div>
              <div className="panel-overline">
                PEOPLE
              </div>

              <h2>
                Team Directory
              </h2>

              <p>
                Search and access employee
                analytics.
              </p>
            </div>

            <div className="directory-tools">
              <div className="dashboard-search">
                <Search size={15} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search employee, code or role..."
                />
              </div>

              <button
                type="button"
                className="directory-view-btn"
                onClick={() =>
                  navigate("/manager/employees")
                }
              >
                View all
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-loading table-loading">
              <div className="dashboard-spinner" />
              <span>
                Loading employees...
              </span>
            </div>
          ) : filteredTeam.length === 0 ? (
            <div className="dashboard-empty">
              <Search size={25} />

              <strong>
                No matching employees
              </strong>

              <p>
                Try another search term.
              </p>
            </div>
          ) : (
            <div className="dashboard-table-wrapper">
              <div className="dashboard-table-head">
                <span>Employee</span>
                <span>Role</span>
                <span>Readiness</span>
                <span>Knowledge Gap</span>
                <span>Status</span>
                <span />
              </div>

              {filteredTeam.map((member) => {
                const readiness =
                  safeNumber(
                    member.readinessPercentage
                  );

                const gap =
                  safeNumber(
                    member.gapPercentage
                  );

                const status =
                  getGapStatus(gap);

                return (
                  <div
                    className="dashboard-table-row"
                    key={member.employeeId}
                  >
                    <div className="table-employee">
                      <div className="table-avatar">
                        {initials(
                          member.employeeName
                        )}
                      </div>

                      <div>
                        <strong>
                          {member.employeeName ||
                            "Employee"}
                        </strong>

                        <span>
                          {member.employeeCode ||
                            "—"}
                        </span>
                      </div>
                    </div>

                    <span className="table-role">
                      {member.jobRoleName ||
                        "—"}
                    </span>

                    <div className="table-metric">
                      <strong>
                        {pct(readiness)}
                      </strong>

                      <div className="table-progress">
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                readiness
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="table-metric gap-metric">
                      <strong>
                        {pct(gap)}
                      </strong>

                      <div className="table-progress">
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                gap
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <span
                      className={`table-status ${status.className}`}
                    >
                      {status.label}
                    </span>

                    <button
                      type="button"
                      className="table-action"
                      onClick={() =>
                        navigate(
                          `/manager/employees?employee=${member.employeeId}`
                        )
                      }
                    >
                      View
                      <ChevronRight
                        size={13}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================
            QUICK ACCESS
        ========================= */}

        <section className="quick-access-section">
          <div className="quick-access-heading">
            <div>
              <div className="panel-overline">
                MANAGER TOOLS
              </div>

              <h2>
                Quick Access
              </h2>
            </div>
          </div>

          <div className="quick-access-grid">

            <button
              type="button"
              onClick={() =>
                navigate("/manager/job-roles")
              }
            >
              <div className="quick-icon purple">
                <Target size={18} />
              </div>

              <div>
                <strong>
                  Job Roles
                </strong>

                <span>
                  Explore organizational roles
                </span>
              </div>

              <ArrowUpRight size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/manager/skills")
              }
            >
              <div className="quick-icon blue">
                <Activity size={18} />
              </div>

              <div>
                <strong>
                  Skill Library
                </strong>

                <span>
                  Browse organizational skills
                </span>
              </div>

              <ArrowUpRight size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/manager/competency-framework"
                )
              }
            >
              <div className="quick-icon green">
                <ShieldCheck size={18} />
              </div>

              <div>
                <strong>
                  Competency Framework
                </strong>

                <span>
                  Review role competencies
                </span>
              </div>

              <ArrowUpRight size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/manager/knowledge-gap-analysis"
                )
              }
            >
              <div className="quick-icon orange">
                <Zap size={18} />
              </div>

              <div>
                <strong>
                  Gap Analysis
                </strong>

                <span>
                  Identify knowledge gaps
                </span>
              </div>

              <ArrowUpRight size={16} />
            </button>
          </div>
        </section>
      </section>
    </ManagerLayout>
  );
};

/**
 * Small reusable arrow icon.
 */
const ArrowRightIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export default Dashboard;