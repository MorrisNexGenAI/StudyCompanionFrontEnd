
// ==================== UPDATED COURSE LIST: src/pages/CourseList.tsx ====================

import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useCourses, useAvailableYears } from '../hooks/useDepartments';
import { useStore } from '../stores/useStore';
import { useNavigate } from 'react-router-dom';
import { dbHelpers } from '../db/schema';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import { CalendarToday, Description, CheckCircle } from '@mui/icons-material';

export const CourseList = () => {
  const navigate = useNavigate();
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const selectedYear = useStore((state) => state.selectedYear);
  const setSelectedYear = useStore((state) => state.setSelectedYear);

  // Load department from profile
  useEffect(() => {
    const loadDepartment = async () => {
      const profile = await dbHelpers.getPremiumProfile();
      if (!profile) {
        navigate('/setup');
        return;
      }
      setDepartmentId(profile.department_id);
    };
    loadDepartment();
  }, [navigate]);

  const { data: availableYears, isLoading: loadingYears } = useAvailableYears(departmentId);
  const { data: coursesData, isLoading: loadingCourses, error } = useCourses(departmentId, selectedYear);

  // Auto-select most recent year on first load
  useEffect(() => {
    if (availableYears && availableYears.length > 0 && !selectedYear) {
      setSelectedYear(availableYears[0]); // Most recent year
    }
  }, [availableYears, selectedYear, setSelectedYear]);

  const handleYearChange = (_: React.SyntheticEvent, newYear: string) => {
    setSelectedYear(newYear);
  };

  if (!departmentId) {
    return (
      <Layout title="Courses" showBack showSettings>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (loadingYears || loadingCourses) {
    return (
      <Layout title={coursesData?.department.name || 'Courses'} showBack showSettings>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Courses" showBack showSettings>
        <Alert severity="error">Failed to load courses. Please check your connection.</Alert>
      </Layout>
    );
  }

  if (!availableYears || availableYears.length === 0) {
    return (
      <Layout title={coursesData?.department.name || 'Courses'} showBack showSettings>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No academic years available yet
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go Back
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={coursesData?.department.name || 'Courses'} showBack showSettings>
      {/* Academic Year Tabs */}
      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedYear || availableYears[0]}
          onChange={handleYearChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 120,
              fontWeight: 600,
            },
          }}
        >
          {availableYears.map((year) => (
            <Tab
              key={year}
              label={year}
              value={year}
              icon={<CalendarToday fontSize="small" />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Year Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        Showing courses for <strong>{selectedYear || availableYears[0]}</strong> academic year
      </Alert>

      {/* Courses List */}
      {!coursesData?.courses || coursesData.courses.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No courses yet for {selectedYear}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try selecting a different academic year
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {coursesData.courses.map((course) => (
            <Card
              key={course.id}
              onClick={() => navigate(`/courses/${course.id}/topics`)}
              sx={{ cursor: 'pointer' }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1}>
                  {course.name}
                </Typography>

                {/* Year Badge */}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {course.year}
                  </Typography>
                </Box>

                {/* Stats */}
                <Box display="flex" gap={2}>
                  <Chip
                    icon={<Description />}
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
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Layout>
  );
};

