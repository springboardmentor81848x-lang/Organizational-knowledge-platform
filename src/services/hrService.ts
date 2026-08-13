import API from "@/api/axios";

export const hrService = {
  getPendingEmployees: async () => {
    const response = await API.get("/hr/pending");
    return response.data; // Returns array of PendingEmployeeDTO
  },

  approveEmployee: async (employeeId: number) => {
    const response = await API.put(`/hr/approve/${employeeId}`);
    return response.data;
  },

  rejectEmployee: async (employeeId: number) => {
    const response = await API.put(`/hr/reject/${employeeId}`);
    return response.data;
  }
};