import api from "@/api/axios";
export interface NotificationResponse {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const notificationService = {
  async getMyNotifications(): Promise<NotificationResponse[]> {
    const response = await api.get("/notifications");
    return response.data;
  },

  async markAsRead(notificationId: number): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all");
  },

  async registerFid(fid: string): Promise<void> {
    await api.post("/notifications/devices", {
      fid,
    });
  },
};

export default notificationService;