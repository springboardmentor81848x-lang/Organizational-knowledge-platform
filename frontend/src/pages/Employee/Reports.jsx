import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { FaFileAlt, FaFilePdf, FaFileExcel, FaDownload, FaChartBar, FaCheckCircle, FaPrint } from "react-icons/fa";
import "./Reports.css";

const Reports = () => {
  const [reportType, setReportType] = useState("Individual");

  const reportsList = [
    {
      id: 1,
      title: "Individual Skill Gap & Competency Analysis Report",
      category: "Individual",
      date: "May 2024",
      size: "2.4 MB",
      desc: "Detailed individual assessment comparing employee skills against required benchmark proficiency levels."
    },
    {
      id: 2,
      title: "Software Engineering Department Gap Summary Report",
      category: "Department",
      date: "Q2 2024",
      size: "4.1 MB",
      desc: "Aggregated team & department heatmap breakdown highlighting high-risk technical competency gaps."
    },
    {
      id: 3,
      title: "Workforce Training Effectiveness & ROI Report",
      category: "Analytics",
      date: "Q1 2024",
      size: "3.8 MB",
      desc: "Post-training velocity measurements, course completion rates, and learning ROI calculation."
    },
    {
      id: 4,
      title: "Strategic Workforce Skill Forecasting Report 2024-2025",
      category: "Strategic",
      date: "Annual 2024",
      size: "5.6 MB",
      desc: "Future skill requirements forecast mapped against company strategic goals and upcoming technology stacks."
    }
  ];

  const handleExportPDF = (title) => {
    alert(`Exporting "${title}" as PDF file...`);
  };

  const handleExportExcel = (title) => {
    alert(`Exporting "${title}" as Excel spreadsheet (.xlsx)...`);
  };

  const filteredReports = reportsList.filter(r =>
    reportType === "All" ? true : r.category === reportType
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar title="Reports & Analytics Export" role="Employee" userName="R Amrutha" />

        <div className="page-container">
          <div className="page-header">
            <div className="page-header-text">
              <h2><FaFileAlt /> Reports & Export Module</h2>
              <p>Generate, view, and export individual and department intelligence reports in PDF or Excel formats.</p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                <FaPrint /> Print Page
              </button>
              <button className="btn btn-primary" onClick={() => handleExportPDF("Full Platform Summary")}>
                <FaFilePdf /> Export Executive PDF
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="filter-bar">
            <label className="font-semibold" style={{ fontSize: "0.85rem", color: "#475569" }}>Report Category:</label>
            <select
              className="select-control"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Individual">Individual Skill Gap Reports</option>
              <option value="Department">Department Gap Summary</option>
              <option value="Analytics">Training Effectiveness & ROI</option>
              <option value="Strategic">Strategic Skill Forecasting</option>
            </select>
          </div>

          {/* Reports Grid */}
          <div className="reports-grid">
            {filteredReports.map((report) => (
              <div key={report.id} className="card-box report-card">
                <div className="report-card-header">
                  <div className="report-icon">
                    <FaChartBar color="#7c3aed" />
                  </div>
                  <div className="report-meta">
                    <span className="badge-pill purple">{report.category}</span>
                    <span className="report-date">{report.date} • {report.size}</span>
                  </div>
                </div>

                <h3>{report.title}</h3>
                <p>{report.desc}</p>

                <div className="report-card-actions">
                  <button className="btn btn-sm btn-outline" onClick={() => handleExportPDF(report.title)}>
                    <FaFilePdf color="#ef4444" /> Export PDF
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleExportExcel(report.title)}>
                    <FaFileExcel color="#10b981" /> Export Excel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
