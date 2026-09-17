import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, Clock3, Loader2 } from "lucide-react";
import EmployeePage, { Card, ProgressBar } from "@/components/layout/EmployeePage";
import trainingProgressService, { TrainingProgress } from "@/services/trainingProgressService";

const Progress: React.FC = () => {
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await trainingProgressService.getMyProgress();
        setProgress(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load your learning progress.");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const completedCourses = useMemo(
    () => progress.filter((item) => item.status === "COMPLETED").length,
    [progress]
  );

  const inProgressCourses = useMemo(
    () => progress.filter((item) => item.status === "IN_PROGRESS").length,
    [progress]
  );

  const totalHours = useMemo(
    () => progress.reduce((sum, item) => sum + Number(item.hoursSpent || 0), 0),
    [progress]
  );

  const overallProgress = useMemo(() => {
    if (!progress.length) return 0;
    return Math.round(
      progress.reduce((sum, item) => sum + Number(item.progressPercentage || 0), 0) /
        progress.length
    );
  }, [progress]);

  return (
    <EmployeePage
      title="My Progress"
      subtitle="Track your actual training activity, completion and learning time."
    >
      {loading && (
        <Card>
          <div className="flex min-h-[300px] items-center justify-center">
            <Loader2 size={30} className="animate-spin text-purple-600" />
          </div>
        </Card>
      )}

      {!loading && error && (
        <Card>
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <BookOpen size={19} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Learning Progress</p>
                  <p className="text-xl font-bold text-slate-900">{overallProgress}%</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={19} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Courses Done</p>
                  <p className="text-xl font-bold text-slate-900">{completedCourses}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Clock3 size={19} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Learning Hours</p>
                  <p className="text-xl font-bold text-slate-900">{totalHours.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <BookOpen size={19} />
                </div>
                <div>
                  <p className="text-xs text-slate-500">In Progress</p>
                  <p className="text-xl font-bold text-slate-900">{inProgressCourses}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Training Progress" subtitle="Progress is calculated from completed training modules.">
              {progress.length === 0 ? (
                <div className="py-12 text-center">
                  <BookOpen size={36} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">No training activity yet</p>
                  <p className="mt-1 text-xs text-slate-400">Start a training program to see your progress here.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {progress.map((item) => {
                    const value = Math.min(100, Math.max(0, Number(item.progressPercentage || 0)));
                    return (
                      <div key={item.employeeTrainingId}>
                        <div className="mb-1 flex justify-between gap-3 text-xs">
                          <b className="truncate">{item.trainingName}</b>
                          <span className="shrink-0">{value.toFixed(2)}%</span>
                        </div>
                        <ProgressBar value={value} />
                        <div className="mt-1 flex justify-between text-[10px] text-slate-400">
                          <span>{item.status.replace("_", " ")}</span>
                          <span>{Number(item.hoursSpent || 0).toFixed(2)} hrs</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card title="Learning Summary" subtitle="Values are read from your training records; no placeholder progress is used.">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] text-slate-400">Enrolled Courses</p>
                  <b className="mt-2 block text-xl">{progress.length}</b>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] text-slate-400">Completed Courses</p>
                  <b className="mt-2 block text-xl">{completedCourses}</b>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] text-slate-400">Learning Hours</p>
                  <b className="mt-2 block text-xl">{totalHours.toFixed(2)}</b>
                </div>
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] text-slate-400">Active Courses</p>
                  <b className="mt-2 block text-xl">{inProgressCourses}</b>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </EmployeePage>
  );
};

export default Progress;
