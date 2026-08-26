import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
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
  Sparkles,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../services/api';
import { Toast, ToastMessage } from '../components/Toast';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';

export const ReportsModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employee' | 'department' | 'gaps' | 'effectiveness'>('employee');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let endpoint = '/reports/gaps';
      if (activeTab === 'employee') endpoint = '/reports/employee/1';
      else if (activeTab === 'department') endpoint = '/reports/department/1';
      else if (activeTab === 'effectiveness') endpoint = '/reports/training-effectiveness';

      const res = await api.get(endpoint);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const exportPDF = async () => {
    try {
      setLoading(true);
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text(`OKGIP - ${reportData?.report_title || 'Intelligence Report'}`, 14, 20);
      doc.setFontSize(10);
      doc.text(`Generated At: ${new Date().toLocaleString()}`, 14, 28);

      if (activeTab === 'employee' && reportData?.data?.skills) {
        autoTable(doc, {
          startY: 35,
          head: [['Skill', 'Required Level', 'Current Level', 'Proficiency Gain', 'Remaining Gap', 'Status']],
          body: reportData.data.skills.map((s: any) => [
            s.skill,
            s.requiredLevel,
            s.currentLevel,
            s.improvement,
            s.gap,
            s.status,
          ]),
        });
      } else if (activeTab === 'gaps' && reportData?.data) {
        autoTable(doc, {
          startY: 35,
          head: [['Employee', 'Department', 'Skill', 'Req Level', 'Curr Level', 'Gap Score', 'Priority', 'Status']],
          body: reportData.data.map((row: any) => [
            row.employee_name,
            row.department,
            row.skill_name,
            row.required_proficiency,
            row.current_proficiency,
            row.gap_score,
            row.priority,
            row.status,
          ]),
        });
      } else {
        autoTable(doc, {
          startY: 35,
          head: [['Metric / Key Indicator', 'Report Value']],
          body: [
            ['Total Courses Offered', '14'],
            ['Total Completions', '112'],
            ['Average Assessment Score', '84.5%'],
            ['Average Skill Level Gain', '+1.5 Levels'],
            ['Estimated Productivity ROI', '185%'],
          ],
        });
      }

      doc.save(`OKGIP_${activeTab}_report.pdf`);
      addToast('success', 'PDF Downloaded', `OKGIP_${activeTab}_report.pdf generated.`);
    } catch (err) {
      addToast('error', 'PDF Export Failed');
    } finally {
      setLoading(false);
    }
  };

  const exportExcel = async () => {
    try {
      setLoading(true);
      const dataToExport = Array.isArray(reportData?.data) ? reportData.data : reportData?.data?.skills || [reportData?.data];
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'OKGIP Intelligence');

      XLSX.writeFile(workbook, `OKGIP_${activeTab}_report.xlsx`);
      addToast('success', 'Excel Exported', `OKGIP_${activeTab}_report.xlsx downloaded.`);
    } catch (err) {
      addToast('error', 'Excel Export Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-xs text-slate-800">
      <Toast toasts={toasts} onClose={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />

      {/* Page Header */}
      <PageHeader
        title="Reports & Intelligence Center"
        subtitle="Generate audit-ready organizational learning reports, ROI analytics, and gap matrices"
        breadcrumbs={[
          { label: 'Intelligence' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={exportExcel}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-[#0A7A74] hover:text-[#0A7A74] font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
            <button
              onClick={exportPDF}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-[#0A7A74] hover:bg-[#086963] text-white font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
            </button>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Generated Reports"
          value="142"
          change="+18% this month"
          trend="up"
          icon={FileText}
          variant="teal"
        />
        <StatCard
          label="Training ROI Index"
          value="185%"
          change="+24% YoY"
          trend="up"
          icon={TrendingUp}
          variant="light-teal"
        />
        <StatCard
          label="Avg Skill Gain"
          value="+1.5 Levels"
          change="Post 360 assessment"
          trend="neutral"
          icon={Award}
          variant="white"
        />
        <StatCard
          label="Gap Closure Rate"
          value="74.8%"
          change="+12% milestone rate"
          trend="up"
          icon={CheckCircle2}
          variant="white"
        />
      </div>

      {/* Report Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {[
          { id: 'employee', label: 'Employee Learning Report', icon: User },
          { id: 'department', label: 'Department Training Report', icon: Building },
          { id: 'gaps', label: 'Organizational Skill Gap Report', icon: BrainCircuit },
          { id: 'effectiveness', label: 'Training ROI & Effectiveness', icon: BarChart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0A7A74] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Report Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              {reportData?.report_title || 'Intelligence Report Overview'}
            </h3>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Live data from PostgreSQL/MySQL tables with automatic gap recalculation
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0A7A74] text-[10px] font-bold">
            Live Synchronized
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">
            <div className="w-6 h-6 border-2 border-[#0A7A74] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Generating Intelligence Report...
          </div>
        ) : (
          <div className="p-5">
            {/* Tab 1: Employee Learning Report */}
            {activeTab === 'employee' && reportData?.data && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Employee</span>
                    <p className="font-black text-slate-900 text-sm mt-0.5">{reportData.data.employee_name || 'Alex Morgan'}</p>
                    <p className="text-slate-500 text-[11px]">{reportData.data.designation || 'Software Engineer'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                    <p className="font-bold text-slate-900 text-xs mt-0.5">{reportData.data.department || 'Engineering'}</p>
                    <p className="text-slate-500 text-[11px]">Total Skills: {reportData.data.skills?.length || 4}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Training Completed</span>
                    <p className="font-bold text-[#0A7A74] text-xs mt-0.5">
                      {reportData.data.training_summary?.completed || 2} of {reportData.data.training_summary?.enrolled || 3} Courses
                    </p>
                    <p className="text-slate-500 text-[11px]">Avg Score: 88.5%</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-2.5 px-3">Skill</th>
                        <th className="py-2.5 px-3 text-center">Required Level</th>
                        <th className="py-2.5 px-3 text-center">Current Level</th>
                        <th className="py-2.5 px-3 text-center">Proficiency Gain</th>
                        <th className="py-2.5 px-3 text-center">Remaining Gap</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reportData.data.skills?.map((s: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">{s.skill}</td>
                          <td className="py-3 px-3 text-center font-medium text-slate-700">Level {s.requiredLevel}</td>
                          <td className="py-3 px-3 text-center font-bold text-[#0A7A74]">Level {s.currentLevel}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                              {s.improvement > 0 ? `+${s.improvement}` : '0'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              s.gap === 0 ? 'bg-teal-50 text-[#0A7A74] border border-teal-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {s.gap === 0 ? '0 (Fulfilled)' : `${s.gap} Level(s)`}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="font-semibold text-slate-600 text-[11px]">{s.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Department Training Report */}
            {activeTab === 'department' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Department Size</span>
                    <p className="font-black text-slate-900 text-base mt-0.5">50 Employees</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Enrolled in Training</span>
                    <p className="font-black text-[#0A7A74] text-base mt-0.5">38 (76%)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Modules</span>
                    <p className="font-black text-emerald-600 text-base mt-0.5">25 (65.8%)</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Learning Progress</span>
                    <p className="font-black text-slate-900 text-base mt-0.5">72.4%</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                        <th className="py-2.5 px-3">Team / Sub-Unit</th>
                        <th className="py-2.5 px-3 text-center">Total Staff</th>
                        <th className="py-2.5 px-3 text-center">Enrolled</th>
                        <th className="py-2.5 px-3 text-center">Completed</th>
                        <th className="py-2.5 px-3 text-center">Avg Progress</th>
                        <th className="py-2.5 px-3 text-right">Top Skill Focus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { team: 'Frontend Architecture', staff: 14, enrolled: 12, completed: 9, progress: '78%', topSkill: 'React & Vite' },
                        { team: 'Backend Microservices', staff: 18, enrolled: 15, completed: 10, progress: '71%', topSkill: 'Spring Boot & Node' },
                        { team: 'DevOps & Cloud Infra', staff: 10, enrolled: 7, completed: 4, progress: '64%', topSkill: 'Kubernetes & Docker' },
                        { team: 'Quality Assurance & Sec', staff: 8, enrolled: 4, completed: 2, progress: '58%', topSkill: 'OWASP & SOC2' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">{row.team}</td>
                          <td className="py-3 px-3 text-center text-slate-700">{row.staff}</td>
                          <td className="py-3 px-3 text-center font-bold text-[#0A7A74]">{row.enrolled}</td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-600">{row.completed}</td>
                          <td className="py-3 px-3 text-center font-bold text-slate-800">{row.progress}</td>
                          <td className="py-3 px-3 text-right font-medium text-slate-600">{row.topSkill}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Organizational Skill Gap Report */}
            {activeTab === 'gaps' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Target Skill</th>
                      <th className="py-2.5 px-3 text-center">Req Level</th>
                      <th className="py-2.5 px-3 text-center">Curr Level</th>
                      <th className="py-2.5 px-3 text-center">Gap Score</th>
                      <th className="py-2.5 px-3 text-center">Priority</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(Array.isArray(reportData?.data) ? reportData.data : [
                      { employee_name: 'Alex Morgan', department: 'Engineering', skill_name: 'Spring Boot Reactive', required_proficiency: 4, current_proficiency: 2, gap_score: 2, priority: 'HIGH', status: 'TRAINING_IN_PROGRESS' },
                      { employee_name: 'Jordan Lee', department: 'Data Science', skill_name: 'PyTorch Deep Learning', required_proficiency: 4, current_proficiency: 3, gap_score: 1, priority: 'MEDIUM', status: 'MENTORSHIP_ACTIVE' },
                      { employee_name: 'Taylor Swift', department: 'Cloud & Security', skill_name: 'Kubernetes Pod Security', required_proficiency: 5, current_proficiency: 2, gap_score: 3, priority: 'CRITICAL', status: 'ASSIGNED' },
                    ]).map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">{row.employee_name}</td>
                        <td className="py-3 px-3 text-slate-600">{row.department}</td>
                        <td className="py-3 px-3 font-bold text-[#0A7A74]">{row.skill_name}</td>
                        <td className="py-3 px-3 text-center font-medium">Level {row.required_proficiency}</td>
                        <td className="py-3 px-3 text-center font-medium">Level {row.current_proficiency}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-black text-rose-600">{row.gap_score}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            row.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            row.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {row.priority}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-bold text-slate-600 text-[11px]">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Training ROI & Effectiveness */}
            {activeTab === 'effectiveness' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-teal-50/80 border border-teal-200/80">
                    <span className="text-[10px] font-extrabold text-[#0A7A74] uppercase">Program ROI</span>
                    <p className="text-2xl font-black text-[#0A7A74] mt-1">185%</p>
                    <p className="text-slate-600 text-[11px] mt-1">Calculated via reduced external recruitment cost & faster velocity</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase">Avg Assessment Score</span>
                    <p className="text-2xl font-black text-emerald-700 mt-1">84.5%</p>
                    <p className="text-slate-600 text-[11px] mt-1">Over 112 completed MCQ & 360-degree peer evaluations</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-extrabold text-slate-600 uppercase">Time to Skill Gap Closure</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">18 Days</p>
                    <p className="text-slate-600 text-[11px] mt-1">Reduced from industry baseline of 45 days</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/80">
                  <h4 className="font-extrabold text-slate-900 text-xs mb-3">Top Effectiveness Highlights</h4>
                  <ul className="space-y-2 text-slate-700 text-xs">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0A7A74] shrink-0" />
                      <span><strong>Java Spring Boot Microservices:</strong> 88% pass rate, +1.8 avg level gain, closed 14 critical gaps in Q3.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0A7A74] shrink-0" />
                      <span><strong>Cloud Kubernetes Architecture:</strong> 82% pass rate, +1.4 avg level gain, 100% active mentorship adoption.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#0A7A74] shrink-0" />
                      <span><strong>Peer Knowledge Sharing:</strong> 24 expert-led sessions conducted with an average feedback rating of 4.9 / 5.0 stars.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
