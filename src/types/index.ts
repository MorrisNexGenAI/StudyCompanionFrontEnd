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

// Topic (metadata only)
export interface TopicMeta {
  id: number;
  title: string;
  page_range: string;
  updated_at: number; // Unix timestamp
  is_refined: boolean;
}

// Topic (full with content)
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

// Sync status
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
