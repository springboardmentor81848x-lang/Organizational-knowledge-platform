import React, { useEffect, useState } from "react";
import {
  BookOpen,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";

import EmployeePage, {
  Card,
} from "@/components/layout/EmployeePage";

import trainingService from "@/services/trainingService";

interface Training {
  trainingId: number;
  trainingName: string;
  provider: string;
  duration: string;
  level: string;
  description?: string;
  courseUrl?: string;
}

const Training: React.FC = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTrainings = async () => {
      try {
        const data =
          await trainingService.getAvailableTrainings();

        console.log(
          "EMPLOYEE TRAININGS API RESPONSE =",
          data
        );

        setTrainings(
          Array.isArray(data) ? data : []
        );
      } catch (err: any) {
        console.error(
          "EMPLOYEE TRAININGS API ERROR =",
          err?.response?.data || err
        );

        setError(
          err?.response?.data?.message ||
            "Unable to load available training programs."
        );
      } finally {
        setLoading(false);
      }
    };

    void loadTrainings();
  }, []);

  return (
    <EmployeePage
      title="Training"
      subtitle="Discover and continue relevant training programs."
    >
      <Card
        title="Training Catalog"
        subtitle="Training programs provided by your organization."
      >

        {/* LOADING */}
        {loading && (
          <div className="flex min-h-[250px] items-center justify-center">
            <div className="text-center">
              <Loader2
                size={30}
                className="mx-auto animate-spin text-purple-600"
              />

              <p className="mt-3 text-xs text-slate-500">
                Loading training programs...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="text-red-500"
              />

              <div>
                <p className="text-sm font-semibold text-red-700">
                  Unable to load training
                </p>

                <p className="mt-1 text-xs text-red-600">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* EMPTY */}
        {!loading &&
          !error &&
          trainings.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-10 text-center">
              <BookOpen
                size={36}
                className="mx-auto text-slate-300"
              />

              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                No training programs available
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                No training programs have been added yet.
              </p>
            </div>
          )}

        {/* TRAINING CARDS */}
        {!loading &&
          !error &&
          trainings.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">

              {trainings.map((training) => (
                <div
                  key={training.trainingId}
                  className="
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    p-5
                    transition
                    hover:border-purple-200
                    hover:shadow-sm
                  "
                >

                  {/* ICON */}
                  <div className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-purple-50
                    text-purple-600
                  ">
                    <BookOpen size={18} />
                  </div>

                  {/* TITLE */}
                  <h3 className="
                    mt-4
                    text-sm
                    font-bold
                    text-slate-800
                  ">
                    {training.trainingName}
                  </h3>

                  {/* DESCRIPTION */}
                  <p className="
                    mt-2
                    text-xs
                    leading-5
                    text-slate-500
                  ">
                    {training.description ||
                      "Improve your skills through this training program."}
                  </p>

                  {/* PROVIDER */}
                  <p className="
                    mt-4
                    text-[10px]
                    font-semibold
                    text-slate-400
                  ">
                    Provider: {training.provider}
                  </p>

                  {/* TAGS */}
                  <div className="mt-3 flex gap-2">

                    <span className="
                      rounded-full
                      bg-purple-50
                      px-2.5 py-1
                      text-[9px]
                      font-bold
                      text-purple-700
                    ">
                      {training.level}
                    </span>

                    <span className="
                      rounded-full
                      bg-slate-100
                      px-2.5 py-1
                      text-[9px]
                      font-bold
                      text-slate-600
                    ">
                      {training.duration}
                    </span>

                  </div>

                  {/* COURSE LINK */}
                  {training.courseUrl && (
                    <a
                      href={training.courseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        mt-5
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-purple-600
                        px-3 py-2
                        text-[10px]
                        font-semibold
                        text-white
                        hover:bg-purple-700
                      "
                    >
                      View Course
                      <ExternalLink size={12} />
                    </a>
                  )}

                </div>
              ))}

            </div>
          )}

      </Card>
    </EmployeePage>
  );
};

export default Training;