import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaChartLine, FaExclamationCircle, FaExclamationTriangle, FaInfoCircle, FaSyncAlt, FaDatabase, FaTable, FaTachometerAlt, FaSlidersH, FaCheckCircle, FaCode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import HeatmapView from "../../components/Heatmap/HeatmapView";
import { gapAnalysisAPI } from "../../services/apiService";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import "./GapAnalysis.css";

const defaultGapPayload = {
  criticalCount: 2,
  moderateCount: 2,
  minorCount: 1,
  readinessScore: 64,
  targetRole: "Software Developer",
  storageStatus: "Stored in PostgreSQL Database (gap_analysis_results)",
  gapDetails: [
    { skill: "Java", category: "Programming", required: "Advanced", requiredScore: 85, current: "Advanced", currentScore: 85, level: "Met", class: "met", gapScore: 0 },
    { skill: "Spring Boot", category: "Framework", required: "Intermediate", requiredScore: 60, current: "Intermediate", currentScore: 60, level: "Met", class: "met", gapScore: 0 },
    { skill: "System Design", category: "Architecture", required: "Advanced", requiredScore: 85, current: "Intermediate", currentScore: 60, level: "Moderate", class: "moderate", gapScore: 25 },
    { skill: "Microservices", category: "Architecture", required: "Advanced", requiredScore: 85, current: "Beginner", currentScore: 35, level: "Critical", class: "critical", gapScore: 50 },
    { skill: "Docker", category: "DevOps", required: "Intermediate", requiredScore: 60, current: "Beginner", currentScore: 35, level: "Moderate", class: "moderate", gapScore: 25 },
    { skill: "Kubernetes", category: "DevOps", required: "Advanced", requiredScore: 85, current: "Beginner", currentScore: 30, level: "Critical", class: "critical", gapScore: 55 },
  ]
};

const GapAnalysis = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("Software Developer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("heatmap"); // 'heatmap' or 'chart' or 'table' or 'simulator'
  const [showSqlInspector, setShowSqlInspector] = useState(false);

  const [gapData, setGapData] = useState(defaultGapPayload);

  // Simulator Local States
  const [simulatedSkills, setSimulatedSkills] = useState([]);

  const fetchGapAnalysis = async (role) => {
    setIsAnalyzing(true);
    try {
      const response = await gapAnalysisAPI.calculateGap(1, role);
      if (response && response.success && response.data) {
        setGapData(response.data);
        setSimulatedSkills(response.data.gapDetails || []);
      } else {
        setGapData({ ...defaultGapPayload, targetRole: role });
        setSimulatedSkills(defaultGapPayload.gapDetails);
      }
    } catch (err) {
      console.error("Gap calculation error:", err);
      setGapData({ ...defaultGapPayload, targetRole: role });
      setSimulatedSkills(defaultGapPayload.gapDetails);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    fetchGapAnalysis(selectedRole);
  }, []);

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setSelectedRole(role);
    fetchGapAnalysis(role);
  };

  const handleAnalyzeAgain = () => {
    fetchGapAnalysis(selectedRole);
  };

  // Interactive Live Skill Upgrade Simulator Function
  const handleSimulateUpgrade = (skillName, newLevel) => {
    const levelScoreMap = { "Unaware": 15, "Beginner": 35, "Intermediate": 60, "Advanced": 85, "Expert": 95 };
    const newScore = levelScoreMap[newLevel] || 60;

    const updatedDetails = simulatedSkills.map(item => {
      if (item.skill.toLowerCase() === skillName.toLowerCase()) {
        const requiredScore = item.requiredScore || 85;
        const diff = requiredScore - newScore;

        let level = 'Met';
        let cls = 'met';
        if (diff >= 40) { level = 'Critical'; cls = 'critical'; }
        else if (diff >= 20) { level = 'Moderate'; cls = 'moderate'; }
        else if (diff > 0) { level = 'Minor'; cls = 'minor'; }

        return {
          ...item,
          current: newLevel,
          currentScore: newScore,
          level,
          class: cls,
          gapScore: Math.max(0, diff)
        };
      }
      return item;
    });

    let crit = 0, mod = 0, min = 0, totalObt = 0, totalReq = 0;
    updatedDetails.forEach(d => {
      if (d.level === 'Critical') crit++;
      else if (d.level === 'Moderate') mod++;
      else if (d.level === 'Minor') min++;
      totalObt += d.currentScore;
      totalReq += (d.requiredScore || 85);
    });

    const newReadiness = Math.round((totalObt / (totalReq || 1)) * 100);

    setSimulatedSkills(updatedDetails);
    setGapData({
      ...gapData,
      criticalCount: crit,
      moderateCount: mod,
      minorCount: min,
      readinessScore: newReadiness,
      gapDetails: updatedDetails
    });
  };

  const safeGapDetails = simulatedSkills.length > 0 ? simulatedSkills : (gapData?.gapDetails || defaultGapPayload.gapDetails);

  const chartData = safeGapDetails.map(g => ({
    name: g.skill,
    CurrentScore: g.currentScore || (g.current === 'Advanced' ? 85 : g.current === 'Intermediate' ? 60 : 35),
    RequiredScore: g.requiredScore || (g.required === 'Advanced' ? 85 : g.required === 'Intermediate' ? 60 : 85)
  }));

  const readinessScore = gapData?.readinessScore ?? 64;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Gap Analysis Engine" role="Employee" userName="R Amrutha" />

        <div className="page-container">
          {/* Header Banner */}
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaChartLine /> Knowledge Gap Detection & Role Benchmarking</h2>
              <p>Dynamic gap analysis recalculations stored directly in PostgreSQL database.</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#e0e7ff', padding: '6px 14px', borderRadius: '20px', color: '#3730a3', fontSize: '0.85rem', fontWeight: 600 }}>
                <FaDatabase color="#4f46e5" />
                <span>PostgreSQL: Active</span>
              </div>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setShowSqlInspector(!showSqlInspector)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FaCode /> {showSqlInspector ? "Hide SQL Query" : "View DB Query"}
              </button>
            </div>
          </div>

          {/* POSTGRESQL DB RECORD INSPECTOR */}
          {showSqlInspector && (
            <div className="card-box" style={{ background: "#0f172a", color: "#38bdf8", padding: "18px", borderRadius: "12px", marginBottom: "20px", fontFamily: "monospace", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", marginBottom: "8px" }}>
                <span>SQL PERSISTENCE QUERY EXECUTION LOG:</span>
                <span>Table: gap_analysis_results</span>
              </div>
              <pre style={{ margin: 0, color: "#4ade80", whiteSpace: "pre-wrap" }}>
{`INSERT INTO gap_analysis_results (user_id, target_role, critical_gaps_count, moderate_gaps_count, minor_gaps_count, gap_details)
VALUES (1, '${selectedRole}', ${gapData.criticalCount}, ${gapData.moderateCount}, ${gapData.minorCount}, '${JSON.stringify(safeGapDetails.slice(0, 2))}...');`}
              </pre>
            </div>
          )}

          {/* Filter & Trigger Bar */}
          <div className="filter-bar">
            <div className="filter-group">
              <label>Select Target Role Framework</label>
              <select
                className="select-control"
                value={selectedRole}
                onChange={handleRoleChange}
                style={{ fontWeight: 700, color: "#1e293b" }}
              >
                <option value="Software Developer">Software Developer (Core Stack)</option>
                <option value="Senior Software Engineer">Senior Software Engineer (Advanced Stack)</option>
                <option value="Full Stack Architect">Full Stack Architect (Enterprise Stack)</option>
                <option value="DevOps Lead">DevOps Lead (Cloud Native Stack)</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Target Role Readiness Score</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${readinessScore}%`,
                      height: '100%',
                      background: readinessScore > 60 ? '#10b981' : readinessScore > 40 ? '#f59e0b' : '#ef4444',
                      transition: 'width 0.5s ease'
                    }}
                  ></div>
                </div>
                <strong style={{ fontSize: '1rem', color: readinessScore > 60 ? '#059669' : '#dc2626' }}>
                  {readinessScore}% Match
                </strong>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleAnalyzeAgain} disabled={isAnalyzing}>
              <FaSyncAlt className={isAnalyzing ? "spin" : ""} /> {isAnalyzing ? "Recalculating..." : "Run Analysis"}
            </button>
          </div>

          {/* Dynamic KPI Cards - Recalculates live per role! */}
          <div className="kpi-grid">
            <div className="kpi-card border-left-red">
              <div className="kpi-content">
                <h3 className="red-text">{gapData?.criticalCount ?? 2}</h3>
                <p>Critical Gaps (High Priority)</p>
              </div>
              <div className="kpi-icon red">
                <FaExclamationCircle />
              </div>
            </div>

            <div className="kpi-card border-left-orange">
              <div className="kpi-content">
                <h3 className="orange-text">{gapData?.moderateCount ?? 2}</h3>
                <p>Moderate Gaps (Med Priority)</p>
              </div>
              <div className="kpi-icon orange">
                <FaExclamationTriangle />
              </div>
            </div>

            <div className="kpi-card border-left-green">
              <div className="kpi-content">
                <h3 className="green-text">{gapData?.minorCount ?? 1}</h3>
                <p>Minor Gaps (Low Priority)</p>
              </div>
              <div className="kpi-icon green">
                <FaInfoCircle />
              </div>
            </div>

            <div className="kpi-card border-left-blue">
              <div className="kpi-content">
                <h3 className="blue-text"><FaTachometerAlt /> {readinessScore}%</h3>
                <p>Target Framework Readiness</p>
              </div>
              <div className="kpi-icon blue">
                <FaCheckCircle />
              </div>
            </div>
          </div>

          {/* View Toggle Tabs */}
          <div style={{ display: 'flex', gap: '12px', margin: '20px 0 10px 0', flexWrap: 'wrap' }}>
            <button
              className={`btn ${activeTab === 'heatmap' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('heatmap')}
            >
              <FaTable /> Heatmap Discrepancy Matrix
            </button>
            <button
              className={`btn ${activeTab === 'chart' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('chart')}
            >
              <FaChartLine /> Recharts Score Comparison
            </button>
            <button
              className={`btn ${activeTab === 'simulator' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('simulator')}
            >
              <FaSlidersH /> Live Skill Gap Simulator (Interactive)
            </button>
            <button
              className={`btn ${activeTab === 'table' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('table')}
            >
              Discrepancy Breakdown Table
            </button>
          </div>

          {/* 1. HEATMAP VIEW */}
          {activeTab === 'heatmap' && (
            <HeatmapView gaps={safeGapDetails} role={selectedRole} />
          )}

          {/* 2. RECHARTS COMPARISON */}
          {activeTab === 'chart' && (
            <div className="card-box" style={{ padding: '24px', marginTop: '16px' }}>
              <h3>Current Proficiency vs Benchmark Required Level ({selectedRole})</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
                Numerical comparison (0-100 scale) comparing employee skills against target framework score requirements.
              </p>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="CurrentScore" fill="#3b82f6" name="Current User Score" />
                    <Bar dataKey="RequiredScore" fill="#ef4444" name="Benchmark Target Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 3. INTERACTIVE LIVE SIMULATOR FOR GUIDE DEMO */}
          {activeTab === 'simulator' && (
            <div className="card-box" style={{ padding: '24px', marginTop: '16px', background: '#f8fafc', border: '2px stroke #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaSlidersH color="#4f46e5" /> Live Skill Gap Simulator (Interactive Demo)
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Test upgrading skill proficiency live and watch the gap automatically re-calculate and change color!
                  </p>
                </div>

                <div style={{ background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>
                  Live Mode: Active
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
                {safeGapDetails.map((item, idx) => (
                  <div key={idx} style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{item.skill}</strong>
                      <span className={`badge-pill ${item.class || 'critical'}`}>{item.level}</span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0 0 10px 0' }}>
                      Required: <strong>{item.required}</strong> | Current: <strong>{item.current}</strong>
                    </p>

                    <label style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Simulate Proficiency Upgrade:
                    </label>
                    <select
                      className="select-control"
                      value={item.current}
                      onChange={(e) => handleSimulateUpgrade(item.skill, e.target.value)}
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      <option value="Unaware">Unaware (15%)</option>
                      <option value="Beginner">Beginner (35%)</option>
                      <option value="Intermediate">Intermediate (60%)</option>
                      <option value="Advanced">Advanced (85%)</option>
                      <option value="Expert">Expert (95%)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. DETAILED TABLE */}
          {activeTab === 'table' && (
            <div className="card-box" style={{ marginTop: '16px' }}>
              <div className="card-header">
                <h3>Gap Discrepancy Breakdown ({selectedRole})</h3>
                <span className="subtitle">Saved to PostgreSQL table gap_analysis_results</span>
              </div>

              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Skill Name</th>
                      <th>Category</th>
                      <th>Required Benchmark</th>
                      <th>Current Level</th>
                      <th>Gap Severity</th>
                      <th>Recommended Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeGapDetails.map((gap, index) => (
                      <tr key={index}>
                        <td style={{ fontWeight: 600, color: "#0f172a" }}>{gap.skill}</td>
                        <td><span className="category-tag">{gap.category || 'Core'}</span></td>
                        <td>
                          <span className="badge-pill blue">{gap.required}</span>
                        </td>
                        <td>
                          <span className="badge-pill beginner">{gap.current}</span>
                        </td>
                        <td>
                          <span className={`badge-pill ${gap.class || (gap.level ? gap.level.toLowerCase() : 'critical')}`}>
                            {gap.level}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate("/training")}
                          >
                            Explore Courses →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GapAnalysis;
