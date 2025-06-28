// API Configuration
export const API_CONFIG = {
  BASE_URL: '/api', // process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
};

// API Headers
export const getAuthHeaders = (token?: string) => ({
  'Content-Type': 'application/json',
  ...(token && { Authorization: `Bearer ${token}` }),
});

// API Response Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type?: string;
  expires_in?: number;
  user?: {
    id: number;
    username: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    role: string;
  };
}

export interface ApiError {
  detail: string;
  status_code?: number;
} 