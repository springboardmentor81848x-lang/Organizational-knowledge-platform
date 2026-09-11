import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { subject: 'Gen AI & RAG', Current: 2, Target: 5, fullMark: 5 },
  { subject: 'Kubernetes/Docker', Current: 3, Target: 5, fullMark: 5 },
  { subject: 'System Security', Current: 3, Target: 4, fullMark: 5 },
  { subject: 'React 19 / Next.js', Current: 4.5, Target: 5, fullMark: 5 },
  { subject: 'GraphQL API', Current: 4, Target: 4, fullMark: 5 },
  { subject: 'TypeScript Arch', Current: 4, Target: 5, fullMark: 5 },
];

export const RadarGapChart = () => {
  const { isDarkMode } = useTheme();

  const strokeGrid = isDarkMode ? '#334155' : '#cbd5e1';
  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke={strokeGrid} strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: textColor, fontSize: 11, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} stroke={textColor} />
          <Radar
            name="Current Level"
            dataKey="Current"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.4}
          />
          <Radar
            name="Target Benchmark"
            dataKey="Target"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.2}
          />
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

