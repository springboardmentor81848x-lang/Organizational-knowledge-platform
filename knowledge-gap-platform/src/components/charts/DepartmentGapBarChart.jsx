import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { dept: 'Product Eng', Readiness: 82, Gaps: 18 },
  { dept: 'Data & AI', Readiness: 89, Gaps: 11 },
  { dept: 'DevOps & Cloud', Readiness: 91, Gaps: 9 },
  { dept: 'UX & Design', Readiness: 86, Gaps: 14 },
  { dept: 'Cyber Security', Readiness: 94, Gaps: 6 },
];

export const DepartmentGapBarChart = () => {
  const { isDarkMode } = useTheme();

  const strokeGrid = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeGrid} />
          <XAxis dataKey="dept" stroke={textColor} fontSize={11} />
          <YAxis stroke={textColor} fontSize={11} />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              borderColor: tooltipBorder,
              borderRadius: '12px',
              color: tooltipText,
              fontSize: '12px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: textColor }} />
          <Bar dataKey="Readiness" name="Readiness Index (%)" fill="#2563eb" radius={[6, 6, 0, 0]} />
          <Bar dataKey="Gaps" name="Knowledge Gap Severity" fill="#f43f5e" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

