import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const data = [
  { name: 'Advanced / Mastered', value: 45, color: '#10b981' },
  { name: 'Proficient', value: 35, color: '#2563eb' },
  { name: 'Emerging Skill', value: 12, color: '#f59e0b' },
  { name: 'Critical Gap', value: 8, color: '#f43f5e' },
];

export const ReadinessDonut = () => {
  const { isDarkMode } = useTheme();

  const textColor = isDarkMode ? '#94a3b8' : '#64748b';
  const tooltipBg = isDarkMode ? '#0f172a' : '#ffffff';
  const tooltipBorder = isDarkMode ? '#334155' : '#e2e8f0';
  const tooltipText = isDarkMode ? '#f8fafc' : '#0f172a';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

