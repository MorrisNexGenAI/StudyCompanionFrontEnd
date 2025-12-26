import type { Table } from 'dexie';
import Dexie from 'dexie';
import type { Department, Course, TopicMeta, DownloadedTopic, PremiumProfile } from '../types';

export class CaffphyDB extends Dexie {
  departments!: Table<Department, number>;
  courses!: Table<Course, number>;
  topics!: Table<TopicMeta, number>;
  downloadedTopics!: Table<DownloadedTopic, number>;
  premiumProfile!: Table<PremiumProfile, number>; // NEW TABLE

  constructor() {
    super('CaffphyDB');
    
    // Version 2 - Add premium profile table
    this.version(2).stores({
      departments: 'id, name',
      courses: 'id, name, *departments.id',
      topics: 'id, course_id, updated_at',
      downloadedTopics: 'id, downloaded_at, updated_at',
      premiumProfile: 'user_id, registered_at', // NEW
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
    await db.premiumProfile.clear();
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

  // Premium Profile Management
  async getPremiumProfile(): Promise<PremiumProfile | undefined> {
    const profiles = await db.premiumProfile.toArray();
    return profiles[0]; // Should only be one profile
  },

  async savePremiumProfile(profile: PremiumProfile): Promise<void> {
    await db.premiumProfile.clear(); // Clear old profiles first
    await db.premiumProfile.add(profile);
  },

  async clearPremiumProfile(): Promise<void> {
    await db.premiumProfile.clear();
  },

  async hasPremiumProfile(): Promise<boolean> {
    const count = await db.premiumProfile.count();
    return count > 0;
  },

  // Get storage size (approximate)
  async getStorageSize(): Promise<number> {
    const allData = await Promise.all([
      db.departments.toArray(),
      db.courses.toArray(),
      db.topics.toArray(),
      db.downloadedTopics.toArray(),
      db.premiumProfile.toArray(),
    ]);
    
    const jsonStr = JSON.stringify(allData);
    return new Blob([jsonStr]).size;
  }
};