import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import {
  TrendingUp,
  ShieldAlert,
  Users,
  Gauge,
  RefreshCw,
  Target,
  BriefcaseBusiness,
} from "lucide-react";

function SummaryCard({ title, value, description, icon, iconClass }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">{value}</h2>
          <p className="text-xs text-slate-400 mt-2">{description}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function SkillForecast() {
  const [summary, setSummary] = useState({
    highDemandSkills: 0,
    skillsAtRisk: 0,
    projectedSkillGaps: 0,
    employeesRequiringUpskilling: 0,
    recruitmentRequirements: 0,
    forecastAvailable: false,
    message: "Insufficient historical data to generate a reliable forecast.",
  });
  const [forecast, setForecast] = useState([]);
  const [atRisk, setAtRisk] = useState([]);
  const [upskillVsHire, setUpskillVsHire] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [summaryRes, skillsRes, riskRes, upskillRes] = await Promise.all([
        api.get("/hr/skill-forecast/summary"),
        api.get("/hr/skill-forecast/skills"),
        api.get("/hr/skill-forecast/at-risk"),
        api.get("/hr/skill-forecast/upskill-vs-hire"),
      ]);

      setSummary(summaryRes.data || {});
      setForecast(Array.isArray(skillsRes.data) ? skillsRes.data : []);
      setAtRisk(Array.isArray(riskRes.data) ? riskRes.data : []);
      setUpskillVsHire(Array.isArray(upskillRes.data) ? upskillRes.data : []);
    } catch (err) {
      console.error("Error loading skill forecast:", err);
      setError("Unable to load skill forecast data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />
        <div className="flex-1 min-w-0">
          <Navbar title="Skill Forecast" />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="text-center">
              <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-indigo-600" />
              <p className="text-slate-500">Loading skill forecast...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar role="HR" />
        <div className="flex-1 min-w-0">
          <Navbar title="Skill Forecast" />
          <main className="p-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto">
              <ShieldAlert size={42} className="mx-auto text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-red-600">Unable to Load</h2>
              <p className="text-slate-600 mt-3">{error}</p>
              <button onClick={fetchData} className="mt-6 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Try Again</button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar role="HR" />
      <div className="flex-1 min-w-0">
        <Navbar title="Skill Forecast" />

        <main className="p-5 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Skill Forecast</h1>
              <p className="text-slate-500 mt-2">Identify future skill demand and anticipate workforce skill shortages.</p>
            </div>
            <button onClick={fetchData} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5 mb-8">
            <SummaryCard title="High-Demand Skills" value={summary.highDemandSkills ?? 0} description="Skills with strongest demand" icon={<TrendingUp size={24} />} iconClass="bg-indigo-100 text-indigo-600" />
            <SummaryCard title="Skills at Risk" value={summary.skillsAtRisk ?? 0} description="Skills likely to face shortages" icon={<ShieldAlert size={24} />} iconClass="bg-orange-100 text-orange-600" />
            <SummaryCard title="Projected Skill Gaps" value={summary.projectedSkillGaps ?? 0} description="Skills short of future need" icon={<Target size={24} />} iconClass="bg-red-100 text-red-600" />
            <SummaryCard title="Employees Requiring Upskilling" value={summary.employeesRequiringUpskilling ?? 0} description="Employees needing learning intervention" icon={<Users size={24} />} iconClass="bg-blue-100 text-blue-600" />
            <SummaryCard title="Recruitment Requirements" value={summary.recruitmentRequirements ?? 0} description="Likely hiring requirements" icon={<BriefcaseBusiness size={24} />} iconClass="bg-cyan-100 text-cyan-600" />
          </div>

          {!summary.forecastAvailable && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-3">
                <Gauge size={20} className="text-amber-600" />
                <span className="font-medium">Insufficient historical data to generate a reliable forecast.</span>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Skill Demand Forecast</h2>
            {forecast.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Skill</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Workforce</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Demand</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Projected Future Demand</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Coverage</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Projected Gap</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Level</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.map((item, index) => (
                      <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-800">{item.skill}</td>
                        <td className="px-4 py-4 text-slate-600">{item.currentWorkforce}</td>
                        <td className="px-4 py-4 text-slate-600">{item.currentDemand}</td>
                        <td className="px-4 py-4 text-slate-600">{item.projectedFutureDemand}</td>
                        <td className="px-4 py-4 text-slate-600">{item.currentCoverage}%</td>
                        <td className="px-4 py-4 text-slate-600">{item.projectedGap}</td>
                        <td className="px-4 py-4 text-slate-600"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.riskLevel === "Critical" ? "bg-red-100 text-red-700" : item.riskLevel === "High" ? "bg-orange-100 text-orange-700" : item.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>{item.riskLevel}</span></td>
                        <td className="px-4 py-4 text-slate-600">{item.recommendedAction}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">No forecast data available.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Skills at Risk</h2>
            {atRisk.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Skill Name</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Capability</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Future Demand</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Projected Shortage</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Risk Level</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Employees for Upskilling</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Recruitment Requirement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {atRisk.map((item, index) => (
                      <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-800">{item.skill}</td>
                        <td className="px-4 py-4 text-slate-600">{item.currentCapability}%</td>
                        <td className="px-4 py-4 text-slate-600">{item.futureDemand}</td>
                        <td className="px-4 py-4 text-slate-600">{item.projectedShortage}</td>
                        <td className="px-4 py-4 text-slate-600"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${item.riskLevel === "Critical" ? "bg-red-100 text-red-700" : item.riskLevel === "High" ? "bg-orange-100 text-orange-700" : item.riskLevel === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-emerald-100 text-emerald-700"}`}>{item.riskLevel}</span></td>
                        <td className="px-4 py-4 text-slate-600">{item.employeesAvailableForUpskilling || 0}</td>
                        <td className="px-4 py-4 text-slate-600">{item.recruitmentRequirement || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">No at-risk skills identified.</div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-5">Upskill vs Hire</h2>
            {upskillVsHire.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Skill</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Future Requirement</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Current Qualified Employees</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Employees Suitable for Upskilling</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Remaining Shortage</th>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-slate-600">Suggested Hiring Requirement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upskillVsHire.map((item, index) => (
                      <tr key={index} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-4 font-medium text-slate-800">{item.skill}</td>
                        <td className="px-4 py-4 text-slate-600">{item.futureRequirement}</td>
                        <td className="px-4 py-4 text-slate-600">{item.currentQualifiedEmployees}</td>
                        <td className="px-4 py-4 text-slate-600">{item.employeesSuitableForUpskilling}</td>
                        <td className="px-4 py-4 text-slate-600">{item.remainingShortage}</td>
                        <td className="px-4 py-4 text-slate-600">{item.suggestedHiringRequirement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500">No upskill-vs-hire analysis available.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
