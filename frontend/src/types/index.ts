export interface LoginDto {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  createdAt: string;
}

export interface CreateCompanyDto {
  name: string;
  cnpj?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  date?: string;
  completed: boolean;
  companyId: string;
  company?: Company;
  createdAt: string;
}

export interface CreateTaskDto {
  name: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  date?: string;
  companyId: string;
}

export interface UpdateTaskDto {
  name?: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  date?: string;
  completed?: boolean;
}

export interface Observation {
  id: string;
  content: string;
  taskId: string;
  createdAt: string;
}

export interface WeeklyData {
  company: Company;
  days: {
    [key: string]: Task[];
  };
}

