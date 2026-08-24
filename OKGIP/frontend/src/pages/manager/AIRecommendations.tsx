import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Brain,
  BookOpen,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";

import ManagerPage from "./ManagerPage";
import managerService from "@/services/managerService";
import { TeamAnalytics } from "@/services/analyticsService";

interface PriorityGap {
  skillName?: string;
  gapType?: string;
  gapPercentage?: number;
  priority?: string;
}

interface LearningPath {
  phase?: number;
  title?: string;
  duration?: string;
  reason?: string;
}

interface RecommendedCourse {
  trainingId?: number;
  trainingName?: string;
  provider?: string;
  level?: string;
  duration?: string;
  courseUrl?: string;
}

interface AiRecommendation {
  employeeId?: number;
  employeeCode?: string;
  employeeName?: string;
  priorityGaps?: PriorityGap[];
  learningPath?: LearningPath[];
  recommendedCourses?: RecommendedCourse[];
}

const AIRecommendations: React.FC = () => {
  const [employees, setEmployees] = useState<TeamAnalytics[]>([]);
  const [selectedEmployee, setSelectedEmployee] =
    useState<number | null>(null);

  const [recommendation, setRecommendation] =
    useState<AiRecommendation | null>(null);

  const [loadingEmployees, setLoadingEmployees] =
    useState(true);

  const [loadingAi, setLoadingAi] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        setError("");

        const data =
          await managerService.getTeamAnalytics();

        setEmployees(
          Array.isArray(data) ? data : []
        );
      } catch (err: any) {
        console.error(
          "AI EMPLOYEE LOAD ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Unable to load employees."
        );
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const generateRecommendation = async (
    employeeId: number
  ) => {
    try {
      setSelectedEmployee(employeeId);
      setLoadingAi(true);
      setError("");
      setRecommendation(null);

      const result =
        await managerService.generateAiRecommendation(
          employeeId
        );

      console.log(
        "AI RECOMMENDATION RESULT:",
        result
      );

      setRecommendation(result);
    } catch (err: any) {
      console.error(
        "AI RECOMMENDATION ERROR:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Unable to generate AI recommendation."
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <ManagerPage
      title="AI Recommendations"
      subtitle="Generate personalized learning recommendations using Gemini AI and live employee knowledge-gap data."
      icon={Sparkles}
      active="AI Recommendations"
    >
      <div className="manager-page-grid">

        {/* ========================= */}
        {/* EMPLOYEE SELECTION */}
        {/* ========================= */}

        <section className="manager-card manager-data-card">

          <div className="manager-toolbar">
            <div>
              <h2>Select Employee</h2>

              <p>
                Choose a team member to generate a
                personalized AI recommendation.
              </p>
            </div>

            <Brain size={20} />
          </div>

          {loadingEmployees && (
            <div className="manager-loading">
              <Loader2
                size={18}
                className="spin"
              />

              Loading employees…
            </div>
          )}

          {!loadingEmployees &&
            employees.length === 0 && (
              <div className="manager-empty-state compact">

                <UserRound size={22} />

                <h3>
                  No employees available
                </h3>

                <p>
                  No team members were returned
                  by the analytics API.
                </p>

              </div>
            )}

          {!loadingEmployees &&
            employees.length > 0 && (
              <div className="ai-employee-list">

                {employees.map(
                  (employee: any) => {
                    const employeeId =
                      Number(
                        employee.employeeId
                      );

                    const isSelected =
                      selectedEmployee ===
                      employeeId;

                    return (
                      <button
                        key={employeeId}
                        type="button"
                        className={`ai-employee-item ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          generateRecommendation(
                            employeeId
                          )
                        }
                      >

                        <div className="ai-employee-avatar">
                          <UserRound
                            size={16}
                          />
                        </div>

                        <div className="ai-employee-info">

                          <strong>
                            {employee.employeeName ||
                              "Employee"}
                          </strong>

                          <span>
                            {employee.jobRoleName ||
                              employee.jobRole ||
                              employee.employeeCode ||
                              "Team Member"}
                          </span>

                        </div>

                        <Sparkles
                          size={15}
                        />

                      </button>
                    );
                  }
                )}

              </div>
            )}

        </section>

        {/* ========================= */}
        {/* AI RESULT */}
        {/* ========================= */}

        <section className="manager-card manager-detail-card">

          <div className="detail-header">

            <div>

              <span>
                GEMINI AI RECOMMENDATION
              </span>

              <h2>
                {recommendation?.employeeName ||
                  "Personalized Learning"}
              </h2>

              <p>
                AI recommendations are generated
                from the employee's actual knowledge
                gaps and available training data.
              </p>

            </div>

            <div className="ai-header-icon">
              <Sparkles size={20} />
            </div>

          </div>

          {loadingAi && (
            <div className="manager-loading">

              <Loader2
                size={20}
                className="spin"
              />

              Gemini is analyzing the employee's
              knowledge gaps…

            </div>
          )}

          {!loadingAi &&
            error && (
              <div className="ai-error">

                <AlertTriangle size={20} />

                <div>

                  <strong>
                    AI recommendation failed
                  </strong>

                  <p>
                    {error}
                  </p>

                </div>

              </div>
            )}

          {!loadingAi &&
            !error &&
            !recommendation && (
              <div className="manager-empty-state compact">

                <Brain size={28} />

                <h3>
                  Select an employee
                </h3>

                <p>
                  Gemini will analyze their
                  knowledge gaps and create a
                  personalized learning
                  recommendation.
                </p>

              </div>
            )}

          {!loadingAi &&
            !error &&
            recommendation && (
              <div className="ai-recommendation-content">

                {/* ================= */}
                {/* PRIORITY GAPS */}
                {/* ================= */}

                <div className="ai-section">

                  <div className="ai-section-title">

                    <Target size={17} />

                    <div>
                      <h3>
                        Priority Skill Gaps
                      </h3>

                      <p>
                        Skills that should be
                        addressed first.
                      </p>
                    </div>

                  </div>

                  {recommendation
                    .priorityGaps
                    ?.length ? (
                    <div className="ai-gap-list">

                      {recommendation.priorityGaps.map(
                        (
                          gap,
                          index
                        ) => (
                          <div
                            className="ai-gap-item"
                            key={`${gap.skillName}-${index}`}
                          >

                            <div>
                              <strong>
                                {gap.skillName ||
                                  "Skill"}
                              </strong>

                              <span>
                                {gap.gapType ||
                                  "Knowledge Gap"}
                              </span>
                            </div>

                            <div className="ai-gap-right">

                              <strong
                                className={
                                  gap.priority ===
                                  "HIGH"
                                    ? "danger"
                                    : ""
                                }
                              >
                                {gap.priority ||
                                  "MEDIUM"}
                              </strong>

                              <span>
                                {gap.gapPercentage !=
                                null
                                  ? `${Math.round(
                                      Number(
                                        gap.gapPercentage
                                      )
                                    )}% gap`
                                  : "Gap"}
                              </span>

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  ) : (
                    <div className="ai-no-data">
                      No priority gaps returned.
                    </div>
                  )}

                </div>

                {/* ================= */}
                {/* LEARNING PATH */}
                {/* ================= */}

                <div className="ai-section">

                  <div className="ai-section-title">

                    <BookOpen size={17} />

                    <div>
                      <h3>
                        Personalized Learning Path
                      </h3>

                      <p>
                        Recommended learning
                        progression.
                      </p>
                    </div>

                  </div>

                  {recommendation
                    .learningPath
                    ?.length ? (
                    <div className="ai-learning-path">

                      {recommendation.learningPath.map(
                        (
                          phase,
                          index
                        ) => (
                          <div
                            className="ai-phase"
                            key={`${phase.phase}-${index}`}
                          >

                            <div className="ai-phase-number">
                              {phase.phase ||
                                index + 1}
                            </div>

                            <div className="ai-phase-content">

                              <strong>
                                {phase.title ||
                                  "Learning Phase"}
                              </strong>

                              <span>
                                {phase.duration ||
                                  "Duration not specified"}
                              </span>

                              {phase.reason && (
                                <p>
                                  {phase.reason}
                                </p>
                              )}

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  ) : (
                    <div className="ai-no-data">
                      No learning path returned.
                    </div>
                  )}

                </div>

                {/* ================= */}
                {/* COURSES */}
                {/* ================= */}

                <div className="ai-section">

                  <div className="ai-section-title">

                    <CheckCircle2
                      size={17}
                    />

                    <div>
                      <h3>
                        Recommended Training
                      </h3>

                      <p>
                        Training available in the
                        organization.
                      </p>
                    </div>

                  </div>

                  {recommendation
                    .recommendedCourses
                    ?.length ? (
                    <div className="ai-course-list">

                      {recommendation.recommendedCourses.map(
                        (
                          course,
                          index
                        ) => (
                          <div
                            className="ai-course"
                            key={
                              course.trainingId ||
                              index
                            }
                          >

                            <div className="ai-course-icon">
                              <BookOpen
                                size={16}
                              />
                            </div>

                            <div className="ai-course-info">

                              <strong>
                                {course.trainingName ||
                                  "Training"}
                              </strong>

                              <span>
                                {course.provider ||
                                  "Organization"}
                                {" • "}
                                {course.level ||
                                  "Level not specified"}
                                {" • "}
                                {course.duration ||
                                  "Duration not specified"}
                              </span>

                            </div>

                            {course.courseUrl && (
                              <a
                                href={
                                  course.courseUrl
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="ai-course-link"
                              >
                                Open
                              </a>
                            )}

                          </div>
                        )
                      )}

                    </div>
                  ) : (
                    <div className="ai-no-data">
                      No training recommendations
                      returned.
                    </div>
                  )}

                </div>

              </div>
            )}

        </section>

      </div>
    </ManagerPage>
  );
};

export default AIRecommendations;