import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Target,
  TrendingUp,
} from "lucide-react";

import gapAnalysisService, {
  GapAnalysisResponse,
  KnowledgeGap,
} from "@/services/gapAnalysisService";

import { useNavigate } from "react-router-dom";
import EmployeePage from "@/components/layout/EmployeePage";
import "@/styles/gap-detection.css";

type GapLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

const getGapLevel = (gapPercentage: number): GapLevel => {
  if (gapPercentage >= 70) return "CRITICAL";
  if (gapPercentage >= 40) return "HIGH";
  if (gapPercentage >= 20) return "MEDIUM";
  return "LOW";
};

const formatProficiency = (
  proficiency?: string | null
): string => {
  if (!proficiency) return "Not Assessed";

  return proficiency
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
};

const formatPercentage = (
  value?: number | null
): string => {
  if (value == null) return "0%";

  return `${Number(value).toFixed(1)}%`;
};

const SkillGapContent: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] =
    useState<GapAnalysisResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadGapAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
  await gapAnalysisService.runMyGapAnalysis();

setData(response);

      } catch (err) {
        console.error(
          "Failed to load skill gap analysis:",
          err
        );

        setError(
          "Unable to load your skill gap analysis."
        );

      } finally {
        setLoading(false);
      }
    };

    loadGapAnalysis();
  }, []);

  const gaps = useMemo(() => {
    if (!data?.knowledgeGaps) {
      return [];
    }

    return [...data.knowledgeGaps].sort(
      (a, b) =>
        (b.gapPercentage ?? 0) -
        (a.gapPercentage ?? 0)
    );
  }, [data]);

  const criticalCount = useMemo(
    () =>
      gaps.filter(
        (gap) =>
          getGapLevel(
            gap.gapPercentage ?? 0
          ) === "CRITICAL"
      ).length,
    [gaps]
  );

  const highCount = useMemo(
    () =>
      gaps.filter(
        (gap) =>
          getGapLevel(
            gap.gapPercentage ?? 0
          ) === "HIGH"
      ).length,
    [gaps]
  );

  if (loading) {
    return (
      <div className="gap-page">
        <div className="gap-loading">
          <div className="gap-spinner" />

          <h2>
            Loading Skill Gap Analysis...
          </h2>

          <p>
            Comparing your skills with the
            requirements of your current role.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gap-page">
        <div className="gap-error-card">

          <AlertTriangle size={32} />

          <h2>
            Unable to load Skill Gaps
          </h2>

          <p>{error}</p>

          <button
            className="gap-primary-button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="gap-page">
        <div className="gap-empty-card">

          <Target size={40} />

          <h2>
            No Skill Gap Analysis Available
          </h2>

          <p>
            Your skill gap analysis has not
            been generated yet.
          </p>

          <button
            className="gap-primary-button"
            onClick={() =>
              navigate("/employee")
            }
          >
            Back to Dashboard
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="gap-page">

      {/* ROLE BANNER */}
      <section className="role-banner">

        <div>

          <span className="banner-label">
            CURRENT ROLE
          </span>

          <h2>
            {data.jobRoleName}
          </h2>

          <p>
            Your skill gaps are calculated
            against the requirements of this role.
          </p>

        </div>

        <div className="role-target">

          <Target size={22} />

          <div>
            <span>
              Role Readiness
            </span>

            <strong>
              {Math.round(
                data.readinessPercentage ?? 0
              )}%
            </strong>
          </div>

        </div>

      </section>


      {/* SUMMARY */}
      <div className="summary-grid">

        <SummaryCard
          title="Total Skills"
          value={data.totalSkills}
          subtitle="Skills evaluated"
          icon={<Target size={21} />}
          className="purple-card"
        />

        <SummaryCard
          title="Skill Gaps"
          value={data.gapSkills}
          subtitle="Skills needing attention"
          icon={<Flame size={21} />}
          className="red-card"
        />

        <SummaryCard
          title="Critical Gaps"
          value={criticalCount}
          subtitle="Immediate attention required"
          icon={<AlertTriangle size={21} />}
          className="orange-card"
        />

        <SummaryCard
          title="Role Readiness"
          value={`${Math.round(
            data.readinessPercentage ?? 0
          )}%`}
          subtitle="Current readiness"
          icon={<TrendingUp size={21} />}
          className="green-card"
        />

      </div>


      {/* HEATMAP */}
      <section className="section-card">

        <div className="section-heading">

          <div>
            <h2>
              <Flame size={20} />
              Skill Gap Heatmap
            </h2>

            <p>
              Higher intensity indicates a
              larger gap between your current
              skill level and the role requirement.
            </p>
          </div>

          <div className="heatmap-legend">

            <span>
              <i className="legend-dot low" />
              Low
            </span>

            <span>
              <i className="legend-dot medium" />
              Medium
            </span>

            <span>
              <i className="legend-dot high" />
              High
            </span>

            <span>
              <i className="legend-dot critical" />
              Critical
            </span>

          </div>

        </div>


        {gaps.length === 0 ? (

          <div className="empty-state">

            <CheckCircle2 size={40} />

            <h3>
              No Skill Gaps Detected
            </h3>

            <p>
              Your current skills match the
              available requirements for your role.
            </p>

          </div>

        ) : (

          <div className="heatmap">

            {gaps.map(
              (
                gap: KnowledgeGap,
                index
              ) => {

                const gapValue = Math.min(
                  Math.max(
                    gap.gapPercentage ?? 0,
                    0
                  ),
                  100
                );

                const level =
                  getGapLevel(gapValue);

                return (
                  <div
                    className={`heatmap-row ${level.toLowerCase()}`}
                    key={
                      gap.knowledgeGapId ??
                      `${gap.skillName}-${index}`
                    }
                  >

                    {/* SKILL */}
                    <div className="heatmap-skill">

                      <div className="heatmap-skill-icon">
                        <Target size={18} />
                      </div>

                      <div>
                        <strong>
                          {gap.skillName}
                        </strong>

                        <span>
                          {formatProficiency(
                            gap.currentProficiency
                          )}

                          <span className="arrow">
                            →
                          </span>

                          {formatProficiency(
                            gap.requiredProficiency
                          )}
                        </span>
                      </div>

                    </div>


                    {/* GAP BAR */}
                    <div className="heatmap-bars">

                      <div className="bar-line">

                        <div className="bar-label">
                          <span>
                            Skill Gap
                          </span>

                          <strong>
                            {formatPercentage(
                              gapValue
                            )}
                          </strong>
                        </div>

                        <div className="bar-track">

                          <div
                            className={`bar gap-bar ${level.toLowerCase()}`}
                            style={{
                              width: `${gapValue}%`,
                            }}
                          />

                        </div>

                      </div>


                      <div className="experience-line">

                        <span>
                          Experience
                        </span>

                        <strong>
                          {gap.currentExperience ??
                            0}{" "}
                          /{" "}
                          {gap.requiredExperience ??
                            0} years
                        </strong>

                      </div>

                    </div>


                    {/* LEVEL */}
                    <div
                      className={`gap-score ${level.toLowerCase()}`}
                    >

                      <span>
                        {level}
                      </span>

                      <strong>
                        {formatPercentage(
                          gapValue
                        )}
                      </strong>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>


      {/* DETAILS */}
      <section className="section-card">

        <div className="section-heading">

          <div>
            <h2>
              Skill Gap Details
            </h2>

            <p>
              Detailed comparison of your
              current skills and role requirements.
            </p>
          </div>

        </div>


        <div className="table-container">

          <table className="gap-table">

            <thead>
              <tr>
                <th>Skill</th>
                <th>Current</th>
                <th>Required</th>
                <th>Experience</th>
                <th>Gap</th>
                <th>Priority</th>
              </tr>
            </thead>

            <tbody>

              {gaps.map(
                (
                  gap,
                  index
                ) => {

                  const level =
                    getGapLevel(
                      gap.gapPercentage ?? 0
                    );

                  return (
                    <tr
                      key={
                        gap.knowledgeGapId ??
                        `${gap.skillName}-${index}`
                      }
                    >

                      <td>
                        <strong>
                          {gap.skillName}
                        </strong>
                      </td>

                      <td>
                        {formatProficiency(
                          gap.currentProficiency
                        )}
                      </td>

                      <td>
                        {formatProficiency(
                          gap.requiredProficiency
                        )}
                      </td>

                      <td>
                        {gap.currentExperience ??
                          0}{" "}
                        /{" "}
                        {gap.requiredExperience ??
                          0} yrs
                      </td>

                      <td>
                        <strong>
                          {formatPercentage(
                            gap.gapPercentage
                          )}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={`status-pill ${level.toLowerCase()}`}
                        >
                          {level}
                        </span>
                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* EXPLANATION */}
      <section className="gap-info-banner">

        <div className="gap-info-icon">
          <Target size={22} />
        </div>

        <div>

          <h3>
            How is your skill gap determined?
          </h3>

          <p>
            The system compares your current
            skill proficiency with the proficiency
            required by your assigned job role.
            Missing skills are treated as full gaps,
            while proficiency and experience
            differences contribute to the calculated
            gap percentage.
          </p>

        </div>

      </section>

    </div>
  );
};


interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  className: string;
}

const SummaryCard: React.FC<
  SummaryCardProps
> = ({
  title,
  value,
  subtitle,
  icon,
  className,
}) => {

  return (
    <div
      className={`summary-card ${className}`}
    >

      <div className="summary-icon">
        {icon}
      </div>

      <div>
        <span>{title}</span>

        <strong>{value}</strong>

        <small>{subtitle}</small>
      </div>

    </div>
  );
};


const SkillGapsPage: React.FC = () => {
  return (
    <EmployeePage
      title="Skill Gap Heatmap"
      subtitle="Understand your skill gaps and the areas you need to improve for your career growth."
    >
      <SkillGapContent />
    </EmployeePage>
  );
};

export default SkillGapsPage;