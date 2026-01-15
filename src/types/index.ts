// ==================== UPDATED TYPES: src/types/index.ts ====================

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


// Topic Metadata
export interface TopicMeta {
  id: number;
  title: string;
  page_range: string;
  updated_at: number;
  is_refined: boolean;
  is_premium: boolean;
}

// Full Topic
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
  is_premium: boolean;
}

// Downloaded topic (stored locally)
export interface DownloadedTopic {
  id: number;
  title: string;
  page_range: string;
  refined_summary: string;
  course_name: string;
  departments: string;
  downloaded_at: number;
  updated_at: number;
}

// UPDATED: Premium Profile with department info
export interface PremiumProfile {
  user_id: number;
  name: string;
  code: string;
  department_id: number;      // NEW
  department_name: string;    // NEW
  registered_at: number;
}

// UPDATED: API Response for registration/login
export interface PremiumAuthResponse {
  user_id: number;
  name: string;
  code: string;
  department_id: number;      // NEW
  department_name: string;    // NEW
  is_new: boolean;
}

// NEW: Courses API Response with year filtering
export interface CoursesResponse {
  courses: Course[];
  available_years: string[];
  current_year: string | null;
  department: {
    id: number;
    name: string;
  };
}

// App state
export interface AppState {
  selectedDepartmentId: number | null;
  selectedYear: string | null;              // NEW
  setSelectedDepartment: (id: number) => void;
  setSelectedYear: (year: string) => void;  // NEW
  clearSelectedDepartment: () => void;
}

// Study content types
export interface QuestionUnit {
  id: string;
  question: string;
  answer: string;
  explanation?: string;
  example?: string;
  isTable: boolean;
}

export interface StudyChunk {
  chunkNumber: number;
  questions: QuestionUnit[];
  startIndex: number;
  endIndex: number;
}

export interface ParsedContent {
  totalQuestions: number;
  chunks: StudyChunk[];
  rawText: string;
}

// Sync status
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

