import api from './api';

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type Priority = (typeof Priority)[keyof typeof Priority];

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: Priority;
  date: string | null;
  completed: boolean;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
  observations?: Observation[];
  createdAt: string;
}

export interface Observation {
  id: string;
  content: string;
  taskId: string;
  createdAt: string;
}

export interface CreateTaskDto {
  name: string;
  description: string;
  priority?: Priority;
  date?: string;
  companyId: string;
}

export interface WeeklyViewData {
  startDate: string;
  endDate: string;
  data: {
    company: {
      id: string;
      name: string;
      cnpj?: string;
    };
    tasks: {
      monday: Task[];
      tuesday: Task[];
      wednesday: Task[];
      thursday: Task[];
      friday: Task[];
      saturday: Task[];
      sunday: Task[];
      backlog: Task[];
    };
  }[];
}

export interface TaskFilters {
  companyId?: string;
  priority?: Priority;
  completed?: boolean;
  date?: string;
}

export const tasksService = {
  getAll: async (filters?: TaskFilters): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters?.companyId) params.append('companyId', filters.companyId);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    if (filters?.date) params.append('date', filters.date);

    const response = await api.get<Task[]>(`/tasks?${params.toString()}`);
    return response.data;
  },

  getWeekly: async (startDate?: string): Promise<WeeklyViewData> => {
    const params = startDate ? `?startDate=${startDate}` : '';
    const response = await api.get<WeeklyViewData>(`/tasks/weekly${params}`);
    return response.data;
  },

  getById: async (id: string): Promise<Task> => {
    const response = await api.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskDto): Promise<Task> => {
    const response = await api.post<Task>('/tasks', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTaskDto> & { completed?: boolean }): Promise<Task> => {
    const response = await api.patch<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },
};

export const observationsService = {
  getAll: async (taskId: string): Promise<Observation[]> => {
    const response = await api.get<Observation[]>(`/tasks/${taskId}/observations`);
    return response.data;
  },

  create: async (taskId: string, content: string): Promise<Observation> => {
    const response = await api.post<Observation>(`/tasks/${taskId}/observations`, { content });
    return response.data;
  },

  delete: async (taskId: string, id: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}/observations/${id}`);
  },
};

