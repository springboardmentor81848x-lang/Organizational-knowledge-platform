import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

/**
 * Enterprise Report Export Utility (PDF & Excel)
 * Implements Milestone 3 Module 9 & Section 30 Checklist Requirements
 */

export function exportReportToPdf(reportType, reportData, title) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()

  // Header Banner
  doc.setFillColor(30, 41, 59) // Deep Navy (#1e293b)
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('KNOWLEDGEIQ PLATFORM', 14, 12)

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(148, 163, 184) // Slate 400
  doc.text(title || 'Enterprise Knowledge Report', 14, 20)

  const timestamp = new Date().toLocaleString()
  doc.setFontSize(9)
  doc.text(`Generated: ${timestamp}`, pageWidth - 14, 20, { align: 'right' })

  let currentY = 36

  if (reportType === 'EMPLOYEE_LEARNING_REPORT') {
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Employee Profile: ${reportData.employeeName || 'N/A'}`, 14, currentY)
    currentY += 6

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text(`Role: ${reportData.roleTitle || 'Employee'} | Department: ${reportData.departmentName || 'N/A'}`, 14, currentY)
    currentY += 8

    // Summary Metrics Box
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(14, currentY, pageWidth - 28, 20, 2, 2, 'F')

    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text('Total Skills', 20, currentY + 7)
    doc.text('Open Gaps', 65, currentY + 7)
    doc.text('Completed Courses', 110, currentY + 7)
    doc.text('Avg Progress', 155, currentY + 7)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text(String(reportData.totalSkills || 0), 20, currentY + 15)
    doc.text(String(reportData.openGapsCount || 0), 65, currentY + 15)
    doc.text(String(reportData.completedCourses || 0), 110, currentY + 15)
    doc.text(`${reportData.averageTrainingProgress || 0}%`, 155, currentY + 15)

    currentY += 28

    // Table 1: Skills & Benchmarks
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text('Skills & Competency Benchmarks', 14, currentY)
    currentY += 4

    const skillRows = (reportData.skills || []).map(s => [
      s.skillName || '',
      s.category || 'General',
      `${s.currentLevel || 0} / 5`,
      `${s.requiredLevel || 0} / 5`,
      s.gap > 0 ? `-${s.gap}` : 'Met',
      s.severity || (s.isCritical ? 'CRITICAL' : 'NORMAL')
    ])

    doc.autoTable({
      startY: currentY,
      head: [['Skill Name', 'Category', 'Current', 'Required', 'Gap', 'Severity']],
      body: skillRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    })

    currentY = doc.lastAutoTable.finalY + 10

    // Table 2: Training Courses
    if (currentY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 41, 59)
    doc.text('Training Course Enrollments', 14, currentY)
    currentY += 4

    const courseRows = (reportData.trainings || []).map(t => [
      t.title || '',
      t.level || 'Intermediate',
      `${t.progressPercent || 0}%`,
      t.status || 'IN_PROGRESS',
      t.enrollmentDate ? new Date(t.enrollmentDate).toLocaleDateString() : 'N/A'
    ])

    doc.autoTable({
      startY: currentY,
      head: [['Course Title', 'Level', 'Progress', 'Status', 'Enrolled Date']],
      body: courseRows.length ? courseRows : [['No enrolled courses found', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    })
  } else if (reportType === 'DEPARTMENT_TRAINING_REPORT') {
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Department Training Report: ${reportData.departmentName || 'All Departments'}`, 14, currentY)
    currentY += 8

    // Summary Metrics Box
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(14, currentY, pageWidth - 28, 20, 2, 2, 'F')

    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text('Total Employees', 20, currentY + 7)
    doc.text('Enrolled in Training', 65, currentY + 7)
    doc.text('Completed Courses', 110, currentY + 7)
    doc.text('Completion Rate', 155, currentY + 7)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text(String(reportData.totalEmployees || 0), 20, currentY + 15)
    doc.text(String(reportData.enrolledEmployees || 0), 65, currentY + 15)
    doc.text(String(reportData.completedEmployees || 0), 110, currentY + 15)
    doc.text(`${reportData.completionPercentage || 0}%`, 155, currentY + 15)

    currentY += 28

    const empRows = (reportData.employees || []).map(e => [
      e.fullName || '',
      e.roleTitle || 'Employee',
      e.enrolledCount || 0,
      e.completedCount || 0,
      `${e.averageProgress || 0}%`,
      e.status || 'Active'
    ])

    doc.autoTable({
      startY: currentY,
      head: [['Employee Name', 'Role Title', 'Courses Enrolled', 'Completed', 'Avg Progress', 'Status']],
      body: empRows.length ? empRows : [['No department records found', '-', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    })
  } else if (reportType === 'SKILL_GAP_REPORT') {
    doc.setTextColor(15, 23, 42)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Organization & Department Skill Gap Analysis Report', 14, currentY)
    currentY += 8

    // Summary Metrics Box
    doc.setFillColor(241, 245, 249)
    doc.roundedRect(14, currentY, pageWidth - 28, 20, 2, 2, 'F')

    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    doc.text('Assessed Headcount', 20, currentY + 7)
    doc.text('Unique Skills Evaluated', 65, currentY + 7)
    doc.text('Critical Shortages', 110, currentY + 7)
    doc.text('Top Domain Gap', 155, currentY + 7)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(15, 23, 42)
    doc.text(String(reportData.totalAssessedEmployees || 0), 20, currentY + 15)
    doc.text(String(reportData.uniqueSkillsEvaluated || 0), 65, currentY + 15)
    doc.text(String(reportData.criticalGapsCount || 0), 110, currentY + 15)
    doc.setFontSize(11)
    doc.text(String(reportData.topDeficitSkill || 'N/A').substring(0, 16), 155, currentY + 15)

    currentY += 28

    const gapRows = (reportData.skillsAnalysis || []).map(g => [
      g.skillName || '',
      g.category || 'General',
      g.affectedEmployeesCount || 0,
      `${g.averageCurrentLevel || 0} / 5`,
      `${g.averageRequiredLevel || 0} / 5`,
      `-${g.averageGap || 0}`,
      g.criticalDeficit ? 'CRITICAL' : 'ELEVATED'
    ])

    doc.autoTable({
      startY: currentY,
      head: [['Skill Name', 'Category', 'Affected Staff', 'Avg Current', 'Benchmark', 'Avg Deficit', 'Priority']],
      body: gapRows.length ? gapRows : [['No open skill deficits identified', '-', '-', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 }
    })
  }

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(148, 163, 184)
    doc.text(`Page ${i} of ${pageCount} — Confidential KnowledgeIQ Report`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' })
  }

  const filename = `${reportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(filename)
}

export function exportReportToExcel(reportType, reportData, title) {
  const wb = XLSX.utils.book_new()

  if (reportType === 'EMPLOYEE_LEARNING_REPORT') {
    const summarySheet = [
      { Metric: 'Employee Name', Value: reportData.employeeName },
      { Metric: 'Role Title', Value: reportData.roleTitle },
      { Metric: 'Department', Value: reportData.departmentName },
      { Metric: 'Total Skills', Value: reportData.totalSkills },
      { Metric: 'Open Gaps', Value: reportData.openGapsCount },
      { Metric: 'Critical Gaps', Value: reportData.criticalGapsCount },
      { Metric: 'Enrolled Courses', Value: reportData.enrolledCourses },
      { Metric: 'Completed Courses', Value: reportData.completedCourses },
      { Metric: 'Average Training Progress (%)', Value: reportData.averageTrainingProgress }
    ]
    const wsSummary = XLSX.utils.json_to_sheet(summarySheet)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    const skillsData = (reportData.skills || []).map(s => ({
      'Skill Name': s.skillName,
      'Category': s.category,
      'Current Level': s.currentLevel,
      'Required Level': s.requiredLevel,
      'Gap': s.gap,
      'Is Critical': s.isCritical ? 'Yes' : 'No',
      'Severity': s.severity
    }))
    const wsSkills = XLSX.utils.json_to_sheet(skillsData)
    XLSX.utils.book_append_sheet(wb, wsSkills, 'Skills Assessment')

    const trainingData = (reportData.trainings || []).map(t => ({
      'Course Title': t.title,
      'Level': t.level,
      'Progress (%)': t.progressPercent,
      'Status': t.status,
      'Enrollment Date': t.enrollmentDate,
      'Completed Date': t.completedDate || 'Pending'
    }))
    const wsTraining = XLSX.utils.json_to_sheet(trainingData)
    XLSX.utils.book_append_sheet(wb, wsTraining, 'Training History')
  } else if (reportType === 'DEPARTMENT_TRAINING_REPORT') {
    const summarySheet = [
      { Metric: 'Department Name', Value: reportData.departmentName },
      { Metric: 'Total Employees', Value: reportData.totalEmployees },
      { Metric: 'Enrolled in Training', Value: reportData.enrolledEmployees },
      { Metric: 'Completed Training', Value: reportData.completedEmployees },
      { Metric: 'Completion Rate (%)', Value: reportData.completionPercentage },
      { Metric: 'Average Progress (%)', Value: reportData.averageProgress },
      { Metric: 'Total Courses Completed', Value: reportData.totalCoursesCompleted }
    ]
    const wsSummary = XLSX.utils.json_to_sheet(summarySheet)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Department Summary')

    const employeesData = (reportData.employees || []).map(e => ({
      'Employee Name': e.fullName,
      'Role Title': e.roleTitle,
      'Courses Enrolled': e.enrolledCount,
      'Completed Courses': e.completedCount,
      'Average Progress (%)': e.averageProgress,
      'Status': e.status
    }))
    const wsEmployees = XLSX.utils.json_to_sheet(employeesData)
    XLSX.utils.book_append_sheet(wb, wsEmployees, 'Employee Roster')
  } else if (reportType === 'SKILL_GAP_REPORT') {
    const summarySheet = [
      { Metric: 'Total Assessed Employees', Value: reportData.totalAssessedEmployees },
      { Metric: 'Unique Skills Evaluated', Value: reportData.uniqueSkillsEvaluated },
      { Metric: 'Critical Deficits Count', Value: reportData.criticalGapsCount },
      { Metric: 'Top Deficit Skill', Value: reportData.topDeficitSkill }
    ]
    const wsSummary = XLSX.utils.json_to_sheet(summarySheet)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    const gapsData = (reportData.skillsAnalysis || []).map(g => ({
      'Skill Name': g.skillName,
      'Category': g.category,
      'Affected Headcount': g.affectedEmployeesCount,
      'Average Current Level': g.averageCurrentLevel,
      'Required Benchmark': g.averageRequiredLevel,
      'Average Deficit': g.averageGap,
      'Critical Deficit': g.criticalDeficit ? 'Yes' : 'No'
    }))
    const wsGaps = XLSX.utils.json_to_sheet(gapsData)
    XLSX.utils.book_append_sheet(wb, wsGaps, 'Skill Deficits')
  }

  const filename = `${reportType.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, filename)
}
