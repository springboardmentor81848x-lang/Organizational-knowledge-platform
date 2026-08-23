import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Loader2,
  Search,
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

const JobRoles: React.FC = () => {
  const [items, setItems] = useState<JobRole[]>([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadJobRoles = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await managerService.getJobRoles();

        console.log("JOB ROLES PAGE DATA:", result);

        if (mounted) {
          setItems(Array.isArray(result) ? result : []);
        }
      } catch (err: any) {
        console.error("JOB ROLES PAGE ERROR:", err);

        if (mounted) {
          setItems([]);

          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load job roles.";

          setError(message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadJobRoles();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      return items;
    }

    return items.filter((item) => {
      const roleName =
        item.jobRoleName ||
        item.name ||
        "";

      const description =
        item.description ||
        "";

      return (
        roleName.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  return (
    <ManagerPage
      title="Job Roles"
      subtitle="Browse organizational job roles exposed by the master-data API."
      icon={BriefcaseBusiness}
      active="Job Roles"
    >
      <section className="manager-card manager-data-card">

        {/* ================= TOOLBAR ================= */}
        <div className="manager-toolbar">
          <div>
            <h2>Job Role Directory</h2>
            <p>
              Available organizational job roles
            </p>
          </div>

          <div className="manager-toolbar-right">
            <div className="manager-search-large">
              <Search size={15} />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search job roles..."
              />
            </div>

            <span className="manager-count">
              {items.length} role
              {items.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="manager-loading">
            <Loader2
              className="spin"
              size={18}
            />
            <span>Loading job roles...</span>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div className="manager-empty-state">
            <div className="manager-empty-icon">
              <AlertTriangle size={22} />
            </div>

            <h2>Unable to load job roles</h2>

            <p>{error}</p>

            <small>
              Check the backend server, authentication
              token and GET /master/job-roles response.
            </small>
          </div>
        )}

        {/* ================= NO DATA ================= */}
        {!loading &&
          !error &&
          items.length === 0 && (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">
                <BriefcaseBusiness size={22} />
              </div>

              <h2>No job roles available</h2>

              <p>
                The master-data API returned no job roles.
              </p>
            </div>
          )}

        {/* ================= DATA ================= */}
        {!loading &&
          !error &&
          items.length > 0 &&
          filtered.length > 0 && (
            <div className="manager-role-table">

              <div className="manager-role-head">
                <span>JOB ROLE</span>
                <span>DESCRIPTION</span>
              </div>

              {filtered.map((item, index) => {
                const roleName =
                  item.jobRoleName ||
                  item.name ||
                  "Unnamed Role";

                return (
                  <div
                    className="manager-role-row"
                    key={
                      item.jobRoleId ||
                      item.id ||
                      index
                    }
                  >
                    <div className="manager-role-name">
                      <div className="manager-role-icon">
                        <BriefcaseBusiness size={16} />
                      </div>

                      <div>
                        <strong>{roleName}</strong>

                        {(item.jobRoleId || item.id) && (
                          <small>
                            Role ID:{" "}
                            {item.jobRoleId || item.id}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="manager-role-description">
                      {item.description || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        {/* ================= SEARCH EMPTY ================= */}
        {!loading &&
          !error &&
          items.length > 0 &&
          filtered.length === 0 && (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">
                <Search size={22} />
              </div>

              <h2>No matching job roles</h2>

              <p>
                Try a different job role or description.
              </p>
            </div>
          )}
      </section>
    </ManagerPage>
  );
};

export default JobRoles;