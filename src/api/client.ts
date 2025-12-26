import axios from 'axios';
import { dbHelpers } from '../db/schema';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - ADD PREMIUM USER ID TO HEADERS
apiClient.interceptors.request.use(
  async (config) => {
    // Get premium profile from IndexedDB
    const profile = await dbHelpers.getPremiumProfile();
    
    if (profile) {
      // Add user_id to headers for premium access filtering
      config.headers['X-User-ID'] = profile.user_id.toString();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (for error handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);