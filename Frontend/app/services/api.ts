import { Platform } from 'react-native';
import axios, { AxiosError, AxiosInstance } from 'axios';

// Force HTTP for all environments during local development
const API_BASE_URL = 'http://localhost:7000';

console.log('API_BASE_URL:', API_BASE_URL);
console.log('Platform:', Platform.OS);

class ApiService {
  private static instance: ApiService;
  private token: string | null = null;
  private axiosInstance: AxiosInstance;

  private constructor() {
    console.log('Initializing ApiService');
    // Initialize token from sessionStorage for web
    if (Platform.OS === 'web') {
      this.token = sessionStorage.getItem('token');
      console.log('Web environment detected, token from sessionStorage:', this.token);
    }

    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Add request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        console.log('Request config:', config);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('Response:', response);
        return response;
      },
      (error: AxiosError) => {
        console.error('Response error:', error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  setToken(token: string) {
    console.log('Setting token:', token);
    this.token = token;
    if (Platform.OS === 'web') {
      sessionStorage.setItem('token', token);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    console.log(`Making GET request to ${endpoint}`);
    try {
      const response = await this.axiosInstance.get<T>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error in GET ${endpoint}:`, error);
      throw error;
    }
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    console.log(`Making POST request to ${endpoint}`);
    console.log('Request data:', data);
    try {
      const response = await this.axiosInstance.post<T>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error in POST ${endpoint}:`, error);
      throw error;
    }
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    console.log(`Making PUT request to ${endpoint}`);
    try {
      const response = await this.axiosInstance.put<T>(endpoint, data);
      return response.data;
    } catch (error) {
      console.error(`Error in PUT ${endpoint}:`, error);
      throw error;
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    console.log(`Making DELETE request to ${endpoint}`);
    try {
      const response = await this.axiosInstance.delete<T>(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error in DELETE ${endpoint}:`, error);
      throw error;
    }
  }
}

export const apiService = ApiService.getInstance(); 