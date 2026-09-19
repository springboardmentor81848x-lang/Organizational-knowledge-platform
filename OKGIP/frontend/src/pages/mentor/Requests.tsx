import React from "react";
import MentorLayout from "@/components/layout/MentorLayout";
import mentorshipService, {
  MentorshipRequest,
} from "@/services/mentorshipService";
import {
  RefreshCw,
  User,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";

export default function MentorRequests() {
  const [rows, setRows] = React.useState<MentorshipRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState<number | null>(null);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requests = await mentorshipService.getMentorRequests();
      setRows(requests);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Unable to load mentorship requests."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const action = async (
    id: number,
    type: "accept" | "reject"
  ) => {
    setBusy(id);
    setError("");

    try {
      if (type === "accept") {
        await mentorshipService.acceptRequest(id);
      } else {
        await mentorshipService.rejectRequest(id);
      }

      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          `Unable to ${type} request.`
      );
    } finally {
      setBusy(null);
    }
  };

  const pendingCount = rows.filter(
    (r) => r.status === "PENDING"
  ).length;

  const acceptedCount = rows.filter(
    (r) => r.status === "ACCEPTED"
  ).length;

  const rejectedCount = rows.filter(
    (r) => r.status === "REJECTED"
  ).length;

  return (
    <MentorLayout title="Mentorship Requests">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Mentorship Requests
            </h2>

            <p className="mt-1 text-slate-500">
              Review employees requesting your expertise and manage
              their mentorship requests.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={<Clock size={20} />}
              label="Pending"
              value={pendingCount}
            />

            <SummaryCard
              icon={<CheckCircle2 size={20} />}
              label="Accepted"
              value={acceptedCount}
            />

            <SummaryCard
              icon={<XCircle size={20} />}
              label="Rejected"
              value={rejectedCount}
            />
          </div>
        )}

        {/* Requests */}
        {loading ? (
          <State text="Loading mentorship requests..." />
        ) : error ? null : rows.length === 0 ? (
          <State text="No mentorship requests found." />
        ) : (
          <div className="space-y-4">
            {rows.map((request) => {
              const isPending = request.status === "PENDING";
              const isBusy = busy === request.requestId;

              return (
                <div
                  key={request.requestId}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Request information */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                            <User size={17} />
                          </div>

                          <h3 className="font-bold text-slate-900">
                            {request.menteeName}
                          </h3>
                        </div>

                        <StatusBadge status={request.status} />
                      </div>

                      {/* Skill */}
                      <div className="mt-4 flex items-center gap-2 text-sm text-slate-700">
                        <BookOpen
                          size={16}
                          className="text-slate-400"
                        />

                        <span>Requested expertise:</span>

                        <span className="font-semibold">
                          {request.skillName}
                        </span>
                      </div>

                      {/* Message */}
                      {request.message && (
                        <div className="mt-3 flex gap-2 rounded-xl bg-slate-50 p-3">
                          <MessageSquare
                            size={15}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />

                          <p className="text-xs leading-5 text-slate-600">
                            {request.message}
                          </p>
                        </div>
                      )}

                      {/* Date */}
                      <p className="mt-3 text-[11px] text-slate-400">
                        Requested{" "}
                        {request.createdAt
                          ? new Date(
                              request.createdAt
                            ).toLocaleString()
                          : "—"}
                      </p>
                    </div>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            action(request.requestId, "accept")
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} />

                          {isBusy ? "Processing..." : "Accept"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() =>
                            action(request.requestId, "reject")
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle size={15} />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MentorLayout>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "ACCEPTED") {
    return (
      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700">
        ACCEPTED
      </span>
    );
  }

  if (status === "REJECTED") {
    return (
      <span className="rounded-full bg-rose-50 px-3 py-1 text-[10px] font-bold text-rose-700">
        REJECTED
      </span>
    );
  }

  return (
    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
      PENDING
    </span>
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
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-2xl font-bold text-slate-900">
          {value}
        </p>
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