import { Layout } from '../components/Layout';
import { useDepartments } from '../hooks/useDepartments';
import { useStore } from '../stores/useStore';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Container,
} from '@mui/material';
import { School } from '@mui/icons-material';

export const DepartmentSelect = () => {
  const { data: departments, isLoading, error } = useDepartments();
  const setSelectedDepartment = useStore((state) => state.setSelectedDepartment);
  const navigate = useNavigate();

  const handleSelectDepartment = (deptId: number) => {
    setSelectedDepartment(deptId);
    navigate('/courses');
  };

  /* =====================
     LOADING STATE
  ====================== */
  if (isLoading) {
    return (
      <Layout title="Study Companion" showSettings>
        <Box
          sx={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6">Loading departments...</Typography>
        </Box>
      </Layout>
    );
  }

  /* =====================
     ERROR STATE
  ====================== */
  if (error) {
    return (
      <Layout title="Study Companion" showSettings>
        <Container maxWidth="sm" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            Failed to load departments. Please check your connection and try again.
          </Alert>
        </Container>
      </Layout>
    );
  }

  /* =====================
     MAIN VIEW
  ====================== */
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <Box className="hero-section">
        <img
          src="/pwa-192x192.png"
          alt="Study Companion Logo"
          className="hero-logo"
        />
        <h1 className="hero-title">Study Companion</h1>
        <p className="hero-subtitle">
          Your offline-first study notes app. Organize, download, and access your
          summaries anytime, anywhere.
        </p>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            textAlign: 'center',
            fontWeight: 600,
            color: 'white',
          }}
        >
          Choose Your Department
        </Typography>

        <Grid container spacing={3}>
          {departments?.map((dept) => (
            <Grid
              key={dept.id}
              size={{ xs: 12, sm: 6, md: 4 }}   // ✅ Grid v2 FIX
            >
              <Box
                className="department-card"
                onClick={() => handleSelectDepartment(dept.id)}
                sx={{ cursor: 'pointer' }}
              >
                <Box className="department-icon-wrapper">
                  <School sx={{ color: 'white', fontSize: 32 }} />
                </Box>
                <h3 className="department-card-title">{dept.name}</h3>
              </Box>
            </Grid>
          ))}
        </Grid>

        {departments?.length === 0 && (
          <Box className="empty-state">
            <div className="empty-state-icon">📚</div>
            <Typography variant="h6" gutterBottom>
              No departments available yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later or contact your administrator
            </Typography>
          </Box>
        )}
      </Container>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <img
            src="/pwa-192x192.png"
            alt="Study Companion"
            className="footer-logo"
          />
          <h3 className="footer-title">Study Companion</h3>
          <p className="footer-text">
            Empowering students with offline-first study tools. Download notes,
            share with classmates, and study smarter.
          </p>
          <div className="footer-links">
            <a href="/settings" className="footer-link">Settings</a>
            <a href="/downloads" className="footer-link">My Downloads</a>
            <a href="#" className="footer-link">Help</a>
          </div>
          <p className="footer-copyright">
            © {new Date().getFullYear()} Study Companion. Made with ❤️ for students.
          </p>
        </div>
      </footer>
    </Box>
  );
};
