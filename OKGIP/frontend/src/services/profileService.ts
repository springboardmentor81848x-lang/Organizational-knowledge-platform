import API from "@/api/axios";

export interface EmployeeProfile {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  dateOfBirth: string;
  gender: string;
}

const profileService = {
  getMyProfile: async (): Promise<EmployeeProfile> => {
    const response = await API.get<EmployeeProfile>("/profile");
    return response.data;
  },

  updateMyProfile: async (
    data: Partial<EmployeeProfile>
  ): Promise<EmployeeProfile> => {
    const response = await API.put<EmployeeProfile>(
      "/profile",
      data
    );
    return response.data;
  },

  createProfile: async (
    data: Omit<EmployeeProfile, "employeeId" | "employeeCode" | "employeeName">
  ): Promise<EmployeeProfile> => {
    const response = await API.post<EmployeeProfile>(
      "/profile",
      data
    );
    return response.data;
  },
};

export default profileService;