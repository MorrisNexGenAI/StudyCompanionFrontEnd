import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { departmentsAPI, coursesAPI, topicsAPI } from '../api/endpoints';
import { db } from '../db/schema';
import type { DownloadedTopic } from '../types';

// Departments
export const useDepartments = () => {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      // Try to get from IndexedDB first
      const cached = await db.departments.toArray();
      if (cached.length > 0) {
        return cached;
      }
      
      // Fetch from API and cache
      const data = await departmentsAPI.getAll();
      await db.departments.bulkPut(data);
      return data;
    },
    staleTime: Infinity, // Departments rarely change
  });
};

// Courses by department
export const useCourses = (departmentId: number | null) => {
  return useQuery({
    queryKey: ['courses', departmentId],
    queryFn: async () => {
      if (!departmentId) return [];
      
      // Try cache first
      const cached = await db.courses
        .where('departments.id')
        .equals(departmentId)
        .toArray();
      
      if (cached.length > 0) {
        return cached;
      }
      
      // Fetch and cache
      const data = await coursesAPI.getByDepartment(departmentId);
      await db.courses.bulkPut(data);
      return data;
    },
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Topics by course
export const useTopics = (courseId: number | null) => {
  return useQuery({
    queryKey: ['topics', courseId],
    queryFn: async () => {
      if (!courseId) return [];
      
      // Always fetch fresh metadata (it's small)
      const data = await topicsAPI.getByCourse(courseId);
      await db.topics.bulkPut(data);
      return data;
    },
    enabled: !!courseId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Single topic (full)
export const useTopic = (topicId: number | null) => {
  return useQuery({
    queryKey: ['topic', topicId],
    queryFn: async () => {
      if (!topicId) return null;
      
      // ALWAYS check IndexedDB first for offline copy
      const downloaded = await db.downloadedTopics.get(topicId);
      if (downloaded) {
        console.log('Loading from offline storage:', downloaded);
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
        };
      }
      
      // If not downloaded, fetch from API and auto-download
      console.log('Fetching from API:', topicId);
      const apiData = await topicsAPI.getFull(topicId);
      
      // Auto-save to IndexedDB for future offline access
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
    staleTime: Infinity, // Once loaded, don't refetch
  });
};

// Download topic mutation
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

// Delete downloaded topic
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