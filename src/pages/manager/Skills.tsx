import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Search,
  Target,
} from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

export default function Skills() {
  const [items, setItems] = useState<any[]>([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSkills = async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await managerService.getSkills();

        console.log("SKILLS PAGE DATA:", result);

        if (mounted) {
          setItems(
            Array.isArray(result) ? result : []
          );
        }
      } catch (err: any) {
        console.error(
          "SKILLS PAGE ERROR:",
          err
        );

        if (mounted) {
          setItems([]);

          setError(
            err?.response?.data?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Unable to load skills."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSkills();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return items.filter((item) =>
      String(
        item.skillName ||
          item.name ||
          ""
      )
        .toLowerCase()
        .includes(q)
    );
  }, [items, query]);

  return (
    <ManagerPage
      title="Skills"
      subtitle="Browse the shared skill master used by competency and gap analysis."
      icon={Target}
      active="Skills"
    >
      <section className="manager-card manager-data-card">
        <div className="manager-toolbar">
          <div>
            <h2>Skill Master</h2>
            <p>GET /master/skills</p>
          </div>

          <div className="manager-search-large">
            <Search size={15} />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search skills…"
            />
          </div>
        </div>

        {loading && (
          <div className="manager-loading">
            <Loader2
              className="spin"
              size={18}
            />
            Loading skill master…
          </div>
        )}

        {!loading && error && (
          <div className="manager-empty-state">
            <AlertTriangle size={24} />

            <strong>
              Unable to load skills
            </strong>

            <p>{error}</p>
          </div>
        )}

        {!loading &&
          !error &&
          items.length === 0 && (
            <div className="manager-empty-state">
              <Target size={24} />

              <strong>
                No skills returned
              </strong>

              <p>
                The skill master API returned
                no skills.
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
                    item.skillId ||
                    item.id ||
                    index
                  }
                >
                  <div className="master-icon">
                    <Target size={16} />
                  </div>

                  <div>
                    <h3>
                      {item.skillName ||
                        item.name ||
                        "Unnamed Skill"}
                    </h3>

                    <span>
                      {item.skillCategory ||
                        "General"}
                    </span>

                    <p>
                      {item.description ||
                        "Available in the organization skill master."}
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