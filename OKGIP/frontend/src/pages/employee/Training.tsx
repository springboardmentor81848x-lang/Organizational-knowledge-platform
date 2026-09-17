import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, BookOpen, CheckCircle2, ExternalLink, Loader2, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EmployeePage, { Card } from "@/components/layout/EmployeePage";
import trainingService, { Training as TrainingModel } from "@/services/trainingService";
import trainingProgressService, { TrainingProgress } from "@/services/trainingProgressService";

const Training: React.FC = () => {
  const navigate = useNavigate();
const [trainings, setTrainings] = useState<TrainingModel[]>([]);
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingId, setStartingId] = useState<number | null>(null);
  const timers = useRef<Record<number, number>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [catalog, mine] = await Promise.all([
          trainingService.getAvailableTrainings(),
          trainingProgressService.getMyProgress(),
        ]);
        setTrainings(catalog);
        setProgress(mine);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load training programs.");
      } finally {
        setLoading(false);
      }
    };
    void load();
    return () => Object.values(timers.current).forEach(window.clearInterval);
  }, []);

  const getProgress = (trainingId: number) => progress.find((p) => p.trainingId === trainingId);

const startTraining = async (training: TrainingModel) => {    try {
      setStartingId(training.trainingId);
      const current = await trainingProgressService.start(training.trainingId);
      setProgress((old) => [...old.filter((p) => p.trainingId !== training.trainingId), current]);
      if (!timers.current[training.trainingId]) {
        timers.current[training.trainingId] = window.setInterval(async () => {
          if (document.visibilityState !== "visible") return;
          try {
            const updated = await trainingProgressService.heartbeat(training.trainingId);
            setProgress((old) => [...old.filter((p) => p.trainingId !== training.trainingId), updated]);
            if (updated.status === "COMPLETED") {
              window.clearInterval(timers.current[training.trainingId]);
              delete timers.current[training.trainingId];
            }
          } catch (e) {
            console.error("Training heartbeat failed", e);
          }
        }, 30000);
      }
      navigate(`/employee/training/${training.trainingId}/learn`);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to start training.");
    } finally {
      setStartingId(null);
    }
  };

  return (
    <EmployeePage title="Training" subtitle="Discover and continue relevant training programs.">
      <Card title="Training Catalog" subtitle="Progress and learning time are calculated automatically from your learning activity.">
        {loading && <div className="flex min-h-[250px] items-center justify-center"><Loader2 size={30} className="animate-spin text-purple-600" /></div>}
        {!loading && error && <div className="rounded-xl border border-red-200 bg-red-50 p-5"><div className="flex items-start gap-3"><AlertCircle size={20} className="text-red-500" /><p className="text-xs text-red-600">{error}</p></div></div>}
        {!loading && !error && trainings.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center"><BookOpen size={36} className="mx-auto text-slate-300" /><h3 className="mt-3 text-sm font-semibold text-slate-700">No training programs available</h3></div>}
        {!loading && !error && trainings.length > 0 && <div className="grid gap-4 md:grid-cols-2">
          {trainings.map((training) => {
            const item = getProgress(training.trainingId);
            const completed = item?.status === "COMPLETED";
            const pct = item?.progressPercentage ?? 0;
            return <div key={training.trainingId} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-purple-200 hover:shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600"><BookOpen size={18} /></div>
              <h3 className="mt-4 text-sm font-bold text-slate-800">{training.trainingName}</h3>
              <p className="mt-2 text-xs leading-5 text-slate-500">{training.description || "Improve your skills through this training program."}</p>
              <p className="mt-4 text-[10px] font-semibold text-slate-400">Provider: {training.provider}</p>
              <div className="mt-3 flex gap-2"><span className="rounded-full bg-purple-50 px-2.5 py-1 text-[9px] font-bold text-purple-700">{training.level}</span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">{training.duration}</span></div>
              {item && <div className="mt-5"><div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-500"><span>{item.status.replace("_", " ")}</span><span>{Math.round(pct)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${pct}%` }} /></div><p className="mt-2 text-[10px] text-slate-400">Learning time: {item.hoursSpent.toFixed(2)} hrs · Calculated automatically</p></div>}
              {!completed && <button type="button" onClick={() => void startTraining(training)} disabled={startingId === training.trainingId} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-[10px] font-semibold text-white hover:bg-purple-700 disabled:opacity-60"><Play size={12} />{startingId === training.trainingId ? "Opening..." : item?.status === "IN_PROGRESS" ? "Continue Learning" : "Start Learning"}</button>}
              {completed && <div className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-emerald-600"><CheckCircle2 size={14} /> Completed</div>}
              {training.courseUrl && <a href={training.courseUrl} target="_blank" rel="noopener noreferrer" className="ml-3 mt-5 inline-flex items-center gap-2 text-[10px] font-semibold text-slate-500 hover:text-purple-600">Course reference <ExternalLink size={12} /></a>}
            </div>;
          })}
        </div>}
      </Card>
    </EmployeePage>
  );
};
export default Training;
