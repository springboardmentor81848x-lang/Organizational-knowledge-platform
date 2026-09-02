import React, { useState, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Filter,
  Layers,
  Award,
  Sparkles,
  Users,
  Target,
  BarChart3,
  TrendingUp,
  X
} from 'lucide-react';
import api from '../services/api';

interface EmployeeSkillHeatmapProps {
  employeeId?: number;
  departmentId?: number;
  showTitle?: boolean;
}

export const EmployeeSkillHeatmap: React.FC<EmployeeSkillHeatmapProps> = ({
  employeeId,
  departmentId,
  showTitle = true,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Database Heatmap State
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [skillNames, setSkillNames] = useState<string[]>([]);
  const [matrixData, setMatrixData] = useState<number[][]>([]);
  const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
  const [skillDetails, setSkillDetails] = useState<any[]>([]);
  const [detailedMatrix, setDetailedMatrix] = useState<any[][]>([]);
  const [summary, setSummary] = useState<any>(null);

  // Filters & Controls
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewDisplayMode, setViewDisplayMode] = useState<'gap' | 'current' | 'required' | 'percent'>('gap');
  const [selectedCell, setSelectedCell] = useState<any | null>(null);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (employeeId) params.employeeId = employeeId;
      if (departmentId) params.departmentId = departmentId;
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

      const res = await api.get('/gaps/heatmap', { params });

      if (res.data.success) {
        setEmployeeNames(res.data.employees || []);
        setSkillNames(res.data.skills || []);
        setMatrixData(res.data.data || []);
        setEmployeeDetails(res.data.employeeDetails || []);
        setSkillDetails(res.data.skillDetails || []);
        setDetailedMatrix(res.data.matrix || []);
        setSummary(res.data.summary || null);
      } else {
        setError(res.data.message || 'Failed to load database heatmap');
      }
    } catch (err: any) {
      console.error('Failed to fetch heatmap from MySQL database:', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to database heatmap endpoint');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [employeeId, departmentId, selectedCategory]);

  const categories = ['All', 'Technical', 'Soft Skills', 'Leadership', 'Domain Knowledge', 'Compliance'];

  if (loading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-64" />
          <div className="h-8 bg-slate-200 rounded w-32" />
        </div>
        <div className="h-64 bg-slate-100/80 rounded-2xl animate-pulse flex flex-col items-center justify-center text-slate-400 space-y-2">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-xs font-bold text-slate-600">Querying MySQL Database & Generating Heatmap Matrix...</p>
          <p className="text-[11px] text-slate-400">Fetching live employee competencies & department skill benchmarks</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-rose-200 rounded-3xl p-6 text-center space-y-3 shadow-xs">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">Database Heatmap Error</h3>
          <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">{error}</p>
        </div>
        <button
          onClick={fetchHeatmapData}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs cursor-pointer transition-all shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Database Request</span>
        </button>
      </div>
    );
  }

  if (employeeNames.length === 0 || skillNames.length === 0) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center text-slate-500 space-y-3 shadow-xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm">No Database Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No active employee skills or required department benchmarks matching the selected criteria.
          </p>
        </div>
        <button
          onClick={fetchHeatmapData}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-6 text-xs">
      {/* Header Section */}
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 mb-1">
              <Flame className="w-3 h-3 text-emerald-600" />
              <span>Live Database Heatmap Engine</span>
            </div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Employee vs. Skill Knowledge Gap Heatmap
            </h2>
            <p className="text-slate-500 text-xs font-medium">
              Dynamic competency matrix computed directly from MySQL employees, skills, and department benchmarks
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Display Mode Selector */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewDisplayMode('gap')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  viewDisplayMode === 'gap'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Display Knowledge Gap Score (Deficit)"
              >
                Gap Value
              </button>
              <button
                onClick={() => setViewDisplayMode('current')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  viewDisplayMode === 'current'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Display Employee Current Proficiency Level"
              >
                Current Lvl
              </button>
              <button
                onClick={() => setViewDisplayMode('required')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  viewDisplayMode === 'required'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Display Department Required Benchmark"
              >
                Required Lvl
              </button>
              <button
                onClick={() => setViewDisplayMode('percent')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                  viewDisplayMode === 'percent'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Display Competency Percentage"
              >
                % Met
              </button>
            </div>

            <button
              onClick={fetchHeatmapData}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
              title="Refresh Heatmap Matrix from MySQL"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary KPI Bar */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-[10px] font-extrabold uppercase text-slate-400">Total Employees</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{summary.totalEmployees}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-[10px] font-extrabold uppercase text-slate-400">Tracked Skills</p>
            <p className="text-lg font-black text-slate-900 mt-0.5">{summary.totalSkills}</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
            <p className="text-[10px] font-extrabold uppercase text-emerald-700">Satisfied (0 Gap)</p>
            <p className="text-lg font-black text-emerald-900 mt-0.5">{summary.zeroGapCount}</p>
          </div>
          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
            <p className="text-[10px] font-extrabold uppercase text-amber-700">Moderate Deficits (-1)</p>
            <p className="text-lg font-black text-amber-900 mt-0.5">{summary.mediumPriorityGaps}</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200/80 col-span-2 md:col-span-1">
            <p className="text-[10px] font-extrabold uppercase text-rose-700">High Risk Deficits (-2+)</p>
            <p className="text-lg font-black text-rose-900 mt-0.5">{summary.highPriorityGaps}</p>
          </div>
        </div>
      )}

      {/* Category Filter & Color Scale Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Heatmap Color Scale Legend */}
        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-600 flex-wrap shrink-0">
          <span className="text-slate-400 uppercase tracking-wider">Gap Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-black text-[9px]">0</div>
            <span>Target Met</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-black text-[9px]">1</div>
            <span>Moderate Gap</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-rose-500 text-white border border-rose-600 flex items-center justify-center font-black text-[9px]">2+</div>
            <span>Critical Deficit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-md bg-slate-100 text-slate-400 border border-dashed border-slate-300 flex items-center justify-center text-[8px] font-bold">?</div>
            <span>Unassessed</span>
          </div>
        </div>
      </div>

      {/* Main Heatmap Matrix Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs max-h-[520px]">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 z-20 bg-slate-100 border-b border-slate-200 shadow-2xs">
            <tr>
              {/* Sticky Left Header: Employee Column */}
              <th className="p-3 font-extrabold uppercase text-[10px] tracking-wider text-slate-700 bg-slate-100 sticky left-0 z-30 min-w-[180px] max-w-[220px] border-r border-slate-200 shadow-xs">
                Employee Name & Dept
              </th>
              {/* Skill Columns */}
              {skillDetails.map((skill) => (
                <th
                  key={skill.id}
                  className="p-2.5 text-center border-r border-slate-200/80 min-w-[110px] max-w-[140px] bg-slate-100"
                >
                  <div className="font-extrabold text-[11px] text-slate-900 truncate" title={skill.name}>
                    {skill.name}
                  </div>
                  <div className="text-[9px] text-slate-500 font-semibold truncate mt-0.5">
                    {skill.category}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 bg-white font-medium">
            {employeeNames.map((empName, empIdx) => {
              const empMeta = employeeDetails[empIdx] || {};
              const empRowCells = detailedMatrix[empIdx] || [];

              return (
                <tr key={empIdx} className="hover:bg-slate-50/60 transition-colors">
                  {/* Sticky Employee Name Column (Y-Axis) */}
                  <td className="p-3 sticky left-0 z-10 bg-white hover:bg-slate-50/90 border-r border-slate-200 min-w-[180px] max-w-[220px] shadow-xs">
                    <p className="font-extrabold text-slate-900 text-xs truncate" title={empName}>
                      {empName}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-bold truncate">
                        {empMeta.departmentName || 'Dept'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium truncate">
                        {empMeta.designation}
                      </span>
                    </div>
                  </td>

                  {/* Skill Cells across X-Axis */}
                  {empRowCells.map((cell: any, skillIdx: number) => {
                    const gap = cell.gapScore;
                    const isAssessed = cell.isAssessed;

                    let cellBg = 'bg-slate-50 hover:bg-slate-100 text-slate-600';
                    let cellBorder = 'border-slate-200/70';
                    let displayContent: React.ReactNode = null;

                    if (!isAssessed) {
                      cellBg = 'bg-slate-50/80 hover:bg-slate-100 text-slate-400 border-dashed';
                      cellBorder = 'border-slate-300';
                      displayContent = (
                        <span className="text-[10px] font-bold text-slate-400">
                          {viewDisplayMode === 'gap' ? 'N/A' : viewDisplayMode === 'current' ? '0/5' : `${cell.requiredLevel}/5`}
                        </span>
                      );
                    } else if (gap <= 0) {
                      cellBg = 'bg-emerald-100/80 hover:bg-emerald-200/80 text-emerald-900 font-extrabold';
                      cellBorder = 'border-emerald-300';
                      displayContent = (
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {viewDisplayMode === 'gap'
                              ? '0'
                              : viewDisplayMode === 'current'
                              ? `${cell.currentLevel}/5`
                              : viewDisplayMode === 'required'
                              ? `${cell.requiredLevel}/5`
                              : `${cell.gapPercentage}%`}
                          </span>
                        </div>
                      );
                    } else if (gap === 1) {
                      cellBg = 'bg-amber-100 hover:bg-amber-200 text-amber-950 font-extrabold';
                      cellBorder = 'border-amber-300';
                      displayContent = (
                        <div className="flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>
                            {viewDisplayMode === 'gap'
                              ? '-1'
                              : viewDisplayMode === 'current'
                              ? `${cell.currentLevel}/5`
                              : viewDisplayMode === 'required'
                              ? `${cell.requiredLevel}/5`
                              : `${cell.gapPercentage}%`}
                          </span>
                        </div>
                      );
                    } else {
                      cellBg = 'bg-rose-500 hover:bg-rose-600 text-white font-black shadow-2xs';
                      cellBorder = 'border-rose-600';
                      displayContent = (
                        <div className="flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
                          <span>
                            {viewDisplayMode === 'gap'
                              ? `-${gap}`
                              : viewDisplayMode === 'current'
                              ? `${cell.currentLevel}/5`
                              : viewDisplayMode === 'required'
                              ? `${cell.requiredLevel}/5`
                              : `${cell.gapPercentage}%`}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <td
                        key={skillIdx}
                        onClick={() => setSelectedCell(cell)}
                        className={`p-2 border-r border-slate-200 text-center transition-all cursor-pointer ${cellBg} ${cellBorder}`}
                        title={`${cell.employeeName} - ${cell.skillName}\nCurrent: Lvl ${cell.currentLevel}\nRequired: Lvl ${cell.requiredLevel}\nGap: ${cell.gapScore}`}
                      >
                        <div className="min-h-[38px] flex items-center justify-center text-xs">
                          {displayContent}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 font-bold">
                  <Flame className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{selectedCell.skillName}</h3>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {selectedCell.employeeName} ({selectedCell.departmentName})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Current Skill Level</p>
                <p className="text-base font-black text-slate-900 mt-0.5">
                  {selectedCell.isAssessed ? `Level ${selectedCell.currentLevel} / 5` : 'Not Assessed'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Department Target</p>
                <p className="text-base font-black text-emerald-700 mt-0.5">
                  Level {selectedCell.requiredLevel} / 5
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-2 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">
                  {selectedCell.gapScore <= 0
                    ? 'Competency Standard Satisfied'
                    : `Knowledge Gap Score: -${selectedCell.gapScore}`}
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed font-medium">
                  {selectedCell.gapScore <= 0
                    ? `${selectedCell.employeeName} meets or exceeds the required benchmark for ${selectedCell.skillName}.`
                    : `Calculated as Required Level (${selectedCell.requiredLevel}) - Current Level (${selectedCell.currentLevel}). Targeted training is recommended.`}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCell(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 cursor-pointer transition-all text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
