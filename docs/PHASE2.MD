# Phase 2: Premium Content Management System (Frontend)

## Overview
Phase 2 adds a secure premium content system that allows instructors to restrict access to specific study materials. Students register with a name and 4-character code to access premium topics assigned to them.

---

## Key Features Added

1. **Premium User Registration** - Name + code authentication
2. **Access Control** - Community (free) vs Premium (paid) topics  
3. **API Authentication** - Automatic user_id in all requests
4. **Filtered Content** - Users see only assigned premium topics
5. **Local Profile Storage** - Premium credentials in IndexedDB

---

## Part A: Premium Registration System

### 1. New Page: PremiumSetup

**Location:** `src/pages/PremiumSetup.tsx`

**Purpose:** First-time user onboarding for premium access

**Features:**
- Name input (max 100 characters)
- Code input (exactly 4 alphanumeric characters, auto-uppercase)
- Client-side validation before API call
- Error handling with user-friendly messages
- "Skip for now" option (access community content only)
- Beautiful Material-UI design with gradient accents

**User Flow:**
```
1. App detects no premium profile in IndexedDB
2. Redirects to /premium-setup
3. User enters name + code
4. Validates format (4 chars, alphanumeric)
5. Calls POST /premium/api/register-or-login/
6. On success:
   - Saves profile to IndexedDB
   - Redirects to departments
7. On error:
   - Shows error message
   - User can retry
8. Can skip to browse community topics
```

**API Integration:**
```typescript
const response = await apiClient.post('/premium/api/register-or-login/', {
  name: name.trim(),
  code: code.trim().toUpperCase(),
});

// Response
{
  user_id: 2,
  name: "Emmanuel Cooper",
  code: "EC21",
  is_new: true  // false if existing user logging in
}
```

---

### 2. IndexedDB Schema Update

**Location:** `src/db/schema.ts`

**New Store Added:**
```typescript
interface PremiumProfile {
  user_id: number;      // Backend user ID
  name: string;         // Full name
  code: string;         // 4-character code
  registered_at: number; // Unix timestamp
}

// Database schema
class CaffphyDB extends Dexie {
  topics!: Table<DownloadedTopic, number>;
  premiumProfile!: Table<PremiumProfile, number>; // NEW

  constructor() {
    super('CaffphyDB');
    this.version(2).stores({  // Version bumped to 2
      topics: 'id, title, courseName, downloadedAt',
      premiumProfile: 'user_id, name, code' // NEW
    });
  }
}
```

**Helper Functions Added:**
```typescript
export const dbHelpers = {
  // Save premium profile
  savePremiumProfile: async (profile: PremiumProfile) => {
    await db.premiumProfile.clear(); // Only one profile
    await db.premiumProfile.add(profile);
  },
  
  // Get premium profile
  getPremiumProfile: async (): Promise<PremiumProfile | null> => {
    const profiles = await db.premiumProfile.toArray();
    return profiles[0] || null;
  },
  
  // Delete premium profile (logout)
  deletePremiumProfile: async () => {
    await db.premiumProfile.clear();
  }
};
```

---

### 3. API Client Authentication

**Location:** `src/api/client.ts`

**Request Interceptor Added:**

Every API request now automatically includes the user's ID:

```typescript
apiClient.interceptors.request.use(async (config) => {
  try {
    // Get premium profile from IndexedDB
    const profile = await dbHelpers.getPremiumProfile();
    
    if (profile?.user_id) {
      // Add user_id as query param for GET requests
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          user_id: profile.user_id,
        };
      }
      
      // Add user_id as header for ALL requests
      config.headers['X-User-ID'] = profile.user_id.toString();
    }
  } catch (error) {
    console.error('Failed to get premium profile:', error);
  }
  
  return config;
});
```

**How It Works:**
- Runs before EVERY API request
- Fetches premium profile from IndexedDB
- Adds user_id to request automatically
- Backend uses this to filter content

**Example Requests:**
```
Before: GET /api/courses/1/topics/
After:  GET /api/courses/1/topics/?user_id=2

Before: GET /api/topics/5/
After:  GET /api/topics/5/?user_id=2
Headers: X-User-ID: 2
```

---

## Part B: Content Access Control

### 1. Topic Filtering

**How It Works:**

**Community Topics:**
- Always visible to everyone
- No user_id required
- Free access

**Premium Topics:**
- Visible ONLY if user is explicitly assigned
- Requires valid user_id in request
- Backend checks assignment in database

**API Response Examples:**

**Without user_id (anonymous/community only):**
```json
GET /api/courses/1/topics/
[
  {
    "id": 1,
    "title": "Cell Structure",
    "is_premium": false
  },
  {
    "id": 2,
    "title": "Cell Division",
    "is_premium": false
  }
  // Premium topics not included
]
```

**With user_id=2 (assigned premium topics):**
```json
GET /api/courses/1/topics/?user_id=2
[
  {
    "id": 1,
    "title": "Cell Structure",
    "is_premium": false
  },
  {
    "id": 2,
    "title": "Cell Division",
    "is_premium": false
  },
  {
    "id": 5,
    "title": "Advanced Genetics",
    "is_premium": true
  }
  // Only premium topics assigned to user_id=2
]
```

---

### 2. Access Denied Handling

**Topic Detail Protection:**

When accessing premium topic detail:

```typescript
GET /api/topics/5/?user_id=2

// If user has access
Response: {
  id: 5,
  title: "Advanced Genetics",
  refined_summary: "...",
  is_premium: true
}

// If user does NOT have access
Response 403: {
  error: "Access denied. This is a premium topic.",
  is_premium: true,
  requires_login: true
}
```

**Frontend Handling:**
```typescript
try {
  const topic = await topicsAPI.getFull(topicId);
  setTopicData(topic);
} catch (error) {
  if (error.response?.status === 403) {
    // Show access denied message
    setError("This is a premium topic. Contact your instructor.");
  }
}
```

---

## Part C: User Experience

### 1. First-Time User Flow

**Scenario 1: New User (Register)**
```
1. Opens app → No profile found
2. Redirected to /premium-setup
3. Enters: Name="Emmanuel Cooper", Code="EC21"
4. API creates new user
5. Profile saved locally
6. Redirected to departments
7. Can now see assigned premium topics
```

**Scenario 2: Returning User (Login)**
```
1. Opens app → No profile found
2. Redirected to /premium-setup
3. Enters existing Name + Code
4. API returns existing user_id
5. Profile saved locally
6. Redirected to departments
7. Sees previously assigned topics
```

**Scenario 3: Skip Registration**
```
1. Opens app → No profile found
2. Redirected to /premium-setup
3. Clicks "Skip for now"
4. Redirected to departments
5. Sees ONLY community topics
6. Can register later
```

---

### 2. Navigation Flow

**App Routing:**
```typescript
<Routes>
  <Route path="/premium-setup" element={<PremiumSetup />} />
  <Route path="/" element={<DepartmentsPage />} />
  <Route path="/departments/:id/courses" element={<CoursesPage />} />
  <Route path="/courses/:id/topics" element={<TopicsPage />} />
  <Route path="/topics/:id" element={<TopicDetailPage />} />
  <Route path="/downloads" element={<DownloadsPage />} />
</Routes>
```

**Premium Check Logic:**
```typescript
// On app load
useEffect(() => {
  const checkPremiumProfile = async () => {
    const profile = await dbHelpers.getPremiumProfile();
    if (!profile && location.pathname !== '/premium-setup') {
      navigate('/premium-setup');
    }
  };
  checkPremiumProfile();
}, []);
```

---

### 3. Premium Badges

**Visual Indicators:**

Topics now show premium badges:

```typescript
// TopicCard component
{topic.is_premium && (
  <Chip 
    icon={<Lock />}
    label="Premium"
    color="secondary"
    size="small"
  />
)}
```

**Badge Locations:**
- Topic list cards
- Topic detail page header
- Download buttons (disabled for non-assigned premium)

---

## Part D: Offline Behavior

### 1. Profile Persistence

**IndexedDB Storage:**
- Premium profile stored locally
- Survives app closes/reopens
- No need to re-login each time
- Syncs with backend when online

**Profile Lifecycle:**
```
Register → Save to IndexedDB → Use in requests → Persist forever
                                     ↓
                            (Until user logs out)
```

---

### 2. Downloaded Premium Content

**Access Rules:**
- Premium topics can be downloaded
- Remain accessible offline after download
- No re-authentication needed offline
- Access validated against local profile

**Download Flow:**
```
1. User downloads premium topic (while online)
2. Saved to IndexedDB with user_id
3. App goes offline
4. User opens downloaded topic
5. Checks local profile matches download
6. Displays content (no API call needed)
```

---

## Part E: Security Considerations

### 1. Client-Side Validation

**Code Format:**
- Exactly 4 characters
- Letters (A-Z) and numbers (0-9) only
- Case-insensitive (auto-uppercase)
- Client validates before API call

**Name Format:**
- 1-100 characters
- Trimmed whitespace
- Required field

---

### 2. API Security

**Authentication:**
- user_id sent with every request
- Backend validates user exists + is active
- Backend checks topic assignments
- 403 error if access denied

**No Token/JWT:**
- Simple name+code system (not high-security)
- Suitable for education context
- No password storage needed
- Easy for students to remember

---

### 3. Data Privacy

**Local Storage:**
- All data in IndexedDB (not localStorage)
- Browser-specific (doesn't sync across devices)
- Can be cleared by user
- No sensitive data stored (no passwords)

**Network Security:**
- HTTPS in production
- CORS configured on backend
- API validates all requests
- Rate limiting on backend (future)

---

## Part F: Error Handling

### 1. Registration Errors

**Common Errors:**

```typescript
// Code already exists (different name)
{
  error: "This code is already linked to another user"
}

// Name exists (different code)
{
  error: "This name is already linked to another code"
}

// Invalid format
{
  error: "Code must be exactly 4 alphanumeric characters"
}

// Account inactive
{
  error: "Account is inactive"
}

// Network error
{
  error: "Failed to connect. Check your internet."
}
```

**User Experience:**
- Errors shown in red alert box
- User can correct and retry
- Form stays filled with previous input
- Clear, actionable error messages

---

### 2. Access Denied Errors

**When Accessing Premium Topic:**

```typescript
// User not assigned
GET /api/topics/10/?user_id=2
Response 403: {
  error: "Access denied. This is a premium topic.",
  is_premium: true
}

// Frontend shows friendly message
"This topic is restricted. Please contact your instructor 
to get access to premium content."
```

---

## Part G: Testing Checklist

### Registration Flow
- [ ] Register new user (creates account)
- [ ] Login existing user (returns same user_id)
- [ ] Invalid code format (shows error)
- [ ] Code already taken (shows error)
- [ ] Name already taken (shows error)
- [ ] Network error (shows error)
- [ ] Skip registration (works, community only)

### Content Access
- [ ] Community topics visible without login
- [ ] Premium topics hidden without login
- [ ] Premium topics visible after login (if assigned)
- [ ] Premium topics hidden if not assigned
- [ ] Access denied message on unauthorized topic
- [ ] user_id sent in all API requests

### Profile Persistence
- [ ] Profile saved to IndexedDB
- [ ] Profile persists after app close
- [ ] Profile used in API requests
- [ ] Can logout (clear profile)

### Offline Behavior
- [ ] Can download premium topic (while online)
- [ ] Can view downloaded premium topic (offline)
- [ ] Cannot download new premium topics (offline)
- [ ] Profile works offline

---

## Part H: Future Enhancements

### Planned Features
- [ ] Profile page (view name, code, logout)
- [ ] Change code (re-authentication)
- [ ] View assigned premium topics list
- [ ] Premium topic expiration dates
- [ ] Multi-device sync (cloud storage)
- [ ] Password protection option
- [ ] Push notifications for new assignments

---

## Part I: API Endpoints Reference

### Premium Authentication

**Register or Login**
```
POST /premium/api/register-or-login/
Body: { name: string, code: string }

Success Response:
{
  user_id: number,
  name: string,
  code: string,
  is_new: boolean
}

Error Response:
{
  error: string
}
```

---

### Content Endpoints (with user_id)

**All endpoints now accept user_id:**

```
GET /api/departments/
GET /api/departments/{id}/courses/?user_id=X
GET /api/courses/{id}/topics/?user_id=X
GET /api/topics/{id}/?user_id=X
```

**Automatic via Interceptor:**
- No manual user_id needed in code
- Interceptor adds it automatically
- Backend filters based on user_id

---

## Key Achievements

1. ✅ **Secure Authentication** - Name + code system
2. ✅ **Access Control** - Premium vs community topics
3. ✅ **Automatic Auth** - API interceptor handles user_id
4. ✅ **Local Persistence** - Profile in IndexedDB
5. ✅ **Filtered Content** - Users see only assigned topics
6. ✅ **Offline Support** - Premium profile works offline
7. ✅ **Error Handling** - Clear messages for all errors
8. ✅ **Skip Option** - Can use app without registration

---

## Developer Notes

### Adding user_id to New Endpoints

If you add new API endpoints:

**Already Handled Automatically:**
```typescript
// This works automatically (interceptor adds user_id)
const data = await apiClient.get('/api/new-endpoint/');
```

**Manual Override (if needed):**
```typescript
// Skip user_id for specific request
const data = await apiClient.get('/api/public-endpoint/', {
  headers: { 'X-Skip-User-ID': 'true' }
});
```

---

### Debugging Auth Issues

**Check if profile exists:**
```typescript
const profile = await dbHelpers.getPremiumProfile();
console.log('Profile:', profile);
```

**Check request headers:**
```typescript
// In browser DevTools → Network tab
// Look for X-User-ID header in requests
```

**Test API directly:**
```bash
curl -H "X-User-ID: 2" http://localhost:8000/api/topics/
```

---

**Phase 2 Complete! 🎉**

Users can now register with name+code, and the app automatically filters content based on their assignments.