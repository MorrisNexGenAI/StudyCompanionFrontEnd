
// ==================== UPDATED PREMIUM SETUP: src/pages/PremiumSetup.tsx ====================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { LockOpen, PersonAdd, School } from '@mui/icons-material';
import { apiClient } from '../api/client';
import { dbHelpers } from '../db/schema';
import { useAllDepartments } from '../hooks/useDepartments';
import type { PremiumAuthResponse, PremiumProfile } from '../types';

export const PremiumSetup = () => {
  const navigate = useNavigate();
  const { data: departments, isLoading: loadingDepartments } = useAllDepartments();
  
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [departmentId, setDepartmentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate input
      if (!name.trim() || !code.trim()) {
        setError('Please enter both name and code');
        setLoading(false);
        return;
      }

      if (code.length !== 4) {
        setError('Code must be exactly 4 characters');
        setLoading(false);
        return;
      }

      if (!/^[A-Z0-9]{4}$/i.test(code)) {
        setError('Code must be alphanumeric (A-Z, 0-9)');
        setLoading(false);
        return;
      }

      if (!departmentId) {
        setError('Please select a department');
        setLoading(false);
        return;
      }

      // Call API
      const response = await apiClient.post<PremiumAuthResponse>(
        'premium/api/register-or-login/',
        {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          department_id: departmentId,
        }
      );

      const data = response.data;

      // Save profile locally with department info
      const profile: PremiumProfile = {
        user_id: data.user_id,
        name: data.name,
        code: data.code,
        department_id: data.department_id,
        department_name: data.department_name,
        registered_at: Date.now(),
      };

      await dbHelpers.savePremiumProfile(profile);

      // Navigate to departments
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to connect. Please check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 4);
    setCode(value);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box textAlign="center" mb={4}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                }}
              >
                <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
                Welcome to Study Companion
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter your details to access premium content
              </Typography>
            </Box>

            {/* Error Alert */}
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Name Input */}
                <TextField
                  label="Full Name"
                  variant="outlined"
                  fullWidth
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Emmanuel Cooper"
                  disabled={loading}
                  inputProps={{ maxLength: 100 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* Code Input */}
                <TextField
                  label="Personal Code"
                  variant="outlined"
                  fullWidth
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="e.g., EC21"
                  disabled={loading}
                  inputProps={{
                    maxLength: 4,
                    style: { textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '1.2rem' },
                  }}
                  helperText="Exactly 4 alphanumeric characters (A-Z, 0-9)"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />

                {/* NEW: Department Dropdown */}
                <FormControl fullWidth disabled={loading || loadingDepartments}>
                  <InputLabel>Department *</InputLabel>
                  <Select
                    value={departmentId}
                    label="Department *"
                    onChange={(e) => setDepartmentId(e.target.value as number)}
                    sx={{ borderRadius: 2 }}
                    startAdornment={<School sx={{ ml: 1, mr: 0.5, color: 'action.active' }} />}
                  >
                    <MenuItem value="">
                      <em>-- Select Your Department --</em>
                    </MenuItem>
                    {departments?.map((dept) => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading || !name.trim() || code.length !== 4 || !departmentId}
                  startIcon={loading ? <CircularProgress size={20} /> : <LockOpen />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                  }}
                >
                  {loading ? 'Verifying...' : 'Continue'}
                </Button>

                {/* Skip Button */}
                <Button
                  variant="text"
                  fullWidth
                  onClick={handleSkip}
                  disabled={loading}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Skip for now
                </Button>
              </Box>
            </form>

            {/* Info Box */}
            <Box
              sx={{
                mt: 4,
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                border: '2px solid',
                borderColor: 'primary.light',
              }}
            >
              <Typography variant="body2" color="text.secondary" mb={1}>
                <strong>💡 Why choose a department?</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Your department determines which courses and topics you can access. You'll only see content relevant to your field of study.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Don't have a code?</strong> Skip and browse community content, or contact your instructor.
              </Typography>
            </Box>

            {/* Footer */}
            <Box textAlign="center" mt={3}>
              <Typography variant="caption" color="text.secondary">
                Your data is stored locally and synced when online.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

