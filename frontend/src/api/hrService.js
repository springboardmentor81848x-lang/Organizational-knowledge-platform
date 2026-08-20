import api from './axiosConfig';

const hrService = {
  getPendingEmployees: async () => {
    try {
      const response = await api.get('/hr/pending');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Failed to fetch' };
    }
  },

  approveEmployee: async (employeeId) => {
    try {
      const response = await api.put(`/hr/approve/${employeeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Approval failed' };
    }
  },

  rejectEmployee: async (employeeId) => {
    try {
      const response = await api.put(`/hr/reject/${employeeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Rejection failed' };
    }
  },
};

export default hrService;