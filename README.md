# Study Companion PWA - Progressive Web App

An offline-first mobile study notes application with premium content management and intelligent study mode. Download topics once, access them anywhere without internet.

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

### Study Mode Features (Phase 3) ⭐ NEW
- 🎯 **Smart Q&A Parsing** - AI-generated content parsed into flashcard format
- 📦 **Intelligent Chunking** - Content split into 5-question study chunks
- 🧠 **Progressive Disclosure** - Show question/answer first, expand for details
- 📊 **Visual Progress** - Track progress through each chunk
- 📋 **Table Support** - Beautiful rendering of table-based answers
- ⚡ **Distraction-Free** - Focus on one concept at a time
- 💾 **Auto-Save Progress** - Resume where you left off

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
│  - Study        │  │  - AI Refine    │
│    Progress     │  │                 │
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
│   │   ├── StudyCard.tsx       # NEW: Q&A flashcard component
│   │   ├── LoadingState.tsx    # Loading skeleton
│   │   └── EmptyState.tsx      # Empty list message
│   │
│   ├── pages/                  # Route pages
│   │   ├── PremiumSetup.tsx    # Premium registration
│   │   ├── DepartmentsPage.tsx # Department selection
│   │   ├── CoursesPage.tsx     # Courses in dept
│   │   ├── TopicsPage.tsx      # Topics in course
│   │   ├── TopicDetailPage.tsx # Full topic view
│   │   ├── StudyModePage.tsx   # NEW: Interactive study mode
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
│   ├── utils/                  # NEW: Utility functions
│   │   └── qaParser.ts         # Parse AI Q&A into structured data
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
│   ├── PHASE2.md               # Phase 2: Premium features
│   └── PHASE3.md               # Phase 3: Study mode (NEW)
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

// Premium User Profile
interface PremiumProfile {
  user_id: number;
  name: string;
  code: string;
  registered_at: number;
}

// Study Progress (NEW in Phase 3)
interface StudyProgress {
  topic_id: number;
  current_chunk: number;
  completed_chunks: number[];
  last_studied: number;
}

// Parsed Q&A Structure (NEW in Phase 3)
interface QuestionUnit {
  id: string;              // "Q1", "Q2", etc.
  question: string;
  answer: string;
  explanation?: string;    // Optional
  example?: string;        // Optional
  isTable: boolean;        // true if answer is table
}

interface StudyChunk {
  chunkNumber: number;     // 1, 2, 3...
  questions: QuestionUnit[];
  startIndex: number;
  endIndex: number;
}
```

**Database Name:** `CaffphyDB`  
**Stores:**
- `topics` - Downloaded topics
- `premiumProfile` - User authentication data
- `studyProgress` - Track progress per topic (NEW)

---

## 📡 API Integration

### Endpoints Used

**Authentication**
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

## 🎓 Study Mode (Phase 3)

### Content Parsing

**AI-Generated Format:**
```
Q1: What causes malaria?
Answer: Infected mosquito bite transmits parasite

Explanation: Tiny life forms not visible to naked eye

Example: Malaria parasites are a type of microbe

---

Q2: What key roles do microbes play?
Answer: Nutrient cycling, biodegradation, disease, biotechnology

Explanation: Essential for environment, food, and human health

Example: Gut bacteria help digest food

---
```

**Parsed Structure:**
```typescript
{
  totalQuestions: 20,
  chunks: [
    {
      chunkNumber: 1,
      questions: [Q1, Q2, Q3, Q4, Q5],
      startIndex: 0,
      endIndex: 4
    },
    {
      chunkNumber: 2,
      questions: [Q6, Q7, Q8, Q9, Q10],
      startIndex: 5,
      endIndex: 9
    },
    // ... more chunks
  ]
}
```

### Study Flow

```
1. User opens topic → Sees "Study Mode" button
2. Click "Study Mode" → Parser extracts Q&A structure
3. Content chunked into groups of 5 questions
4. User sees Chunk 1:
   - Question 1 (expanded)
   - Question 2 (collapsed)
   - Question 3 (collapsed)
   - Question 4 (collapsed)
   - Question 5 (collapsed)
5. Tap card → Expands to show Explanation + Example
6. Navigate: Previous/Next buttons
7. Progress indicator: "Chunk 1 of 4 • Question 2 of 5"
8. Complete chunk → Move to next chunk
9. Progress auto-saved to IndexedDB
```

### UI Components

**StudyCard.tsx:**
- Displays one Q&A unit
- Collapsible Explanation/Example
- Table rendering for structured answers
- Progress indicator
- Expand/collapse animation

**StudyModePage.tsx:**
- Container for study session
- Chunk navigation
- Progress tracking
- Exit confirmation

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
Main bundle:     ~180KB (gzipped) +20KB for study mode
Vendor bundle:   ~80KB (gzipped)
Total:           ~260KB
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

### Study Progress
- Saved locally in IndexedDB
- No internet required
- Syncs when back online (future)

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy PWA with study mode"
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
- **[PHASE3.md](docs/PHASE3.md)** - Study mode with Q&A parsing (NEW)
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

### Phase 2 ✅ (Completed)
- [x] Premium user registration
- [x] Access control (community vs premium)
- [x] User profile storage
- [x] Filtered content by user
- [x] API authentication

### Phase 3 ✅ (Current) ⭐ NEW
- [x] Q&A parser for AI-generated content
- [x] Intelligent chunking (5 questions per chunk)
- [x] Interactive study cards
- [x] Progressive disclosure (expand/collapse)
- [x] Table support for structured answers
- [x] Study progress tracking
- [x] Distraction-free study mode

### Phase 4 🚧 (Planned)
- [ ] Search functionality across topics
- [ ] Filter topics by status/department
- [ ] Bulk download (entire course)
- [ ] Export to PDF
- [ ] Dark mode toggle
- [ ] Spaced repetition algorithm
- [ ] Study statistics dashboard

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

- **Documentation**: docs/PHASE1.md, docs/PHASE2.md, docs/PHASE3.md
- **Issues**: GitHub Issues
- **Email**: studycompanion.gmail.com

---

**Built with ❤️ for students who need secure, offline access to study materials with intelligent learning tools.**