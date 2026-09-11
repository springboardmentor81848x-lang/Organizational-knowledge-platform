import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const HeatMapChart = () => {
  const { isDarkMode } = useTheme();

  const matrixData = [
    { department: 'Product Eng', React: 95, Kubernetes: 60, GenAI: 40, Security: 75 },
    { department: 'Data & AI', React: 50, Kubernetes: 85, GenAI: 98, Security: 90 },
    { department: 'DevOps & Cloud', React: 40, Kubernetes: 98, GenAI: 70, Security: 95 },
    { department: 'UX & Design', React: 85, Kubernetes: 20, GenAI: 65, Security: 50 },
    { department: 'Cyber Security', React: 60, Kubernetes: 90, GenAI: 80, Security: 99 },
  ];

  const skills = ['React', 'Kubernetes', 'GenAI', 'Security'];

  const getHeatColor = (value) => {
    if (value >= 90) return 'bg-emerald-500 text-white';
    if (value >= 75) return 'bg-blue-500 text-white';
    if (value >= 50) return 'bg-amber-500 text-white';
    return 'bg-rose-500 text-white';
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800">
            <th className="p-3 font-bold text-slate-400">Department</th>
            {skills.map((s) => (
              <th key={s} className="p-3 font-bold text-slate-400 text-center">
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {matrixData.map((row) => (
            <tr key={row.department} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="p-3 font-extrabold text-slate-900 dark:text-slate-100">{row.department}</td>
              {skills.map((s) => (
                <td key={s} className="p-2 text-center">
                  <div
                    className={`p-2 rounded-xl text-xs font-black shadow-xs ${getHeatColor(
                      row[s]
                    )}`}
                  >
                    {row[s]}%
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
