import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  FileText,
  BarChart,
  CheckCircle2,
  TrendingUp,
  Award,
  Building,
  User,
  BrainCircuit,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import 'chart.js/auto';
import { Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';

interface PickerOption {
  id: number;
  label: string;
}

export const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employee' | 'department' | 'gaps' | 'effectiveness'>('employee');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Real org-wide KPI row — fetched once from live gap analytics, not
  // hardcoded numbers.
  const [kpis, setKpis] = useState<{
    totalEmployees: number; totalGaps: number; highPriorityGaps: number; inTrainingCount: number;
  } | null>(null);

  // Real employee/department pickers — the report used to always fetch
  // employee #1 / department #1 no matter what, since there was no
  // selector at all.
  const [employeeOptions, setEmployeeOptions] = useState<PickerOption[]>([]);
  const [departmentOptions, setDepartmentOptions] = useState<PickerOption[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    setToasts((prev) => [...prev, { id: String(Date.now()), type, title, message }]);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/gaps/analytics');
        if (res.data.success) {
          const m = res.data.data.metrics;
          setKpis({
            totalEmployees: m.totalEmployees,
            totalGaps: m.totalGaps,
            highPriorityGaps: m.highPriorityGaps,
            inTrainingCount: m.inTrainingCount,
          });
        }
      } catch (err) {
        console.error('Failed to load report KPIs:', err);
      }

      try {
        const empRes = await api.get('/employees');
        if (empRes.data.success) {
          const opts = (empRes.data.data || []).map((e: any) => ({
            id: e.id,
            label: `${e.first_name} ${e.last_name} — ${e.designation || 'Employee'}`,
          }));
          setEmployeeOptions(opts);
          if (opts.length > 0) setSelectedEmployeeId(opts[0].id);
        }
      } catch (err) {
        console.error('Failed to load employees for picker:', err);
      }

      try {
        const deptRes = await api.get('/departments');
        if (deptRes.data.success) {
          const opts = (deptRes.data.data || []).map((d: any) => ({ id: d.id, label: d.name }));
          setDepartmentOptions(opts);
          if (opts.length > 0) setSelectedDepartmentId(opts[0].id);
        }
      } catch (err) {
        console.error('Failed to load departments for picker:', err);
      }
    })();
  }, []);

  const fetchReport = async () => {
    if (activeTab === 'employee' && !selectedEmployeeId) return;
    if (activeTab === 'department' && !selectedDepartmentId) return;

    try {
      setLoading(true);
      setReportData(null);
      let endpoint = '';
      if (activeTab === 'employee') endpoint = `/reports/employee/${selectedEmployeeId}`;
      else if (activeTab === 'department') endpoint = `/reports/department/${selectedDepartmentId}`;
      else if (activeTab === 'gaps') endpoint = '/reports/gaps';
      else if (activeTab === 'effectiveness') endpoint = '/reports/training-effectiveness';

      const res = await api.get(endpoint);
      if (res.data.success) {
        setReportData(res.data);
      } else {
        addToast('error', 'Failed to load report', res.data.message || 'Unknown error');
      }
    } catch (err: any) {
      console.error('Failed to fetch report:', err);
      addToast('error', 'Failed to load report', err.response?.data?.message || 'Could not reach the server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedEmployeeId, selectedDepartmentId]);

  // ----------------------------------------------------------------------
  // PDF export — builds a real table from whichever tab's real data is
  // currently loaded. No fabricated fallback table.
  // ----------------------------------------------------------------------
  const handleExportPDF = () => {
    if (!reportData) {
      addToast('error', 'Nothing to export', 'Load a report first.');
      return;
    }
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('OKGIP Intelligence Report', 14, 18);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

    if (activeTab === 'employee' && reportData.data) {
      const d = reportData.data;
      doc.setFontSize(12);
      doc.text(`${d.employee.name} — ${d.employee.designation} (${d.employee.department})`, 14, 35);
      autoTable(doc, {
        startY: 42,
        head: [['Skill', 'Category', 'Current Level', 'Verified']],
        body: d.skills.map((s: any) => [s.skill_name, s.category, s.current_level, s.verified ? 'Yes' : 'No']),
      });
      const y1 = (doc as any).lastAutoTable.finalY + 8;
      autoTable(doc, {
        startY: y1,
        head: [['Skill Gap', 'Required', 'Current', 'Gap', 'Priority', 'Status']],
        body: d.gaps.map((g: any) => [g.skill_name, g.required_proficiency, g.current_proficiency, g.gap_score, g.priority, g.status]),
      });
    } else if (activeTab === 'department' && reportData.data) {
      const d = reportData.data;
      doc.setFontSize(12);
      doc.text(`${d.department.name} (${d.department.code || ''}) — ${d.department.employee_count} employees`, 14, 35);
      autoTable(doc, {
        startY: 42,
        head: [['Metric', 'Value']],
        body: [
          ['Active Skill Gaps', d.metrics.active_skill_gaps],
          ['High-Risk Gaps', d.metrics.high_risk_gaps],
          ['Training Enrollments', d.metrics.total_training_enrollments],
          ['Training Completion Rate', `${d.metrics.training_completion_rate}%`],
          ['Average Progress', `${d.metrics.average_progress}%`],
        ],
      });
      const y1 = (doc as any).lastAutoTable.finalY + 8;
      autoTable(doc, {
        startY: y1,
        head: [['Employee', 'Designation', 'Status']],
        body: d.employees.map((e: any) => [e.name, e.designation, e.status]),
      });
    } else if (activeTab === 'gaps' && Array.isArray(reportData.data)) {
      autoTable(doc, {
        startY: 35,
        head: [['Employee', 'Department', 'Skill', 'Required', 'Current', 'Gap', 'Priority', 'Status']],
        body: reportData.data.map((g: any) => [
          g.employee_name, g.department, g.skill_name, g.required_proficiency, g.current_proficiency, g.gap_score, g.priority, g.status,
        ]),
      });
    } else if (activeTab === 'effectiveness' && reportData.data) {
      const d = reportData.data;
      autoTable(doc, {
        startY: 35,
        head: [['Program', 'Category', 'Provider', 'Enrolled', 'Completed', 'Completion Rate', 'Avg Progress', 'Avg Assessment Score']],
        body: d.programs.map((p: any) => [
          p.title, p.category, p.provider, p.total_enrolled, p.completed_count, `${p.completion_rate}%`, `${p.average_progress}%`,
          p.average_assessment_score !== null ? `${p.average_assessment_score}%` : 'Not yet assessed',
        ]),
      });
    }

    doc.save(`OKGIP_${activeTab}_report.pdf`);
    addToast('success', 'PDF Exported', 'Report downloaded successfully.');
  };

  // ----------------------------------------------------------------------
  // Excel export — flattens whichever tab's real data is loaded.
  // ----------------------------------------------------------------------
  const handleExportExcel = () => {
    if (!reportData) {
      addToast('error', 'Nothing to export', 'Load a report first.');
      return;
    }
    let rows: any[] = [];
    if (activeTab === 'employee' && reportData.data) {
      rows = reportData.data.skills.map((s: any) => ({
        Employee: reportData.data.employee.name,
        Skill: s.skill_name,
        Category: s.category,
        CurrentLevel: s.current_level,
        Verified: s.verified ? 'Yes' : 'No',
      }));
    } else if (activeTab === 'department' && reportData.data) {
      rows = reportData.data.employees.map((e: any) => ({
        Department: reportData.data.department.name,
        Employee: e.name,
        Designation: e.designation,
        Status: e.status,
      }));
    } else if (activeTab === 'gaps' && Array.isArray(reportData.data)) {
      rows = reportData.data;
    } else if (activeTab === 'effectiveness' && reportData.data) {
      rows = reportData.data.programs;
    }

    if (rows.length === 0) {
      addToast('error', 'Nothing to export', 'This report has no rows yet.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OKGIP Intelligence');
    XLSX.writeFile(workbook, `OKGIP_${activeTab}_report.xlsx`);
    addToast('success', 'Excel Exported', 'Report downloaded successfully.');
  };

  const tabs = [
    { key: 'employee' as const, label: 'Employee Report', icon: User },
    { key: 'department' as const, label: 'Department Report', icon: Building },
    { key: 'gaps' as const, label: 'Skill Gap Report', icon: BrainCircuit },
    { key: 'effectiveness' as const, label: 'Training Effectiveness', icon: Award },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 text-xs">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      <PageHeader
        title="Reports & Analytics"
        description="Real, database-backed reports — employee, department, skill gap, and training effectiveness."
        icon={FileText}
      />

      {/* Real KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard title="Total Employees" value={kpis ? String(kpis.totalEmployees) : '—'} icon={User} color="teal" />
        <StatCard title="Total Knowledge Gaps" value={kpis ? String(kpis.totalGaps) : '—'} icon={BrainCircuit} color="amber" />
        <StatCard title="High-Priority Gaps" value={kpis ? String(kpis.highPriorityGaps) : '—'} icon={TrendingUp} color="rose" />
        <StatCard title="Employees In Training" value={kpis ? String(kpis.inTrainingCount) : '—'} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-1.5 flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                activeTab === t.key ? 'bg-[#0A7A74] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Selectors + export buttons */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-wrap items-center gap-3">
        {activeTab === 'employee' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedEmployeeId ?? ''}
              onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
              className="h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 font-medium focus:outline-none focus:border-[#0A7A74]"
            >
              {employeeOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
        {activeTab === 'department' && (
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDepartmentId ?? ''}
              onChange={(e) => setSelectedDepartmentId(Number(e.target.value))}
              className="h-9 bg-slate-50 border border-slate-200 rounded-xl px-3 font-medium focus:outline-none focus:border-[#0A7A74]"
            >
              {departmentOptions.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 h-9 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 h-9 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-bold"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <span className="w-4 h-4 border-2 border-[#0A7A74]/30 border-t-[#0A7A74] rounded-full animate-spin mr-2" />
            Loading report...
          </div>
        ) : !reportData ? (
          <div className="text-center py-16 text-slate-400">Select an option above to load a report.</div>
        ) : activeTab === 'employee' ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-sm">{reportData.data.employee.name}</h3>
              <p className="text-slate-500">{reportData.data.employee.designation} • {reportData.data.employee.department}</p>
              <p className="text-slate-400 mt-1">
                {reportData.data.assessments_completed} assessment(s) completed
                {reportData.data.average_assessment_score !== null
                  ? ` — average score ${reportData.data.average_assessment_score}%`
                  : ' — not yet assessed'}
              </p>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2">Skill</th><th>Category</th><th>Current Level</th><th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.skills.length === 0 ? (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400">No skills assessed yet.</td></tr>
                ) : reportData.data.skills.map((s: any, i: number) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-800">{s.skill_name}</td>
                    <td className="text-slate-500">{s.category}</td>
                    <td className="text-slate-700">L{s.current_level}/5</td>
                    <td>{s.verified ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.data.gaps.length > 0 && (
              <>
                <h4 className="font-bold text-slate-800 mt-4">Open Skill Gaps</h4>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold">
                      <th className="py-2">Skill</th><th>Required</th><th>Current</th><th>Gap</th><th>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.gaps.map((g: any, i: number) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-2 font-semibold text-slate-800">{g.skill_name}</td>
                        <td>L{g.required_proficiency}</td>
                        <td>L{g.current_proficiency}</td>
                        <td className="font-bold text-rose-600">{g.gap_score}</td>
                        <td>{g.priority}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        ) : activeTab === 'department' ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-sm">{reportData.data.department.name}</h3>
              <p className="text-slate-500">{reportData.data.department.employee_count} employees</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <StatCard title="Active Gaps" value={String(reportData.data.metrics.active_skill_gaps)} icon={BrainCircuit} color="amber" />
              <StatCard title="High-Risk Gaps" value={String(reportData.data.metrics.high_risk_gaps)} icon={TrendingUp} color="rose" />
              <StatCard title="Training Enrollments" value={String(reportData.data.metrics.total_training_enrollments)} icon={Layers} color="blue" />
              <StatCard title="Completion Rate" value={`${reportData.data.metrics.training_completion_rate}%`} icon={CheckCircle2} color="emerald" />
              <StatCard title="Avg Progress" value={`${reportData.data.metrics.average_progress}%`} icon={BarChart} color="teal" />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2">Employee</th><th>Designation</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.employees.length === 0 ? (
                  <tr><td colSpan={3} className="py-6 text-center text-slate-400">No employees in this department yet.</td></tr>
                ) : reportData.data.employees.map((e: any) => (
                  <tr key={e.id} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-800">{e.name}</td>
                    <td className="text-slate-500">{e.designation}</td>
                    <td className="text-slate-500">{e.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'gaps' ? (
          <div className="space-y-3">
            {reportData.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
                <StatCard title="Total Gaps" value={String(reportData.summary.total_gaps)} icon={BrainCircuit} color="teal" />
                <StatCard title="High Priority" value={String(reportData.summary.high_priority)} icon={TrendingUp} color="rose" />
                <StatCard title="Medium Priority" value={String(reportData.summary.medium_priority)} icon={BarChart} color="amber" />
                <StatCard title="Resolved" value={String(reportData.summary.resolved)} icon={CheckCircle2} color="emerald" />
              </div>
            )}
            {reportData.summary && (reportData.summary.total_gaps > 0 || reportData.summary.resolved > 0) && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 max-w-md mx-auto mb-2">
                <p className="text-center font-bold text-slate-700 mb-2">Gap Priority Distribution</p>
                <Doughnut
                  data={{
                    labels: ['High Priority', 'Medium Priority', 'Low Priority', 'Resolved'],
                    datasets: [{
                      data: [
                        reportData.summary.high_priority,
                        reportData.summary.medium_priority,
                        reportData.summary.low_priority,
                        reportData.summary.resolved,
                      ],
                      backgroundColor: ['#e11d48', '#f59e0b', '#3b82f6', '#10b981'],
                      borderWidth: 0,
                    }],
                  }}
                  options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } } }}
                />
              </div>
            )}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2">Employee</th><th>Department</th><th>Skill</th><th>Gap</th><th>Priority</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(!reportData.data || reportData.data.length === 0) ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">No open skill gaps right now.</td></tr>
                ) : reportData.data.map((g: any) => (
                  <tr key={g.id} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-800">{g.employee_name}</td>
                    <td className="text-slate-500">{g.department}</td>
                    <td className="text-slate-700">{g.skill_name}</td>
                    <td className="font-bold text-rose-600">{g.gap_score}</td>
                    <td>{g.priority}</td>
                    <td>{g.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'effectiveness' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Total Programs" value={String(reportData.data.total_programs)} icon={Layers} color="teal" />
              <StatCard title="Total Enrollments" value={String(reportData.data.total_enrollments)} icon={User} color="blue" />
              <StatCard title="Overall Completion" value={`${reportData.data.overall_completion_rate}%`} icon={CheckCircle2} color="emerald" />
              <StatCard
                title="Avg Days to Close Gap"
                value={reportData.data.average_days_to_gap_resolution !== null ? String(reportData.data.average_days_to_gap_resolution) : 'No resolved gaps yet'}
                icon={Sparkles}
                color="amber"
              />
            </div>
            {reportData.data.programs.length > 0 && (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-center font-bold text-slate-700 mb-2">Completion Rate by Training Program</p>
                <Bar
                  data={{
                    labels: reportData.data.programs.map((p: any) => p.title.length > 20 ? p.title.slice(0, 20) + '…' : p.title),
                    datasets: [{
                      label: 'Completion Rate %',
                      data: reportData.data.programs.map((p: any) => p.completion_rate),
                      backgroundColor: '#0A7A74',
                      borderRadius: 6,
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100, ticks: { font: { size: 10 } } }, x: { ticks: { font: { size: 9 } } } },
                  }}
                />
              </div>
            )}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold">
                  <th className="py-2">Program</th><th>Provider</th><th>Enrolled</th><th>Completed</th><th>Completion Rate</th><th>Avg Assessment Score</th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.programs.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">No training programs yet.</td></tr>
                ) : reportData.data.programs.map((p: any) => (
                  <tr key={p.id} className="border-b border-slate-100">
                    <td className="py-2 font-semibold text-slate-800">{p.title}</td>
                    <td className="text-slate-500">{p.provider}</td>
                    <td>{p.total_enrolled}</td>
                    <td>{p.completed_count}</td>
                    <td>{p.completion_rate}%</td>
                    <td>{p.average_assessment_score !== null ? `${p.average_assessment_score}%` : 'Not yet assessed'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};
