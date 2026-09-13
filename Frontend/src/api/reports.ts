import { api } from './client'

export type ReportFormat = 'pdf' | 'excel'

/**
 * Reports are generated at request time and streamed back as a file. The server chooses the
 * filename, which the client preserves so a download is saved under the name the report was
 * generated with.
 */
export const reportsApi = {
  employeeLearning: (employeeId: number, format: ReportFormat) =>
    api.download(`/api/reports/employee/${employeeId}?format=${format}`),

  departmentTraining: (department: string, format: ReportFormat) =>
    api.download(`/api/reports/department/${encodeURIComponent(department)}?format=${format}`),

  /** The organisation-wide skill gap report. */
  skillGap: (format: ReportFormat) => api.download(`/api/reports/training-effectiveness?format=${format}`),
}
