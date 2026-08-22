import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Loader2,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";
import { TeamAnalytics } from "@/services/analyticsService";

const pct = (value: any) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0%";
  }

  return `${Math.round(number)}%`;
};

const Employees: React.FC = () => {
  const [params, setParams] = useSearchParams();

  const [team, setTeam] = useState<TeamAnalytics[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Load manager team analytics
   */
  useEffect(() => {
    let mounted = true;

    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await managerService.getTeamAnalytics();

        console.log("EMPLOYEES PAGE TEAM DATA:", result);

        if (mounted) {
          setTeam(Array.isArray(result) ? result : []);
        }
      } catch (err: any) {
        console.error("EMPLOYEES PAGE ERROR:", err);

        if (mounted) {
          setTeam([]);

          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load team employees.";

          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Open employee analytics from URL
   */
  useEffect(() => {
    const id = Number(params.get("employee"));

    if (!id) {
      setSelected(null);
      return;
    }

    let mounted = true;

    const loadEmployee = async () => {
      try {
        const result =
          await managerService.getEmployeeSummary(id);

        console.log(
          `EMPLOYEE ${id} SUMMARY:`,
          result
        );

        if (mounted) {
          setSelected(result);
        }
      } catch (err) {
        console.error(
          `EMPLOYEE ${id} SUMMARY ERROR:`,
          err
        );

        if (mounted) {
          setSelected(null);
        }
      }
    };

    loadEmployee();

    return () => {
      mounted = false;
    };
  }, [params]);

  /**
   * Search/filter employees
   */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return team;
    }

    return team.filter((employee: any) => {
      return [
        employee.employeeName,
        employee.employeeCode,
        employee.jobRoleName,
        employee.jobRole,
        employee.role,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [team, query]);

  return (
    <ManagerPage
      title="Employees"
      subtitle="View team members and open their backend analytics."
      icon={Users}
      active="Employees"
    >
      <section className="manager-card manager-data-card">
        <div className="manager-toolbar">
          <div className="manager-search-large">
            <Search size={15} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search name, code or role…"
            />
          </div>

          <span>
            {team.length} team member
            {team.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading && (
          <div className="manager-loading">
            <Loader2 className="spin" size={18} />
            Loading employees…
          </div>
        )}

        {!loading && error && (
          <div className="manager-empty-state">
            <AlertTriangle size={24} />

            <strong>
              Unable to load team employees
            </strong>

            <p>{error}</p>

            <small>
              Check the backend server, authentication
              token and GET /analytics/team response.
            </small>
          </div>
        )}

        {!loading && !error && team.length === 0 && (
          <div className="manager-empty-state">
            <Users size={24} />

            <strong>No team members</strong>

            <p>
              The backend returned no employees for
              this manager.
            </p>
          </div>
        )}

        {!loading && !error && team.length > 0 && (
          <div className="manager-modern-table">
            <div className="modern-head">
              <span>Employee</span>
              <span>Role</span>
              <span>Readiness</span>
              <span>Gap</span>
              <span />
            </div>

            {filtered.map((employee: any) => (
              <button
                type="button"
                className="modern-row"
                key={employee.employeeId}
                onClick={() =>
                  setParams({
                    employee: String(
                      employee.employeeId
                    ),
                  })
                }
              >
                <span>
                  <b>
                    {employee.employeeName ||
                      employee.name ||
                      "Employee"}
                  </b>

                  <small>
                    {employee.employeeCode || "—"}
                  </small>
                </span>

                <span>
                  {employee.jobRoleName ||
                    employee.jobRole ||
                    employee.role ||
                    "—"}
                </span>

                <strong>
                  {pct(
                    employee.readinessPercentage ??
                      employee.readiness
                  )}
                </strong>

                <strong
                  className={
                    Number(
                      employee.gapPercentage ??
                        employee.overallGapPercentage
                    ) >= 50
                      ? "danger"
                      : ""
                  }
                >
                  {pct(
                    employee.gapPercentage ??
                      employee.overallGapPercentage
                  )}
                </strong>

                <span>View →</span>
              </button>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          team.length > 0 &&
          filtered.length === 0 && (
            <div className="manager-empty-state">
              <Search size={24} />

              <strong>
                No matching employees
              </strong>

              <p>
                Try a different name, employee code
                or role.
              </p>
            </div>
          )}
      </section>

      {selected && (
        <section className="manager-card manager-detail-card">
          <div className="detail-header">
            <div>
              <span>EMPLOYEE ANALYTICS</span>

              <h2>
                {selected.employeeName ||
                  selected.name ||
                  "Employee"}
              </h2>

              <p>
                Live response from the employee
                analytics API.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setParams({});
              }}
              aria-label="Close employee analytics"
            >
              <X size={16} />
            </button>
          </div>

          <div className="detail-kpis">
            <div>
              <ShieldCheck />

              <b>
                {pct(
                  selected.readinessPercentage ??
                    selected.readiness
                )}
              </b>

              <span>Readiness</span>
            </div>

            <div>
              <Activity />

              <b>
                {pct(
                  selected.gapPercentage ??
                    selected.overallGapPercentage
                )}
              </b>

              <span>Knowledge Gap</span>
            </div>

            <div>
              <Users />

              <b>
                {selected.totalSkills ?? "—"}
              </b>

              <span>Skills</span>
            </div>
          </div>

          <pre className="api-json">
            {JSON.stringify(selected, null, 2)}
          </pre>
        </section>
      )}
    </ManagerPage>
  );
};

export default Employees;