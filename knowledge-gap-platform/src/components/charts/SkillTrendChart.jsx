import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { month: 'Jan', Readiness: 68, LearningHours: 12 },
  { month: 'Feb', Readiness: 71, LearningHours: 18 },
  { month: 'Mar', Readiness: 74, LearningHours: 24 },
  { month: 'Apr', Readiness: 78, LearningHours: 20 },
  { month: 'May', Readiness: 80, LearningHours: 28 },
  { month: 'Jun', Readiness: 82, LearningHours: 35 },
  { month: 'Jul', Readiness: 84, LearningHours: 32.5 },
];

export const SkillTrendChart = () => {
  const { isDarkMode } = useTheme();

  const strokeGrid = isDarkMode ? '#334155' : '#e2e8f0';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorReadiness" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeGrid} />
          <XAxis dataKey="month" stroke={textColor} fontSize={11} />
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
          <Area
            type="monotone"
            dataKey="Readiness"
            name="Skill Readiness (%)"
            stroke="#2563eb"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorReadiness)"
          />
          <Area
            type="monotone"
            dataKey="LearningHours"
            name="Learning Hours"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorHours)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

