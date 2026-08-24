import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Search,
  Target,
} from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

interface JobRole {
  jobRoleId?: number;
  id?: number;
  jobRoleName?: string;
  name?: string;
  description?: string;
}

const getRoleId = (role: JobRole) =>
  role.jobRoleId ?? role.id ?? null;

const getRoleName = (role: JobRole) =>
  role.jobRoleName ?? role.name ?? "Unnamed Role";

/**
 * Convert different backend competency response shapes
 * into a simple array without inventing any data.
 */
const extractCompetencies = (response: any): any[] => {
  if (!response) {
    return [];
  }

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.competencies)) {
    return response.competencies;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.skills)) {
    return response.skills;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  return [];
};

const getCompetencyName = (item: any) =>
  item.competencyName ||
  item.skillName ||
  item.name ||
  item.competency ||
  item.skill ||
  "Unnamed Competency";

const getLevel = (item: any) =>
  item.requiredLevel ??
  item.proficiencyLevel ??
  item.level ??
  item.requiredProficiency ??
  null;

const CompetencyFramework: React.FC = () => {
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(
    null
  );
  const [data, setData] = useState<any>(null);

  const [roleQuery, setRoleQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  /**
   * Load available job roles
   */
  useEffect(() => {
    let mounted = true;

    const loadRoles = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await managerService.getJobRoles();

        console.log(
          "COMPETENCY FRAMEWORK JOB ROLES:",
          result
        );

        if (mounted) {
          setRoles(Array.isArray(result) ? result : []);
        }
      } catch (err: any) {
        console.error(
          "COMPETENCY FRAMEWORK JOB ROLES ERROR:",
          err
        );

        if (mounted) {
          setRoles([]);

          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Unable to load job roles."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadRoles();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Fetch competencies for selected role
   */
  const loadCompetencies = async (roleId: number) => {
    try {
      setSelectedRoleId(roleId);
      setDetailLoading(true);
      setDetailError("");
      setData(null);

      const result =
        await managerService.getJobRoleCompetencies(roleId);

      console.log(
        `COMPETENCIES FOR JOB ROLE ${roleId}:`,
        result
      );

      setData(result);
    } catch (err: any) {
      console.error(
        `COMPETENCY FRAMEWORK DETAIL ERROR ${roleId}:`,
        err
      );

      setData(null);

      setDetailError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to load competencies for this job role."
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /**
   * Search job roles
   */
  const filteredRoles = useMemo(() => {
    const query = roleQuery.trim().toLowerCase();

    if (!query) {
      return roles;
    }

    return roles.filter((role) =>
      [
        role.jobRoleName,
        role.name,
        role.description,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [roles, roleQuery]);

  const selectedRole = roles.find(
    (role) => getRoleId(role) === selectedRoleId
  );

  const competencies = extractCompetencies(data);

  return (
    <ManagerPage
      title="Competency Framework"
      subtitle="Review required competencies for each job role."
      icon={BookOpen}
      active="Competency Framework"
    >
      <div className="competency-framework-grid">

        {/* ================= JOB ROLES ================= */}
        <section className="manager-card competency-role-card">

          <div className="competency-card-header">
            <div>
              <span className="manager-section-label">
                JOB ROLES
              </span>

              <h2>Role Competency Directory</h2>

              <p>
                Select a job role to view its required
                competencies.
              </p>
            </div>

            <span className="manager-count">
              {roles.length} role
              {roles.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="competency-search">
            <Search size={15} />

            <input
              value={roleQuery}
              onChange={(event) =>
                setRoleQuery(event.target.value)
              }
              placeholder="Search job roles..."
            />
          </div>

          {loading && (
            <div className="manager-loading">
              <Loader2
                className="spin"
                size={18}
              />
              Loading job roles...
            </div>
          )}

          {!loading && error && (
            <div className="manager-empty-state competency-message">
              <AlertTriangle size={24} />

              <strong>
                Unable to load job roles
              </strong>

              <p>{error}</p>
            </div>
          )}

          {!loading &&
            !error &&
            roles.length === 0 && (
              <div className="manager-empty-state competency-message">
                <BookOpen size={24} />

                <strong>
                  No job roles available
                </strong>

                <p>
                  The job role master API returned no
                  roles.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            roles.length > 0 &&
            filteredRoles.length === 0 && (
              <div className="manager-empty-state competency-message">
                <Search size={22} />

                <strong>
                  No matching job roles
                </strong>

                <p>
                  Try a different role name.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredRoles.length > 0 && (
              <div className="competency-role-list">
                {filteredRoles.map((role, index) => {
                  const roleId = getRoleId(role);

                  return (
                    <button
                      type="button"
                      key={roleId ?? index}
                      className={`competency-role-item ${
                        selectedRoleId === roleId
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        if (roleId !== null) {
                          loadCompetencies(roleId);
                        }
                      }}
                    >
                      <span className="competency-role-icon">
                        <BriefcaseIcon />
                      </span>

                      <span className="competency-role-info">
                        <strong>
                          {getRoleName(role)}
                        </strong>

                        <small>
                          {role.description ||
                            `Role ID: ${
                              roleId ?? "—"
                            }`}
                        </small>
                      </span>

                      <ChevronRight
                        size={15}
                        className="competency-role-arrow"
                      />
                    </button>
                  );
                })}
              </div>
            )}
        </section>

        {/* ================= COMPETENCIES ================= */}
        <section className="manager-card competency-detail-card">

          <div className="competency-card-header detail">
            <div>
              <span className="manager-section-label">
                COMPETENCY FRAMEWORK
              </span>

              <h2>
                {selectedRole
                  ? getRoleName(selectedRole)
                  : "Select a Job Role"}
              </h2>

              <p>
                {selectedRole
                  ? "Required competencies returned by the backend."
                  : "Choose a role from the directory to view its competency requirements."}
              </p>
            </div>

            {selectedRole && (
              <div className="competency-role-badge">
                <Target size={14} />
                Role Selected
              </div>
            )}
          </div>

          {detailLoading && (
            <div className="manager-loading competency-loading">
              <Loader2
                className="spin"
                size={20}
              />
              Loading competencies...
            </div>
          )}

          {!detailLoading && detailError && (
            <div className="manager-empty-state competency-message">
              <AlertTriangle size={24} />

              <strong>
                Unable to load competencies
              </strong>

              <p>{detailError}</p>
            </div>
          )}

          {!detailLoading &&
            !detailError &&
            !selectedRoleId && (
              <div className="competency-placeholder">
                <div className="competency-placeholder-icon">
                  <BookOpen size={24} />
                </div>

                <h3>
                  Choose a job role
                </h3>

                <p>
                  Select a role from the left to view
                  its competency framework.
                </p>
              </div>
            )}

          {!detailLoading &&
            !detailError &&
            selectedRoleId &&
            data &&
            competencies.length > 0 && (
              <div className="competency-list">

                <div className="competency-list-head">
                  <span>COMPETENCY</span>
                  <span>REQUIRED LEVEL</span>
                </div>

                {competencies.map(
                  (item: any, index: number) => {
                    const level = getLevel(item);

                    return (
                      <div
                        className="competency-list-row"
                        key={
                          item.competencyId ||
                          item.skillId ||
                          item.id ||
                          index
                        }
                      >
                        <div className="competency-name">
                          <div className="competency-check">
                            <CheckCircle2 size={15} />
                          </div>

                          <div>
                            <strong>
                              {getCompetencyName(
                                item
                              )}
                            </strong>

                            {item.category && (
                              <small>
                                {item.category}
                              </small>
                            )}
                          </div>
                        </div>

                        <div>
                          {level !== null &&
                          level !== undefined ? (
                            <span className="competency-level">
                              Level {String(level)}
                            </span>
                          ) : (
                            <span className="competency-not-specified">
                              Not specified
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}

          {!detailLoading &&
            !detailError &&
            selectedRoleId &&
            data &&
            competencies.length === 0 && (
              <div className="competency-placeholder compact">
                <div className="competency-placeholder-icon">
                  <BookOpen size={22} />
                </div>

                <h3>
                  No competency records returned
                </h3>

                <p>
                  The backend returned a response, but
                  no competency list was found in the
                  supported response fields.
                </p>
              </div>
            )}
        </section>
      </div>
    </ManagerPage>
  );
};

/**
 * Small inline icon so the role list does not
 * depend on another lucide import.
 */
const BriefcaseIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="3"
      y="7"
      width="18"
      height="13"
      rx="2"
    />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M3 12h18" />
  </svg>
);

export default CompetencyFramework;