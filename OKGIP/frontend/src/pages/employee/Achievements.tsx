import React, { useEffect, useMemo, useState } from "react";
import EmployeePage, { Card } from "@/components/layout/EmployeePage";

import { Award, BookOpen, CheckCircle2, GraduationCap, Target, Zap } from "lucide-react";

import { getMySkills } from "@/services/skillService";
import analyticsService from "@/services/analyticsService";
import trainingProgressService, {
  TrainingProgress,
} from "@/services/trainingProgressService";
import profileService from "@/services/profileService";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  unlocked: boolean;
  progress: number;
  progressText: string;
}

const toPercentage = (value: unknown): number | null => {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return null;
  }

  if (n >= 0 && n <= 1) {
    return n * 100;
  }

  return Math.max(0, Math.min(100, n));
};

const extractRows = (value: any, keys: string[]): any[] => {
  if (Array.isArray(value)) {
    return value;
  }

  for (const key of keys) {
    if (Array.isArray(value?.[key])) {
      return value[key];
    }
  }

  return [];
};

const Achievements: React.FC = () => {
  const [skills, setSkills] = useState<any[]>([]);
  const [proficiency, setProficiency] = useState<any>(null);
  const [trainingProgress, setTrainingProgress] = useState<
    TrainingProgress[]
  >([]);
  const [profile, setProfile] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadAchievementsData = async () => {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          getMySkills(),
          analyticsService.getMyProficiency(),
          trainingProgressService.getMyProgress(),
          profileService.getMyProfile(),
        ]);

        if (!mounted) {
          return;
        }

        const [
          skillsResult,
          proficiencyResult,
          trainingResult,
          profileResult,
        ] = results;

        if (skillsResult.status === "fulfilled") {
          setSkills(
            Array.isArray(skillsResult.value)
              ? skillsResult.value
              : []
          );
        }

        if (proficiencyResult.status === "fulfilled") {
          setProficiency(proficiencyResult.value);
        }

        if (trainingResult.status === "fulfilled") {
          setTrainingProgress(
            Array.isArray(trainingResult.value)
              ? trainingResult.value
              : []
          );
        }

        if (profileResult.status === "fulfilled") {
          setProfile(profileResult.value);
        }

        if (
          skillsResult.status === "rejected" &&
          proficiencyResult.status === "rejected" &&
          trainingResult.status === "rejected" &&
          profileResult.status === "rejected"
        ) {
          setError("Unable to load your achievement data.");
        }
      } catch (err) {
        console.error(
          "Failed to load achievement data:",
          err
        );
        setError("Unable to load achievement data.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadAchievementsData();

    return () => {
      mounted = false;
    };
  }, []);

  const proficiencyRows = useMemo(
    () =>
      extractRows(proficiency, [
        "skills",
        "proficiencies",
        "data",
        "items",
      ]),
    [proficiency]
  );

  const proficiencyValues = useMemo(
    () =>
      proficiencyRows
        .map((row) =>
          toPercentage(
            row.proficiencyPercentage ??
              row.percentage ??
              row.score ??
              row.currentPercentage
          )
        )
        .filter(
          (value): value is number => value !== null
        ),
    [proficiencyRows]
  );

  const averageProficiency = useMemo(() => {
    if (proficiencyValues.length === 0) {
      return 0;
    }

    return (
      proficiencyValues.reduce(
        (sum, value) => sum + value,
        0
      ) / proficiencyValues.length
    );
  }, [proficiencyValues]);

  const completedTrainings = trainingProgress.filter(
    (item) => item.status === "COMPLETED"
  ).length;

  const totalLearningActivities = trainingProgress.length;

  const totalLearningHours = trainingProgress.reduce(
    (sum, item) =>
      sum + Number(item.hoursSpent || 0),
    0
  );

  const employeeName =
    profile?.employeeName ||
    profile?.name ||
    "Employee";

  const achievements: Achievement[] = [
    {
      id: "skill-builder",
      title: "Skill Builder",
      description:
        "Add at least 5 skills to your employee skill profile.",
      icon: BookOpen,
      unlocked: skills.length >= 5,
      progress: Math.min(
        100,
        (skills.length / 5) * 100
      ),
      progressText: `${skills.length}/5 skills`,
    },
    {
      id: "learning-champion",
      title: "Learning Champion",
      description:
        "Complete at least 5 assigned training programs.",
      icon: GraduationCap,
      unlocked: completedTrainings >= 5,
      progress: Math.min(
        100,
        (completedTrainings / 5) * 100
      ),
      progressText: `${completedTrainings}/5 completed`,
    },
    {
      id: "proficiency-master",
      title: "Proficiency Master",
      description:
        "Reach an average proficiency of at least 80%.",
      icon: Target,
      unlocked: averageProficiency >= 80,
      progress: Math.min(
        100,
        (averageProficiency / 80) * 100
      ),
      progressText: `${averageProficiency.toFixed(1)}% average`,
    },
    {
      id: "consistent-learner",
      title: "Consistent Learner",
      description:
        "Participate in at least 10 learning activities.",
      icon: Zap,
      unlocked: totalLearningActivities >= 10,
      progress: Math.min(
        100,
        (totalLearningActivities / 10) * 100
      ),
      progressText: `${totalLearningActivities}/10 activities`,
    },
    {
      id: "learning-hours",
      title: "Learning Hours",
      description:
        "Complete at least 20 hours of tracked learning.",
      icon: CheckCircle2,
      unlocked: totalLearningHours >= 20,
      progress: Math.min(
        100,
        (totalLearningHours / 20) * 100
      ),
      progressText: `${totalLearningHours.toFixed(1)}/20 hours`,
    },
  ];

  const unlockedCount = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  return (
    <EmployeePage
      title="Achievements"
      subtitle={`Track your learning milestones and accomplishments, ${employeeName}.`}
    >
      <Card title="Your Achievements">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading your achievements...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">
                  Achievements Unlocked
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <Award
                    size={18}
                    className="text-purple-600"
                  />
                  <strong className="text-xl text-slate-800">
                    {unlockedCount}
                  </strong>
                  <span className="text-xs text-slate-400">
                    / {achievements.length}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">
                  Completed Training
                </span>
                <div className="mt-1">
                  <strong className="text-xl text-slate-800">
                    {completedTrainings}
                  </strong>
                  <span className="ml-2 text-xs text-slate-400">
                    courses
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">
                  Learning Hours
                </span>
                <div className="mt-1">
                  <strong className="text-xl text-slate-800">
                    {totalLearningHours.toFixed(1)}
                  </strong>
                  <span className="ml-2 text-xs text-slate-400">
                    hours
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;

                return (
                  <div
                    key={achievement.id}
                    className={`rounded-xl border p-5 transition ${
                      achievement.unlocked
                        ? "border-purple-200 bg-purple-50/40"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                          achievement.unlocked
                            ? "bg-purple-100 text-purple-600"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        <Icon size={21} />
                      </div>

                      {achievement.unlocked && (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                          UNLOCKED
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                      {achievement.title}
                    </h3>

                    <p className="mt-1 min-h-[38px] text-xs leading-5 text-slate-500">
                      {achievement.description}
                    </p>

                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">
                          Progress
                        </span>

                        <span className="font-semibold text-slate-600">
                          {achievement.progressText}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all ${
                            achievement.unlocked
                              ? "bg-green-500"
                              : "bg-purple-500"
                          }`}
                          style={{
                            width: `${achievement.progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-slate-300 p-4">
              <div className="flex items-start gap-3">
                <Award
                  size={18}
                  className="mt-0.5 text-purple-600"
                />

                <div>
                  <p className="text-xs font-semibold text-slate-700">
                    Achievement calculation
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    Achievement progress is calculated from
                    your current skills, proficiency,
                    training progress and tracked learning
                    activity returned by the Employee APIs.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>
    </EmployeePage>
  );
};

export default Achievements;