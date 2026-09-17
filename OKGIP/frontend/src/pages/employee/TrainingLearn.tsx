import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, FileText, Loader2, PlayCircle, BookOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeePage, { Card } from "@/components/layout/EmployeePage";
import trainingService, { Training } from "@/services/trainingService";
import trainingProgressService, { TrainingModule, TrainingProgress } from "@/services/trainingProgressService";

const TrainingLearn: React.FC = () => {
  const { trainingId } = useParams<{ trainingId: string }>();
  const id = Number(trainingId);
  const navigate = useNavigate();
  const [training, setTraining] = useState<Training | undefined>();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<TrainingProgress | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [catalog, content, mine] = await Promise.all([
          trainingService.getAvailableTrainings(),
          trainingProgressService.getContent(id),
          trainingProgressService.getMyProgress(),
        ]);
        setTraining(catalog.find((x) => x.trainingId === id));
        setModules(content);
        const existing = mine.find((x) => x.trainingId === id);
        if (existing) {
          setProgress(existing);
        } else {
          setProgress(await trainingProgressService.start(id));
        }
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load this training.");
      } finally {
        setLoading(false);
      }
    };
    if (Number.isFinite(id)) void load();
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [id]);

  useEffect(() => {
    if (!id || !progress || progress.status === "COMPLETED") return;
    const send = async () => {
      if (document.visibilityState !== "visible") return;
      try { setProgress(await trainingProgressService.heartbeat(id)); } catch (e) { console.error(e); }
    };
    timer.current = window.setInterval(() => void send(), 30000);
    return () => { if (timer.current) window.clearInterval(timer.current); timer.current = null; };
  }, [id, progress?.status]);

  const current = modules[active];
  const completedCount = useMemo(() => modules.filter((m) => m.completed).length, [modules]);
  const percentage = modules.length ? Math.round((completedCount / modules.length) * 100) : 0;

  const completeCurrent = async () => {
    if (!current || current.completed) return;
    try {
      setBusy(true);
      const updated = await trainingProgressService.completeModule(id, current.moduleId);
      setProgress(updated);
      setModules((old) => old.map((m) => m.moduleId === current.moduleId ? { ...m, completed: true, completedAt: new Date().toISOString() } : m));
      if (active < modules.length - 1) setActive(active + 1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to complete this module.");
    } finally { setBusy(false); }
  };

  if (loading) return <EmployeePage title="Training"><div className="flex min-h-[350px] items-center justify-center"><Loader2 size={30} className="animate-spin text-purple-600" /></div></EmployeePage>;
  if (error && !training) return <EmployeePage title="Training"><Card><p className="text-sm text-red-600">{error}</p></Card></EmployeePage>;

  return <EmployeePage title={training?.trainingName || "Training"} subtitle={training?.provider ? `${training.provider} · ${training.level} · ${training.duration}` : "Learn module by module."}>
    <div className="mb-5 flex items-center justify-between"><button onClick={() => navigate("/employee/training")} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-purple-600"><ArrowLeft size={14} /> Back to Training</button><div className="text-right"><p className="text-[10px] text-slate-400">Learning time</p><p className="text-sm font-bold text-slate-800">{progress?.hoursSpent.toFixed(2) || "0.00"} hrs</p></div></div>
    <Card title="Course Progress" subtitle="Progress is calculated from completed modules. You never enter a percentage or hours.">
      <div className="flex items-center justify-between text-xs font-semibold"><span>{completedCount} of {modules.length} modules completed</span><span>{percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-purple-600 transition-all" style={{ width: `${percentage}%` }} /></div>
    </Card>
    <div className="mt-5 grid gap-5 lg:grid-cols-[320px_1fr]">
      <Card title="Course Content" subtitle="Follow the modules in order."><div className="space-y-2">{modules.map((module, index) => <button key={module.moduleId} onClick={() => setActive(index)} className={`w-full rounded-xl border p-3 text-left ${index === active ? "border-purple-300 bg-purple-50" : "border-slate-100 bg-white"}`}><div className="flex items-center gap-3"><div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold">{module.completed ? <CheckCircle2 size={15} className="text-emerald-600" /> : module.moduleOrder}</div><div className="min-w-0"><p className="text-xs font-bold text-slate-800">{module.moduleTitle}</p><p className="mt-1 text-[10px] text-slate-400">{module.estimatedMinutes || "—"} min</p></div></div></button>)}</div></Card>
      <Card title={current?.moduleTitle || "Module"} subtitle={current?.description || "Study the resources below, then continue when you have completed the module."}>
        {!current ? <div className="py-16 text-center text-sm text-slate-500">No modules have been added to this training yet.</div> : <>
          <div className="space-y-3">{current.resources.map((resource) => <a key={resource.resourceId} href={resource.resourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-slate-200 p-4 hover:border-purple-300 hover:bg-purple-50"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">{resource.resourceType === "PDF" ? <FileText size={17} /> : resource.resourceType === "VIDEO" ? <PlayCircle size={17} /> : <BookOpen size={17} />}</div><div><p className="text-xs font-bold text-slate-800">{resource.title}</p><p className="text-[10px] text-slate-400">{resource.resourceType}{resource.description ? ` · ${resource.description}` : ""}</p></div></div><ExternalLink size={14} className="text-slate-400" /></a>)}</div>
          <div className="mt-6 flex items-center justify-between rounded-xl bg-slate-50 p-4"><div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={15} /> Active learning time is tracked automatically.</div><button onClick={() => void completeCurrent()} disabled={busy || current.completed} className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Saving..." : current.completed ? "Module Completed" : "Complete & Continue"}</button></div>
        </>}
      </Card>
    </div>
  </EmployeePage>;
};
export default TrainingLearn;
