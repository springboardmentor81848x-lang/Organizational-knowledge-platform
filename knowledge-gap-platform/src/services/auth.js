import { mockApiResponse } from './axios';
import { mockCurrentUser } from '../data/mockData';

export const authService = {
  login: async (email, password, role = 'employee') => {
    return mockApiResponse({
      user: {
        ...mockCurrentUser,
        email: email || mockCurrentUser.email,
        role: role,
      },
      token: 'jwt-enterprise-token-xyz-987654',
      expiresIn: 3600,
    });
  },
  forgotPassword: async (email) => {
    return mockApiResponse({
      success: true,
      message: `Password reset link sent to ${email}`,
    });
  },
  resetPassword: async (token, newPassword) => {
    return mockApiResponse({
      success: true,
      message: 'Your password has been reset successfully.',
    });
  },
  getCurrentUser: async () => {
    return mockApiResponse(mockCurrentUser);
  },
};
