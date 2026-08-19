import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import gapAnalysisService, {
  GapAnalysisResponse,
  KnowledgeGap,
} from "@/services/gapAnalysisService";
import "@/styles/gap-detection.css";
import { useNavigate } from "react-router-dom";

const SkillGapsPage: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<GapAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGapAnalysis = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await gapAnalysisService.getMyGapAnalysis();

        setData(response);
      } catch (err) {
        console.error("Failed to load gap analysis:", err);

        setError(
          "Unable to load your skill gap analysis. Please make sure your backend is running and the gap analysis is available."
        );
      } finally {
        setLoading(false);
      }
    };

    loadGapAnalysis();
  }, []);

  /*
   * Sort gaps from highest gap percentage
   * to lowest.
   */
  const sortedGaps = useMemo(() => {
    if (!data?.knowledgeGaps) {
      return [];
    }

    return [...data.knowledgeGaps].sort(
      (a, b) => b.gapPercentage - a.gapPercentage
    );
  }, [data]);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="gap-page">
        <div className="gap-loading">
          <div className="gap-spinner" />
          <h2>Loading Skill Gap Analysis...</h2>
          <p>
            We are checking your current skills against the
            required skills for your role.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error
   */
  if (error) {
    return (
      <div className="gap-page">
        <div className="gap-topbar">
          <button
            className="gap-back-button"
            onClick={() => navigate("/employee")}
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>
        </div>

        <div className="gap-error-card">
          <div className="gap-error-icon">
            <AlertCircle size={30} />
          </div>

          <h2>Unable to load Skill Gap Analysis</h2>

          <p>{error}</p>

          <button
            className="gap-primary-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
   * No analysis available
   */
  if (!data) {
    return (
      <div className="gap-page">
        <div className="gap-empty-card">
          <Target size={42} />

          <h2>No Gap Analysis Available</h2>

          <p>
            Your skill gap analysis has not been generated yet.
          </p>

          <button
            className="gap-primary-button"
            onClick={() => navigate("/employee")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gap-page">

      {/* =========================
          HEADER
      ========================== */}
      <div className="gap-header">

        <div>
          <button
            className="gap-back-button"
            onClick={() => navigate("/employee")}
          >
            <ArrowLeft size={17} />
            Dashboard
          </button>

          <div className="gap-title-section">
            <div className="gap-title-icon">
              <Target size={24} />
            </div>

            <div>
              <h1>Skill Gap Analysis</h1>

              <p>
                Identify the skills you need to improve
                for your current role.
              </p>
            </div>
          </div>
        </div>

        <div className="gap-employee-info">
          <div className="gap-avatar">
            {data.employeeName
              ?.charAt(0)
              ?.toUpperCase() || "E"}
          </div>

          <div>
            <strong>{data.employeeName}</strong>
            <span>{data.jobRoleName}</span>
          </div>
        </div>

      </div>

      {/* =========================
          SUMMARY CARDS
      ========================== */}
      <div className="gap-summary-grid">

        <SummaryCard
          title="Overall Gap"
          value={`${data.overallGapPercentage}%`}
          subtitle="Skills requiring improvement"
          type="danger"
          icon={<TrendingDown size={21} />}
        />

        <SummaryCard
          title="Total Skills"
          value={data.totalSkills}
          subtitle="Skills evaluated"
          type="primary"
          icon={<Target size={21} />}
        />

        <SummaryCard
          title="Skill Gaps"
          value={data.gapSkills}
          subtitle="Skills needing attention"
          type="warning"
          icon={<AlertCircle size={21} />}
        />

        <SummaryCard
          title="Readiness"
          value={`${data.readinessPercentage}%`}
          subtitle="Role readiness"
          type="success"
          icon={<TrendingUp size={21} />}
        />

      </div>

      {/* =========================
          OVERVIEW
      ========================== */}
      <div className="gap-content-grid">

        <section className="gap-card gap-overview-card">

          <div className="gap-card-header">
            <div>
              <h2>Skill Gap Overview</h2>
              <p>
                Current proficiency compared with
                required proficiency.
              </p>
            </div>

            <Target size={21} />
          </div>

          <div className="gap-overview-body">

            <div className="gap-progress-circle">
              <div>
                <strong>
                  {Math.round(data.readinessPercentage)}%
                </strong>

                <span>Ready</span>
              </div>
            </div>

            <div className="gap-overview-details">

              <div className="gap-stat-row">
                <span>
                  <span className="gap-dot green" />
                  Skills completed
                </span>

                <strong>
                  {data.completedSkills}
                </strong>
              </div>

              <div className="gap-stat-row">
                <span>
                  <span className="gap-dot red" />
                  Skills with gaps
                </span>

                <strong>
                  {data.gapSkills}
                </strong>
              </div>

              <div className="gap-stat-row">
                <span>
                  <span className="gap-dot purple" />
                  Total skills
                </span>

                <strong>
                  {data.totalSkills}
                </strong>
              </div>

            </div>

          </div>
        </section>

        {/* Priority section */}
        <section className="gap-card">

          <div className="gap-card-header">
            <div>
              <h2>Priority Skills</h2>
              <p>
                Skills with the highest gaps need
                attention first.
              </p>
            </div>

            <AlertCircle size={21} />
          </div>

          <div className="gap-priority-list">

            {sortedGaps.slice(0, 5).map((gap) => (
              <PrioritySkill
                key={gap.knowledgeGapId}
                gap={gap}
              />
            ))}

            {sortedGaps.length === 0 && (
              <div className="gap-no-data">
                <CheckCircle2 size={25} />
                <span>
                  No skill gaps have been identified.
                </span>
              </div>
            )}

          </div>

        </section>

      </div>

      {/* =========================
          GAP DETAILS
      ========================== */}
      <section className="gap-card gap-details-card">

        <div className="gap-card-header">
          <div>
            <h2>Skill Gap Details</h2>
            <p>
              Detailed comparison of your current
              skills against role requirements.
            </p>
          </div>

          <Users size={21} />
        </div>

        {sortedGaps.length > 0 ? (
          <div className="gap-table-wrapper">

            <table className="gap-table">

              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Current Level</th>
                  <th>Required Level</th>
                  <th>Current Experience</th>
                  <th>Required Experience</th>
                  <th>Gap</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {sortedGaps.map((gap) => (
                  <GapTableRow
                    key={gap.knowledgeGapId}
                    gap={gap}
                  />
                ))}

              </tbody>

            </table>

          </div>
        ) : (
          <div className="gap-no-data large">
            <CheckCircle2 size={30} />

            <div>
              <strong>No skill gaps found</strong>

              <p>
                Your current skills match the available
                requirements for your role.
              </p>
            </div>
          </div>
        )}

      </section>

      {/* =========================
          EXPLANATION
      ========================== */}
      <section className="gap-info-banner">

        <div className="gap-info-icon">
          <Target size={22} />
        </div>

        <div>
          <h3>How is your skill gap calculated?</h3>

          <p>
            The system compares your current proficiency
            and experience with the proficiency and
            experience required for your assigned job role.
            The difference is used to identify your skill
            gaps and prioritize areas for improvement.
          </p>
        </div>

      </section>

    </div>
  );
};


/* =====================================================
   SUMMARY CARD
===================================================== */

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  type: "primary" | "success" | "warning" | "danger";
  icon: React.ReactNode;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  type,
  icon,
}) => {
  return (
    <div className={`gap-summary-card ${type}`}>

      <div className="gap-summary-top">

        <div className="gap-summary-icon">
          {icon}
        </div>

      </div>

      <span className="gap-summary-title">
        {title}
      </span>

      <strong className="gap-summary-value">
        {value}
      </strong>

      <span className="gap-summary-subtitle">
        {subtitle}
      </span>

    </div>
  );
};


/* =====================================================
   PRIORITY SKILL
===================================================== */

const PrioritySkill: React.FC<{
  gap: KnowledgeGap;
}> = ({ gap }) => {

  const percentage = Math.min(
    Math.max(gap.gapPercentage, 0),
    100
  );

  const severity =
    percentage >= 70
      ? "Critical"
      : percentage >= 40
      ? "Medium"
      : "Low";

  return (
    <div className="gap-priority-item">

      <div className="gap-priority-main">

        <div>
          <strong>{gap.skillName}</strong>

          <span>
            {gap.currentProficiency}
            {" → "}
            {gap.requiredProficiency}
          </span>
        </div>

        <div className="gap-priority-right">

          <strong>{percentage}%</strong>

          <span
            className={`gap-severity ${severity.toLowerCase()}`}
          >
            {severity}
          </span>

        </div>

      </div>

      <div className="gap-progress-bar">
        <div
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

    </div>
  );
};


/* =====================================================
   TABLE ROW
===================================================== */

const GapTableRow: React.FC<{
  gap: KnowledgeGap;
}> = ({ gap }) => {

  const percentage = Math.min(
    Math.max(gap.gapPercentage, 0),
    100
  );

  const severity =
    percentage >= 70
      ? "Critical"
      : percentage >= 40
      ? "Medium"
      : "Low";

  return (
    <tr>

      <td>
        <div className="gap-skill-name">
          <div className="gap-skill-icon">
            <Target size={15} />
          </div>

          <strong>{gap.skillName}</strong>
        </div>
      </td>

      <td>
        <span className="gap-level current">
          {gap.currentProficiency}
        </span>
      </td>

      <td>
        <span className="gap-level required">
          {gap.requiredProficiency}
        </span>
      </td>

      <td>
        {gap.currentExperience} years
      </td>

      <td>
        {gap.requiredExperience} years
      </td>

      <td>
        <div className="gap-percentage">
          <strong>{percentage}%</strong>

          <div className="gap-mini-bar">
            <div
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>
        </div>
      </td>

      <td>
        <span
          className={`gap-status ${severity.toLowerCase()}`}
        >
          {severity === "Critical" ? (
            <XCircle size={14} />
          ) : severity === "Medium" ? (
            <AlertCircle size={14} />
          ) : (
            <CheckCircle2 size={14} />
          )}

          {gap.status || severity}
        </span>
      </td>

    </tr>
  );
};

export default SkillGapsPage;