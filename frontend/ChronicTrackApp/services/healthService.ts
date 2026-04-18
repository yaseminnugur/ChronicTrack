import { api } from './api';

export const saveBloodSugar = async (data: { glucose: string; mealState?: string; notes?: string }) => {
  const response = await api.post('/health/blood-sugar', data);
  return response.data;
};

export const saveBloodPressure = async (data: { systolic: string; diastolic: string; pulse: string; notes?: string }) => {
  const response = await api.post('/health/blood-pressure', data);
  return response.data;
};

export const getDashboardData = async (days: number = 7) => {
  const response = await api.get(`/health/dashboard?days=${days}`);
  return response.data;
};

export const getBloodSugars = async () => {
  const response = await api.get('/health/blood-sugar');
  return response.data;
};

export const getBloodPressures = async () => {
  const response = await api.get('/health/blood-pressure');
  return response.data;
};
