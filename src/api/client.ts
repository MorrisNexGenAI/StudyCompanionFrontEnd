import axios from 'axios';
import { dbHelpers } from '../db/schema';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// CRITICAL: Add user_id to ALL requests
apiClient.interceptors.request.use(async (config) => {
  try {
    // Get premium profile from IndexedDB
    const profile = await dbHelpers.getPremiumProfile();
    
    if (profile?.user_id) {
      // Add user_id as query param for GET requests
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          user_id: profile.user_id,
        };
      }
      
      // Add user_id as header for all requests
      config.headers['X-User-ID'] = profile.user_id.toString();
    }
  } catch (error) {
    console.error('Failed to get premium profile:', error);
  }
  
  return config;
});

export default apiClient;