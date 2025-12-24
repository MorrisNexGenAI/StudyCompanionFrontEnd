# Cafphy Study Summary

A full-stack offline-first study notes application with OCR text extraction, AI-powered summaries, and Progressive Web App (PWA) support.

## 📚 Overview

Cafphy helps students:
1. **Scan** textbook pages using OCR (Optical Character Recognition)
2. **Organize** notes into Courses → Topics
3. **Refine** raw text with AI (ChatGPT) summaries
4. **Access** notes anywhere, even offline via PWA

---

## 🏗️ Architecture

### Backend (Django + Python)
- **OCR Processing** - Extracts text from images using Colab GPU
- **REST API** - Provides data to mobile/web clients
- **Admin Panel** - Manage courses, topics, and departments
- **Database** - SQLite (local development)

### Frontend (React PWA + TypeScript)
- **Progressive Web App** - Installable on any device
- **Offline-First** - Works without internet after initial load
- **Material UI** - Modern, responsive design
- **IndexedDB** - Local storage for downloaded topics

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- Django 5.1
- OCR Service (Ngrok tunnel to Colab)

---

### Backend Setup (Django)

```bash
# 1. Clone repository
git clone <your-repo>
cd cafphy-study-summary

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run migrations
python manage.py makemigrations
python manage.py migrate

# 5. Seed departments (optional)
python manage.py seed_departments

# 6. Create superuser (optional)
python manage.py createsuperuser

# 7. Start server
python manage.py runserver
```

**Backend runs on:** `http://localhost:8000`

---

### Frontend Setup (React PWA)

```bash
# 1. Navigate to PWA directory
cd cafphy-pwa

# 2. Install dependencies
npm install

# 3. Create .env file
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Start development server
npm run dev
```

**Frontend runs on:** `http://localhost:3000`

---

## 📱 Usage Flow

### For Students (Web Interface)

1. **Home** → Click "Scan New Pages"
2. **Upload Photos** → Select textbook images
3. **OCR Extraction** → Wait for text extraction
4. **Save Topic** → Choose course + topic title
5. **Refine Summary** → Choose AI Model → Refine → Save Result
6. **View Summary** → Read, print, or export

### For Students (PWA Mobile App)

1. **Select Department** → Choose your field of study
2. **Browse Courses** → View all courses in department
3. **View Topics** → See list of topics in course
4. **Download Topic** → Click download icon for offline access
5. **Read Offline** → Works without internet
6. **Share** → Share summaries via native share or clipboard

---

## 🗂️ Project Structure

```
cafphy-study-summary/
├── scanner/                # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── scan/                   # Main Django app
│   ├── models.py          # Course, Topic, Department models
│   ├── views.py           # Web views + API endpoints
│   ├── urls.py            # URL routing
│   ├── templates/         # HTML templates
│   ├── utils/             # OCR utilities
│   └── management/        # Custom commands
├── cafphy-pwa/            # React PWA
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── db/           # IndexedDB schema
│   │   ├── hooks/        # React Query hooks
│   │   ├── stores/       # Zustand state
│   │   └── types/        # TypeScript types
│   ├── public/           # Static assets
│   └── vite.config.ts    # Vite configuration
├── db.sqlite3             # SQLite database
├── requirements.txt       # Python dependencies
├── PHASE1.md             # Backend migration docs
├── PHASE2.md             # PWA development docs
└── README.md             # This file
```

---

## 🔌 API Endpoints

### Public API (No Auth Required)

**Get Departments**
```
GET /api/departments/
Response: [{"id": 1, "name": "Health Science"}, ...]
```

**Get Courses by Department**
```
GET /api/departments/<dept_id>/courses/
Response: [{
  "id": 1,
  "name": "BIO 202",
  "departments": [...],
  "topic_count": 5,
  "refined_count": 3
}, ...]
```

**Get Topics by Course (Metadata)**
```
GET /api/courses/<course_id>/topics/
Response: [{
  "id": 1,
  "title": "Cell Division",
  "page_range": "Pages 1-5",
  "is_refined": true,
  "updated_at": 1703001234
}, ...]
```

**Get Full Topic (with Content)**
```
GET /api/topics/<topic_id>/
Response: {
  "id": 1,
  "title": "Cell Division",
  "refined_summary": "...",
  "course_name": "BIO 202",
  "departments": ["Health Science"],
  ...
}
```

---

## 🗄️ Database Models

### Department
```python
- id (PK)
- name (unique)
```

### Course
```python
- id (PK)
- name
- year
- departments (ManyToMany → Department)
```

### Topic
```python
- id (PK)
- course (FK → Course)
- title
- raw_text (OCR output)
- refined_summary (AI-polished)
- page_range
```

---

## 🎨 Tech Stack

### Backend
- **Django 5.1** - Web framework
- **Django REST Framework** - API (implied, using function-based views)
- **SQLite** - Database
- **Pillow** - Image processing
- **Requests** - HTTP client for OCR service
- **Python-dotenv** - Environment variables

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Material UI** - Component library
- **TanStack Query** - Data fetching & caching
- **Zustand** - State management
- **Dexie.js** - IndexedDB wrapper
- **Axios** - HTTP client
- **React Router** - Navigation

### PWA
- **vite-plugin-pwa** - Service worker generation
- **Workbox** - Caching strategies
- **Web App Manifest** - Installability

---

## 🔧 Configuration

### Django Settings (`scanner/settings.py`)
```python
# OCR Service
COLAB_OCR_URL = "https://your-ngrok-url.ngrok-free.dev"

# Database (SQLite)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}
```

### React Environment (`.env`)
```bash
VITE_API_URL=http://localhost:8000
```

---

## 📦 Dependencies

### Python (`requirements.txt`)
```
Django==5.1
Pillow==10.0.0
requests==2.31.0
python-dotenv==1.0.0
whitenoise==6.5.0
```

### Node.js (`package.json`)
```json
{
  "@mui/material": "^5.x",
  "@tanstack/react-query": "^5.x",
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "dexie": "^3.x",
  "zustand": "^4.x",
  "vite": "^5.x",
  "vite-plugin-pwa": "^0.19.x"
}
```

---

## 🚢 Deployment

### Backend (Django)

**Option 1: Render**
```bash
render login
setup project
push from github
```

### Frontend (PWA)

**Option 1: Vercel** (Recommended)
```bash
npm run build
vercel --prod
```

**Option 2: Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**Option 3: GitHub Pages**
```bash
npm run build
# Copy dist/ contents to gh-pages branch
```

---

## 🔒 Security

### Current Setup (Development)
- ✅ CSRF protection enabled
- ✅ XSS protection enabled
- ⚠️ No authentication (public API)
- ⚠️ Debug mode enabled

### Production Checklist
- [ ] Set `DEBUG = False`
- [ ] Add authentication to API
- [ ] Enable HTTPS
- [ ] Set strong `SECRET_KEY`
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Enable HSTS headers

---

## 🧪 Testing

### Backend Tests
```bash
python manage.py test
```

### Frontend Tests (Not yet implemented)
```bash
npm run test
```

### Manual Testing Checklist
- [ ] Scan pages and extract text
- [ ] Create course with multiple departments
- [ ] Save topics to courses
- [ ] Add refined summaries
- [ ] View full course summary
- [ ] Print/export summaries
- [ ] Install PWA on mobile
- [ ] Download topics for offline
- [ ] Read topics offline (airplane mode)
- [ ] Share topics
- [ ] Delete offline copies

---

## 🐛 Troubleshooting

### "No such table: scan_course"
**Solution:** Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### OCR not working
**Solution:** Check Colab/Ngrok tunnel
1. Ensure Colab notebook is running
2. Update `COLAB_OCR_URL` in settings
3. Test endpoint: `curl <ngrok-url>/health`

### PWA not installing
**Solution:** Check requirements
- Must use HTTPS (or localhost)
- Must have valid manifest.json
- Must have service worker registered

### Topics not loading offline
**Solution:** Clear IndexedDB
1. DevTools → Application → IndexedDB
2. Delete "CaffphyDB"
3. Re-download topics

---

## 📖 Documentation

- **[PHASE1.md](PHASE1.md)** - Backend migration details
- **[PHASE2.md](PHASE2.md)** - PWA development guide
- **Django Docs** - https://docs.djangoproject.com/
- **React Docs** - https://react.dev/
- **Material UI** - https://mui.com/

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 License

This project is for educational purposes.

---

## 👨‍💻 Development Team

- **Backend** - Django + Python
- **Frontend** - React + TypeScript
- **OCR** - EasyOCR (via Colab)

---

## 🎯 Roadmap

### Phase 1 ✅ (Completed)
- [x] Department model migration
- [x] Multi-department support
- [x] API endpoints for mobile
- [x] Updated templates

### Phase 2 ✅ (Completed)
- [x] React PWA setup
- [x] Offline-first architecture
- [x] IndexedDB integration
- [x] Material UI design
- [x] Topic download/share/delete
- [x] "My Downloads" page

### Phase 3 🚧 (Future)
- [ ] Search functionality
- [ ] Bulk download
- [ ] Background sync
- [ ] Export to PDF
- [ ] Dark mode
- [ ] Push notifications
- [ ] User authentication
- [ ] Analytics dashboard

---

## 📞 Support

For issues or questions:
1. Check documentation (PHASE1.md, PHASE2.md)
2. Open GitHub issue
3. Contact development team

---

## 🎉 Acknowledgments

- **Material UI** - Beautiful component library
- **TanStack Query** - Powerful data fetching
- **Dexie.js** - Easy IndexedDB
- **Vite** - Lightning-fast builds
- **Django** - Batteries-included web framework

---

**Built with ❤️ for students who want to study smarter, not harder.**