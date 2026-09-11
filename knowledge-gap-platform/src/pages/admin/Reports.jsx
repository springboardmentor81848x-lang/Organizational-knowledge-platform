import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { FileSpreadsheet, Download, FileText } from 'lucide-react';

export const Reports = () => {
  const reports = [
    { title: 'Q3 Enterprise Skill Vulnerability Intelligence Report', date: 'Jul 28, 2026', size: '4.2 MB', format: 'PDF' },
    { title: 'Departmental Retraining Budget Utilization & ROI', date: 'Jul 20, 2026', size: '1.8 MB', format: 'XLSX' },
    { title: 'AI Match Precision & Skill Gap Remediation Metrics', date: 'Jul 15, 2026', size: '2.5 MB', format: 'PDF' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center space-x-2">
          <FileSpreadsheet className="w-6 h-6 text-rose-600" />
          <span>Executive Reports Generator</span>
        </h1>
        <p className="text-xs text-slate-500">
          Download enterprise-ready audit compliance and skill gap intelligence reports.
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((r, i) => (
          <Card key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{r.title}</h3>
                <p className="text-xs text-slate-400">Generated on {r.date} • {r.size}</p>
              </div>
            </div>

            <button
              onClick={() => alert(`Downloading ${r.title} (${r.format})`)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {r.format}</span>
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
};
