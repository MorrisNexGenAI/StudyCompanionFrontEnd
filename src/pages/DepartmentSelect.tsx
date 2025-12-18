import { Layout } from '../components/Layout';
import { useDepartments } from '../hooks/useDepartments';
import { useStore } from '../stores/useStore';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
// @ts-ignore: No declaration file for '@mui/icons-material' in this project
import { School } from '@mui/icons-material';

export const DepartmentSelect = () => {
  const { data: departments, isLoading, error } = useDepartments();
  const setSelectedDepartment = useStore((state) => state.setSelectedDepartment);
  const navigate = useNavigate();

  const handleSelectDepartment = (deptId: number) => {
    setSelectedDepartment(deptId);
    navigate('/courses');
  };

  if (isLoading) {
    return (
      <Layout title="Choose Department" showSettings>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Choose Department" showSettings>
        <Alert severity="error">
          Failed to load departments. Please check your connection.
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout title="Choose Your Department" showSettings>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Select a department to view your courses
      </Typography>

    <Grid container spacing={2}>
  {departments?.map((dept) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={dept.id}>
      <Card
        onClick={() => handleSelectDepartment(dept.id)}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                backgroundColor: 'primary.main',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <School sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h6" fontWeight={600}>
              {dept.name}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Grid>
  ))}
</Grid>
    </Layout>
  );
};
