
// ==================== UPDATED API ENDPOINTS: src/api/endpoints.ts ====================

import { apiClient } from './client';
import type { Department, TopicMeta, TopicFull, CoursesResponse } from '../types';

// Departments
export const departmentsAPI = {
  // Get all departments (for registration)
  getAll: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<{ departments: Department[] }>('/premium/api/departments/');
    return data.departments;
  },

  // NEW: Get user's specific department
  getUserDepartment: async (userId: number): Promise<{ user: any; department: Department }> => {
    const { data } = await apiClient.get(`/premium/api/users/${userId}/department/`);
    return data;
  },

  // NEW: Get available years for department
  getAvailableYears: async (deptId: number): Promise<string[]> => {
    const { data } = await apiClient.get<{ years: string[] }>(`/premium/api/departments/${deptId}/years/`);
    return data.years;
  },
};

// Courses
export const coursesAPI = {
  // UPDATED: Get courses by department with optional year filter
  getByDepartmentAndYear: async (deptId: number, year?: string): Promise<CoursesResponse> => {
    const params = year ? { year } : {};
    // user_id is automatically added by interceptor
    const { data } = await apiClient.get<CoursesResponse>(
      `/premium/api/departments/${deptId}/courses/`,
      { params }
    );
    return data;
  },
};

// Topics
export const topicsAPI = {
  getByCourse: async (courseId: number): Promise<TopicMeta[]> => {
    // user_id is automatically added by interceptor
    const { data } = await apiClient.get<{ topics: TopicMeta[] }>(
      `/premium/api/courses/${courseId}/topics/`
    );
    return data.topics;
  },

  getFull: async (topicId: number): Promise<TopicFull> => {
    // user_id is automatically added by interceptor
    const { data } = await apiClient.get<TopicFull>(`/premium/api/topics/${topicId}/`);
    return data;
  },
};

