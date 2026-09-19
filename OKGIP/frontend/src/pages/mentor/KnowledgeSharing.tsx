import React from "react";
import { BookOpen, CalendarDays, Clock3, Download, FileText, Trash2, Upload, X } from "lucide-react";
import MentorLayout from "@/components/layout/MentorLayout";
import mentorshipService, { KnowledgeResource, KnowledgeSession } from "@/services/mentorshipService";

const formatDate = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function KnowledgeSharing() {
  const [sessions, setSessions] = React.useState<KnowledgeSession[]>([]);
  const [resources, setResources] = React.useState<Record<number, KnowledgeResource[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [uploadFor, setUploadFor] = React.useState<KnowledgeSession | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await mentorshipService.getSessions();
      setSessions(data);
      const entries = await Promise.all(data.map(async (s) => [s.sessionId, await mentorshipService.getResources(s.sessionId)] as const));
      setResources(Object.fromEntries(entries));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to load knowledge-sharing data.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const submitUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFor || !file) return;
    setBusy(true);
    setError("");
    try {
      const saved = await mentorshipService.uploadResource(uploadFor.sessionId, file, title, description);
      setResources((old) => ({ ...old, [uploadFor.sessionId]: [saved, ...(old[uploadFor.sessionId] || [])] }));
      setUploadFor(null);
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to upload the learning material.");
    } finally {
      setBusy(false);
    }
  };

  const download = async (resource: KnowledgeResource) => {
    try {
      const blob = await mentorshipService.downloadResource(resource.resourceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = resource.fileName || resource.title || "knowledge-resource";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to download the material.");
    }
  };

  const deleteResource = async (sessionId: number, resourceId: number) => {
    if (!window.confirm("Delete this learning material?")) return;
    try {
      await mentorshipService.deleteResource(resourceId);
      setResources((old) => ({ ...old, [sessionId]: (old[sessionId] || []).filter((r) => r.resourceId !== resourceId) }));
    } catch (e: any) {
      setError(e?.response?.data?.message || "Unable to delete the material.");
    }
  };

  return (
    <MentorLayout title="Knowledge Sharing">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Knowledge Sharing</h2>
        <p className="mt-1 text-slate-500">Share your notes and learning materials with the people in your knowledge-sharing sessions.</p>
      </div>

      {error && <div className="mb-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">Loading knowledge-sharing sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">No knowledge-sharing sessions found.</div>
      ) : (
        <div className="space-y-5">
          {sessions.map((session) => (
            <section key={session.sessionId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2"><BookOpen size={19} className="text-purple-600" /><h3 className="font-bold text-slate-900">{session.title}</h3></div>
                  <p className="mt-2 text-sm text-slate-600">{session.menteeName} · {session.skillName}</p>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span><CalendarDays className="mr-1 inline" size={13} />{formatDate(session.scheduledAt)}</span>
                    <span><Clock3 className="mr-1 inline" size={13} />{session.durationMinutes} min</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{session.status}</span>
                  </div>
                  {session.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{session.notes}</p>}
                </div>
                <button type="button" onClick={() => setUploadFor(session)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white">
                  <Upload size={14} /> Share Material
                </button>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <h4 className="text-sm font-semibold text-slate-800">Learning Materials</h4>
                {(resources[session.sessionId] || []).length === 0 ? (
                  <p className="mt-3 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">No notes or documents shared yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {(resources[session.sessionId] || []).map((resource) => (
                      <div key={resource.resourceId} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="rounded-lg bg-purple-50 p-2 text-purple-600"><FileText size={17} /></div>
                          <div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{resource.title}</p><p className="text-[11px] text-slate-500">{resource.fileName} · {formatSize(resource.fileSize)} · By {resource.authorName || "Participant"}</p></div>
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => download(resource)} className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-[11px] font-semibold text-slate-700"><Download size={13} /> Download</button>
                          <button type="button" onClick={() => deleteResource(session.sessionId, resource.resourceId)} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-2 text-[11px] font-semibold text-rose-700"><Trash2 size={13} /> Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      {uploadFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <form onSubmit={submitUpload} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-5 flex items-center justify-between"><div><h3 className="font-bold text-slate-900">Share Learning Material</h3><p className="mt-1 text-xs text-slate-500">{uploadFor.title}</p></div><button type="button" onClick={() => setUploadFor(null)}><X size={18} /></button></div>
            <label className="mb-4 block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">File</span><input required type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full rounded-lg border p-2 text-xs" /><span className="mt-1 block text-[10px] text-slate-400">PDF, DOC, DOCX, TXT or MD · maximum 10 MB</span></label>
            <label className="mb-4 block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Title</span><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Java Collections Notes" className="w-full rounded-lg border px-3 py-2 text-sm" /></label>
            <label className="mb-5 block"><span className="mb-1.5 block text-xs font-semibold text-slate-600">Description</span><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this material cover?" className="min-h-20 w-full rounded-lg border px-3 py-2 text-sm" /></label>
            <button disabled={busy || !file} className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busy ? "Uploading..." : "Upload Material"}</button>
          </form>
        </div>
      )}
    </MentorLayout>
  );
}
