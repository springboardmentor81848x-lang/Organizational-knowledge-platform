import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Loader2,
  Search,
  Target,
} from "lucide-react";
import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";

interface Skill {
  skillId?: number;
  id?: number;
  skillName?: string;
  name?: string;
  skillCategory?: string;
  category?: string;
  description?: string;
}

const Skills: React.FC = () => {
  const [items, setItems] = useState<Skill[]>([]);
  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadSkills = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await managerService.getSkills();

        console.log("SKILLS PAGE DATA:", result);

        if (mounted) {
          setItems(Array.isArray(result) ? result : []);
        }
      } catch (err: any) {
        console.error("SKILLS PAGE ERROR:", err);

        if (mounted) {
          setItems([]);

          const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load skills.";

          setError(message);
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

    if (!q) {
      return items;
    }

    return items.filter((item) => {
      const skillName =
        item.skillName ||
        item.name ||
        "";

      const category =
        item.skillCategory ||
        item.category ||
        "";

      const description =
        item.description ||
        "";

      return (
        skillName.toLowerCase().includes(q) ||
        category.toLowerCase().includes(q) ||
        description.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  return (
    <ManagerPage
      title="Skills"
      subtitle="Browse the shared skill master used by competency and gap analysis."
      icon={Target}
      active="Skills"
    >
      <section className="manager-card manager-data-card">

        {/* ================= TOOLBAR ================= */}
        <div className="manager-toolbar">
          <div>
            <h2>Skill Directory</h2>
            <p>
              Available organizational skills
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
                placeholder="Search skills..."
              />
            </div>

            <span className="manager-count">
              {items.length} skill
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
            <span>Loading skills...</span>
          </div>
        )}

        {/* ================= ERROR ================= */}
        {!loading && error && (
          <div className="manager-empty-state">
            <div className="manager-empty-icon">
              <AlertTriangle size={22} />
            </div>

            <h2>Unable to load skills</h2>

            <p>{error}</p>

            <small>
              Check the backend server, authentication
              token and GET /master/skills response.
            </small>
          </div>
        )}

        {/* ================= NO DATA ================= */}
        {!loading &&
          !error &&
          items.length === 0 && (
            <div className="manager-empty-state">
              <div className="manager-empty-icon">
                <Target size={22} />
              </div>

              <h2>No skills available</h2>

              <p>
                The skill master API returned no skills.
              </p>
            </div>
          )}

        {/* ================= DATA ================= */}
        {!loading &&
          !error &&
          items.length > 0 &&
          filtered.length > 0 && (
            <div className="manager-skill-table">

              <div className="manager-skill-head">
                <span>SKILL</span>
                <span>CATEGORY</span>
                <span>DESCRIPTION</span>
              </div>

              {filtered.map((item, index) => {
                const skillName =
                  item.skillName ||
                  item.name ||
                  "Unnamed Skill";

                const category =
                  item.skillCategory ||
                  item.category ||
                  "General";

                return (
                  <div
                    className="manager-skill-row"
                    key={
                      item.skillId ||
                      item.id ||
                      index
                    }
                  >
                    <div className="manager-skill-name">
                      <div className="manager-skill-icon">
                        <Target size={16} />
                      </div>

                      <div>
                        <strong>{skillName}</strong>

                        {(item.skillId || item.id) && (
                          <small>
                            Skill ID:{" "}
                            {item.skillId || item.id}
                          </small>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="manager-skill-category">
                        {category}
                      </span>
                    </div>

                    <div className="manager-skill-description">
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

              <h2>No matching skills</h2>

              <p>
                Try a different skill, category or description.
              </p>
            </div>
          )}

      </section>
    </ManagerPage>
  );
};

export default Skills;