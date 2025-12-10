import api from './api';

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

export const companiesService = {
  getAll: async (): Promise<Company[]> => {
    const response = await api.get<Company[]>('/companies');
    return response.data;
  },

  getById: async (id: string): Promise<Company> => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  create: async (data: CreateCompanyDto): Promise<Company> => {
    const response = await api.post<Company>('/companies', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCompanyDto>): Promise<Company> => {
    const response = await api.patch<Company>(`/companies/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },
};

