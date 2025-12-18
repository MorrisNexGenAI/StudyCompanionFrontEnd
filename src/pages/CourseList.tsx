import { Layout } from '../components/Layout';
import { useCourses, useDepartments } from '../hooks/useDepartments';
import { useStore } from '../stores/useStore';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Button,
} from '@mui/material';
// @ts-ignore: No declaration file for '@mui/icons-material' in this project
import { CalendarToday, Description, CheckCircle } from '@mui/icons-material';

export const CourseList = () => {
  const selectedDeptId = useStore((state) => state.selectedDepartmentId);
  const { data: departments } = useDepartments();
  const { data: courses, isLoading, error } = useCourses(selectedDeptId);
  const navigate = useNavigate();

  const selectedDept = departments?.find((d) => d.id === selectedDeptId);

  if (!selectedDeptId) {
    navigate('/');
    return null;
  }

  if (isLoading) {
    return (
      <Layout title={selectedDept?.name || 'Courses'} showBack showSettings>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title={selectedDept?.name || 'Courses'} showBack showSettings>
        <Alert severity="error">Failed to load courses. Please check your connection.</Alert>
      </Layout>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <Layout title={selectedDept?.name || 'Courses'} showBack showSettings>
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" mb={2}>
            No courses yet in this department
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Choose Another Department
          </Button>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title={selectedDept?.name || 'Courses'} showBack showSettings>
      <Stack spacing={2}>
        {courses.map((course) => (
          <Card
            key={course.id}
            onClick={() => navigate(`/courses/${course.id}/topics`)}
            sx={{ cursor: 'pointer' }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={1}>
                {course.name}
              </Typography>

              {/* Departments */}
              {course.departments.length > 0 && (
                <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                  {course.departments.map((dept) => (
                    <Chip
                      key={dept.id}
                      label={dept.name}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              )}

              {/* Year */}
              {course.year && (
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {course.year}
                  </Typography>
                </Box>
              )}

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
    </Layout>
  );
};
