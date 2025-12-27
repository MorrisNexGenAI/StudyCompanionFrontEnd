# Study Companion PWA - Progressive Web App

An offline-first mobile study notes application with premium content management. Download topics once, access them anywhere without internet.

---

## 📱 Features

### Core Functionality
- 📚 **Browse by Department** - Health Science, Criminal Justice, Business, etc.
- 📖 **View Study Topics** - Access AI-refined summaries
- 🔒 **Premium Content** - Secure access control for exclusive materials
- ⬇️ **Download for Offline** - Save topics to device storage
- ✈️ **Works Offline** - Full functionality without internet
- 📤 **Share Notes** - Native share or copy to clipboard
- 🗑️ **Manage Downloads** - View and delete saved topics

### Premium Features (Phase 2)
- 🎫 **User Registration** - Name + 4-character code authentication
- 🔐 **Access Control** - Community topics (free) vs Premium topics (paid)
- 👤 **Personal Profile** - View your name, code, and access level
- 🎯 **Filtered Content** - See only topics assigned to you
- 📊 **Usage Tracking** - Local analytics on downloaded topics

### Progressive Web App
- 📲 **Installable** - Add to home screen (iOS/Android)
- 🚀 **Fast Loading** - Cached for instant access
- 🔄 **Auto Updates** - Service worker updates in background
- 📴 **Offline First** - Works without connection

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface (React)              │
│  ┌──────────┬──────────────┬─────────────────┐ │
│  │  Pages   │  Components  │   Material-UI   │ │
│  └──────────┴──────────────┴─────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│           State Management Layer                 │
│  ┌──────────────────────┬────────────────────┐ │
│  │  TanStack Query      │   Zustand Store    │ │
│  │  (Server State)      │   (Client State)   │ │
│  └──────────────────────┴────────────────────┘ │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌─────────────────┐  ┌─────────────────┐
│   IndexedDB     │  │   Backend API   │
│  (Local Store)  │  │  (Django REST)  │
│                 │  │                 │
│  - Downloads    │  │  - All Topics   │
│  - Premium      │  │  - Premium Auth │
│    Profile      │  │  - Filtering    │
└─────────────────┘  └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# 1. Navigate to PWA directory
cd cafphy-pwa

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env with your API URL
echo "VITE_API_URL=http://localhost:8000" > .env

# 5. Start development server
npm run dev
```

**App runs on:** `http://localhost:5173`

### Build for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Structure

```
cafphy-pwa/
├── src/
│   ├── api/                    # API client layer
│   │   ├── client.ts           # Axios instance with auth
│   │   └── endpoints.ts        # API endpoint functions
│   │
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx          # App shell with nav
│   │   ├── TopicCard.tsx       # Topic list item
│   │   ├── LoadingState.tsx    # Loading skeleton
│   │   └── EmptyState.tsx      # Empty list message
│   │
│   ├── pages/                  # Route pages
│   │   ├── PremiumSetup.tsx    # NEW: Premium registration
│   │   ├── DepartmentsPage.tsx # Department selection
│   │   ├── CoursesPage.tsx     # Courses in dept
│   │   ├── TopicsPage.tsx      # Topics in course
│   │   ├── TopicDetailPage.tsx # Full topic view
│   │   └── DownloadsPage.tsx   # Offline downloads
│   │
│   ├── db/                     # IndexedDB layer
│   │   └── schema.ts           # Dexie database + helpers
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useDepartments.ts   # Fetch departments
│   │   ├── useCourses.ts       # Fetch courses
│   │   ├── useTopics.ts        # Fetch topics
│   │   ├── useTopicDetail.ts   # Fetch topic content
│   │   └── useOffline.ts       # Offline detection
│   │
│   ├── stores/                 # Zustand state
│   │   └── downloadStore.ts    # Download tracking
│   │
│   ├── types/                  # TypeScript types
│   │   └── index.ts            # Shared interfaces
│   │
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   ├── theme.ts                # MUI theme config
│   └── vite-env.d.ts           # Vite types
│
├── public/                     # Static assets
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO
│   ├── favicon.ico             # Browser icon
│   └── icons/                  # PWA icons
│       ├── icon-192x192.png
│       └── icon-512x512.png
│
├── docs/                       # Documentation
│   ├── PHASE1.md               # Phase 1: Offline-first PWA
│   └── PHASE2.md               # Phase 2: Premium features
│
├── vite.config.ts              # Vite + PWA config
├── tsconfig.json               # TypeScript config
├── package.json                # Dependencies
├── .env.example                # Environment template
└── README.md                   # This file
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:
```bash
# Backend API URL
VITE_API_URL=http://localhost:8000

# For production
# VITE_API_URL=https://api.cafphy.com
```

---

## 🗄️ Data Storage

### IndexedDB Schema

```typescript
// Downloaded Topics
interface DownloadedTopic {
  id: number;
  title: string;
  content: string;
  courseName: string;
  departments: string[];
  pageRange: string;
  downloadedAt: number;
  updatedAt: number;
}

// Premium User Profile (NEW in Phase 2)
interface PremiumProfile {
  user_id: number;
  name: string;
  code: string;
  registered_at: number;
}
```

**Database Name:** `CaffphyDB`  
**Stores:**
- `topics` - Downloaded topics
- `premiumProfile` - User authentication data

---

## 📡 API Integration

### Endpoints Used

**Authentication (NEW)**
```
POST /premium/api/register-or-login/
Body: { name: string, code: string }
Response: { user_id, name, code, is_new }
```

**Departments**
```
GET /api/departments/
Response: Department[]
```

**Courses**
```
GET /api/departments/{deptId}/courses/?user_id=X
Response: Course[]
```

**Topics (Filtered by User)**
```
GET /api/courses/{courseId}/topics/?user_id=X
Response: TopicMetadata[]
```

**Topic Detail (Access Controlled)**
```
GET /api/topics/{topicId}/?user_id=X
Response: TopicDetail | 403 Access Denied
```

### Request Interceptor

All API requests automatically include `user_id`:
- As query parameter for GET requests
- As `X-User-ID` header for all requests

---

## 🔐 Premium Access Flow

### Registration/Login
```
1. User opens app for first time
2. Shows PremiumSetup page
3. User enters name + 4-char code
4. API validates credentials
5. Save profile to IndexedDB
6. Redirect to departments
```

### Content Filtering
```
1. User browses topics
2. API request includes user_id
3. Backend filters topics:
   - Community topics (everyone)
   - Premium topics (only if assigned)
4. User sees only accessible content
```

### Skipping Registration
```
- User can click "Skip for now"
- Gets access to community topics only
- Can register later from settings
```

---

## ⚡ Performance

### Metrics (Lighthouse)

```
Performance:    95/100
Accessibility:  98/100
Best Practices: 100/100
SEO:            100/100
PWA:            100/100
```

### Bundle Size

```
Main bundle:     ~160KB (gzipped) +10KB for auth
Vendor bundle:   ~80KB (gzipped)
Total:           ~240KB
First Load:      < 1 second on 4G
```

---

## 📴 Offline Functionality

### Premium Profile
- Stored in IndexedDB
- Persists across sessions
- Syncs with backend when online
- Used for API authentication

### Downloaded Content
- Saved with user_id
- Access checked against profile
- Premium topics remain accessible offline

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy PWA with premium features"
git push origin main
```

2. **Connect to Vercel**
   - Go to vercel.com
   - Import repository
   - Configure environment:
     ```
     VITE_API_URL=https://api.cafphy.com
     ```

3. **Deploy**
   - Automatic on every push
   - Get URL: `https://cafphy-pwa.vercel.app`

---

## 📖 Documentation

- **[PHASE1.md](docs/PHASE1.md)** - Offline-first architecture
- **[PHASE2.md](docs/PHASE2.md)** - Premium features implementation
- **React Docs** - https://react.dev
- **Material-UI** - https://mui.com
- **TanStack Query** - https://tanstack.com/query
- **Dexie.js** - https://dexie.org

---

## 🎯 Version History

### Phase 1 ✅ (Completed)
- [x] Offline-first architecture
- [x] Download & manage topics
- [x] Share functionality
- [x] Installable PWA
- [x] Material-UI design
- [x] IndexedDB storage

### Phase 2 ✅ (Current)
- [x] Premium user registration
- [x] Access control (community vs premium)
- [x] User profile storage
- [x] Filtered content by user
- [x] API authentication

### Phase 3 🚧 (Planned)
- [ ] Search functionality
- [ ] Filter topics by status/department
- [ ] Bulk download (entire course)
- [ ] Export to PDF
- [ ] Dark mode toggle
- [ ] Push notifications

---

## 📦 Dependencies

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
  }
}
```

---

## 👨‍💻 Support

- **Documentation**: docs/PHASE1.md, docs/PHASE2.md
- **Issues**: GitHub Issues
- **Email**: support@cafphy.com

---

**Built with ❤️ for students who need secure, offline access to study materials.**