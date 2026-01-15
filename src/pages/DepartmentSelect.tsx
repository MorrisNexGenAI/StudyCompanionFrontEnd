// src/pages/DepartmentSelect.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbHelpers } from '../db/schema';
import { useStore } from '../stores/useStore';
import { coursesAPI } from '../api/endpoints';
import { db } from '../db/schema';
import type { Course } from '../types';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  ArrowForward,
  CloudDownload,
  Settings as SettingsIcon,
  MenuBook,
  CheckCircle,
  CalendarToday,
} from '@mui/icons-material';
import { Header } from '../components/Header';

// Department emoji mapping
const getDepartmentEmoji = (deptName: string): string => {
  const lowerName = deptName.toLowerCase();
  
  if (lowerName.includes('health') || lowerName.includes('science')) return '⚕️';
  if (lowerName.includes('business')) return '💼';
  if (lowerName.includes('education')) return '📚';
  if (lowerName.includes('criminal') || lowerName.includes('justice')) return '⚖️';
  if (lowerName.includes('agriculture')) return '🌾';
  if (lowerName.includes('t-vet') || lowerName.includes('tvet') || lowerName.includes('technical') || lowerName.includes('vocational')) return '🔧';
  
  return '🎓';
};

// Department gradient mapping
const getDepartmentGradient = (deptName: string): string => {
  const lowerName = deptName.toLowerCase();
  
  if (lowerName.includes('health') || lowerName.includes('science')) {
    return 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)';
  }
  if (lowerName.includes('business')) {
    return 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
  }
  if (lowerName.includes('education')) {
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
  if (lowerName.includes('criminal') || lowerName.includes('justice')) {
    return 'linear-gradient(135deg, #434343 0%, #000000 100%)';
  }
  if (lowerName.includes('agriculture')) {
    return 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
  }
  if (lowerName.includes('t-vet') || lowerName.includes('tvet') || lowerName.includes('technical') || lowerName.includes('vocational')) {
    return 'linear-gradient(135deg, #f46b45ff 0%, #eea849 100%)';
  }
  
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
};

interface DepartmentInfo {
  id: number;
  name: string;
  userId: number;
  userName: string;
}

export const DepartmentSelect = () => {
  const navigate = useNavigate();
  const setSelectedDepartment = useStore((state) => state.setSelectedDepartment);
  
  const [deptInfo, setDeptInfo] = useState<DepartmentInfo | null>(null);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalTopics: 0, downloaded: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDepartmentData();
  }, []);

  const loadDepartmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const profile = await dbHelpers.getPremiumProfile();
      
      if (!profile) {
        navigate('/setup', { replace: true });
        return;
      }

      if (!profile.department_id) {
        setError('No department assigned. Please contact administrator.');
        setLoading(false);
        return;
      }

      setDeptInfo({
        id: profile.department_id,
        name: profile.department_name,
        userId: profile.user_id,
        userName: profile.name,
      });

      const coursesResponse = await coursesAPI.getByDepartmentAndYear(profile.department_id);
      
      const sortedCourses = coursesResponse.courses
        .sort((a, b) => b.topic_count - a.topic_count)
        .slice(0, 2);
      
      setFeaturedCourses(sortedCourses);

      const totalCourses = coursesResponse.courses.length;
      const totalTopics = coursesResponse.courses.reduce((sum, c) => sum + c.topic_count, 0);
      const downloaded = await db.downloadedTopics.count();

      setStats({ totalCourses, totalTopics, downloaded });

    } catch (err) {
      console.error('Error loading department data:', err);
      setError('Failed to load department data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllCourses = () => {
    if (deptInfo) {
      setSelectedDepartment(deptInfo.id);
      navigate('/courses');
    }
  };

  const handleCourseClick = (courseId: number) => {
    if (deptInfo) {
      setSelectedDepartment(deptInfo.id);
      navigate(`/courses/${courseId}/topics`);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Loading your department...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h5" color="error" mb={2}>
                ⚠️ {error}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/settings')}
                sx={{ mt: 2 }}
              >
                Go to Settings
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  if (!deptInfo) {
    return null;
  }

  const emoji = getDepartmentEmoji(deptInfo.name);
  const gradient = getDepartmentGradient(deptInfo.name);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', pb: 4 }}>
      {/* Header Component */}
      <Header
        emoji={emoji}
        departmentName={deptInfo.name}
        userName={deptInfo.userName}
        gradient={gradient}
        stats={stats}
      />

      <Container maxWidth="lg" sx={{ mt: -4, position: 'relative', zIndex: 2 }}>
        {/* Primary Action Buttons */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2,
            mb: 4,
          }}
        >
          <Card
            onClick={handleViewAllCourses}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <MenuBook sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                View All Courses
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Browse {stats.totalCourses} courses by year
              </Typography>
            </CardContent>
          </Card>

          <Card
            onClick={() => navigate('/downloads')}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <CloudDownload sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
              <Typography variant="h6" fontWeight={600} mb={0.5}>
                My Downloads
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {stats.downloaded} topics available offline
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Featured Courses */}
        {featuredCourses.length > 0 ? (
          <Box sx={{ mb: 4 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Typography variant="h5" fontWeight={600}>
                🔥 Featured Courses
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={handleViewAllCourses}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}
            >
              {featuredCourses.map((course) => (
                <Card
                  key={course.id}
                  onClick={() => handleCourseClick(course.id)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '2px solid transparent',
                    '&:hover': {
                      borderColor: 'primary.main',
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="start" justifyContent="space-between" mb={2}>
                      <Box>
                        <Typography variant="h6" fontWeight={600} mb={0.5}>
                          📚 {course.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {course.year}
                          </Typography>
                        </Box>
                      </Box>
                      <ArrowForward sx={{ color: 'primary.main' }} />
                    </Box>

                    <Stack direction="row" spacing={1} mb={2}>
                      <Chip
                        icon={<MenuBook />}
                        label={`${course.topic_count} topics`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        icon={<CheckCircle />}
                        label={`${course.refined_count} refined`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Click to explore topics and start studying
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            No courses available yet. Check back later!
          </Alert>
        )}

        {/* Quick Links */}
        <Card sx={{ bgcolor: 'primary.main', color: 'white', mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} mb={2}>
              ⚡ Quick Actions
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
                gap: 2,
              }}
            >
              <Button
                fullWidth
                variant="outlined"
                startIcon={<MenuBook />}
                onClick={handleViewAllCourses}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Courses
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloudDownload />}
                onClick={() => navigate('/downloads')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Downloads
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => navigate('/settings')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Settings
              </Button>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => window.open('https://support.example.com', '_blank')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Help
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Tip:</strong> Download topics to study offline. Your progress syncs when you're back online!
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};