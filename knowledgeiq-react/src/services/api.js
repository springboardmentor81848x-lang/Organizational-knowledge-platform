const API_BASE_URL = '/api'

export function getToken() {
  return localStorage.getItem('knowledgeiq_token')
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('knowledgeiq_token', token)
  } else {
    localStorage.removeItem('knowledgeiq_token')
  }
}

export function getCurrentUserFromStorage() {
  const user = localStorage.getItem('knowledgeiq_user')
  return user ? JSON.parse(user) : null
}

export function setCurrentUserInStorage(user) {
  if (user) {
    localStorage.setItem('knowledgeiq_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('knowledgeiq_user')
  }
}

// On module load: clean up any malformed session data
;(function cleanupStaleSession() {
  try {
    const raw = localStorage.getItem('knowledgeiq_user')
    if (raw) JSON.parse(raw) // will throw if corrupted
  } catch {
    localStorage.removeItem('knowledgeiq_user')
    localStorage.removeItem('knowledgeiq_token')
  }
})()

async function request(endpoint, options = {}) {
  const token = getToken()
  const isPublicAuth = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register') || endpoint.startsWith('/auth/health')
  const headers = {
    'Content-Type': 'application/json',
    ...(token && !isPublicAuth ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.message || `Request failed with status ${response.status}`)
  }

  return response.json()
}

export const api = {
  getToken,
  setToken,
  getCurrentUserFromStorage,
  setCurrentUserInStorage,

  login: async (email, password) => {
    setToken(null)
    setCurrentUserInStorage(null)
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
    if (data.token) {
      setToken(data.token)
      setCurrentUserInStorage(data)
    }
    return data
  },

  register: async (payload) => {
    setToken(null)
    setCurrentUserInStorage(null)
    const data = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    if (data.token) {
      setToken(data.token)
      setCurrentUserInStorage(data)
    }
    return data
  },

  getCurrentUser: async () => {
    return request('/auth/me')
  },

  getUserGaps: async () => {
    return request(`/gap-analysis/me`)
  },

  getScopedHeatmap: async () => {
    return request(`/gap-analysis/scoped-heatmap`)
  },

  getPersonalizedRecommendations: async () => {
    return request('/training/recommendations/personalized')
  },

  getPersonalizedLearningPath: async () => {
    return request('/training/learning-path/personalized')
  },

  chatWithAi: async (message, courseContext) => {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, courseContext })
    })
  },

  getCourses: async () => {
    return request('/training/courses')
  },

  enrollCourse: async (courseId) => {
    return request('/training/enroll', {
      method: 'POST',
      body: JSON.stringify({ courseId })
    })
  },

  getUserEnrollments: async () => {
    return request(`/training/enrollments/me`)
  },

  getMentorsForSkill: async (skillId) => {
    return request(`/mentorship/mentors/skill/${skillId}`)
  },

  requestMentorship: async (mentorId, skillId, notes) => {
    return request('/mentorship/request', {
      method: 'POST',
      body: JSON.stringify({ mentorId, skillId, notes })
    })
  },

  getUserNotifications: async () => {
    return request(`/notifications/me`)
  },

  getUnreadNotificationCount: async () => {
    return request(`/notifications/me/unread-count`)
  },

  markNotificationRead: async (notificationId) => {
    return request(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    })
  },

  deleteNotification: async (notificationId) => {
    return request(`/notifications/${notificationId}`, {
      method: 'DELETE'
    })
  },

  markAllNotificationsRead: async () => {
    return request(`/notifications/mark-all-read`, {
      method: 'PUT'
    })
  },

  getDashboardSummary: async () => {
    return request('/analytics/dashboard-summary')
  },

  getEmployeeDashboard: async () => {
    return request('/dashboard/employee')
  },

  getHrDashboard: async () => {
    return request('/dashboard/hr')
  },

  getAdminDashboard: async () => {
    return request('/dashboard/admin')
  },

  getProfile: async () => {
    return request('/auth/me')
  },

  updateProfile: async (form, imageFile) => {
    const token = getToken()
    
    if (!imageFile) {
      return request('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(form)
      })
    }

    const formData = new FormData()
    formData.append('profileData', new Blob([JSON.stringify(form)], { type: 'application/json' }))
    formData.append('image', imageFile)
    
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || errorData.message || 'Failed to update profile')
    }
    
    return response.json()
  },

  logout: () => {
    setToken(null)
    setCurrentUserInStorage(null)
  },

  getAiOnboardingSuggestions: async (domain) => {
    return request('/ai/onboarding', {
      method: 'POST',
      body: JSON.stringify({ domain })
    })
  },

  generateAiAssessment: async (domain, difficulty = 'Intermediate', questionCount = 5) => {
    return request('/ai/generate-assessment', {
      method: 'POST',
      body: JSON.stringify({ domain, difficulty, questionCount })
    })
  },

  evaluateAiAssessment: async (submissionPayload) => {
    return request('/ai/evaluate-assessment', {
      method: 'POST',
      body: JSON.stringify(submissionPayload)
    })
  },

  googleLogin: async (accessToken, userInfo) => {
    setToken(null)
    setCurrentUserInStorage(null)
    const data = await request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ accessToken, userInfo })
    })
    if (data.token) {
      setToken(data.token)
      setCurrentUserInStorage(data)
    }
    return data
  },

  getUserAssessments: async () => {
    return request('/assessments/me')
  },

  getAssessmentQuestionnaire: async () => {
    return request('/assessments/questionnaire')
  },

  submitAssessment: async (responses, title = 'Skill Self-Assessment', type = 'SELF_ASSESSMENT', assessmentId = null) => {
    return request('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify({ title, type, responses, assessmentId })
    })
  },

  requestPeerAssessment: async (evaluatorEmail, title, notes) => {
    return request('/assessments/request-peer', {
      method: 'POST',
      body: JSON.stringify({ evaluatorEmail, title, notes })
    })
  },

  getPendingEvaluations: async () => {
    return request('/assessments/pending-evaluations')
  },

  createCustomQuestionnaire: async (payload) => {
    return request('/assessments/custom-builder', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  getCustomQuestionnaires: async () => {
    return request('/assessments/custom-questionnaires')
  },

  scheduleAssessment: async (payload) => {
    return request('/assessments/schedule', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  compareAssessments: async (id1, id2) => {
    return request(`/assessments/compare?id1=${id1}&id2=${id2}`)
  },

  updateSkillRating: async (skillId, proficiencyLevel, notes = '') => {
    return request('/employee/skills/rating', {
      method: 'POST',
      body: JSON.stringify({ skillId, proficiencyLevel, notes })
    })
  },

  addCustomSkill: async (skillName, categoryName, proficiencyLevel = 3) => {
    return request('/employee/skills/add', {
      method: 'POST',
      body: JSON.stringify({ skillName, categoryName, proficiencyLevel })
    })
  },

  getCertifications: async () => {
    return request('/employee/certifications')
  },

  addCertification: async (payload) => {
    const token = getToken()
    if (payload instanceof FormData) {
      const response = await fetch(`${API_BASE_URL}/employee/certifications`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: payload
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.message || 'Failed to add certification')
      }
      return response.json()
    }
    return request('/employee/certifications', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  deleteCertification: async (id) => {
    return request(`/employee/certifications/${id}`, {
      method: 'DELETE'
    })
  },

  viewCertificate: async (id) => {
    return request(`/employee/certifications/${id}/view`)
  },

  recalculateGaps: async () => {
    return request('/gap-analysis/recalculate', {
      method: 'POST'
    })
  },

  updateExperience: async (experience) => {
    return request('/employee/profile/experience', {
      method: 'PUT',
      body: JSON.stringify({ experience })
    })
  },

  updateEducation: async (education) => {
    return request('/employee/profile/education', {
      method: 'PUT',
      body: JSON.stringify({ education })
    })
  },

  getRoleMapping: async () => {
    return request('/employee/role-mapping')
  },

  updateEnrollmentStatus: async (enrollmentId, status) => {
    return request(`/training/enrollments/${enrollmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  downloadGapsCsv: () => {
    const token = getToken()
    window.open(`/api/analytics/export/gaps.csv?token=${token}`, '_blank')
  },

  downloadTrainingCsv: () => {
    const token = getToken()
    window.open(`/api/analytics/export/training.csv?token=${token}`, '_blank')
  },

  getManagerTeamGaps: async () => {
    return request('/manager/team-gaps')
  },

  getManagerTeamProfiles: async () => {
    return request('/manager/team-profiles')
  },

  getManagerHeatmapData: async () => {
    return request('/manager/heatmap-data')
  },

  getEmployeeRecommendations: async (employeeId) => {
    return request(`/manager/employee/${employeeId}/recommendations`)
  },

  assignCourseToEmployee: async (employeeId, courseId, notes = '') => {
    return request(`/manager/assign-course`, {
      method: 'POST',
      body: JSON.stringify({ employeeId, courseId, notes })
    })
  },

  getOrganizations: async () => {
    return request('/auth/organizations')
  },

  getDepartments: async (orgName) => {
    return request(`/auth/departments?orgName=${encodeURIComponent(orgName)}`)
  },

  // L&D Admin endpoints
  getLdDashboard: async () => {
    return request('/ldadmin/dashboard')
  },

  getLdCertifications: async () => {
    return request('/ldadmin/certifications')
  },

  verifyCertification: async (id) => {
    return request(`/ldadmin/certifications/${id}/verify`, {
      method: 'POST'
    })
  },

  createCourse: async (payload) => {
    return request('/training/courses', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  updateCourse: async (id, payload) => {
    return request(`/training/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  deleteCourse: async (id) => {
    return request(`/training/courses/${id}`, {
      method: 'DELETE'
    })
  },

  getLdPaths: async () => {
    return request('/ldadmin/paths')
  },

  createLdPath: async (payload) => {
    return request('/ldadmin/paths', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  deleteLdPath: async (id) => {
    return request(`/ldadmin/paths/${id}`, {
      method: 'DELETE'
    })
  },

  // Dept Head endpoints
  getDeptHeadDashboard: async () => {
    return request('/depthead/dashboard')
  },

  getDeptHeadBenchmarks: async () => {
    return request('/depthead/benchmarks')
  },

  updateRoleBenchmark: async (id, payload) => {
    return request(`/depthead/benchmarks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  addRoleBenchmark: async (payload) => {
    return request('/depthead/benchmarks', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  getDeptHeadAllocation: async () => {
    return request('/depthead/allocation')
  },

  updateDeptAllocation: async (payload) => {
    return request('/depthead/allocation', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
  },

  // System Admin endpoints
  getAdminUsers: async () => {
    return request('/admin/users')
  },

  toggleUserStatus: async (id) => {
    return request(`/admin/users/${id}/status`, {
      method: 'PUT'
    })
  },

  updateUserRole: async (id, role) => {
    return request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role })
    })
  },

  getSkills: async () => {
    return request('/competency/skills')
  },

  createSkill: async (payload) => {
    return request('/admin/skills', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  deleteSkill: async (id) => {
    return request(`/admin/skills/${id}`, {
      method: 'DELETE'
    })
  },

  // HR Specialist endpoints
  getHrUsers: async () => {
    return request('/hr/users')
  },

  toggleHrUserStatus: async (id) => {
    return request(`/hr/users/${id}/status`, {
      method: 'POST'
    })
  },

  updateHrUserRole: async (id, payload) => {
    return request(`/hr/users/${id}/role`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  getHrDepartments: async () => {
    return request('/hr/departments-list')
  },

  createHrDepartment: async (payload) => {
    return request('/hr/departments', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
  },

  getHrForecasting: async () => {
    return request('/hr/forecasting-data')
  },

  getExternalCatalog: async () => {
    return request('/training/external-catalog')
  },

  getCompetencyFramework: async (roleId) => {
    if (roleId) return request(`/competency/framework/${roleId}`)
    return request('/competency/framework')
  },

  getGapTrends: async () => {
    return request('/gap-analysis/trends')
  },

  getPersonalizedLearningPath: async () => {
    return request('/training/learning-path/personalized')
  }
}

export default api
