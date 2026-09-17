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

/* ============================================================
   GET STORED JWT
   ============================================================ */

const getStoredToken = (): string | null => {
  const possibleKeys = [
    "okip_token",
    "token",
    "accessToken",
    "authToken",
    "jwt",
  ];

  for (const key of possibleKeys) {
    const token = localStorage.getItem(key);

    if (token) {
      return token;
    }
  }

  return null;
};

/* ============================================================
   DECODE JWT PAYLOAD
   ============================================================ */

const getJwtPayload = (): any | null => {
  try {
    const token = getStoredToken();

    if (!token) {
      return null;
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const base64Url = parts[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const json = atob(base64);

    return JSON.parse(json);
  } catch (error) {
    console.error(
      "PROFILE SERVICE: Unable to decode JWT:",
      error
    );

    return null;
  }
};

/* ============================================================
   FIND EMPLOYEE ID FROM JWT / LOCAL STORAGE
   ============================================================ */

const getEmployeeIdFromLocalData = (): number | null => {
  try {
    /* --------------------------------------------------------
       1. Check stored user objects
       -------------------------------------------------------- */

    const userKeys = [
      "user",
      "currentUser",
      "authUser",
      "employee",
    ];

    for (const key of userKeys) {
      const storedUser =
        localStorage.getItem(key);

      if (!storedUser) {
        continue;
      }

      try {
        const user = JSON.parse(storedUser);

        const id =
          user?.employeeId ??
          user?.employeeID ??
          user?.userId ??
          user?.user_id ??
          user?.id;

        const numericId = Number(id);

        if (
          Number.isFinite(numericId) &&
          numericId > 0
        ) {
          return numericId;
        }
      } catch {
        // Continue to JWT
      }
    }

    /* --------------------------------------------------------
       2. Check JWT payload
       -------------------------------------------------------- */

    const payload = getJwtPayload();

    if (!payload) {
      return null;
    }

    const id =
      payload?.employeeId ??
      payload?.employeeID ??
      payload?.employee_id ??
      payload?.userId ??
      payload?.user_id;

    const numericId = Number(id);

    if (
      Number.isFinite(numericId) &&
      numericId > 0
    ) {
      return numericId;
    }

    /* --------------------------------------------------------
       3. Some OKGIP JWTs use sub for email.
       If sub is numeric, use it as employee ID.
       -------------------------------------------------------- */

    const subjectId =
      Number(payload?.sub);

    if (
      Number.isFinite(subjectId) &&
      subjectId > 0
    ) {
      return subjectId;
    }

    return null;
  } catch (error) {
    console.error(
      "PROFILE SERVICE: Unable to determine employee ID:",
      error
    );

    return null;
  }
};

/* ============================================================
   PROFILE SERVICE
   ============================================================ */

const profileService = {

  /* ==========================================================
     GET LOGGED-IN USER PROFILE
     ========================================================== */

  getMyProfile:
    async (): Promise<EmployeeProfile> => {

      console.log(
        "================================="
      );

      console.log(
        "PROFILE SERVICE: GET /profile"
      );

      console.log(
        "================================="
      );

      try {

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

        const profile =
          raw?.data ??
          raw?.employee ??
          raw?.profile ??
          raw;

        const rawEmployeeId =
          profile?.employeeId ??
          profile?.employeeID ??
          profile?.id;

        const employeeId =
          Number(rawEmployeeId);

        if (
          Number.isFinite(employeeId) &&
          employeeId > 0
        ) {

          console.log(
            "PROFILE SERVICE: EMPLOYEE ID:",
            employeeId
          );

          return {
            ...profile,
            employeeId,
          } as EmployeeProfile;
        }

        throw new Error(
          "Employee ID was not found in profile response."
        );

      } catch (error: any) {

        const status =
          error?.response?.status;

        const message =
          error?.response?.data?.message;

        console.error(
          "PROFILE SERVICE: PROFILE REQUEST FAILED:",
          status,
          message || error?.message
        );

        /* ====================================================
           MANAGER FALLBACK
           
           If backend says Profile not found, do NOT break
           the complete frontend authentication state.

           Try to obtain employee ID from JWT/local storage.
           ==================================================== */

        if (
          status === 404 &&
          message === "Profile not found."
        ) {

          console.warn(
            "PROFILE SERVICE: Backend profile not found."
          );

          const employeeId =
            getEmployeeIdFromLocalData();

          if (
            employeeId !== null &&
            employeeId > 0
          ) {

            const payload =
              getJwtPayload();

            const email =
              payload?.sub ?? "";

            const role =
              payload?.role ?? "";

            console.warn(
              "PROFILE SERVICE: Using JWT fallback for employee ID:",
              employeeId
            );

            return {
              employeeId,
              employeeCode: "",
              employeeName: "",
              phoneNumber: "",
              address: "",
              city: "",
              state: "",
              country: "",
              pincode: "",
              dateOfBirth: "",
              gender: "",
            };
          }
        }

        throw error;
      }
    },

  /* ==========================================================
     UPDATE PROFILE
     ========================================================== */

  updateMyProfile:
    async (
      data: Partial<EmployeeProfile>
    ): Promise<EmployeeProfile> => {

      // Send only fields accepted by EmployeeProfileRequestDTO.
      // Do NOT send employeeId/employeeCode/employeeName back to
      // the profile endpoint because those belong to the Employee
      // table and are read-only here.
      const payload = {
        phoneNumber: data.phoneNumber ?? "",
        address: data.address ?? "",
        city: data.city ?? "",
        state: data.state ?? "",
        country: data.country ?? "",
        pincode: data.pincode ?? "",
        dateOfBirth: data.dateOfBirth || null,
        gender: data.gender ?? "",
      };

      const response =
        await API.put<EmployeeProfile>(
          "/profile",
          payload
        );

      return response.data;
    },

  /* ==========================================================
     CREATE PROFILE
     ========================================================== */

  createProfile:
    async (
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