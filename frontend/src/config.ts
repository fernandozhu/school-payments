const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const API_ENDPOINTS = {
  fieldTrips: `${API_BASE_URL}/api/fieldtrip`,
  payment: `${API_BASE_URL}/api/payment`,
} as const;
