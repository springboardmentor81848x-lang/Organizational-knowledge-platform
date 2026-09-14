import { API_BASE as API_BASE_URL } from './platformApi';

const DEPARTMENT_HEAD_BASE = `${API_BASE_URL}/dashboard/department-head`;

export const departmentHeadService = {
  // Get department statistics
  getDepartmentStatistics: async (email) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/statistics?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching department statistics:', error);
      return null;
    }
  },

  // Get department teams
  getDepartmentTeams: async (email) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/teams?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch teams');
      return await response.json();
    } catch (error) {
      console.error('Error fetching department teams:', error);
      return [];
    }
  },

  // Get department employees
  getDepartmentEmployees: async (email) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/employees?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      return await response.json();
    } catch (error) {
      console.error('Error fetching department employees:', error);
      return [];
    }
  },

  // Get knowledge gaps
  getKnowledgeGaps: async (email) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/knowledge-gaps?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch knowledge gaps');
      return await response.json();
    } catch (error) {
      console.error('Error fetching knowledge gaps:', error);
      return [];
    }
  },

  // Get learning priorities
  getLearningPriorities: async (email) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/learning-priorities?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch learning priorities');
      return await response.json();
    } catch (error) {
      console.error('Error fetching learning priorities:', error);
      return [];
    }
  },

  // Create learning priority
  createLearningPriority: async (email, priorityData) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/learning-priorities?email=${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillName: priorityData.skill,
          targetTeams: priorityData.targetTeams,
          targetProficiencyLevel: priorityData.targetLevel,
          priority: priorityData.priority,
        }),
      });
      if (!response.ok) throw new Error('Failed to create learning priority');
      return await response.json();
    } catch (error) {
      console.error('Error creating learning priority:', error);
      return null;
    }
  },

  // Get knowledge approvals
  getKnowledgeApprovals: async (email) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/knowledge-approvals?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch knowledge approvals');
      return await response.json();
    } catch (error) {
      console.error('Error fetching knowledge approvals:', error);
      return [];
    }
  },

  // Review knowledge approval
  reviewKnowledgeApproval: async (email, approvalId, status, notes = '') => {
    try {
      const response = await fetch(
        `${DEPARTMENT_HEAD_BASE}/knowledge-approvals/${approvalId}?email=${email}&status=${status}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        }
      );
      if (!response.ok) throw new Error('Failed to review approval');
      return await response.json();
    } catch (error) {
      console.error('Error reviewing approval:', error);
      return null;
    }
  },

  // Get team leader reports
  getTeamLeaderReports: async (email) => {
    try {
      const response = await fetch(`${DEPARTMENT_HEAD_BASE}/team-leader-reports?email=${email}`);
      if (!response.ok) throw new Error('Failed to fetch team leader reports');
      return await response.json();
    } catch (error) {
      console.error('Error fetching team leader reports:', error);
      return [];
    }
  },

  // Resolve team leader report
  resolveTeamLeaderReport: async (email, reportId, resolution = '') => {
    try {
      const response = await fetch(
        `${DEPARTMENT_HEAD_BASE}/team-leader-reports/${reportId}?email=${email}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resolution }),
        }
      );
      if (!response.ok) throw new Error('Failed to resolve report');
      return await response.json();
    } catch (error) {
      console.error('Error resolving report:', error);
      return null;
    }
  },
};
