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

  // =====================================================
  // GET LOGGED-IN EMPLOYEE PROFILE
  // =====================================================

  getMyProfile: async (): Promise<EmployeeProfile> => {

    console.log(
      "PROFILE SERVICE: Calling GET /profile"
    );

    const response =
      await API.get("/profile");

    console.log(
      "PROFILE SERVICE: STATUS:",
      response.status
    );

    console.log(
      "PROFILE SERVICE: RAW RESPONSE:",
      response.data
    );

    const raw = response.data;

    // ---------------------------------------------------
    // Backend may return the profile directly
    // OR inside a wrapper object.
    // ---------------------------------------------------

    const profile =
      raw?.data ??
      raw?.employee ??
      raw?.profile ??
      raw;

    console.log(
      "PROFILE SERVICE: NORMALIZED PROFILE:",
      profile
    );

    // ---------------------------------------------------
    // employeeId may arrive as number or string.
    // ---------------------------------------------------

    const rawEmployeeId =
      profile?.employeeId ??
      profile?.employeeID ??
      profile?.id;

    const employeeId =
      Number(rawEmployeeId);

    console.log(
      "PROFILE SERVICE: RAW EMPLOYEE ID:",
      rawEmployeeId
    );

    console.log(
      "PROFILE SERVICE: FINAL EMPLOYEE ID:",
      employeeId
    );

    if (
      !Number.isFinite(employeeId) ||
      employeeId <= 0
    ) {
      throw new Error(
        "Employee ID was not found in the profile response."
      );
    }

    return {
      ...profile,
      employeeId,
    } as EmployeeProfile;
  },

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  updateMyProfile: async (
    data: Partial<EmployeeProfile>
  ): Promise<EmployeeProfile> => {

    const response =
      await API.put<EmployeeProfile>(
        "/profile",
        data
      );

    return response.data;
  },

  // =====================================================
  // CREATE PROFILE
  // =====================================================

  createProfile: async (
    data: Omit<
      EmployeeProfile,
      | "employeeId"
      | "employeeCode"
      | "employeeName"
    >
  ): Promise<EmployeeProfile> => {

    const response =
      await API.post<EmployeeProfile>(
        "/profile",
        data
      );

    return response.data;
  },
};

export default profileService;