import React from "react";
import MentorLayout from "@/components/layout/MentorLayout";
import mentorshipService, {
  MentorshipRequest,
} from "@/services/mentorshipService";
import { Users, RefreshCw, BookOpen, UserCheck } from "lucide-react";

interface MenteeGroup {
  menteeId: number;
  menteeName: string;
  requests: MentorshipRequest[];
}

export default function Mentees() {
  const [rows, setRows] = React.useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requests = await mentorshipService.getMentees();

      const accepted = requests.filter(
        (request) => request.status === "ACCEPTED"
      );

      setRows(accepted);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Unable to load your mentees."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const menteeMap = React.useMemo(() => {
    const map = new Map<number, MenteeGroup>();

    rows.forEach((request) => {
      if (!map.has(request.menteeId)) {
        map.set(request.menteeId, {
          menteeId: request.menteeId,
          menteeName: request.menteeName,
          requests: [],
        });
      }

      map.get(request.menteeId)!.requests.push(request);
    });

    return Array.from(map.values());
  }, [rows]);

  const totalMentees = menteeMap.length;
  const totalSkills = rows.length;

  return (
    <MentorLayout title="My Mentees">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              My Mentees
            </h2>

            <p className="mt-1 text-slate-500">
              View employees with whom you have an accepted mentorship
              relationship.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {/* Summary */}
        {!loading && !error && (
          <div className="grid gap-4 sm:grid-cols-2">
            <SummaryCard
              icon={<UserCheck size={20} />}
              label="Active Mentees"
              value={totalMentees}
            />

            <SummaryCard
              icon={<BookOpen size={20} />}
              label="Mentorship Skills"
              value={totalSkills}
            />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <State text="Loading accepted mentees..." />
        ) : error ? null : menteeMap.length === 0 ? (
          <State text="No accepted mentees yet." />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {menteeMap.map((mentee) => (
              <div
                key={mentee.menteeId}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {/* Mentee Header */}
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Users size={21} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-bold text-slate-900">
                      {mentee.menteeName}
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Mentee ID: {mentee.menteeId}
                    </p>
                  </div>

                  <span className="ml-auto shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                    ACTIVE
                  </span>
                </div>

                {/* Skills */}
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Mentorship Areas
                  </p>

                  <div className="space-y-2">
                    {mentee.requests.map((request) => (
                      <div
                        key={request.requestId}
                        className="rounded-xl bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-slate-800">
                            {request.skillName}
                          </span>

                          <span className="text-[10px] font-semibold text-emerald-600">
                            ACCEPTED
                          </span>
                        </div>

                        <p className="mt-1 text-[11px] text-slate-500">
                          Connected on{" "}
                          {request.createdAt
                            ? new Date(
                                request.createdAt
                              ).toLocaleDateString()
                            : "—"}
                        </p>

                        {request.message && (
                          <p className="mt-2 rounded-lg bg-white p-2 text-xs leading-5 text-slate-600">
                            {request.message}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill count */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    {mentee.requests.length}{" "}
                    {mentee.requests.length === 1
                      ? "mentorship area"
                      : "mentorship areas"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MentorLayout>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
        {icon}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function State({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}