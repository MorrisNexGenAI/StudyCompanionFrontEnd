
// ==================== UPDATED SETTINGS: src/pages/Settings.tsx ====================

import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { useStore } from '../stores/useStore';
import { db, dbHelpers } from '../db/schema';
import type { PremiumProfile } from '../types';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
} from '@mui/material';

import {
  Apartment as DepartmentIcon,
  Storage,
  Info,
  DeleteForever,
  Person,
  Logout,
  School,
} from '@mui/icons-material';

export const Settings = () => {
  const navigate = useNavigate();
  const clearSelectedDepartment = useStore((state) => state.clearSelectedDepartment);

  // Offline stats
  const [storageSize, setStorageSize] = useState('0 KB');
  const [offlineCount, setOfflineCount] = useState(0);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Premium profile
  const [profile, setProfile] = useState<PremiumProfile | null>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    loadStats();
    loadProfile();
  }, []);

  const loadStats = async () => {
    const size = await dbHelpers.getStorageSize();
    setStorageSize(`${(size / 1024).toFixed(2)} KB`);

    const count = await db.downloadedTopics.count();
    setOfflineCount(count);
  };

  const loadProfile = async () => {
    const p = await dbHelpers.getPremiumProfile();
    setProfile(p || null);
  };

  const handleChangeDepartment = () => {
    clearSelectedDepartment();
    navigate('/');
  };

  const handleClearAll = async () => {
    await dbHelpers.clearAll();
    setClearDialogOpen(false);
    loadStats();
    alert('All offline data cleared!');
  };

  const handleLogout = async () => {
    await dbHelpers.clearPremiumProfile();
    setLogoutDialogOpen(false);
    window.location.href = '/setup';
  };

  return (
    <Layout title="Settings" showBack>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ================= PREMIUM ACCOUNT ================= */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Person color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Premium Account
              </Typography>
            </Box>

            {profile ? (
              <>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background:
                      'linear-gradient(135deg, rgba(102,126,234,0.1), rgba(118,75,162,0.1))',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography fontWeight={600}>{profile.name}</Typography>

                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Personal Code
                  </Typography>
                  <Typography
                    fontWeight={700}
                    sx={{ fontFamily: 'monospace', color: 'primary.main' }}
                  >
                    {profile.code}
                  </Typography>

                  {/* NEW: Department Display */}
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Department
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <School fontSize="small" color="secondary" />
                    <Chip
                      label={profile.department_name}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  <Typography variant="caption" color="text.secondary" mt={2} display="block">
                    Registered: {new Date(profile.registered_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<Logout />}
                  onClick={() => setLogoutDialogOpen(true)}
                  sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Alert severity="info">
                You are browsing as a guest. Set up premium to unlock exclusive topics.
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* ================= GENERAL SETTINGS ================= */}
        <Card sx={{ borderRadius: 3 }}>
          <List disablePadding>
            <ListItemButton onClick={handleChangeDepartment}>
              <DepartmentIcon sx={{ mr: 2, color: 'primary.main' }} />
              <ListItemText
                primary="View Department"
                secondary="Go to your department page"
              />
            </ListItemButton>

            <Divider />

            <ListItemButton onClick={() => navigate('/downloads')}>
              <Storage sx={{ mr: 2, color: 'primary.main' }} />
              <ListItemText
                primary="My Downloads"
                secondary={`${offlineCount} topics • ${storageSize}`}
              />
            </ListItemButton>

            <Divider />

            <ListItemButton onClick={() => setClearDialogOpen(true)}>
              <DeleteForever sx={{ mr: 2, color: 'error.main' }} />
              <ListItemText
                primary="Clear Offline Data"
                secondary="Remove all downloaded topics"
              />
            </ListItemButton>

            <Divider />

            <ListItem>
              <Info sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary="About"
                secondary="Study Companion v3.1.0 - Phase 5"
              />
            </ListItem>
          </List>
        </Card>

        <Alert severity="info">
          This app works offline. Download topics to study without internet access.
        </Alert>
      </Box>

      {/* ================= CLEAR DATA DIALOG ================= */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear Offline Data?</DialogTitle>
        <DialogContent>
          <Typography>
            This will remove all downloaded topics. You can re-download them later.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleClearAll}>
            Clear All
          </Button>
        </DialogActions>
      </Dialog>

      {/* ================= LOGOUT DIALOG ================= */}
      <Dialog open={logoutDialogOpen} onClose={() => setLogoutDialogOpen(false)}>
        <DialogTitle>Log Out?</DialogTitle>
        <DialogContent>
          <Typography>
            You will need your name and code to access premium content again.
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Offline downloads will remain available.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLogoutDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleLogout}>
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};