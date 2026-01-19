import axios from 'axios';
import { dbHelpers } from '../db/schema';

// UPDATED: Local server configuration
const LOCAL_SERVER_URLS = [
  'http://192.168.43.1:8080',  // Default Android hotspot
  'http://192.168.137.1:8080', // Windows hotspot
  'http://172.20.10.1:8080',   // iPhone hotspot
];

const DJANGO_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Detect which server is available
let currentBaseURL = DJANGO_API_URL;
let localServerAvailable = false;

// Check if local admin server is available
async function checkLocalServer(): Promise<string | null> {
  for (const url of LOCAL_SERVER_URLS) {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.admin_pwa === true) {
          console.log('✅ Local Admin PWA detected:', url);
          return url;
        }
      }
    } catch (e) {
      // Server not available, try next
    }
  }
  return null;
}

// Initialize with local server check
(async () => {
  const localURL = await checkLocalServer();
  if (localURL) {
    currentBaseURL = localURL;
    localServerAvailable = true;
    console.log('📱 Using local Admin PWA:', currentBaseURL);
  } else {
    console.log('🌐 Using Django backend:', currentBaseURL);
  }
})();

export const apiClient = axios.create({
  baseURL: currentBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: localServerAvailable ? 5000 : 15000, // Faster timeout for local
});

// Request interceptor - Add user_id
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

// Response interceptor - Fallback to Django if local fails
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If local server failed and we haven't retried
    if (localServerAvailable && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.log('⚠️ Local server failed, falling back to Django...');
      
      // Switch to Django backend
      currentBaseURL = DJANGO_API_URL;
      localServerAvailable = false;
      apiClient.defaults.baseURL = DJANGO_API_URL;
      apiClient.defaults.timeout = 15000;
      
      // Retry request with Django
      return apiClient(originalRequest);
    }
    
    return Promise.reject(error);
  }
);

// Export helper to manually refresh server detection
export async function refreshServerDetection() {
  const localURL = await checkLocalServer();
  
  if (localURL) {
    currentBaseURL = localURL;
    localServerAvailable = true;
    apiClient.defaults.baseURL = localURL;
    apiClient.defaults.timeout = 5000;
    console.log('📱 Switched to local Admin PWA:', currentBaseURL);
    return { mode: 'local', url: localURL };
  } else {
    currentBaseURL = DJANGO_API_URL;
    localServerAvailable = false;
    apiClient.defaults.baseURL = DJANGO_API_URL;
    apiClient.defaults.timeout = 15000;
    console.log('🌐 Using Django backend:', currentBaseURL);
    return { mode: 'online', url: DJANGO_API_URL };
  }
}

// Export current connection status
export function getConnectionStatus() {
  return {
    mode: localServerAvailable ? 'local' : 'online',
    baseURL: currentBaseURL,
    isLocal: localServerAvailable,
  };
}

export default apiClient;