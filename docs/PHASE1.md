# Phase 1: React PWA Development

## Overview
Built a Progressive Web App (PWA) from scratch with offline-first architecture, allowing students to download and access study notes without internet connection.

---

## Part A: Project Setup

### 1. Technology Stack Selection

**Build Tool:** Vite (chosen for speed)
```bash
npm create vite@latest cafphy-pwa -- --template react-ts
```

**Core Libraries:**
- **React 18** - UI library
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Dexie.js** - IndexedDB wrapper
- **Axios** - HTTP client
- **vite-plugin-pwa** - PWA capabilities

### 2. Project Structure

```
cafphy-pwa/
├── src/
│   ├── api/              # API client & endpoints
│   │   └── client.ts     # Axios instance with base URL
│   │
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx    # App shell with navigation
│   │   ├── TopicCard.tsx # Topic list item
│   │   └── LoadingState.tsx
│   │
│   ├── pages/            # Route pages
│   │   ├── DepartmentsPage.tsx
│   │   ├── CoursesPage.tsx
│   │   ├── TopicsPage.tsx
│   │   ├── TopicDetailPage.tsx
│   │   └── DownloadsPage.tsx
│   │
│   ├── db/               # IndexedDB schema
│   │   └── schema.ts     # Dexie database definition
│   │
│   ├── hooks/            # Custom React hooks
│   │   ├── useTopics.ts  # TanStack Query hooks
│   │   └── useOffline.ts # Offline detection
│   │
│   ├── stores/           # Zustand stores
│   │   └── downloadStore.ts
│   │
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts
│   │
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── theme.ts          # MUI theme
│
├── public/               # Static assets
│   ├── manifest.json     # PWA manifest
│   ├── icons/            # App icons (192x192, 512x512)
│   └── sw.js             # Service worker (auto-generated)
│
├── vite.config.ts        # Vite + PWA config
├── tsconfig.json         # TypeScript config
└── package.json          # Dependencies
```

---

## Part B: Core Features Implementation

### 1. API Integration

**API Client Setup**
```typescript
// src/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Endpoints Implemented:**
- `GET /api/departments/` - List departments
- `GET /api/departments/:id/courses/` - Courses in department
- `GET /api/courses/:id/topics/` - Topics metadata
- `GET /api/topics/:id/` - Full topic with content

### 2. Data Layer (IndexedDB)

**Database Schema (Dexie.js)**
```typescript
// src/db/schema.ts
import Dexie, { Table } from 'dexie';

export interface DownloadedTopic {
  id: number;
  title: string;
  content: string;
  courseName: string;
  departments: string[];
  pageRange: string;
  downloadedAt: number;
  updatedAt: number;
}

class CaffphyDB extends Dexie {
  topics!: Table<DownloadedTopic, number>;

  constructor() {
    super('CaffphyDB');
    this.version(1).stores({
      topics: 'id, title, courseName, downloadedAt'
    });
  }
}

export const db = new CaffphyDB();
```

**Why IndexedDB?**
- Can store large amounts of data (MBs)
- Persistent across sessions
- Works offline
- Fast querying with indexes

### 3. State Management

**Server State (TanStack Query)**
```typescript
// src/hooks/useTopics.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export const useTopics = (courseId: number) => {
  return useQuery({
    queryKey: ['topics', courseId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/courses/${courseId}/topics/`);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};
```

**Client State (Zustand)**
```typescript
// src/stores/downloadStore.ts
import { create } from 'zustand';

interface DownloadStore {
  downloadedIds: Set<number>;
  addDownload: (id: number) => void;
  removeDownload: (id: number) => void;
  hasDownload: (id: number) => boolean;
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  downloadedIds: new Set(),
  
  addDownload: (id) => set((state) => ({
    downloadedIds: new Set(state.downloadedIds).add(id)
  })),
  
  removeDownload: (id) => {
    const newSet = new Set(get().downloadedIds);
    newSet.delete(id);
    set({ downloadedIds: newSet });
  },
  
  hasDownload: (id) => get().downloadedIds.has(id),
}));
```

### 4. Offline-First Architecture

**Download Flow:**
```
1. User clicks download icon
2. Fetch full topic from API: GET /api/topics/:id/
3. Save to IndexedDB: db.topics.add({...})
4. Update Zustand store: addDownload(id)
5. Show success toast
```

**Offline Access Flow:**
```
1. User navigates to topic detail
2. Check if online:
   - If online: Fetch from API (normal flow)
   - If offline: Query IndexedDB: db.topics.get(id)
3. Display content
```

**Offline Detection:**
```typescript
// src/hooks/useOffline.ts
import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
};
```

---

## Part C: Progressive Web App Features

### 1. PWA Configuration

**Vite PWA Plugin**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Cafphy Study Notes',
        short_name: 'Cafphy',
        description: 'Offline-first study notes app',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ]
});
```

### 2. Web App Manifest

```json
{
  "name": "Cafphy Study Notes",
  "short_name": "Cafphy",
  "description": "Access your study notes offline",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 3. Service Worker Strategy

**Network First (for API calls):**
- Try network request first
- If fails, serve from cache
- Update cache with successful responses

**Cache First (for static assets):**
- Serve from cache immediately
- Update cache in background
- Fast loading, always available offline

---

## Part D: Key Pages Implementation

### 1. Departments Page
- Lists all departments
- Material-UI Cards with icons
- Click → Navigate to courses

### 2. Courses Page
- Shows courses in selected department
- Displays topic count & refined count
- Year badge
- Click → Navigate to topics

### 3. Topics Page
- Lists all topics in course
- Shows page range
- Download icon (cloud/check)
- Status badges (refined/raw)
- Click → View full topic

### 4. Topic Detail Page
- Shows refined summary OR raw text
- Share button (Web Share API)
- Copy to clipboard button
- Delete download button
- Formatted with proper spacing

### 5. My Downloads Page
- Lists all downloaded topics
- Sorted by download date (newest first)
- Course name & department badges
- Delete individual downloads
- Works 100% offline

---

## Part E: User Experience Features

### 1. Share Functionality

**Web Share API** (native mobile sharing)
```typescript
const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: topic.title,
        text: topic.refined_summary,
      });
    } catch (err) {
      // User cancelled, ignore
    }
  }
};
```

**Clipboard Fallback**
```typescript
const handleCopy = async () => {
  await navigator.clipboard.writeText(topic.refined_summary);
  showToast('Copied to clipboard!');
};
```

### 2. Loading States
- Skeleton loaders during fetch
- Spinner for long operations
- Empty states with helpful messages

### 3. Error Handling
- Network errors caught and displayed
- Retry buttons on failed requests
- Offline mode gracefully handled

### 4. Responsive Design
- Mobile-first approach
- Touch-friendly buttons (48px minimum)
- Readable font sizes (16px minimum)
- Proper spacing for thumbs

---

## Part F: Performance Optimizations

### 1. Data Fetching Strategy
```
Departments → Courses → Topics → Topic Detail
     ↓            ↓         ↓          ↓
  Cache 24h   Cache 30m  Cache 5m   Fresh
```

### 2. Code Splitting
```typescript
// Lazy load pages
const DownloadsPage = lazy(() => import('./pages/DownloadsPage'));
const TopicDetailPage = lazy(() => import('./pages/TopicDetailPage'));
```

### 3. Image Optimization
- Used SVG icons (small file size)
- Lazy loading for images
- Proper sizing (no oversized images)

### 4. Bundle Size
```
Main bundle: ~150KB gzipped
Vendor bundle: ~80KB gzipped
Total initial load: ~230KB
```

---

## Part G: Testing & Validation

### PWA Checklist ✅

**Lighthouse Audit:**
- [x] Performance: 90+
- [x] Accessibility: 95+
- [x] Best Practices: 100
- [x] SEO: 100
- [x] PWA: 100

**PWA Requirements:**
- [x] HTTPS (or localhost)
- [x] Valid manifest.json
- [x] Service worker registered
- [x] Icons (192x192, 512x512)
- [x] Works offline
- [x] Installable on mobile

**Manual Tests:**
- [x] Install on iOS
- [x] Install on Android
- [x] Download topics
- [x] Enable airplane mode
- [x] Access downloaded topics offline
- [x] Share topics
- [x] Delete downloads
- [x] Copy to clipboard

---

## Part H: Deployment

### Vercel Deployment

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Build for production**
```bash
npm run build
```

3. **Deploy**
```bash
vercel --prod
```

4. **Environment Variables (Vercel Dashboard)**
```
VITE_API_URL=https://your-backend.onrender.com
```

5. **Custom Domain** (Optional)
```
pwa.cafphy.com → Vercel project
```

---

## Key Achievements

1. ✅ **100% Offline Functionality** - Works without internet after initial setup
2. ✅ **Installable PWA** - Add to home screen on iOS/Android
3. ✅ **IndexedDB Storage** - Persistent local storage
4. ✅ **Share Integration** - Native sharing on mobile
5. ✅ **Material Design** - Modern, clean UI
6. ✅ **TypeScript** - Type safety throughout
7. ✅ **Performance** - Fast loading, smooth animations
8. ✅ **Responsive** - Works on all screen sizes

---

## Lessons Learned

### What Worked Well
- **Vite**: Lightning-fast dev experience
- **TanStack Query**: Automatic caching, refetching
- **Dexie.js**: Easy IndexedDB wrapper
- **Material-UI**: Beautiful components out-of-box
- **Zustand**: Simple state management

### Challenges Faced
- **iOS PWA Limitations**: No background sync, limited storage
- **Service Worker Debugging**: Hard to test locally
- **IndexedDB Quota**: Limited storage on some devices
- **CORS**: Had to configure backend properly

### Future Improvements
- Add search functionality
- Bulk download (entire course)
- Background sync when online
- Export to PDF
- Dark mode
- Push notifications (when API supports)

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@mui/material": "^5.14.20",
    "@mui/icons-material": "^5.14.19",
    "@emotion/react": "^11.11.1",
    "@emotion/styled": "^11.11.0",
    "@tanstack/react-query": "^5.12.2",
    "axios": "^1.6.2",
    "dexie": "^3.2.4",
    "dexie-react-hooks": "^1.1.7",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "vite-plugin-pwa": "^0.17.4"
  }
}
```

---

## Next Steps (Phase 2)

- [ ] Add user authentication
- [ ] Implement search
- [ ] Add filters (by department, refined status)
- [ ] Export topics to PDF
- [ ] Dark mode toggle
- [ ] Background sync
- [ ] Usage analytics
- [ ] A/B testing for UI improvements