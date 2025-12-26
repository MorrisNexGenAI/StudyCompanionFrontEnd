// Department
export interface Department {
  id: number;
  name: string;
}

// Course
export interface Course {
  id: number;
  name: string;
  year: string;
  departments: Department[];
  topic_count: number;
  refined_count: number;
}


// Downloaded topic (stored locally)
export interface DownloadedTopic {
  id: number; // Same as server topic_id
  title: string;
  page_range: string;
  refined_summary: string;
  course_name: string;
  departments: string; // CSV string
  downloaded_at: number;
  updated_at: number; // Server's updated_at
}

// App state
export interface AppState {
  selectedDepartmentId: number | null;
  setSelectedDepartment: (id: number) => void;
  clearSelectedDepartment: () => void;
}

export interface PremiumProfile {
  user_id: number;
  name: string;
  code: string;
  registered_at: number; // Unix timestamp
}

// API Response for registration/login
export interface PremiumAuthResponse {
  user_id: number;
  name: string;
  code: string;
  is_new: boolean;
  message: string;
}

// Update TopicMeta to include is_premium
export interface TopicMeta {
  id: number;
  title: string;
  page_range: string;
  updated_at: number;
  is_refined: boolean;
  is_premium: boolean; // ADD THIS
}

// Update TopicFull to include is_premium
export interface TopicFull {
  id: number;
  title: string;
  page_range: string;
  refined_summary: string;
  raw_text: string;
  course_name: string;
  course_year: string;
  departments: string[];
  updated_at: number;
  created_at: number;
  is_premium: boolean; // ADD THIS
}

// Sync status
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
