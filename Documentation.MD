# Phase 1: Django Backend Migration
VITE_API_URL = https://your-django-backend.onrender.com
## Overview
Migrated from single `subject` CharField to many-to-many `departments` relationship to support courses with multiple departments.

---

## Changes Made

### 1. Models (`scan/models.py`)

#### New Model: Department
```python
class Department(BaseModel):
    name = models.CharField(max_length=200, unique=True)
    
    @classmethod
    def get_or_create_department(cls, name):
        # Case-insensitive lookup
        dept, created = cls.objects.get_or_create(
            name__iexact=name, 
            defaults={'name': name}
        )
        return dept
```

#### Updated Model: Course
**Removed:**
- `subject = models.CharField(max_length=200, blank=True)`

**Added:**
- `departments = models.ManyToManyField(Department, blank=True, related_name='courses')`
- `get_departments_display()` - Returns comma-separated department names
- Updated `get_full_refined_text()` - Includes departments in output

#### Model: Topic
- No changes (still references Course via ForeignKey)

---

### 2. Database Migrations

#### Created Tables:
- `scan_department` - Stores department names
- `scan_course_departments` - Many-to-many relationship table

#### Migration Strategy:
1. Deleted old database (`db.sqlite3`)
2. Deleted all migration files
3. Created fresh migrations: `python manage.py makemigrations`
4. Applied migrations: `python manage.py migrate`

---

### 3. Views (`scan/views.py`)

#### New API Endpoints (4 total):

**1. List Departments**
```python
GET /api/departments/
Response: [{"id": 1, "name": "Health Science" }, ...]
```

**2. Courses by Department**
```python
GET /api/departments/<dept_id>/courses/
Response: [{
    "id": 1,
    "name": "BIO 202",
    "year": "2024",
    "departments": [{"id": 1, "name": "Health Science"}],
    "topic_count": 5,
    "refined_count": 3
}, ...]
```

**3. Topics by Course (Metadata Only)**
```python
GET /api/courses/<course_id>/topics/
Response: [{
    "id": 1,
    "title": "Cell Division",
    "page_range": "Pages 1-5",
    "updated_at": 1703001234,
    "is_refined": true
}, ...]
```

**4. Full Topic with Content**
```python
GET /api/topics/<topic_id>/
Response: {
    "id": 1,
    "title": "Cell Division",
    "page_range": "Pages 1-5",
    "refined_summary": "...",
    "raw_text": "...",
    "course_name": "BIO 202",
    "course_year": "2024",
    "departments": ["Health Science"],
    "updated_at": 1703001234,
    "created_at": 1702995000
}
```

#### Updated Existing Views:
- `create_course()` - Now handles `POST.getlist('departments')`
- `library()` - Added `prefetch_related('departments')` for performance
- `course_detail()` - Added department prefetch
- `course_full_summary()` - Added department prefetch

---

### 4. URLs (`scan/urls.py`)

**Added API Routes:**
```python
path('api/departments/', views.api_departments),
path('api/departments/<int:dept_id>/courses/', views.api_department_courses),
path('api/courses/<int:course_id>/topics/', views.api_course_topics),
path('api/topics/<int:topic_id>/', views.api_topic_detail),
```

---

### 5. Templates

#### `create_course.html`
**Changed:**
- Replaced single text input with multi-select dropdown
- Added Choices.js library for enhanced UX
- Searchable department selection with tag removal

**Before:**
```html
<input type="text" name="subject" placeholder="e.g., Health Science">
```

**After:**
```html
<select name="departments" id="departmentSelect" multiple>
  {% for dept in all_departments %}
  <option value="{{ dept.id }}">{{ dept.name }}</option>
  {% endfor %}
</select>
<script src="https://cdn.jsdelivr.net/npm/choices.js/..."></script>
```

#### `course_detail.html`
**Changed:**
- Display departments as purple badge chips
- Show year separately
- Maintain all existing functionality

**Before:**
```html
{% if course.subject %}
<p class="text-gray-600">{{ course.subject }}</p>
{% endif %}
```

**After:**
```html
{% if course.departments.all %}
<div class="flex flex-wrap gap-2 mt-2">
  {% for dept in course.departments.all %}
  <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
    {{ dept.name }}
  </span>
  {% endfor %}
</div>
{% endif %}
```

#### `library.html`
**Changed:**
- Show departments as small purple badges on course cards
- Show "No department" if none selected
- Added year display

#### `course_full_summary.html`
**Changed:**
- Display departments in header
- Updated for visual consistency

---

### 6. Data Seeding

Created management command: `scan/management/commands/seed_departments.py`

**Usage:**
```bash
python manage.py seed_departments
```

**Seeded Departments:**
- Health Science
- Criminal Justice
- Education
- Business
- Agriculture

---

## API Design Philosophy

### Open API (No Authentication)
- All endpoints are public
- Designed for mobile app consumption
- No rate limiting (for now)

### Response Format
- All timestamps as Unix timestamps (integers)
- Departments returned as array of objects
- Efficient queries with `prefetch_related()`

### Caching Strategy
- Metadata is small and cached forever on client
- Full text only fetched when needed
- Supports offline-first mobile app

---

## Database Schema

```
Department (scan_department)
├── id (PK)
├── name (unique)
├── created_at
└── updated_at

Course (scan_course)
├── id (PK)
├── name
├── year
├── description
├── created_at
└── updated_at

Course_Departments (scan_course_departments)
├── id (PK)
├── course_id (FK → Course)
└── department_id (FK → Department)

Topic (scan_topic)
├── id (PK)
├── course_id (FK → Course)
├── title
├── raw_text
├── refined_summary
├── page_range
├── order
├── created_at
└── updated_at
```

---

## Testing Checklist

- [x] Create course with multiple departments
- [x] Display departments on course cards
- [x] API returns correct department data
- [x] Full summary includes departments
- [x] Backward compatibility (old courses work)
- [x] No duplicate departments created
- [x] Efficient database queries (no N+1)

---

## Files Changed

**Modified:**
- `scan/models.py`
- `scan/views.py`
- `scan/urls.py`
- `scan/templates/scan/partials/create_course.html`
- `scan/templates/scan/partials/course_detail.html`
- `scan/templates/scan/partials/library.html`
- `scan/templates/scan/partials/course_full_summary.html`

**Created:**
- `scan/management/commands/seed_departments.py`
- New migrations (auto-generated)

**Unchanged:**
- `scan/templates/scan/partials/home.html`
- `scan/templates/scan/partials/scan.html`
- `scan/templates/scan/partials/save_form.html`
- `scan/templates/scan/partials/topic_detail.html`
- `scan/templates/scan/partials/edit_refined.html`
- `scan/utils/ocr.py`
- `settings.py`

---

## Key Takeaways

1. **Reusable over repetitive** - DRY principle maintained
2. **Purpose-driven changes** - Only modified what was necessary
3. **Backward compatible** - Old functionality preserved
4. **Performance optimized** - Used `prefetch_related()` to avoid N+1 queries
5. **Type-safe API** - Clear response formats for mobile consumption