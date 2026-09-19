import React, { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MessageCircle, Star, UserRound, Users, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import EmployeePage, { Card } from "@/components/layout/EmployeePage";
import mentorshipService, {
  KnowledgeSession,
  MentorRecommendation,
  MentorshipRequest,
  KnowledgeResource,
} from "@/services/mentorshipService";

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const statusClass = (status: string) => {
  if (status === "ACCEPTED" || status === "COMPLETED") return "bg-emerald-50 text-emerald-700";
  if (status === "REJECTED" || status === "CANCELLED") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
};

const Mentorship: React.FC = () => {
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [requests, setRequests] = useState<MentorshipRequest[]>([]);
  const [sessions, setSessions] = useState<KnowledgeSession[]>([]);
  const [resources, setResources] = useState<Record<number, KnowledgeResource[]>>({});
  const [uploadFor, setUploadFor] = useState<KnowledgeSession | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [sessionFor, setSessionFor] = useState<MentorshipRequest | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<KnowledgeSession | null>(null);
  const [sessionTitle, setSessionTitle] = useState("Knowledge Sharing Session");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(5);
  const { employeeId: currentEmployeeId } = useAuth();
  const [comments, setComments] = useState("");

  const load = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [recommended, myRequests, mySessions] = await Promise.all([
        mentorshipService.getRecommendations(),
        mentorshipService.getRequests(),
        mentorshipService.getSessions(),
      ]);
      setRecommendations(recommended);
      setRequests(myRequests);
      setSessions(mySessions);
      const resourceEntries = await Promise.all(mySessions.map(async (session) => [session.sessionId, await mentorshipService.getResources(session.sessionId)] as const));
      setResources(Object.fromEntries(resourceEntries));
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to load mentorship data from the backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const pendingIncoming = useMemo(
    () => requests.filter((item) => item.status === "PENDING" && item.mentorId === currentEmployeeId),
    [requests],
  );

  const activeRequests = useMemo(
    () => requests.filter((item) => item.status === "ACCEPTED"),
    [requests],
  );

  const requestMentor = async (mentor: MentorRecommendation) => {
    setBusyId(mentor.employeeId);
    setMessage("");
    try {
      await mentorshipService.createRequest(
        mentor.employeeId,
        mentor.skillId,
        `I would like guidance on ${mentor.skillName} to improve my current skill gap.`,
      );
      setMessage(`Mentorship request sent to ${mentor.name}.`);
      await load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to send the mentorship request.");
    } finally {
      setBusyId(null);
    }
  };

  const respond = async (requestId: number, action: "accept" | "reject") => {
    setBusyId(requestId);
    setMessage("");
    try {
      if (action === "accept") await mentorshipService.acceptRequest(requestId);
      else await mentorshipService.rejectRequest(requestId);
      await load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to update the mentorship request.");
    } finally {
      setBusyId(null);
    }
  };

  const scheduleSession = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sessionFor) return;
    setBusyId(sessionFor.requestId);
    try {
      await mentorshipService.createSession(
        sessionFor.requestId,
        sessionTitle,
        scheduledAt,
        durationMinutes,
        notes,
      );
      setSessionFor(null);
      setSessionTitle("Knowledge Sharing Session");
      setScheduledAt("");
      setDurationMinutes(30);
      setNotes("");
      setMessage("Knowledge-sharing session scheduled successfully.");
      await load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to schedule the session.");
    } finally {
      setBusyId(null);
    }
  };

  const completeSession = async (sessionId: number) => {
    setBusyId(sessionId);
    try {
      await mentorshipService.completeSession(sessionId);
      setMessage("Session marked as completed. You can now submit feedback.");
      await load();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to complete the session.");
    } finally {
      setBusyId(null);
    }
  };

  const uploadMaterial = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!uploadFor || !uploadFile) return;
    setBusyId(uploadFor.sessionId);
    try {
      const saved = await mentorshipService.uploadResource(uploadFor.sessionId, uploadFile, uploadTitle, uploadDescription);
      setResources((old) => ({ ...old, [uploadFor.sessionId]: [saved, ...(old[uploadFor.sessionId] || [])] }));
      setUploadFor(null);
      setUploadFile(null);
      setUploadTitle("");
      setUploadDescription("");
      setMessage("Learning material shared successfully.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to share the learning material.");
    } finally {
      setBusyId(null);
    }
  };

  const downloadMaterial = async (resource: KnowledgeResource) => {
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
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to download the material.");
    }
  };

  const submitFeedback = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!feedbackFor) return;
    setBusyId(feedbackFor.sessionId);
    try {
      await mentorshipService.submitFeedback(feedbackFor.sessionId, rating, comments);
      setFeedbackFor(null);
      setRating(5);
      setComments("");
      setMessage("Feedback submitted successfully.");
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Unable to submit feedback.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <EmployeePage title="Mentorship" subtitle="Connect with experts and turn skill gaps into knowledge-sharing opportunities.">
      {message && (
        <div className="mb-5 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-xs text-purple-700">
          {message}
        </div>
      )}

      {loading ? (
        <Card title="Mentorship & Knowledge Sharing">
          <div className="py-12 text-center text-xs text-slate-500">Loading live mentorship data...</div>
        </Card>
      ) : (
        <>
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <SummaryCard icon={<Users size={18} />} label="Recommended Mentors" value={recommendations.length} />
            <SummaryCard icon={<MessageCircle size={18} />} label="Active Mentorships" value={activeRequests.length} />
            <SummaryCard icon={<CalendarDays size={18} />} label="Upcoming Sessions" value={sessions.filter((s) => s.status === "SCHEDULED").length} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card title="Recommended Mentors" subtitle="Experts are matched to your skill needs, proficiency and experience.">
              {recommendations.length === 0 ? (
                <EmptyState
                  title="No mentor recommendations right now"
                  text="No suitable active mentor is currently available for your skills. Add or update skills, or try again later."
                />
              ) : (
                <div className="space-y-3">
                  {recommendations.map((mentor) => (
                    <div key={`${mentor.employeeId}-${mentor.skillId}`} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 gap-3">
                          <div className="rounded-full bg-purple-50 p-2 text-purple-600"><UserRound size={16} /></div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{mentor.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{mentor.skillName} · {mentor.proficiency}</p>
                            <p className="mt-1 text-[11px] text-slate-400">{mentor.department || "Department not available"}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={busyId === mentor.employeeId}
                          onClick={() => requestMentor(mentor)}
                          className="shrink-0 rounded-lg bg-purple-600 px-3 py-2 text-[11px] font-semibold text-white disabled:opacity-50"
                        >
                          {busyId === mentor.employeeId ? "Sending..." : "Request"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="My Mentorship" subtitle="Requests and accepted mentor relationships.">
              {requests.length === 0 ? (
                <EmptyState title="No mentorship activity yet" text="Send a request to a recommended mentor to start knowledge sharing." />
              ) : (
                <div className="space-y-3">
                  {requests.map((item) => (
                    <div key={item.requestId} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.skillName}</p>
                          <p className="mt-1 text-xs text-slate-500">{item.menteeName} ↔ {item.mentorName}</p>
                          {item.message && <p className="mt-2 text-[11px] text-slate-500">{item.message}</p>}
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(item.status)}`}>{item.status.replaceAll("_", " ")}</span>
                      </div>
                      {item.status === "PENDING" && item.mentorId === currentEmployeeId && (
                        <div className="mt-3 flex gap-2">
                          <button type="button" onClick={() => respond(item.requestId, "accept")} disabled={busyId === item.requestId} className="rounded-lg border border-emerald-200 px-3 py-2 text-[10px] font-semibold text-emerald-700 disabled:opacity-50">Accept</button>
                          <button type="button" onClick={() => respond(item.requestId, "reject")} disabled={busyId === item.requestId} className="rounded-lg border border-rose-200 px-3 py-2 text-[10px] font-semibold text-rose-700 disabled:opacity-50">Reject</button>
                        </div>
                      )}
                      {item.status === "ACCEPTED" && (
                        <button type="button" onClick={() => setSessionFor(item)} className="mt-3 rounded-lg border px-3 py-2 text-[10px] font-semibold text-slate-700">Schedule Knowledge Session</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="mt-5">
            <Card title="Knowledge-Sharing Sessions" subtitle="Schedule, complete and review mentoring sessions.">
              {sessions.length === 0 ? (
                <EmptyState title="No sessions scheduled" text="Accepted mentorships can be used to schedule knowledge-sharing sessions." />
              ) : (
                <div className="space-y-3">
                  {sessions.map((session) => (
                    <div key={session.sessionId} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{session.title}</p>
                          <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-500">
                            <span className="inline-flex items-center gap-1"><Users size={13} />{session.mentorName} ↔ {session.menteeName}</span>
                            <span className="inline-flex items-center gap-1"><CalendarDays size={13} />{formatDate(session.scheduledAt)}</span>
                            <span className="inline-flex items-center gap-1"><Clock3 size={13} />{session.durationMinutes} min</span>
                            <span>{session.skillName}</span>
                          </div>
                          {resources[session.sessionId]?.length ? (
                            <div className="mt-3 rounded-lg bg-slate-50 p-3">
                              <p className="mb-2 text-[11px] font-semibold text-slate-700">Learning Materials</p>
                              <div className="space-y-2">
                                {resources[session.sessionId].map((resource) => (
                                  <div key={resource.resourceId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                    <div className="min-w-0"><p className="truncate text-[11px] font-semibold text-slate-700">{resource.title}</p><p className="text-[10px] text-slate-400">{resource.fileName} · {resource.authorName || "Participant"}</p></div>
                                    <button type="button" onClick={() => downloadMaterial(resource)} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold text-slate-700">Download</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 text-[11px] text-slate-400">No learning materials shared yet.</p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => setUploadFor(session)} className="rounded-lg border border-purple-200 px-3 py-2 text-[10px] font-semibold text-purple-700">Share Material</button>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(session.status)}`}>{session.status.replaceAll("_", " ")}</span>
                          {session.status === "SCHEDULED" && (
                            <>
                              <button type="button" onClick={() => completeSession(session.sessionId)} disabled={busyId === session.sessionId} className="rounded-lg border px-3 py-2 text-[10px] font-semibold text-slate-700 disabled:opacity-50">Mark Complete</button>
                              <button type="button" onClick={async () => { setBusyId(session.sessionId); try { await mentorshipService.cancelSession(session.sessionId); setMessage("Session cancelled successfully."); await load(); } catch (error: any) { setMessage(error?.response?.data?.message || "Unable to cancel the session."); } finally { setBusyId(null); } }} disabled={busyId === session.sessionId} className="rounded-lg border border-rose-200 px-3 py-2 text-[10px] font-semibold text-rose-700 disabled:opacity-50">Cancel</button>
                            </>
                          )}
                          {session.status === "COMPLETED" && (
                            session.myFeedbackSubmitted ? <span className="text-[10px] font-semibold text-emerald-700">Feedback submitted</span> : <button type="button" onClick={() => setFeedbackFor(session)} className="inline-flex items-center gap-1 rounded-lg bg-purple-600 px-3 py-2 text-[10px] font-semibold text-white"><Star size={12} />Feedback</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {pendingIncoming.length > 0 && (
            <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-xs text-amber-800">
              <strong>{pendingIncoming.length}</strong> mentorship request(s) are waiting for a response. If you are the requested mentor, accept or reject them from <strong>My Mentorship</strong>.
            </div>
          )}
        </>
      )}

      {sessionFor && (
        <Modal title="Schedule Knowledge Session" onClose={() => setSessionFor(null)}>
          <form onSubmit={scheduleSession} className="space-y-4">
            <Field label="Title"><input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" required /></Field>
            <Field label="Date & time"><input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" required /></Field>
            <Field label="Duration (minutes)"><input type="number" min={15} max={240} value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" required /></Field>
            <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" /></Field>
            <button disabled={busyId === sessionFor.requestId} className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busyId === sessionFor.requestId ? "Scheduling..." : "Schedule Session"}</button>
          </form>
        </Modal>
      )}

      {uploadFor && (
        <Modal title="Share Learning Material" onClose={() => setUploadFor(null)}>
          <form onSubmit={uploadMaterial} className="space-y-4">
            <Field label="File"><input required type="file" accept=".pdf,.doc,.docx,.txt,.md" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs" /></Field>
            <p className="-mt-2 text-[10px] text-slate-400">PDF, DOC, DOCX, TXT or MD · maximum 10 MB</p>
            <Field label="Title"><input value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="e.g. Session Notes" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" /></Field>
            <Field label="Description"><textarea value={uploadDescription} onChange={(e) => setUploadDescription(e.target.value)} placeholder="Briefly describe this material" className="w-full min-h-20 rounded-lg border border-slate-200 px-3 py-2 text-sm" /></Field>
            <button disabled={busyId === uploadFor.sessionId || !uploadFile} className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busyId === uploadFor.sessionId ? "Uploading..." : "Share Material"}</button>
          </form>
        </Modal>
      )}

      {feedbackFor && (
        <Modal title="Session Feedback" onClose={() => setFeedbackFor(null)}>
          <form onSubmit={submitFeedback} className="space-y-4">
            <Field label="Rating (1–5)"><input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" required /></Field>
            <Field label="Comments"><textarea value={comments} onChange={(e) => setComments(e.target.value)} className="w-full min-h-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-400" placeholder="What was useful? What could improve?" /></Field>
            <button disabled={busyId === feedbackFor.sessionId} className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{busyId === feedbackFor.sessionId ? "Submitting..." : "Submit Feedback"}</button>
          </form>
        </Modal>
      )}
    </EmployeePage>
  );
};

const SummaryCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3 inline-flex rounded-lg bg-purple-50 p-2 text-purple-600">{icon}</div>
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

const EmptyState = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-xl bg-slate-50 p-8 text-center">
    <CheckCircle2 className="mx-auto text-slate-300" size={26} />
    <p className="mt-3 text-sm font-semibold text-slate-700">{title}</p>
    <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">{text}</p>
  </div>
);

const Modal = ({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><XCircle size={18} /></button>
      </div>
      {children}
    </div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
    {children}
  </label>
);

export default Mentorship;
