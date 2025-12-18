import type { Table } from 'dexie';
import Dexie from 'dexie';
import type { Department, Course, TopicMeta, DownloadedTopic } from '../types';

export class CaffphyDB extends Dexie {
  departments!: Table<Department, number>;
  courses!: Table<Course, number>;
  topics!: Table<TopicMeta, number>;
  downloadedTopics!: Table<DownloadedTopic, number>;

  constructor() {
    super('CaffphyDB');
    
    this.version(1).stores({
      departments: 'id, name',
      courses: 'id, name, *departments.id',
      topics: 'id, course_id, updated_at',
      downloadedTopics: 'id, downloaded_at, updated_at'
    });
  }
}

export const db = new CaffphyDB();

// Helper functions
export const dbHelpers = {
  // Clear all data
  async clearAll() {
    await db.departments.clear();
    await db.courses.clear();
    await db.topics.clear();
    await db.downloadedTopics.clear();
  },

  // Get downloaded topic IDs
  async getDownloadedTopicIds(): Promise<number[]> {
    const topics = await db.downloadedTopics.toArray();
    return topics.map(t => t.id);
  },

  // Check if topic is downloaded
  async isTopicDownloaded(topicId: number): Promise<boolean> {
    const topic = await db.downloadedTopics.get(topicId);
    return !!topic;
  },

  // Get storage size (approximate)
  async getStorageSize(): Promise<number> {
    const allData = await Promise.all([
      db.departments.toArray(),
      db.courses.toArray(),
      db.topics.toArray(),
      db.downloadedTopics.toArray()
    ]);
    
    const jsonStr = JSON.stringify(allData);
    return new Blob([jsonStr]).size;
  }
};
