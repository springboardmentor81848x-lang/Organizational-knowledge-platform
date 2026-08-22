import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Loader2,
  Search,
} from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

export default function JobRoles() {
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadJobRoles = async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await managerService.getJobRoles();

        console.log("JOB ROLES PAGE DATA:", result);

        if (mounted) {
          setItems(
            Array.isArray(result) ? result : []
          );
        }
      } catch (err: any) {
        console.error(
          "JOB ROLES PAGE ERROR:",
          err
        );

        if (mounted) {
          setItems([]);

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

    loadJobRoles();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) =>
      String(
        item.jobRoleName ||
          item.name ||
          ""
      )
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  return (
    <ManagerPage
      title="Job Roles"
      subtitle="Browse organizational job roles exposed by the master-data API."
      icon={BriefcaseBusiness}
      active="Job Roles"
    >
      <section className="manager-card manager-data-card">
        <div className="manager-toolbar">
          <div>
            <h2>Job Role Master</h2>
            <p>GET /master/job-roles</p>
          </div>

          <div className="manager-search-large">
            <Search size={15} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search job roles…"
            />
          </div>
        </div>

        {loading && (
          <div className="manager-loading">
            <Loader2
              className="spin"
              size={18}
            />
            Loading job roles…
          </div>
        )}

        {!loading && error && (
          <div className="manager-empty-state">
            <AlertTriangle size={24} />

            <strong>
              Unable to load job roles
            </strong>

            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          items.length === 0 && (
            <div className="manager-empty-state">
              <BriefcaseBusiness size={24} />

              <strong>
                No job roles returned
              </strong>

              <p>
                The master-data API returned no
                job roles.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filtered.length > 0 && (
            <div className="manager-card-grid">
              {filtered.map((item, index) => (
                <div
                  className="master-card"
                  key={
                    item.jobRoleId ||
                    item.id ||
                    index
                  }
                >
                  <div className="master-icon">
                    <BriefcaseBusiness
                      size={16}
                    />
                  </div>

                  <div>
                    <h3>
                      {item.jobRoleName ||
                        item.name ||
                        "Unnamed Role"}
                    </h3>

                    <p>
                      {item.description ||
                        "Organizational job role."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    </ManagerPage>
  );
}