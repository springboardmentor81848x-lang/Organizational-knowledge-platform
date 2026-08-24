import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Target,
  TrendingUp,
} from "lucide-react";

import EmployeePage from "@/components/layout/EmployeePage";
import gapAnalysisService, {
  type GapAnalysisResponse,
  type KnowledgeGap,
} from "@/services/gapAnalysisService";

// =====================================================
// HELPERS
// =====================================================

const parsePercentage = (
  value: string | number | null | undefined
): number => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(
    String(value).replace("%", "").trim()
  );

  return Number.isFinite(parsed) ? parsed : 0;
};

const clampPercentage = (value: number): number => {
  return Math.min(Math.max(value, 0), 100);
};

const formatPercentage = (value: number): string => {
  const rounded = Math.round(value * 10) / 10;

  return `${rounded}%`;
};

// =====================================================
// PRIORITY
// =====================================================

const getPriority = (gap: KnowledgeGap) => {
  const status = String(gap.status || "").toLowerCase();

  if (
    status.includes("improv") ||
    status.includes("progress")
  ) {
    return "Improving";
  }

  const gapPercentage = clampPercentage(
    Number(gap.gapPercentage) || 0
  );

  if (gapPercentage >= 20) {
    return "High Priority";
  }

  if (gapPercentage > 0) {
    return "Medium Priority";
  }

  return "Improving";
};

// =====================================================
// PRIORITY STYLE
// =====================================================

const getPriorityClass = (priority: string) => {
  if (priority === "High Priority") {
    return "bg-red-50 text-red-600";
  }

  if (priority === "Medium Priority") {
    return "bg-orange-50 text-orange-500";
  }

  return "bg-green-50 text-green-600";
};

// =====================================================
// GAP COLOR
// =====================================================

const getGapColorClass = (gapPercentage: number) => {
  if (gapPercentage >= 20) {
    return "text-red-500";
  }

  if (gapPercentage > 10) {
    return "text-orange-500";
  }

  return "text-green-600";
};

// =====================================================
// SKILL ICON
// =====================================================

const SkillIcon: React.FC = () => {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-50">
      <Target
        size={23}
        className="text-purple-600"
      />
    </div>
  );
};

// =====================================================
// STAT CARD
// =====================================================

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
  descriptionClassName?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  iconClassName,
  descriptionClassName = "text-slate-500",
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h2>

          <p
            className={`mt-2 text-sm ${descriptionClassName}`}
          >
            {description}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// SKILL CARD
// =====================================================

interface SkillCardProps {
  skill: KnowledgeGap;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
}) => {
  const currentLevel = clampPercentage(
    parsePercentage(skill.currentProficiency)
  );

  const targetLevel = clampPercentage(
    parsePercentage(skill.requiredProficiency)
  );

  const gapPercentage = clampPercentage(
    Number(skill.gapPercentage) || 0
  );

  const priority = getPriority(skill);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      {/* TOP */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <SkillIcon />

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {skill.skillName}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {skill.jobRoleName || "Employee"}
            </p>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${getPriorityClass(
            priority
          )}`}
        >
          {priority}
        </span>
      </div>

      {/* LEVELS */}
      <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-[1fr_1fr_180px]">
        {/* CURRENT LEVEL */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Current Level
            </span>

            <span className="text-sm font-semibold text-slate-700">
              {formatPercentage(currentLevel)}
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{
                width: `${currentLevel}%`,
              }}
            />
          </div>
        </div>

        {/* TARGET LEVEL */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Target Level
            </span>

            <span className="text-sm font-semibold text-slate-700">
              {formatPercentage(targetLevel)}
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-purple-600 transition-all duration-500"
              style={{
                width: `${targetLevel}%`,
              }}
            />
          </div>
        </div>

        {/* GAP */}
        <div className="flex flex-col justify-center">
          <span className="text-sm font-medium text-slate-500">
            Gap
          </span>

          <span
            className={`mt-1 text-2xl font-bold ${getGapColorClass(
              gapPercentage
            )}`}
          >
            {formatPercentage(gapPercentage)}
          </span>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// MAIN PAGE
// =====================================================

const SkillGapsPage: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] =
    useState<GapAnalysisResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ===================================================
  // LOAD CURRENT LOGGED-IN EMPLOYEE GAP ANALYSIS
  // ===================================================

  useEffect(() => {
    let mounted = true;

    const loadGapAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(
          "SKILL GAPS: Loading current employee gap analysis..."
        );

        const response =
          await gapAnalysisService.getMyGapAnalysis();

        console.log(
          "SKILL GAPS: API RESPONSE:",
          response
        );

        if (!mounted) {
          return;
        }

        setData(response);
      } catch (err) {
        console.error(
          "SKILL GAPS: Failed to load:",
          err
        );

        if (!mounted) {
          return;
        }

        setError(
          "Unable to load your skill gap analysis."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadGapAnalysis();

    return () => {
      mounted = false;
    };
  }, []);

  // ===================================================
  // CALCULATE STATS
  // ===================================================

  const stats = useMemo(() => {
    const skills = data?.knowledgeGaps ?? [];

    const totalSkillGaps =
      data?.gapSkills ?? skills.length;

    const highPriority =
      skills.filter((skill) => {
        const priority = getPriority(skill);

        return priority === "High Priority";
      }).length;

    const improving =
      skills.filter((skill) => {
        const priority = getPriority(skill);

        return priority === "Improving";
      }).length;

    const gapClosure = clampPercentage(
      Number(data?.readinessPercentage) || 0
    );

    return {
      totalSkillGaps,
      highPriority,
      improving,
      gapClosure,
    };
  }, [data]);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <EmployeePage
        title="Skill Gaps"
        subtitle="Identify your skill gaps and understand the areas you need to improve for your career growth."
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-100 border-t-purple-600" />

            <p className="mt-4 text-sm text-slate-500">
              Loading your skill gap analysis...
            </p>
          </div>
        </div>
      </EmployeePage>
    );
  }

  // ===================================================
  // ERROR
  // ===================================================

  if (error) {
    return (
      <EmployeePage
        title="Skill Gaps"
        subtitle="Identify your skill gaps and understand the areas you need to improve for your career growth."
      >
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle
              size={22}
              className="text-red-500"
            />

            <div>
              <h3 className="font-semibold text-red-700">
                Unable to load Skill Gaps
              </h3>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      </EmployeePage>
    );
  }

  // ===================================================
  // NO DATA
  // ===================================================

  if (!data) {
    return (
      <EmployeePage
        title="Skill Gaps"
        subtitle="Identify your skill gaps and understand the areas you need to improve for your career growth."
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <Target
            size={40}
            className="mx-auto text-purple-500"
          />

          <h3 className="mt-4 text-lg font-bold text-slate-900">
            No Skill Gap Data
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            There is currently no skill gap analysis available
            for your account.
          </p>
        </div>
      </EmployeePage>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <EmployeePage
      title="Skill Gaps"
      subtitle="Identify your skill gaps and understand the areas you need to improve for your career growth."
    >
      {/* =================================================
          EMPLOYEE INFO
         ================================================= */}

      <div className="mb-6 rounded-2xl border border-purple-100 bg-purple-50/70 px-6 py-5">
        <p className="text-sm font-medium text-purple-600">
          Skill Gap Analysis For
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          <span className="font-bold text-slate-900">
            {data.employeeName || "Employee"}
          </span>

          <span className="text-slate-400">
            |
          </span>

          <span className="text-sm text-slate-600">
            {data.employeeCode || "—"}
          </span>

          <span className="text-slate-400">
            |
          </span>

          <span className="text-sm text-slate-600">
            {data.jobRoleName || "Employee"}
          </span>
        </div>
      </div>

      {/* =================================================
          STAT CARDS
         ================================================= */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Skill Gaps"
          value={stats.totalSkillGaps}
          description="Skills requiring improvement"
          icon={
            <TrendingUp
              size={22}
              className="text-purple-600"
            />
          }
          iconClassName="bg-purple-50"
        />

        <StatCard
          title="High Priority"
          value={stats.highPriority}
          description="Needs immediate attention"
          icon={
            <AlertTriangle
              size={22}
              className="text-red-500"
            />
          }
          iconClassName="bg-red-50"
          descriptionClassName="text-red-500"
        />

        <StatCard
          title="Improving"
          value={stats.improving}
          description="Skills showing progress"
          icon={
            <ArrowUpRight
              size={22}
              className="text-green-600"
            />
          }
          iconClassName="bg-green-50"
          descriptionClassName="text-green-600"
        />

        <StatCard
          title="Gap Closure"
          value={formatPercentage(stats.gapClosure)}
          description="Overall improvement"
          icon={
            <Target
              size={22}
              className="text-blue-600"
            />
          }
          iconClassName="bg-blue-50"
        />
      </div>

      {/* =================================================
          SKILL GAP LIST
         ================================================= */}

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Your Skill Gaps
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Skills where your current proficiency is below
            the expected level.
          </p>
        </div>

        {data.knowledgeGaps.length === 0 ? (
          <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle2
              size={40}
              className="mx-auto text-green-600"
            />

            <h3 className="mt-3 font-bold text-green-700">
              No Skill Gaps Found
            </h3>

            <p className="mt-1 text-sm text-green-600">
              Great! You currently have no identified skill
              gaps.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.knowledgeGaps.map(
              (skill, index) => (
                <SkillCard
                  key={
                    skill.knowledgeGapId ||
                    `${skill.skillName}-${index}`
                  }
                  skill={skill}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* =================================================
          RECOMMENDED NEXT STEP
         ================================================= */}

      <section className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/70 p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white">
              <CheckCircle2
                size={21}
                className="text-purple-600"
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Recommended Next Step
              </h3>

              <p className="mt-1 text-sm text-slate-600">
                Focus on your highest-priority skill gaps
                first, then continue with the recommended
                learning path to strengthen your skills.
              </p>
            </div>
          </div>

          {/* =================================================
              THIS BUTTON GOES TO THE SAME ROUTE AS SIDEBAR
             ================================================= */}

          <button
            type="button"
            onClick={() =>
              navigate("/employee/learning-paths")
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            View Learning Path
            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>
    </EmployeePage>
  );
};

export default SkillGapsPage;