
// ==================== UPDATED HOOKS: src/hooks/useDepartments.ts ====================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsAPI, coursesAPI, topicsAPI } from '../api/endpoints';
import { db} from '../db/schema';
import type { DownloadedTopic } from '../types';

// Get all departments (for registration)
export const useAllDepartments = () => {
  return useQuery({
    queryKey: ['all-departments'],
    queryFn: async () => {
      return await departmentsAPI.getAll();
    },
    staleTime: Infinity,
  });
};

// NEW: Get user's specific department
export const useUserDepartment = (userId: number | null) => {
  return useQuery({
    queryKey: ['user-department', userId],
    queryFn: async () => {
      if (!userId) return null;
      return await departmentsAPI.getUserDepartment(userId);
    },
    enabled: !!userId,
    staleTime: Infinity,
  });
};

// NEW: Get available years for department
export const useAvailableYears = (departmentId: number | null) => {
  return useQuery({
    queryKey: ['available-years', departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      return await departmentsAPI.getAvailableYears(departmentId);
    },
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
};

// UPDATED: Courses by department with year filter
export const useCourses = (departmentId: number | null, year: string | null) => {
  return useQuery({
    queryKey: ['courses', departmentId, year],
    queryFn: async () => {
      if (!departmentId) return null;
      
      // Fetch from API with year filter
      const data = await coursesAPI.getByDepartmentAndYear(departmentId, year || undefined);
      
      // Cache courses
      if (data.courses.length > 0) {
        await db.courses.bulkPut(data.courses);
      }
      
      return data;
    },
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
};

// Topics by course (unchanged)
export const useTopics = (courseId: number | null) => {
  return useQuery({
    queryKey: ['topics', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      const data = await topicsAPI.getByCourse(courseId);
      await db.topics.bulkPut(data);
      return data;
    },
    enabled: !!courseId,
    staleTime: 1 * 60 * 1000,
  });
};

// Single topic (unchanged)
export const useTopic = (topicId: number | null) => {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      if (!topicId) return null;
      
      // Check IndexedDB first
      const downloaded = await db.downloadedTopics.get(topicId);
      if (downloaded) {
        return {
          id: downloaded.id,
          title: downloaded.title,
          page_range: downloaded.page_range,
          refined_summary: downloaded.refined_summary,
          raw_text: '',
          course_name: downloaded.course_name,
          course_year: '',
          departments: downloaded.departments.split(', ').filter(d => d.trim()),
          updated_at: downloaded.updated_at,
          created_at: downloaded.downloaded_at,
          is_premium: false,
        };
      }
      
      // Fetch from API and auto-save
      const apiData = await topicsAPI.getFull(topicId);
      
      const toSave = {
        id: apiData.id,
        title: apiData.title,
        page_range: apiData.page_range,
        refined_summary: apiData.refined_summary,
        course_name: apiData.course_name,
        departments: apiData.departments.join(', '),
        downloaded_at: Date.now(),
        updated_at: apiData.updated_at,
      };
      await db.downloadedTopics.put(toSave);
      
      return apiData;
    },
    enabled: !!topicId,
    staleTime: Infinity,
  });
};

// Download topic mutation (unchanged)
export const useDownloadTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (topicId: number) => {
      const topicData = await topicsAPI.getFull(topicId);
      
      const downloaded: DownloadedTopic = {
        id: topicData.id,
        title: topicData.title,
        page_range: topicData.page_range,
        refined_summary: topicData.refined_summary,
        course_name: topicData.course_name,
        departments: topicData.departments.join(', '),
        downloaded_at: Date.now(),
        updated_at: topicData.updated_at,
      };
      
      await db.downloadedTopics.put(downloaded);
      return downloaded;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};

// Delete downloaded topic (unchanged)
export const useDeleteDownloadedTopic = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (topicId: number) => {
      await db.downloadedTopics.delete(topicId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topics'] });
    },
  });
};
