import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor: attach auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('triora_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor: handle errors & normalize responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('triora_auth_token');
      }
      const message =
        error.response.data?.error?.message ||
        (error.response.data as any)?.message ||
        'An unexpected error occurred.';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(
        new Error('Unable to connect to Triora backend server. Please check your network connection.')
      );
    } else {
      return Promise.reject(error);
    }
  }
);

export default api;
