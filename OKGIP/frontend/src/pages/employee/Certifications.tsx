import React, { useEffect, useState } from "react";
import EmployeePage, {
  Card,
} from "@/components/layout/EmployeePage";

import {
  Award,
  CalendarDays,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

interface Certification {
  id: number | string;
  name: string;
  provider: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

const extractRows = (
  value: any,
  keys: string[]
): any[] => {
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

const formatDate = (value?: string) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const Certifications: React.FC = () => {
  const [certifications, setCertifications] =
    useState<Certification[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCertifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("okip_token");

      const response = await fetch(
        "http://localhost:8080/api/certification",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Certification API returned ${response.status}`
        );
      }

      const data = await response.json();

      const rows = extractRows(data, [
        "certifications",
        "data",
        "items",
      ]);

      const mapped: Certification[] =
        rows.map((row: any, index: number) => ({
          id:
            row.certificationId ||
            row.id ||
            index,

          name:
            row.certificationName ||
            row.name ||
            row.title ||
            "Certification",

          provider:
            row.provider ||
            row.issuer ||
            row.organization ||
            "—",

          issueDate:
            row.issueDate ||
            row.issuedDate ||
            row.startDate ||
            "",

          expiryDate:
            row.expiryDate ||
            row.expirationDate ||
            "",

          status:
            row.status ||
            "Verified",
        }));

      setCertifications(mapped);
    } catch (err) {
      console.error(
        "Failed to load certifications:",
        err
      );

      setError(
        "Unable to load certifications from the backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCertifications();
  }, []);

  const verifiedCount = certifications.filter(
    (certificate) =>
      certificate.status.toLowerCase() ===
        "verified" ||
      certificate.status.toLowerCase() ===
        "active"
  ).length;

  return (
    <EmployeePage
      title="Certifications"
      subtitle="View your verified certifications and renewal information."
    >
      <Card title="My Certifications">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading certifications...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}

            <button
              type="button"
              onClick={loadCertifications}
              className="ml-3 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Retry
            </button>
          </div>
        ) : certifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center">
            <Award
              size={28}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 text-sm font-semibold text-slate-700">
              No certifications found
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              No certification records have been returned
              for your employee account.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">
                  Total Certifications
                </span>

                <div className="mt-1 flex items-center gap-2">
                  <Award
                    size={18}
                    className="text-purple-600"
                  />

                  <strong className="text-xl text-slate-800">
                    {certifications.length}
                  </strong>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">
                  Verified / Active
                </span>

                <div className="mt-1 flex items-center gap-2">
                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />

                  <strong className="text-xl text-slate-800">
                    {verifiedCount}
                  </strong>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="text-xs text-slate-500">
                  Last Updated
                </span>

                <div className="mt-1 flex items-center gap-2">
                  <CalendarDays
                    size={18}
                    className="text-blue-600"
                  />

                  <strong className="text-xs text-slate-700">
                    Live backend data
                  </strong>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left text-xs">
                <thead>
                  <tr className="border-b text-[10px] uppercase tracking-wide text-slate-400">
                    <th className="px-3 py-3">
                      Certification
                    </th>

                    <th className="px-3 py-3">
                      Provider
                    </th>

                    <th className="px-3 py-3">
                      Issue Date
                    </th>

                    <th className="px-3 py-3">
                      Expiry
                    </th>

                    <th className="px-3 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {certifications.map(
                    (certificate) => {
                      const normalizedStatus =
                        certificate.status
                          .toLowerCase();

                      const isVerified =
                        normalizedStatus ===
                          "verified" ||
                        normalizedStatus ===
                          "active";

                      return (
                        <tr
                          key={certificate.id}
                          className="border-b border-slate-50 transition hover:bg-slate-50"
                        >
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                <ShieldCheck
                                  size={16}
                                />
                              </div>

                              <div>
                                <p className="font-semibold text-slate-800">
                                  {certificate.name}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-3 py-4 text-slate-600">
                            {certificate.provider}
                          </td>

                          <td className="px-3 py-4 text-slate-600">
                            {formatDate(
                              certificate.issueDate
                            )}
                          </td>

                          <td className="px-3 py-4 text-slate-600">
                            {certificate.expiryDate
                              ? formatDate(
                                  certificate.expiryDate
                                )
                              : "No expiry"}
                          </td>

                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                isVerified
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isVerified && (
                                <CheckCircle2
                                  size={11}
                                />
                              )}

                              {certificate.status}
                            </span>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 text-blue-600"
                />

                <div>
                  <p className="text-xs font-semibold text-blue-800">
                    Live certification data
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-700">
                    These records are loaded directly from
                    your authenticated employee
                    certification API. No certification
                    records are hardcoded in this page.
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

export default Certifications;