import API from "@/api/axios";

/**
 * These values are the role names accepted by the Milestone 1 backend.  Keep
 * the API values here (rather than the display labels used by the UI) so a
 * role can never be accidentally sent in the wrong format.
 */
export const ADMIN_USER_ROLES = [
  "ROLE_ADMIN",
  "ROLE_HR",
  "ROLE_MANAGER",
  "ROLE_EMPLOYEE",

  
] as const;

export type AdminUserRole = (typeof ADMIN_USER_ROLES)[number];

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  officialEmail: string;
  password: string;
  departmentId: number;
  role: AdminUserRole;
}

export interface CreateUserResponse {
  employeeId?: number;
  employeeCode?: string;
  message?: string;
}
export interface AdminNotification {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Creates an immediately-approved organization account.
 *
 * `api` supplies the `/api` prefix and attaches the stored JWT bearer token,
 * which makes this request compatible with the protected admin endpoint.
 */
export const createUser = async (
  payload: CreateUserRequest
): Promise<CreateUserResponse> => {
  const response = await API.post<CreateUserResponse>("/admin/users", payload);

  return response.data;
};
export const getAdminNotifications = async (): Promise<AdminNotification[]> => {
  const response = await API.get<AdminNotification[]>("/admin/notifications");
  return response.data;
};

const adminService = {
  createUser,
  getAdminNotifications,
};
export default adminService;
