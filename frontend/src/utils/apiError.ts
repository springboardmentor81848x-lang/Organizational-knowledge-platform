import axios from "axios";

type ErrorBody = {
  message?: unknown;
  error?: unknown;
  detail?: unknown;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const body = error.response?.data as ErrorBody | undefined;
  const message = body?.message ?? body?.error ?? body?.detail;

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error.response?.status === 401) {
    return "Your email or password is incorrect, or your account has not been approved yet.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (!error.response) {
    return "We could not reach the OKIP server. Check that the backend is running and try again.";
  }

  return fallback;
};
