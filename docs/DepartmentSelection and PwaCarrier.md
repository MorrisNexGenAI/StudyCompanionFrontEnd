# 📱 PHASE 5 - User Frontend Department Selection Feature

## 📋 Overview
This document outlines the changes made to the User PWA (Study Companion) to support department selection during registration and department-based content filtering.

---

## 🎯 Feature Summary

### **What Was Added:**
- Department selection dropdown during user registration
- Department data stored in local IndexedDB profile
- Department information sent to backend API
- Support for users without departments (optional field)
- Auto-detect local Admin PWA server for offline updates

### **Why It Matters:**
- Users only see courses/topics relevant to their department
- Reduces clutter and improves content discovery
- Enables department-specific premium content
- Supports multi-department institutions

---

## 📁 Files Modified

### **1. Type Definitions**
**File:** `src/types.ts` (or wherever types are defined)

**Changes Made:**
```typescript
// BEFORE
export interface PremiumProfile {
  user_id: number;
  name: string;
  code: string;
  registered_at: number;
}

// AFTER
export interface PremiumProfile {
  user_id: number;
  name: string;
  code: string;
  department_id?: number | null;      // ← ADDED
  department_name?: string | null;     // ← ADDED
  registered_at: number;
}
```

**What Changed:**
- Added `department_id` - stores the selected department's ID
- Added `department_name` - stores the department name for display
- Both fields are optional (user can skip department selection)

---

### **2. API Client Configuration**
**File:** `src/api/client.ts`

**Changes Made:**
Added local server detection for Admin Carrier PWA:

```typescript
// NEW: Local server URLs for Admin PWA
const LOCAL_SERVER_URLS = [
  'http://192.168.43.1:8080',   // Android hotspot
  'http://192.168.137.1:8080',  // Windows hotspot
  'http://172.20.10.1:8080',    // iPhone hotspot
];

// NEW: Check if local admin server is available
async function checkLocalServer(): Promise<string | null> {
  for (const url of LOCAL_SERVER_URLS) {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        mode: 'cors',
        signal: AbortSignal.timeout(2000),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.admin_pwa === true) {
          return url;
        }
      }
    } catch (e) {
      // Server not available, try next
    }
  }
  return null;
}

// NEW: Export helper functions
export async function refreshServerDetection() { /* ... */ }
export function getConnectionStatus() { /* ... */ }
```

**What Changed:**
- Added automatic detection of local Admin Carrier PWA
- Prioritizes local server over Django backend
- Falls back to Django if local server unavailable
- Exports helper functions for manual server detection

---

### **3. API Endpoints**
**File:** `src/api/endpoints.ts`

**Changes Made:**
```typescript
// ADDED: Department API
export const departmentsAPI = {
  getAll: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>('/api/departments/');
    return data;
  },
  
  // NEW: Get departments for registration
  getForRegistration: async (): Promise<Department[]> => {
    const { data } = await apiClient.get<Department[]>('/premium/api/departments/');
    return data;
  },
};
```

**What Changed:**
- Added new API endpoint to fetch departments list
- Used during registration to populate dropdown
- Supports both public API and premium API endpoints

---

### **4. Premium Setup Component**
**File:** `src/components/PremiumSetup.tsx`

**Major Changes:**

#### **New State Variables:**
```typescript
const [departmentId, setDepartmentId] = useState<number | ''>('');
const [departments, setDepartments] = useState<Department[]>([]);
const [loadingDepts, setLoadingDepts] = useState(true);
```

#### **Load Departments on Mount:**
```typescript
useEffect(() => {
  loadDepartments();
}, []);

const loadDepartments = async () => {
  try {
    const response = await apiClient.get<{ departments: Department[] }>(
      '/premium/api/departments/'
    );
    setDepartments(response.data.departments);
  } catch (err) {
    console.error('Failed to load departments:', err);
    setError('Failed to load departments. You can continue without selecting one.');
  } finally {
    setLoadingDepts(false);
  }
};
```

#### **Updated Registration Payload:**
```typescript
// BEFORE
const response = await apiClient.post<PremiumAuthResponse>(
  'premium/api/register-or-login/',
  {
    name: name.trim(),
    code: code.trim().toUpperCase(),
  }
);

// AFTER
const response = await apiClient.post<PremiumAuthResponse>(
  'premium/api/register-or-login/',
  {
    name: name.trim(),
    code: code.trim().toUpperCase(),
    department_id: departmentId || null,  // ← ADDED
  }
);
```

#### **Updated Profile Storage:**
```typescript
// BEFORE
const profile: PremiumProfile = {
  user_id: data.user_id,
  name: data.name,
  code: data.code,
  registered_at: Date.now(),
};

// AFTER
const profile: PremiumProfile = {
  user_id: data.user_id,
  name: data.name,
  code: data.code,
  department_id: data.department_id,      // ← ADDED
  department_name: data.department_name,  // ← ADDED
  registered_at: Date.now(),
};
```

#### **New UI Element - Department Dropdown:**
```tsx
<FormControl fullWidth disabled={loading || loadingDepts}>
  <InputLabel>Department (Optional)</InputLabel>
  <Select
    value={departmentId}
    label="Department (Optional)"
    onChange={(e) => setDepartmentId(e.target.value as number)}
    sx={{ borderRadius: 2 }}
  >
    <MenuItem value="">
      <em>No Department</em>
    </MenuItem>
    {departments.map((dept) => (
      <MenuItem key={dept.id} value={dept.id}>
        {dept.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
```

**What Changed:**
- Added department dropdown between code and submit button
- Loads available departments from backend on component mount
- Shows loading state while fetching departments
- Allows users to skip department selection
- Sends department_id to backend during registration
- Stores department info in local IndexedDB

---

### **5. Connection Status Component (NEW)**
**File:** `src/components/ConnectionStatus.tsx`

**Completely New Component:**

**Purpose:**
- Shows current connection mode (Local/Online/Offline)
- Indicates when connected to Admin Carrier PWA
- Manual refresh button to check for local server

**Features:**
```typescript
// Auto-refresh every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    const newStatus = await refreshServerDetection();
    setStatus({
      mode: newStatus.mode,
      baseURL: newStatus.url,
      isLocal: newStatus.mode === 'local',
    });
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

**Visual Indicators:**
- 🟢 Green "Connected Locally" when Admin PWA detected
- 🔵 Blue "Online" when using Django backend
- ⚫ Gray "Offline" when no connection

**What It Does:**
- Helps users know their connection status
- Shows when they're getting updates from nearby Admin PWA
- Provides manual refresh to re-check for local server

---

### **6. Vite Configuration**
**File:** `vite.config.ts`

**Changes Made:**
```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https?:\/\/.*\/api\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        // Local server detection handled in client.ts
      }
    }
  ]
}
```

**What Changed:**
- Updated service worker caching strategy
- Removed custom local server plugin (moved to client.ts)
- Simplified PWA configuration

---

## 🔄 User Flow Changes

### **BEFORE Phase 5:**
```
User opens app
    ↓
Premium Setup page
    ↓
Enter name (required)
    ↓
Enter code (required)
    ↓
Submit
    ↓
Register/Login to backend
    ↓
See ALL topics from ALL departments
```

### **AFTER Phase 5:**
```
User opens app
    ↓
Premium Setup page
    ↓
App loads departments from backend
    ↓
Enter name (required)
    ↓
Enter code (required)
    ↓
Select department (optional) ← NEW
    ↓
Submit with department_id
    ↓
Register/Login to backend
    ↓
See ONLY topics from selected department ← FILTERED
```

---

## 📊 Data Flow

### **Registration Flow:**
```
User selects department
    ↓
Frontend: departmentId = 5
    ↓
POST /premium/api/register-or-login/
{
  "name": "John Doe",
  "code": "JD21",
  "department_id": 5
}
    ↓
Backend creates/updates user
    ↓
Response:
{
  "user_id": 123,
  "name": "John Doe",
  "code": "JD21",
  "department_id": 5,
  "department_name": "Computer Science"
}
    ↓
Frontend saves to IndexedDB:
{
  user_id: 123,
  name: "John Doe",
  code: "JD21",
  department_id: 5,
  department_name: "Computer Science",
  registered_at: 1737244800000
}
```

### **Content Filtering Flow:**
```
User browses topics
    ↓
Frontend reads profile from IndexedDB
    ↓
GET /api/courses/5/topics/?user_id=123
    ↓
Backend checks user's department (dept_id: 5)
    ↓
Backend filters topics:
  - Course must be in department 5
  - Topic must be non-premium OR user assigned
    ↓
Returns filtered topic list
    ↓
User sees only relevant topics
```

---

## 🌐 Local Server Detection

### **How It Works:**
```
App starts
    ↓
Check http://192.168.43.1:8080/api/health
    ↓
Response: { "admin_pwa": true } ?
    ↓
YES → Use local server
    ↓
apiClient.defaults.baseURL = 'http://192.168.43.1:8080'
    ↓
All API requests go to local Admin PWA
    ↓
NO → Use Django backend
    ↓
apiClient.defaults.baseURL = 'https://backend.onrender.com'
```

### **User Experience:**
- **With Admin PWA nearby:** "Connected Locally" 🟢 → Instant updates
- **Without Admin PWA:** "Online" 🔵 → Normal internet connection
- **No connection:** Uses cached data from IndexedDB

---

## 🎨 UI/UX Changes

### **New Elements:**

1. **Department Dropdown (PremiumSetup):**
   - Material-UI Select component
   - Shows all available departments
   - Optional field - users can skip
   - Displays "No Department" option

2. **Connection Status Indicator (Header/Toolbar):**
   - Chip showing connection mode
   - Icon changes based on status
   - Manual refresh button
   - Auto-refreshes every 30 seconds

3. **Updated Instructions (PremiumSetup):**
   - Mentions department selection
   - Explains optional nature
   - Clarifies department filtering

### **Visual Changes:**
- Department dropdown styled to match existing form fields
- Connection status uses theme colors
- Loading states while fetching departments
- Error messages if department load fails

---

## 💾 IndexedDB Schema Changes

### **BEFORE:**
```javascript
{
  user_id: 123,
  name: "John Doe",
  code: "JD21",
  registered_at: 1737244800000
}
```

### **AFTER:**
```javascript
{
  user_id: 123,
  name: "John Doe",
  code: "JD21",
  department_id: 5,              // ← NEW
  department_name: "Computer Science",  // ← NEW
  registered_at: 1737244800000
}
```

**Migration Strategy:**
- Existing users: department_id and department_name are `null`
- New users: department_id populated if selected
- No data loss - backward compatible

---

## 🧪 Testing Performed

### **Test 1: Department Loading**
✅ Departments load on component mount  
✅ Loading indicator shows while fetching  
✅ Error message if fetch fails  
✅ Dropdown populates with departments  

### **Test 2: Registration with Department**
✅ User can select department  
✅ Department_id sent in API request  
✅ Response includes department info  
✅ Profile saved with department  

### **Test 3: Registration without Department**
✅ User can skip department (select "No Department")  
✅ Null sent to backend  
✅ Profile saved with null department  
✅ No errors occur  

### **Test 4: Existing Users**
✅ Users without department can still login  
✅ Department can be added later  
✅ No breaking changes for existing users  

### **Test 5: Local Server Detection**
✅ Detects Admin PWA when available  
✅ Falls back to Django when not available  
✅ Connection status shows correct mode  
✅ Manual refresh works  

---

## 📦 Dependencies Added

**None!** All changes use existing dependencies:
- Material-UI components (already installed)
- Axios (already installed)
- IndexedDB via idb (already installed)

---

## 🚀 Deployment Steps

### **Step 1: Update Code**
```bash
# Copy updated files
cp src/types.ts src/types.ts
cp src/api/client.ts src/api/client.ts
cp src/api/endpoints.ts src/api/endpoints.ts
cp src/components/PremiumSetup.tsx src/components/PremiumSetup.tsx
cp src/components/ConnectionStatus.tsx src/components/ConnectionStatus.tsx
cp vite.config.ts vite.config.ts
```

### **Step 2: Test Locally**
```bash
npm run dev
```

### **Step 3: Build for Production**
```bash
npm run build
```

### **Step 4: Deploy**
```bash
# Deploy to Netlify/Vercel/your hosting
netlify deploy --prod
```

---

## 🔍 Debugging Guide

### **Issue: Departments not loading**
**Check:**
- Browser console for API errors
- Backend `/premium/api/departments/` endpoint works
- CORS headers configured correctly
- Network tab shows request/response

### **Issue: Department not saved**
**Check:**
- IndexedDB in DevTools → Application tab
- Profile object has department_id field
- Backend response includes department info

### **Issue: Local server not detected**
**Check:**
- Admin Carrier PWA is running
- Phone hotspot is enabled
- IP address matches expected range
- Health endpoint returns `{admin_pwa: true}`

---

## ✅ Success Criteria

Phase 5 is complete when:

- [x] User can select department during registration
- [x] Department is optional (can be skipped)
- [x] Department info stored in IndexedDB
- [x] Department sent to backend API
- [x] Connection status component shows local/online mode
- [x] Local server detection works
- [x] Existing users unaffected
- [x] No breaking changes
- [x] All tests pass
- [x] Deployed to production

---

## 📝 Documentation Updated

Files updated in project documentation:
- [x] README.md - Feature list
- [x] CHANGELOG.md - Phase 5 changes
- [x] API.md - New endpoints documented
- [x] SETUP.md - Installation steps
- [x] This document added to `/docs/PHASE_5_FRONTEND.md`

---

## 🎯 Impact Summary

### **For Users:**
- ✅ Only see relevant content for their department
- ✅ Faster content discovery
- ✅ Less clutter
- ✅ Instant updates when near Admin PWA

### **For Admins:**
- ✅ Better content organization
- ✅ Department-specific premium topics
- ✅ Easier user management
- ✅ Offline distribution capability

### **For Developers:**
- ✅ Clean, maintainable code
- ✅ Backward compatible
- ✅ Well-documented changes
- ✅ Easy to test and debug

---

## 🔮 Future Enhancements

Potential improvements for future phases:

1. **Multiple Departments:** Allow users to belong to multiple departments
2. **Department Transfer:** Admin feature to move users between departments
3. **Department Analytics:** Show stats per department
4. **Smart Defaults:** Auto-suggest department based on course selections
5. **Offline Department Sync:** Cache department list for offline use

---

## 📚 Related Documentation

- Backend Phase 5 Guide: `/docs/PHASE_5_BACKEND.md`
- Admin Carrier PWA Setup: `/docs/ADMIN_CARRIER_SETUP.md`
- API Documentation: `/docs/API.md`
- User Guide: `/docs/USER_GUIDE.md`

---

**Phase 5 Frontend Changes - Complete! ✅**

Last Updated: January 2025  
Version: 2.0.0  
Author: Development Team