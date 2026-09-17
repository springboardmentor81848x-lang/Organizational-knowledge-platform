import api from "@/api/axios";

export interface TrainingProgress {
  employeeTrainingId: number;
  trainingId: number;
  trainingName: string;
  provider?: string;
  duration?: string;
  courseUrl?: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  progressPercentage: number;
  hoursSpent: number;
  enrolledAt?: string;
  startedAt?: string;
  lastActivityAt?: string;
  completedAt?: string;
}

export interface TrainingResource {
  resourceId: number;
  title: string;
  resourceType: "VIDEO" | "PDF" | "ARTICLE" | "PRACTICE" | "LINK" | string;
  resourceUrl: string;
  description?: string;
  resourceOrder: number;
}

export interface TrainingModule {
  moduleId: number;
  trainingId: number;
  moduleTitle: string;
  description?: string;
  moduleOrder: number;
  estimatedMinutes?: number;
  completed: boolean;
  completedAt?: string;
  resources: TrainingResource[];
}

const trainingProgressService = {
  getMyProgress: async (): Promise<TrainingProgress[]> => {
    const response = await api.get<TrainingProgress[]>("/employee/trainings/progress");
    return Array.isArray(response.data) ? response.data : [];
  },
  start: async (trainingId: number): Promise<TrainingProgress> => {
    const response = await api.post<TrainingProgress>(`/employee/trainings/${trainingId}/start`);
    return response.data;
  },
  heartbeat: async (trainingId: number): Promise<TrainingProgress> => {
    const response = await api.post<TrainingProgress>(`/employee/trainings/${trainingId}/heartbeat`);
    return response.data;
  },
  getContent: async (trainingId: number): Promise<TrainingModule[]> => {
    const response = await api.get<TrainingModule[]>(`/employee/trainings/${trainingId}/content`);
    return Array.isArray(response.data) ? response.data : [];
  },
  completeModule: async (trainingId: number, moduleId: number): Promise<TrainingProgress> => {
    const response = await api.post<TrainingProgress>(`/employee/trainings/${trainingId}/modules/${moduleId}/complete`);
    return response.data;
  },
};

export default trainingProgressService;
