import { api } from './api';

export const saveStep1Profile = async (data: {
  weight: string;
  height: string;
  age: string;
  isSmoking: boolean;
  activityLevel: string;
  saltLevel: string;
}) => {
  const response = await api.put('/onboarding/step1', data);
  return response.data;
};

export const completeOnboardingWithConditions = async (chronicConditions: string[]) => {
  const response = await api.put('/onboarding/step2', {
    chronicConditions
  });
  return response.data;
};
