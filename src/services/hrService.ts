import api from "./api";

/** A registration that is waiting for an HR decision. */
export interface PendingEmployee {
  employeeId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  officialEmail: string;
}

/** Returned after HR approves or rejects a registration. */
export interface EmployeeApprovalResponse {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  status: string;
  message: string;
}

/** Fetch the registrations which still require an HR decision. */
export const getPendingEmployees = async (): Promise<PendingEmployee[]> => {
  const response = await api.get<PendingEmployee[]>("/hr/pending");

  return response.data;
};

/** Approve a pending employee. The endpoint intentionally takes no request body. */
export const approveEmployee = async (
  employeeId: number
): Promise<EmployeeApprovalResponse> => {
  const response = await api.put<EmployeeApprovalResponse>(
    `/hr/approve/${employeeId}`
  );

  return response.data;
};

/** Reject a pending employee. The endpoint intentionally takes no request body. */
export const rejectEmployee = async (
  employeeId: number
): Promise<EmployeeApprovalResponse> => {
  const response = await api.put<EmployeeApprovalResponse>(
    `/hr/reject/${employeeId}`
  );

  return response.data;
};
