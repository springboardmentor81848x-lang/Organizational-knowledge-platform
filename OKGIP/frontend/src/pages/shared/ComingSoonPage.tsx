import React from "react";

interface ComingSoonPageProps {
  role: string;
  page: string;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ role, page }) => {
  const pageTitle = page
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-lg">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
          <span className="text-2xl">⚙️</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {pageTitle}
        </h1>

        <p className="mt-3 text-slate-600 dark:text-slate-400">
          This {role} module is currently being implemented and will be
          connected to the backend and database.
        </p>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-500">
          No hardcoded or placeholder business data is being displayed.
        </p>
      </div>
    </div>
  );
};

export default ComingSoonPage;