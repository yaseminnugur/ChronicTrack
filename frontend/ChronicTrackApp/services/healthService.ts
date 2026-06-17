import { api } from './api';

export const saveBloodSugar = async (data: { glucose: string; mealState?: string; notes?: string; measuredAt?: string }) => {
  const response = await api.post('/health/blood-sugar', data);
  return response.data;
};

export const saveBloodPressure = async (data: { systolic: string; diastolic: string; pulse: string; notes?: string; measuredAt?: string }) => {
  const response = await api.post('/health/blood-pressure', data);
  return response.data;
};

export const getDashboardData = async (days: number = 7) => {
  const response = await api.get(`/health/dashboard?days=${days}`);
  return response.data;
};

export const getBloodSugars = async (filters?: { startDate?: string; endDate?: string }) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/health/blood-sugar${query}`);
  return response.data;
};

export const getBloodPressures = async (filters?: { startDate?: string; endDate?: string }) => {
  const params = new URLSearchParams();
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/health/blood-pressure${query}`);
  return response.data;
};
