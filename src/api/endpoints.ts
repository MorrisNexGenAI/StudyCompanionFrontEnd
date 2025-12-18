import { apiClient } from './client';
import type { Department, Course, TopicMeta, TopicFull } from '../types';

// Departments
export const departmentsAPI = {
  getAll: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>('/api/departments/');
    return data;
  },
};

// Courses
export const coursesAPI = {
  getByDepartment: async (deptId: number): Promise<Course[]> => {
    const { data } = await apiClient.get<Course[]>(`/api/departments/${deptId}/courses/`);
    return data;
  },
};

// Topics
export const topicsAPI = {
  getByCourse: async (courseId: number): Promise<TopicMeta[]> => {
    const { data } = await apiClient.get<TopicMeta[]>(`/api/courses/${courseId}/topics/`);
    return data;
  },

  getFull: async (topicId: number): Promise<TopicFull> => {
    const { data } = await apiClient.get<TopicFull>(`/api/topics/${topicId}/`);
    return data;
  },
};
